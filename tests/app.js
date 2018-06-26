'use strict'

const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const Router = require('koa-router')

const koajv = require('../')

const bodyValidator = koajv.bodyValidator({
  id: 'body',
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
  }
}, { schemaId: 'auto' })

const queryValidator = koajv.queryValidator({
  id: 'query',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
}, { schemaId: 'auto' })

const paramsValidator = koajv.paramsValidator({
  id: 'params',
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      pattern: '^VALID$'},
  },
}, { schemaId: 'auto' })

const router = new Router()

router.post('/test/body', bodyValidator, (ctx) => ctx.body = 'OK')
router.get('/test/querystring', queryValidator, (ctx) => ctx.body = 'OK')
router.get('/test/params/:id', paramsValidator, (ctx) => ctx.body = 'OK')

const app = new Koa()

app.use(bodyparser())
app.use(async(ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status
    ctx.body = {
      message: err.message,
      code: err.code || 'UNKNOWN_ERROR',
    }
  }
})
app.use(router.routes(), router.allowedMethods())

module.exports = app
