const { isValidString, unless, K } = require('../lib')

const envs = {}

envs.staging = {
  name: 'staging',
  port: 5000,
}
envs.production = {
  name: 'production',
  port: 3000,
}

const nodeEnv = unless(isValidString, K(''))(process.env.NODE_ENV)

const currentEnv =
  typeof envs[nodeEnv] === 'object' && envs[nodeEnv].constructor === Object
    ? envs[nodeEnv]
    : envs.staging

module.exports = {
  config: currentEnv,
}
