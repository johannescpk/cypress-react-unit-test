'use strict'
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
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
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.createMount = exports.unmount = exports.mount = void 0
var React = __importStar(require('react'))
var react_dom_1 = __importStar(require('react-dom'))
var getDisplayName_1 = __importDefault(require('./getDisplayName'))
var utils_1 = require('./utils')
var rootId = 'cypress-root'
var isComponentSpec = function() {
  return Cypress.spec.specType === 'component'
}
function checkMountModeEnabled() {
  if (!isComponentSpec()) {
    throw new Error(
      'In order to use mount or unmount functions please place the spec in component folder',
    )
  }
}
/**
 * Inject custom style text or CSS file or 3rd party style resources
 */
var injectStyles = function(options) {
  return function() {
    var document = cy.state('document')
    var el = document.getElementById(rootId)
    return utils_1.injectStylesBeforeElement(options, document, el)
  }
}
/**
 * Mount a React component in a blank document; register it as an alias
 * To access: use an alias or original component reference
 * @function   mount
 * @param      {React.ReactElement}  jsx - component to mount
 * @param      {MountOptions}  [options] - options, like alias, styles
 * @see https://github.com/bahmutov/cypress-react-unit-test
 * @see https://glebbahmutov.com/blog/my-vision-for-component-tests/
 * @example
 ```
  import Hello from './hello.jsx'
  import {mount} from 'cypress-react-unit-test'
  it('works', () => {
    mount(<Hello onClick={cy.stub()} />)
    // use Cypress commands
    cy.contains('Hello').click()
  })
 ```
 **/
var mount = function(jsx, options) {
  if (options === void 0) {
    options = {}
  }
  checkMountModeEnabled()
  // Get the display name property via the component constructor
  // @ts-ignore FIXME
  var componentName = getDisplayName_1.default(jsx.type, options.alias)
  var displayName = options.alias || componentName
  var message = options.alias
    ? '<' + componentName + ' ... /> as "' + options.alias + '"'
    : '<' + componentName + ' ... />'
  var logInstance
  return cy
    .then(function() {
      if (options.log !== false) {
        logInstance = Cypress.log({
          name: 'mount',
          message: [message],
        })
      }
    })
    .then(injectStyles(options))
    .then(function() {
      var _a, _b, _c
      var document = cy.state('document')
      var reactDomToUse = options.ReactDom || react_dom_1.default
      var el = document.getElementById(rootId)
      if (!el) {
        throw new Error(
          [
            '[cypress-react-unit-test] 🔥 Hmm, cannot find root element to mount the component.',
            'Did you forget to include the support file?',
            'Check https://github.com/bahmutov/cypress-react-unit-test#install please',
          ].join(' '),
        )
      }
      var key =
        // @ts-ignore provide unique key to the the wrapped component to make sure we are rerendering between tests
        (((_c =
          (_b =
            (_a =
              Cypress === null || Cypress === void 0
                ? void 0
                : Cypress.mocha) === null || _a === void 0
              ? void 0
              : _a.getRunner()) === null || _b === void 0
            ? void 0
            : _b.test) === null || _c === void 0
          ? void 0
          : _c.title) || '') + Math.random()
      var props = {
        key: key,
      }
      var reactComponent = React.createElement(
        options.strict ? React.StrictMode : React.Fragment,
        props,
        jsx,
      )
      // since we always surround the component with a fragment
      // let's get back the original component
      // @ts-ignore
      var userComponent = reactComponent.props.children
      reactDomToUse.render(reactComponent, el)
      if (logInstance) {
        var logConsoleProps_1 = {
          props: jsx.props,
          description: 'Mounts React component',
          home: 'https://github.com/bahmutov/cypress-react-unit-test',
        }
        var componentElement = el.children[0]
        if (componentElement) {
          // @ts-ignore
          logConsoleProps_1.yielded = reactDomToUse.findDOMNode(
            componentElement,
          )
        }
        logInstance.set('consoleProps', function() {
          return logConsoleProps_1
        })
        if (el.children.length) {
          logInstance.set('$el', el.children.item(0))
        }
      }
      return (
        cy
          .wrap(userComponent, { log: false })
          .as(displayName)
          // by waiting, we give the component's hook a chance to run
          // https://github.com/bahmutov/cypress-react-unit-test/issues/200
          .wait(1, { log: false })
          .then(function() {
            if (logInstance) {
              logInstance.snapshot('mounted')
              logInstance.end()
            }
            // by returning undefined we keep the previous subject
            // which is the mounted component
            return undefined
          })
      )
    })
}
exports.mount = mount
/**
 * Removes the mounted component. Notice this command automatically
 * queues up the `unmount` into Cypress chain, thus you don't need `.then`
 * to call it.
 * @see https://github.com/bahmutov/cypress-react-unit-test/tree/main/cypress/component/basic/unmount
 * @example
  ```
  import { mount, unmount } from 'cypress-react-unit-test'
  it('works', () => {
    mount(...)
    // interact with the component using Cypress commands
    // whenever you want to unmount
    unmount()
  })
  ```
 */
var unmount = function() {
  checkMountModeEnabled()
  return cy.then(function() {
    cy.log('unmounting...')
    var selector = '#' + rootId
    return cy.get(selector, { log: false }).then(function($el) {
      react_dom_1.unmountComponentAtNode($el[0])
    })
  })
}
exports.unmount = unmount
/**
 * Creates new instance of `mount` function with default options
 * @function   createMount
 * @param      {MountOptions}  [defaultOptions] - defaultOptions for returned `mount` function
 * @returns    new instance of `mount` with assigned options
 * @example
 * ```
 * import Hello from './hello.jsx'
 * import { createMount } from 'cypress-react-unit-test'
 *
 * const mount = createMount({ strict: true, cssFile: 'path/to/any/css/file.css' })
 *
 * it('works', () => {
 *   mount(<Hello />)
 *   // use Cypress commands
 *   cy.get('button').should('have.css', 'color', 'rgb(124, 12, 109)')
 * })
 ```
 **/
var createMount = function(defaultOptions) {
  return function(element, options) {
    return exports.mount(
      element,
      __assign(__assign({}, defaultOptions), options),
    )
  }
}
exports.createMount = createMount
/** @deprecated Should be removed in the next major version */
exports.default = exports.mount
