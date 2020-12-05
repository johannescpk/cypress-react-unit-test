'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.validateSemverVersion = void 0
const semver_1 = __importDefault(require('semver'))
const chalk_1 = __importDefault(require('chalk'))
/**
 * Compare available version range with the provided version from package.json
 * @param packageName Package name used to display a helper message to user.
 */
function validateSemverVersion(version, allowedVersionRange, packageName) {
  var _a
  const minAvailableVersion =
    (_a = semver_1.default.minVersion(version)) === null || _a === void 0
      ? void 0
      : _a.raw
  const isValid = Boolean(
    minAvailableVersion &&
      semver_1.default.satisfies(minAvailableVersion, allowedVersionRange),
  )
  if (!isValid && packageName) {
    const packageNameSymbol = chalk_1.default.green(packageName)
    console.warn(
      `It seems like you are using ${packageNameSymbol} with version ${chalk_1.default.bold(
        version,
      )}, however we support only ${packageNameSymbol} projects with version ${chalk_1.default.bold(
        allowedVersionRange,
      )}. Trying to find another template...`,
    )
  }
  return isValid
}
exports.validateSemverVersion = validateSemverVersion
