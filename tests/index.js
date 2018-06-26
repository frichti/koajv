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

    it('Should throw an error with code: INVALID_ID_TYPE and message: "id should be integer"', async () => {
      const res = await superagent
        .post('http://localhost:9000/test/body')
        .send({ id: 'Invalid string' })
        .catch(err => err.response)

      assert.deepEqual(res.body, {
        code: 'INVALID_ID_TYPE',
        message: 'id should be integer'
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

    it('Should throw an error with code: INVALID_NAME_REQUIRED and message: "should have required property \'name\'', async () => {
      const res = await superagent
        .get('http://localhost:9000/test/querystring?id=123456')
        .catch(err => err.response)

        assert.deepEqual(res.body, {
          code: 'INVALID_NAME_REQUIRED',
          message: 'should have required property \'name\''
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

    it('Should throw an error with code: INVALID_ID_PATTERN and message: "id should match pattern \"^VALID$\"', async () => {
      const res = await superagent
        .get('http://localhost:9000/test/params/INVALID')
        .catch(err => err.response)

        assert.deepEqual(res.body, {
          code: 'INVALID_ID_PATTERN',
          message: 'id should match pattern \"^VALID$\"'
        })
        assert.equal(res.status, 400)
    })
  })

})

afterEach(() => {
  server.close()
})
