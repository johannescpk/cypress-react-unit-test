#!/usr/bin/env node
'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.main = exports.guessTemplateForUsedFramework = void 0
const fs_1 = __importDefault(require('fs'))
const path_1 = __importDefault(require('path'))
const chalk_1 = __importDefault(require('chalk'))
const find_up_1 = __importDefault(require('find-up'))
const inquirer_1 = __importDefault(require('inquirer'))
const cli_highlight_1 = __importDefault(require('cli-highlight'))
const next_1 = require('./templates/next')
const webpack_file_1 = require('./templates/webpack-file')
const react_scripts_1 = require('./templates/react-scripts')
const babel_1 = require('./templates/babel')
const webpack_options_1 = require('./templates/webpack-options')
const templates = {
  'next.js': next_1.NextTemplate,
  'create-react-app': react_scripts_1.ReactScriptsTemplate,
  webpack: webpack_file_1.WebpackTemplate,
  babel: babel_1.BabelTemplate,
  'default (webpack options)': webpack_options_1.WebpackOptions,
}
function guessTemplateForUsedFramework() {
  for (const [name, template] of Object.entries(templates)) {
    const typedTemplate = template
    const { success, payload } = typedTemplate.test(process.cwd())
    if (success) {
      return {
        defaultTemplate: typedTemplate,
        defaultTemplateName: name,
        templatePayload:
          payload !== null && payload !== void 0 ? payload : null,
      }
    }
  }
  return {
    templatePayload: null,
    defaultTemplate: null,
    defaultTemplateName: null,
  }
}
exports.guessTemplateForUsedFramework = guessTemplateForUsedFramework
async function getCypressConfig() {
  const cypressJsonPath = await find_up_1.default('cypress.json')
  // TODO figure out how to work with newly installed cypress
  if (!cypressJsonPath) {
    console.log(
      `\nIt looks like Cypress is not installed because we were unable to find ${chalk_1.default.green(
        'cypress.json',
      )} in this project. Please install Cypress via ${chalk_1.default.inverse(
        ' yarn add cypress -D ',
      )} (or via npm), then run ${chalk_1.default.inverse(
        ' cypress open ',
      )} and rerun this script.`,
    )
    console.log(
      `\nFind more information about installation at: ${chalk_1.default.bold.underline(
        'https://github.com/bahmutov/cypress-react-unit-test#init',
      )}`,
    )
    process.exit(1)
  }
  return {
    cypressConfigPath: cypressJsonPath,
    config: JSON.parse(
      fs_1.default
        .readFileSync(cypressJsonPath, { encoding: 'utf-8' })
        .toString(),
    ),
  }
}
function printCypressJsonHelp(cypressJsonPath, componentFolder) {
  const resultObject = {
    experimentalComponentTesting: true,
    componentFolder,
    testFiles: '**/*.spec.{js,ts,jsx,tsx}',
  }
  const relativeCypressJsonPath = path_1.default.relative(
    process.cwd(),
    cypressJsonPath,
  )
  const highlightedCode = cli_highlight_1.default(
    JSON.stringify(resultObject, null, 2),
    {
      language: 'json',
    },
  )
  console.log(
    `\n${chalk_1.default.bold('1.')} Add this to the ${chalk_1.default.green(
      relativeCypressJsonPath,
    )}:`,
  )
  console.log(`\n${highlightedCode}\n`)
}
function printSupportHelper(supportFilePath) {
  const stepNumber = chalk_1.default.bold('2.')
  const importCode = "import 'cypress-react-unit-test/support'"
  const requireCode = "require('cypress-react-unit-test/support')"
  if (fs_1.default.existsSync(supportFilePath)) {
    const fileContent = fs_1.default.readFileSync(supportFilePath, {
      encoding: 'utf-8',
    })
    const relativeSupportPath = path_1.default.relative(
      process.cwd(),
      supportFilePath,
    )
    const importCodeWithPreferredStyle = fileContent.includes('import ')
      ? importCode
      : requireCode
    console.log(
      `\n${stepNumber} This to the ${chalk_1.default.green(
        relativeSupportPath,
      )}:`,
    )
    console.log(
      `\n${cli_highlight_1.default(importCodeWithPreferredStyle, {
        language: 'js',
      })}\n`,
    )
  } else {
    console.log(
      `\n${stepNumber} This to the support file https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Support-file`,
    )
    console.log(
      `\n${cli_highlight_1.default(requireCode, { language: 'js' })}\n`,
    )
  }
}
function printPluginHelper(pluginCode, pluginsFilePath) {
  const highlightedPluginCode = cli_highlight_1.default(pluginCode, {
    language: 'js',
  })
  const relativePluginsFilePath = path_1.default.relative(
    process.cwd(),
    pluginsFilePath,
  )
  const stepTitle = fs_1.default.existsSync(pluginsFilePath)
    ? `And this to the ${chalk_1.default.green(relativePluginsFilePath)}`
    : `And this to your plugins file (https://docs.cypress.io/guides/tooling/plugins-guide.html)`
  console.log(`${chalk_1.default.bold('3.')} ${stepTitle}:`)
  console.log(`\n${highlightedPluginCode}\n`)
}
async function main() {
  var _a, _b, _c
  const packageVersion =
    (_a = process.env.npm_package_version) !== null && _a !== void 0
      ? _a
      : require('../package.json').version
  console.log(
    `${chalk_1.default.green(
      `cypress-react-unit-test@${packageVersion}`,
    )} init component testing wizard\n`,
  )
  const { config, cypressConfigPath } = await getCypressConfig()
  const {
    defaultTemplate,
    defaultTemplateName,
    templatePayload,
  } = guessTemplateForUsedFramework()
  const cypressProjectRoot = path_1.default.resolve(cypressConfigPath, '..')
  const pluginsFilePath = path_1.default.resolve(
    cypressProjectRoot,
    (_b = config.pluginsFile) !== null && _b !== void 0
      ? _b
      : './cypress/plugins/index.js',
  )
  const supportFilePath = path_1.default.resolve(
    cypressProjectRoot,
    (_c = config.supportFile) !== null && _c !== void 0
      ? _c
      : './cypress/support/index.js',
  )
  const templateChoices = Object.keys(templates).sort(key =>
    key === defaultTemplateName ? -1 : 0,
  )
  const {
    chosenTemplateName,
    componentFolder,
  } = await inquirer_1.default.prompt([
    {
      type: 'list',
      name: 'chosenTemplateName',
      choices: templateChoices,
      default: defaultTemplate ? 0 : undefined,
      message: (defaultTemplate === null || defaultTemplate === void 0
      ? void 0
      : defaultTemplate.message)
        ? `${
            defaultTemplate === null || defaultTemplate === void 0
              ? void 0
              : defaultTemplate.message
          }\n\n Press ${chalk_1.default.inverse(
            ' Enter ',
          )} to continue with ${chalk_1.default.green(
            defaultTemplateName,
          )} configuration or select another template from the list:`
        : 'We were not able to automatically determine which framework or bundling tool you are using. Please choose one from the list:',
    },
    {
      type: 'input',
      name: 'componentFolder',
      filter: input => input.trim(),
      validate: input =>
        input === '' || !/^[a-zA-Z].*/.test(input)
          ? `Directory "${input}" is invalid`
          : true,
      message: 'Which folder would you like to use for your component tests?',
      default: answers =>
        templates[answers.chosenTemplateName].recommendedComponentFolder,
    },
  ])
  const chosenTemplate = templates[chosenTemplateName]
  printCypressJsonHelp(cypressConfigPath, componentFolder)
  printSupportHelper(supportFilePath)
  printPluginHelper(
    chosenTemplate.getPluginsCode(templatePayload, {
      cypressProjectRoot,
    }),
    pluginsFilePath,
  )
  if (chosenTemplate.printHelper) {
    chosenTemplate.printHelper()
  }
  console.log(`Find examples of component tests for ${chalk_1.default.green(
    chosenTemplateName,
  )} in ${chalk_1.default.underline(
    chosenTemplate.getExampleUrl({ componentFolder }),
  )}.
    \n`)
  console.log(
    `Docs for different recipes of bundling tools: ${chalk_1.default.bold.underline(
      'https://github.com/bahmutov/cypress-react-unit-test/blob/main/docs/recipes.md',
    )}`,
  )
  console.log(
    `\nHappy testing with ${chalk_1.default.green('cypress.io')} ⚛️🌲\n`,
  )
}
exports.main = main
if (process.env.NODE_ENV !== 'test') {
  main().catch(e => console.error(e))
}
