/**
 * Module dependencies.
 */

const glob = require('glob')

/**
 * Module exports.
 */

module.exports = fuf

/**
 * Find unused files.
 */

function fuf(target, source) {
  return new Promise((resolve, reject) => {

    // Validate inputs.
    if (!target) {
      return reject(new Error('the target path is required'))
    }
  
    if (!source) {
      return reject(new Error('the source path is required'))
    }

    Promise.all([
      pglob(target, { nodir: true, ignore: source }),
      pglob(source, { nodir: true }),
    ]).then(([targetFiles, sourceFiles]) => {
      console.log(targetFiles)
      console.log(sourceFiles)
      resolve();
    }).catch(reject);
  })
}

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