'use strict'

const Ajv = require('ajv')

function validatorFactory(schema, options) {
  const ajv = new Ajv(options)

  if (options.keywords) {
    const keywords = Object.keys(options.keywords)
    keywords.forEach((kw) => {
      ajv.addKeyword(kw, options.keywords[kw])
    })
    delete options.keywords
  }

  ajv.addSchema(schema)

  return function (body) {
    const isValid = ajv.validate(schema.id, body)
    if (!isValid) {

      const firstAjvError = ajv.errors[0]
      const property = firstAjvError.dataPath.substr(1)
      const constraint = firstAjvError.keyword

      const error = new Error('Invalid Payload')
      error.code = `INVALID_${property.toUpperCase()}_${constraint.toUpperCase()}`
      error.message = `${property} ${firstAjvError.message}`

      if (!property && constraint === 'required' ) {
        error.code = `INVALID_${firstAjvError.params.missingProperty.toUpperCase()}_${constraint.toUpperCase()}`
        error.message = `${firstAjvError.message}`
      }
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
