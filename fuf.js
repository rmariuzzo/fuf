/**
 * Module dependencies.
 */

const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

/**
 * Module exports.
 */

module.exports = fuf

/**
 * @typedef {Object} FufOptions
 * @property {string} match The match key to use to determine used file.
 */

/**
 * Default options.
 * @type {FufOptions}
 */

const defaults = {
  match: 'name',
}

const MATCHES = ['name', 'ext', 'fullname', 'path']

/**
 * Find unused files.
 * 
 * @param {string} target The target directory containing files that will be used to look for usage.
 * @param {string} source The source directory containing files that will be determined if unused.
 * @param {FufOptions} options The options.
 * 
 * @return {Promise<FindSourceFilesResult[]> Error>}
 */
function fuf(target, source, options = {}) {
  return new Promise((resolve, reject) => {

    if (!target) {
      return reject(new Error('the target path is required'))
    }
  
    if (!source) {
      return reject(new Error('the source path is required'))
    }

    

    options = { ...defaults, ...options }

    Promise.all([
      pglob(target, { nodir: true, ignore: source }),
      findSourceFiles(source),
    ]).then(([targetFiles, sourceFiles]) => {
      // By default all source files are considered unused.
      const unused = sourceFiles.map(file => ({ ...file }))

      // We loop through all files looking for unused files matches, when we
      // found a match we removed it from the unused bag.
      const results = targetFiles.map(file => {
        return fs.readFile(file)
          .then(data => {
            const matches = findMatches(data.toString(), unused.map(u => u[options.match]))
            matches.forEach(match => {
              // Remove match from unused.
              unused.splice(unused.findIndex(u => u[options.match] === match.needle), 1)
              // Remove match from source files.
              sourceFiles.splice(sourceFiles.findIndex(f => f[options.match] === match.needle), 1)
            })
          })
      })

      Promise
        .all(results)
        .then(() => {
          resolve({ unused })
        })
    }).catch(reject)
  })
}

/**
 * @typedef {Object} FindSourceFilesResult
 * @property {string} ext The file extension.
 * @property {string} name The file name without extension.
 * @property {string} fullname The file name with extension.
 * @property {string} path The file path.
 */

/**
 * Find source files using a glob pattern.
 * 
 * @param {String} pattern The glob pattern
 * 
 * @return {Promise<FindSourceFilesResult[]>, Error>}
 */
function findSourceFiles(pattern) {
  return pglob(pattern, { nodir: true })
    .then(files => {
      return files.map(file => {
        const ext = path.extname(file)
        const name = path.basename(file, ext)
        return {
          ext,
          name,
          fullname: `${name}${ext}`,
          path: file
        }
      })
    })
}

/**
 * Promisify version of glob.
 * 
 * @param {string} pattern The glob pattern.
 * @param {Object} options The hash of options.
 * 
 * @return {Promise<string[], Error>}
 */
function pglob(pattern, options) {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (error, files) => {
      if (error) {
        return reject(error)
      }
      resolve(files)
    })
  })
}

/**
 * @typedef {Object} FindMatchesResult
 * @property {string} line The matching text line.
 * @property {string} needle The matching pattern.
 * @property {number} row The matching row number.
 * @property {number} col The matching column number.
 */

/**
 * Find matches of one or more texts (needles) in a text.
 *
 * @param {string} text The text content.
 * @param {string[]} needles List of text to find for matches.
 * 
 * @return {FindMatchesResult[]}
 */
function findMatches(text, needles) {
  let matches = []
  text
    .split(/[\r\n]/)
    .forEach((line, rowIndex) => {
      needles.forEach(needle => {
        const colIndex = line.indexOf(needle)
        if (colIndex !== -1) {
          matches.push({
            line,
            needle,
            row: rowIndex + 1,
            col: colIndex,
          })
        }
      })
    })
  return matches
}