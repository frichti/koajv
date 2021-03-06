# Koajv

Koa middleware factory to validate, querystring, body payload, route params

You can find examples of how to use this library.
You can also look at the tests scenarios in the tests directory to get running examples to use.

## Breaking changes :

- v1.0.0 -> v2.0.0 : The validation error format has changed

## Minor changes :

- v2.0.0 -> v2.1.0 : Add support for custom keywords

## Body validation :

In this example the call can looks like : `POST http://host.com/example/body`

```js
const koajv = require('koajv')

const ajvOptions = {
  allErrors: true,
  useDefaults: true,
  schemaId: 'auto',
  keywords: {
    trim: {
      type: 'string',
      modifying: true,
      compile: function (sch, parentSchema) {
        return function(data, dataPath, parentData, property) {
          if(typeof data === 'string') {
            if(sch) {
              parentData[property] = data.trim()
            }
            return true
          }
          return false
        }
      }
    }
  }
}

const schema = {
  id: 'userSchema',
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    category: { type: 'string', pattern: '^Teacher|Student$' },
  }
}

const bodyValidatorMiddleware = koajv.bodyValidator(schema) // Wille check ctx.request.body

const validator = koajv.createValidator(schema) // return a method

try {
  validator({ invalid: 'test' }) // If the object is not matching the schema an execption is thrown
} catch (err) {

}

router.post('/example/body', bodyValidatorMiddleware, routeHandler)
```

## Querystring validation :

In this example the call can looks like : `GET http://host.com/example/query?name=test&category=Student`

```js
const koajv = require('koajv')

const ajvOptions = {
  allErrors: true,
  useDefaults: true,
  schemaId: 'auto',
}

const schema = {
  id: 'querySchema',
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    category: { type: 'string', pattern: '^Teacher|Student$' },
  }
}

const queryValidatorMiddleware = koajv.queryValidator(schema, ajvOptions) // Will check ctx.request.query

router.get('/example/query', queryValidatorMiddleware, routeHandler)
```

## Params validation :

In this example the call can looks like : `GET http://host.com/example/params/teacher`

```js
const koajv = require('koajv')

const ajvOptions = {
  allErrors: true,
  useDefaults: true,
  schemaId: 'auto',
}

const schema = {
  id: 'paramsSchema',
  type: 'object',
  additionalProperties: false,
  properties: {
    category: { type: 'string', pattern: `^teacher|student$`},
  }
}

const paramsValidatorMiddleware = koajv.paramsValidator(schema, ajvOptions) // Will check ctx.params

router.get('/example/params/:category', paramsValidatorMiddleware, routeHandler)
```

## Generic validation :

You can also instantiate a validator function by using the facotry method `koajv.createValidator()'

```js
const koajv = require('koajv')

const ajvOptions = {
  allErrors: true,
  useDefaults: true,
  schemaId: 'auto',
}

const schema = {
  id: 'userSchema',
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    category: { type: 'string', pattern: '^Teacher|Student$' },
  }
}

const validator = koajv.createValidator(schema, ajvOptions) // return a method

try {
  validator({ invalid: 'test' }) // If the object is not matching the schema an execption is thrown
} catch (err) {

}
```

## Error Handling :

Here is a simple example of middleware to catch koajv errors :

```js
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
```

## Custom keywords :

To add custom keywords you can pass it as an options

```js
const koajv = require('koajv')

const ajvOptions = {
  allErrors: true,
  useDefaults: true,
  schemaId: 'auto',
  keywords: {
    trim: {
      type: 'string',
      modifying: true,
      compile: function (sch, parentSchema) {
        return function(data, dataPath, parentData, property) {
          if(typeof data === 'string') {
            if(sch) {
              parentData[property] = data.trim()
            }
            return true
          }
          return false
        }
      }
    }
  }
}

```

## Tests

To Launch the tests :

- run : `$ npm install`
- run : `$ npm test`
- run : `$ npm run watch` : It launch test when you change the code

(The tests will run a koa app on port 9000 be sure that this port is available)

## Code Coverage

After running `$ npm test` you can access the code coverage report here : `./coverage/index.html`
