'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.BabelTemplate = void 0
const chalk_1 = __importDefault(require('chalk'))
const find_up_1 = __importDefault(require('find-up'))
const findPackageJson_1 = require('../findPackageJson')
exports.BabelTemplate = {
  message: `It looks like you have babel config defined. We can use it to transpile your components for testing.\n ${chalk_1.default.red(
    '>>',
  )} This is not a replacement for bundling tool. We will use ${chalk_1.default.red(
    'webpack',
  )} to bundle the components for testing.`,
  getExampleUrl: () =>
    'https://github.com/bahmutov/cypress-react-unit-test/tree/main/examples/babel',
  recommendedComponentFolder: 'cypress/component',
  getPluginsCode: () =>
    [
      "const preprocessor = require('cypress-react-unit-test/plugins/babel')",
      'module.exports = (on, config) => {',
      '  preprocessor(on, config)',
      '  // IMPORTANT to return the config object',
      '  return config',
      '}',
    ].join('\n'),
  test: cwd => {
    const babelConfig = find_up_1.default.sync(
      ['babel.config.js', 'babel.config.json', '.babelrc', '.babelrc.json'],
      { type: 'file', cwd },
    )
    if (babelConfig) {
      return { success: true }
    }
    // babel config can also be declared in package.json with `babel` key https://babeljs.io/docs/en/configuration#packagejson
    const packageJsonIterator = findPackageJson_1.createFindPackageJsonIterator(
      cwd,
    )
    return packageJsonIterator.map(({ babel }) => ({
      continue: !Boolean(babel),
    }))
  },
}
