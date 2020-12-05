'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.injectStylesBeforeElement = void 0
/**
 * Insert links to external style resources.
 */
function insertStylesheets(stylesheets, document, el) {
  stylesheets.forEach(function(href) {
    var link = document.createElement('link')
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.href = href
    document.body.insertBefore(link, el)
  })
}
/**
 * Inserts a single stylesheet element
 */
function insertStyles(styles, document, el) {
  styles.forEach(function(style) {
    var styleElement = document.createElement('style')
    styleElement.appendChild(document.createTextNode(style))
    document.body.insertBefore(styleElement, el)
  })
}
function insertSingleCssFile(cssFilename, document, el, log) {
  return cy.readFile(cssFilename, { log: log }).then(function(css) {
    var style = document.createElement('style')
    style.appendChild(document.createTextNode(css))
    document.body.insertBefore(style, el)
  })
}
/**
 * Reads the given CSS file from local file system
 * and adds the loaded style text as an element.
 */
function insertLocalCssFiles(cssFilenames, document, el, log) {
  return Cypress.Promise.mapSeries(cssFilenames, function(cssFilename) {
    return insertSingleCssFile(cssFilename, document, el, log)
  })
}
/**
 * Injects custom style text or CSS file or 3rd party style resources
 * into the given document.
 */
var injectStylesBeforeElement = function(options, document, el) {
  // first insert all stylesheets as Link elements
  var stylesheets = []
  if (typeof options.stylesheet === 'string') {
    stylesheets.push(options.stylesheet)
  } else if (Array.isArray(options.stylesheet)) {
    stylesheets = stylesheets.concat(options.stylesheet)
  }
  if (typeof options.stylesheets === 'string') {
    options.stylesheets = [options.stylesheets]
  }
  if (options.stylesheets) {
    stylesheets = stylesheets.concat(options.stylesheets)
  }
  insertStylesheets(stylesheets, document, el)
  // insert any styles as <style>...</style> elements
  var styles = []
  if (typeof options.style === 'string') {
    styles.push(options.style)
  } else if (Array.isArray(options.style)) {
    styles = styles.concat(options.style)
  }
  if (typeof options.styles === 'string') {
    styles.push(options.styles)
  } else if (Array.isArray(options.styles)) {
    styles = styles.concat(options.styles)
  }
  insertStyles(styles, document, el)
  // now load any css files by path and add their content
  // as <style>...</style> elements
  var cssFiles = []
  if (typeof options.cssFile === 'string') {
    cssFiles.push(options.cssFile)
  } else if (Array.isArray(options.cssFile)) {
    cssFiles = cssFiles.concat(options.cssFile)
  }
  if (typeof options.cssFiles === 'string') {
    cssFiles.push(options.cssFiles)
  } else if (Array.isArray(options.cssFiles)) {
    cssFiles = cssFiles.concat(options.cssFiles)
  }
  return insertLocalCssFiles(cssFiles, document, el, options.log)
}
exports.injectStylesBeforeElement = injectStylesBeforeElement