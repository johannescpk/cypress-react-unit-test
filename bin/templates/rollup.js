'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.RollupTemplate = exports.extractRollupConfigPathFromScript = void 0
const path_1 = __importDefault(require('path'))
const chalk_1 = __importDefault(require('chalk'))
const find_up_1 = __importDefault(require('find-up'))
const cli_highlight_1 = __importDefault(require('cli-highlight'))
const findPackageJson_1 = require('../findPackageJson')
function extractRollupConfigPathFromScript(script) {
  if (script.includes('rollup ')) {
    const cliArgs = script.split(' ').map(part => part.trim())
    const configArgIndex = cliArgs.findIndex(
      arg => arg === '--config' || arg === '-c',
    )
    return configArgIndex === -1 ? null : cliArgs[configArgIndex + 1]
  }
  return null
}
exports.extractRollupConfigPathFromScript = extractRollupConfigPathFromScript
exports.RollupTemplate = {
  message:
    'It looks like you have custom `rollup.config.js`. We can use it to bundle the components for testing.',
  getExampleUrl: () =>
    'https://github.com/bahmutov/cypress-react-unit-test/tree/main/examples/rollup',
  recommendedComponentFolder: 'src',
  getPluginsCode: (payload, { cypressProjectRoot }) => {
    const includeWarnComment = !Boolean(payload)
    const rollupConfigPath = payload
      ? path_1.default.relative(cypressProjectRoot, payload.rollupConfigPath)
      : 'rollup.config.js'
    return [
      `// do not forget to install`,
      `const rollupPreprocessor = require('@bahmutov/cy-rollup')`,
      `module.exports = (on, config) => {`,
      `  on(`,
      `    'file:preprocessor',`,
      `    rollupPreprocessor({`,
      includeWarnComment
        ? '      // TODO replace with valid rollup config path'
        : '',
      `      configFile: '${rollupConfigPath}',`,
      `    }),`,
      `  )`,
      ``,
      `  require('@cypress/code-coverage/task')(on, config)`,
      `  // IMPORTANT to return the config object`,
      `  return config`,
      `}`,
    ].join('\n')
  },
  printHelper: () => {
    console.log(
      `Make sure that it is also required to add some additional configuration to the ${chalk_1.default.red(
        'rollup.config.js',
      )}. Here is whats required:`,
    )
    const code = cli_highlight_1.default(
      [
        `import replace from '@rollup/plugin-replace'`,
        `import commonjs from '@rollup/plugin-commonjs'`,
        `import nodeResolve from '@rollup/plugin-node-resolve'`,
        ``,
        `export default [`,
        `  {`,
        `    plugins: [`,
        `      nodeResolve(),`,
        `      // process cypress-react-unit-test-code`,
        `      commonjs(),`,
        `      // required for react sources`,
        `      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),`,
        `    ]`,
        `  }`,
        `]`,
      ].join('\n'),
      { language: 'js' },
    )
    console.log(`\n${code}\n`)
  },
  test: root => {
    const rollupConfigPath = find_up_1.default.sync('rollup.config.js', {
      cwd: root,
    })
    if (rollupConfigPath) {
      return {
        success: true,
        payload: { rollupConfigPath },
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
        const rollupConfigRelativePath = extractRollupConfigPathFromScript(
          script,
        )
        if (rollupConfigRelativePath) {
          const directoryRoot = path_1.default.resolve(packageJsonPath, '..')
          const rollupConfigPath = path_1.default.resolve(
            directoryRoot,
            rollupConfigRelativePath,
          )
          return {
            continue: false,
            payload: { rollupConfigPath },
          }
        }
      }
      return { continue: true }
    })
  },
}
