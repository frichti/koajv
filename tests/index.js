'use strict'

const assert = require('assert')
const superagent = require('superagent')
const app = require('./app')

let server
beforeEach(() => {
  server = app.listen(9000)
})

describe('Koajv', function () {

  describe('Body validator', function () {
    it('Should not throw an error if the body is valid', async () => {
      const res = await superagent
        .post('http://localhost:9000/test/body')
        .send({ id: 5 })

      assert.equal(res.text, 'OK')
      assert.equal(res.status, 200)
    })

    it('Should throw an error if the body is NOT valid', async () => {
      const res = await superagent
        .post('http://localhost:9000/test/body')
        .send({ id: 'Invalid string' })
        .catch(err => err.response)

      assert.deepEqual(res.body, {
        message: 'Invalid Payload',
        code: 'INVALID_PAYLOAD',
        details: [{
          field: '.id',
          reason: 'should be integer'
        }]
      })
      assert.equal(res.status, 400)

    })
  })

  describe('Query validator', function () {
    it('Should not throw an error if the querystring is valid', async () => {
      const res = await superagent
        .get('http://localhost:9000/test/querystring?id=123456&name=john')

      assert.equal(res.text, 'OK')
      assert.equal(res.status, 200)
    })

    it('Should throw an error if the querystring is NOT valid', async () => {
      const res = await superagent
        .get('http://localhost:9000/test/querystring?id=123456')
        .catch(err => err.response)

        assert.deepEqual(res.body, {
          message: 'Invalid Payload',
          code: 'INVALID_PAYLOAD',
          details: [{
            field: '',
            reason: 'should have required property \'name\''
          }]
        })
        assert.equal(res.status, 400)
    })
  })

  describe('Params validator', function () {
    it('Should not throw an error if the params is valid', async () => {
      const res = await superagent
        .get('http://localhost:9000/test/params/VALID')

      assert.equal(res.text, 'OK')
      assert.equal(res.status, 200)
    })

    it('Should throw an error if the params is NOT valid', async () => {
      const res = await superagent
        .get('http://localhost:9000/test/params/INVALID')
        .catch(err => err.response)

        assert.deepEqual(res.body, {
          message: 'Invalid Payload',
          code: 'INVALID_PAYLOAD',
          details: [{
            field: '.id',
            reason: 'should match pattern "^VALID$"'
          }]
        })
        assert.equal(res.status, 400)
    })
  })

})

afterEach(() => {
  server.close()
})
