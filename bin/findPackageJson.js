'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.createFindPackageJsonIterator = void 0
const path_1 = __importDefault(require('path'))
const fs_1 = __importDefault(require('fs'))
const find_up_1 = __importDefault(require('find-up'))
/**
 * Return the parsed package.json that we find in a parent folder.
 *
 * @returns {Object} Value, filename and indication if the iteration is done.
 */
function createFindPackageJsonIterator(rootPath = process.cwd()) {
  function scanForPackageJson(cwd) {
    const packageJsonPath = find_up_1.default.sync('package.json', { cwd })
    if (!packageJsonPath) {
      return {
        packageData: undefined,
        filename: undefined,
        done: true,
      }
    }
    const packageData = JSON.parse(
      fs_1.default.readFileSync(packageJsonPath, {
        encoding: 'utf-8',
      }),
    )
    return {
      packageData,
      filename: packageJsonPath,
      done: false,
    }
  }
  return {
    map: cb => {
      let stepPathToScan = rootPath
      while (true) {
        const result = scanForPackageJson(stepPathToScan)
        if (result.done) {
          // didn't find the package.json
          return { success: false }
        }
        if (result.packageData) {
          const cbResult = cb(result.packageData, result.filename)
          if (!cbResult.continue) {
            return { success: true, payload: cbResult.payload }
          }
        }
        const nextStepPathToScan = path_1.default.resolve(stepPathToScan, '..')
        if (nextStepPathToScan === stepPathToScan) {
          // we are at the root. Give up
          return { success: false }
        }
        stepPathToScan = nextStepPathToScan
      }
    },
  }
}
exports.createFindPackageJsonIterator = createFindPackageJsonIterator
