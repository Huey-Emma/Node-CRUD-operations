const crypto = require('crypto')

const Product = require('../models/Products')

const FsHelpers = require('../helpers/fshelpers')
const { negate, eq, nth, partial, filter, pipe } = require('../lib')

const handlers = {}
handlers._product = {}

const ACCEPTABLEMETHODS = ['get', 'post', 'put', 'delete']

handlers.notfound = (data, callback) => {
  callback(404, {
    status: 'fail',
    message: 'Not Found',
  })
}

handlers.product = (data, callback) => {
  if (!ACCEPTABLEMETHODS.includes(data.method)) {
    return callback(406, {
      status: 'fail',
      message: 'Unacceptable method',
    })
  }

  handlers._product[data.method](data, callback)
}

handlers._product.get = async (data, callback) => {
  const { id } = data.query

  if (id) {
    if (id.length !== 20)
      return callback(400, {
        status: 'fail',
        message: 'Invalid ID',
      })

    try {
      const fileData = await FsHelpers.read('products')
      const product = pipe(
        partial(filter, (ctx) => eq(ctx.id, id)),
        partial(nth, 0)
      )(fileData)

      if (!product)
        return callback(404, {
          status: 'fail',
          message: 'Product not found',
        })

      callback(200, {
        status: 'success',
        data: product,
      })
    } catch (e) {
      console.error('Error:', e.message)
      callback(404, {
        status: 'fail',
        message: 'Could not fetch data',
      })
    }
  } else {
    try {
      const products = await FsHelpers.read('products')

      callback(200, {
        status: 'success',
        data: { products },
      })
    } catch (e) {
      console.error('Error:', e.message)
      callback(404, {
        status: 'fail',
        message: 'Could not fetch data',
      })
    }
  }
}

handlers._product.post = async (data, callback) => {
  const {
    payload: { name, price, description },
  } = data

  if (!(name && price && description))
    return callback(400, {
      status: 'fail',
      message: 'Invalid entry',
    })

  let productContainer

  try {
    const fileData = await FsHelpers.read('products')
    productContainer = fileData
  } catch (e) {
    console.error('Error: ', e.message)
    productContainer = []
  }

  const id = crypto.randomBytes(10).toString('hex')
  const product = new Product({ id, name, price, description })

  productContainer.push(product)

  try {
    await FsHelpers.write('products', productContainer)
    callback(201, {
      status: 'success',
      data: product,
    })
  } catch (e) {
    console.error('Error:', e.message)
    callback(400, {
      status: 'fail',
      message: 'Operation failed',
    })
  }
}

handlers._product.put = async (data, callback) => {
  const {
    payload: { name, price, description },
    query: { id },
  } = data

  if (id.length !== 20)
    return callback(400, {
      status: 'fail',
      message: 'Invalid ID',
    })

  try {
    const fileData = await FsHelpers.read('products')
    const product = pipe(
      partial(filter, (ctx) => eq(ctx.id, id)),
      partial(nth, 0)
    )(fileData)

    product.name = name || product.name
    product.price = price || product.price
    product.description = description || product.description

    const productIdx = fileData.findIndex((ctx) => eq(ctx.id, id))
    fileData[productIdx] = product

    await FsHelpers.update('products', fileData)

    callback(200, {
      status: 'success',
      data: product,
    })
  } catch (e) {
    console.error('Error:', e.message)
    callback(400, {
      status: 'fail',
      message: 'Operation failed',
    })
  }
}

handlers._product.delete = async (data, callback) => {
  const {
    query: { id },
  } = data

  if (id.length !== 20)
    return callback(400, {
      status: 'fail',
      message: 'Invalid ID',
    })

  try {
    const fileData = await FsHelpers.read('products')
    const filteredFileData = fileData.filter((ctx) => negate(eq)(ctx.id, id))

    await FsHelpers.update('products', filteredFileData)
    callback(204, {
      status: 'success',
      data: {},
    })
  } catch (e) {
    console.error(e)
    callback(400, {
      status: 'fail',
      message: 'Failed Operation',
    })
  }
}

module.exports = handlers
