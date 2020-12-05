'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function(o, m, k, k2) {
        if (k2 === undefined) k2 = k
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function() {
            return m[k]
          },
        })
      }
    : function(o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function(o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function(o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.mountHook = void 0
var React = __importStar(require('react'))
var mount_1 = require('./mount')
// mounting hooks inside a test component mostly copied from
// https://github.com/testing-library/react-hooks-testing-library/blob/master/src/pure.js
function resultContainer() {
  var value = null
  var error = null
  var resolvers = []
  var result = {
    get current() {
      if (error) {
        throw error
      }
      return value
    },
    get error() {
      return error
    },
  }
  var updateResult = function(val, err) {
    if (err === void 0) {
      err = null
    }
    value = val
    error = err
    resolvers.splice(0, resolvers.length).forEach(function(resolve) {
      return resolve()
    })
  }
  return {
    result: result,
    addResolver: function(resolver) {
      resolvers.push(resolver)
    },
    setValue: function(val) {
      return updateResult(val)
    },
    setError: function(err) {
      return updateResult(undefined, err)
    },
  }
}
function TestHook(_a) {
  var callback = _a.callback,
    onError = _a.onError,
    children = _a.children
  try {
    children(callback())
  } catch (err) {
    if (err.then) {
      throw err
    } else {
      onError(err)
    }
  }
  // TODO decide what the test hook component should show
  // maybe nothing, or maybe useful information about the hook?
  // maybe its current properties?
  // return <div>TestHook</div>
  return null
}
/**
 * Mounts a React hook function in a test component for testing.
 *
 * @see https://github.com/bahmutov/cypress-react-unit-test#advanced-examples
 */
var mountHook = function(hookFn, options) {
  if (options === void 0) {
    options = {}
  }
  var _a = resultContainer(),
    result = _a.result,
    setValue = _a.setValue,
    setError = _a.setError
  var testElement = React.createElement(TestHook, {
    callback: hookFn,
    onError: setError,
    children: setValue,
    key: Math.random().toString(),
  })
  var mountElement = testElement
  if (options.wrapper) {
    // what's the proper type? I don't even care anymore
    // because types for React seem to be a mess
    // @ts-ignore
    mountElement = React.createElement(options.wrapper, {
      children: [testElement],
    })
  }
  return mount_1.mount(mountElement).then(function() {
    cy.wrap(result)
  })
}
exports.mountHook = mountHook
