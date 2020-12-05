'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.NextTemplate = void 0
const findPackageJson_1 = require('../findPackageJson')
const utils_1 = require('../utils')
const versions_1 = require('../versions')
exports.NextTemplate = {
  message: 'It looks like you are using next.js.',
  getExampleUrl: () =>
    'https://github.com/bahmutov/cypress-react-unit-test/tree/main/examples/nextjs',
  recommendedComponentFolder: 'cypress/component',
  getPluginsCode: () =>
    [
      "const preprocessor = require('cypress-react-unit-test/plugins/next')",
      'module.exports = (on, config) => {',
      '  preprocessor(on, config)',
      '  // IMPORTANT to return the config object',
      '  return config',
      '}',
    ].join('\n'),
  test: () => {
    const packageJsonIterator = findPackageJson_1.createFindPackageJsonIterator(
      process.cwd(),
    )
    return packageJsonIterator.map(({ dependencies, devDependencies }) => {
      if (!dependencies && !devDependencies) {
        return { continue: true }
      }
      const allDeps = {
        ...(devDependencies || {}),
        ...(dependencies || {}),
      }
      const nextVersion = allDeps['next']
      if (!nextVersion) {
        return { continue: true }
      }
      if (
        !utils_1.validateSemverVersion(
          nextVersion,
          versions_1.MIN_SUPPORTED_VERSION['next'],
          'next',
        )
      ) {
        return { continue: true }
      }
      // yey found the next
      return { continue: false }
    })
  },
}
