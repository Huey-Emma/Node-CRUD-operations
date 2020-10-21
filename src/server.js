const http = require('http'),
  url = require('url')

const { config } = require('./config')
const handlers = require('./controllers/handlers')
const { when, pipe, split, filter, join, isValidString } = require('./lib')

const server = http.createServer((req, res) => {
  const parsedurl = url.parse(req.url, true)
  const path = parsedurl.pathname

  const trimmedpath = pipe(
    split.bind(null, '/'),
    filter.bind(null, Boolean),
    join.bind(null, '/')
  )(path)

  const headers = req.headers
  const method = req.method
  const query = parsedurl.query

  const body = []
  req.on('data', (chunk) => {
    body.push(chunk)
  })

  req.on('end', () => {
    const payload = Buffer.concat(body).toString()

    const data = {
      path: trimmedpath,
      method: method.toLowerCase(),
      headers,
      query,
      payload: when(isValidString, JSON.parse)(payload),
    }

    const selectedPath = router[trimmedpath]
      ? router[trimmedpath]
      : router.notfound

    selectedPath(data, (statusCode, payload) => {
      statusCode = statusCode || 200
      payload = payload || {}

      res.writeHead(statusCode, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(payload))
    })
  })
})

const router = {
  notfound: handlers.notfound,
  'api/v1/products': handlers.product,
}

server.listen(config.port, function () {
  console.log('Server running on port ' + config.port)
})
