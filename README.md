![fuf – Find Unused Files in a directory](.github/banner.svg)

## Usage

```js
import fuf from 'fuf'

fuf('target/directory', 'files/directory/**.*')
  .then(results => {
    console.log(results.unused)
    console.log(results.used)
  })
```

## How it works?

 1. **`fuf`** find filenames that will be test for usage.
 2. **`fuf`** find usage of those filenames in files from a target directory.
 3. **`fuf`** output a list of unused files and a list of used files.

## Development

  1. Clone and fork this repo.
  2. Install dependencies: `npm install`.
  3. Do your stuff.
  4. [Run tests](#test).
  5. Prepare a pull request.

## Releases

  1. `npm install --global np`
  2. `np`

<div align=center>

Made with :heart: by [Rubens Mariuzzo](https://github.com/rmariuzzo).

[MIT license](LICENSE)

</div>