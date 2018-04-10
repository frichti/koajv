'use strict'

const Ajv = require('ajv')

function validatorFactory(schema, options) {
  const ajv = new Ajv(options)
  ajv.addSchema(schema)

  return function (body) {
    const isValid = ajv.validate(schema.id, body)
    if (!isValid) {
      const error = new Error('Invalid Payload')
      error.code = 'INVALID_PAYLOAD'
      error.details = ajv.errors.map(err => {
        return {
          field: err.dataPath,
          reason: err.message
        }
      })

      throw error
    }
  }
}

function middlewareFactory(schema, target, options) {
  const validator = validatorFactory(schema, options)
  return async function (ctx, next) {
    try {
      validator(ctx.request[target])
    } catch (err) {
      err.status = 400
      ctx.throw(400, err)
    }
    await next()
  }
}

function paramsValidator(schema, options) {
  const validator = validatorFactory(schema, options)
  return async function (ctx, next) {
    try {
      validator(ctx.params)
    } catch (err) {
      err.status = 400
      ctx.throw(400, err)
    }
    await next()
  }
}

module.exports = {
  createValidator: validatorFactory,
  paramsValidator,
  bodyValidator: (schema, options) => middlewareFactory(schema, 'body', options),
  queryValidator: (schema, options) => middlewareFactory(schema, 'query', options),
}