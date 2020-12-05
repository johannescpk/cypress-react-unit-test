'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.ReactScriptsTemplate = void 0
const chalk_1 = __importDefault(require('chalk'))
const findPackageJson_1 = require('../findPackageJson')
const utils_1 = require('../utils')
const versions_1 = require('../versions')
exports.ReactScriptsTemplate = {
  recommendedComponentFolder: 'src',
  message: 'It looks like you are using create-react-app.',
  getExampleUrl: ({ componentFolder }) =>
    componentFolder === 'src'
      ? 'https://github.com/bahmutov/cypress-react-unit-test/tree/main/examples/react-scripts'
      : 'https://github.com/bahmutov/cypress-react-unit-test/tree/main/examples/react-scripts-folder',
  getPluginsCode: () =>
    [
      "const preprocessor = require('cypress-react-unit-test/plugins/react-scripts')",
      'module.exports = (on, config) => {',
      '   preprocessor(on, config)',
      '  // IMPORTANT to return the config object',
      '  return config',
      '}',
    ].join('\n'),
  test: () => {
    // TODO also determine ejected create react app
    const packageJsonIterator = findPackageJson_1.createFindPackageJsonIterator(
      process.cwd(),
    )
    return packageJsonIterator.map(({ dependencies, devDependencies }) => {
      if (dependencies || devDependencies) {
        const allDeps = { ...devDependencies, ...dependencies } || {}
        if (!allDeps['react-scripts']) {
          return { continue: true }
        }
        if (
          !utils_1.validateSemverVersion(
            allDeps['react-scripts'],
            versions_1.MIN_SUPPORTED_VERSION['react-scripts'],
          )
        ) {
          console.warn(
            `It looks like you are using ${chalk_1.default.green(
              'crate-react-app',
            )}, but we support only projects with version ${chalk_1.default.bold(
              versions_1.MIN_SUPPORTED_VERSION['react-scripts'],
            )} of react-scripts.`,
          )
          // yey found the template
          return { continue: true }
        }
        return { continue: false }
      }
      return { continue: true }
    })
  },
}
