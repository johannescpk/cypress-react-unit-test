'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.WebpackTemplate = exports.extractWebpackConfigPathFromScript = void 0
const path_1 = __importDefault(require('path'))
const find_up_1 = __importDefault(require('find-up'))
const findPackageJson_1 = require('../findPackageJson')
function extractWebpackConfigPathFromScript(script) {
  if (script.includes('webpack ')) {
    const webpackCliArgs = script.split(' ').map(part => part.trim())
    const configArgIndex = webpackCliArgs.findIndex(arg => arg === '--config')
    return configArgIndex === -1 ? null : webpackCliArgs[configArgIndex + 1]
  }
  return null
}
exports.extractWebpackConfigPathFromScript = extractWebpackConfigPathFromScript
exports.WebpackTemplate = {
  message:
    'It looks like you have custom `webpack.config.js`. We can use it to bundle the components for testing.',
  getExampleUrl: () =>
    'https://github.com/bahmutov/cypress-react-unit-test/tree/main/examples/webpack-file',
  recommendedComponentFolder: 'cypress/component',
  getPluginsCode: (payload, { cypressProjectRoot }) => {
    const includeWarnComment = !Boolean(payload)
    const webpackConfigPath = payload
      ? path_1.default.relative(cypressProjectRoot, payload.webpackConfigPath)
      : './webpack.config.js'
    return [
      "const preprocessor = require('cypress-react-unit-test/plugins/load-webpack')",
      'module.exports = (on, config) => {',
      includeWarnComment
        ? '// TODO replace with valid webpack config path'
        : '',
      `config.env.webpackFilename = '${webpackConfigPath}'`,
      '  preprocessor(on, config)',
      '  // IMPORTANT to return the config object',
      '  return config',
      '}',
    ].join('\n')
  },
  test: root => {
    const webpackConfigPath = find_up_1.default.sync('webpack.config.js', {
      cwd: root,
    })
    if (webpackConfigPath) {
      return {
        success: true,
        payload: { webpackConfigPath },
      }
    }
    const packageJsonIterator = findPackageJson_1.createFindPackageJsonIterator(
      root,
    )
    return packageJsonIterator.map(({ scripts }, packageJsonPath) => {
      if (!scripts) {
        return { continue: true }
      }
      for (const script of Object.values(scripts)) {
        const webpackConfigRelativePath = extractWebpackConfigPathFromScript(
          script,
        )
        if (webpackConfigRelativePath) {
          const directoryRoot = path_1.default.resolve(packageJsonPath, '..')
          const webpackConfigPath = path_1.default.resolve(
            directoryRoot,
            webpackConfigRelativePath,
          )
          return {
            continue: false,
            payload: { webpackConfigPath },
          }
        }
      }
      return { continue: true }
    })
  },
}
