# Welcome to Style2DTS webpack plugin!

This is a webpack plugin that generates typescript definition (.d.ts) files on fly, allowing to import less/css files into typescript code and always have up to date .d.ts content while editing style source files. Implmentation was initially inspired by two existing NPM packages
 - https://github.com/dropbox/typed-css-modules-webpack-plugin
 -  https://github.com/awexfwex/typed-less-modules

Thanks guys!  However we had to add some improvements which are necessary to track [less](https://lesscss.org/) files, which support [@import](https://lesscss.org/features/) statement.

# Features

 - Generates  .d.ts files in build and watch webpack modes.
 - Tracks dependencies so if "common.less" is modified, plugin generates .d.ts files for everything that imports "common.less". Actually this is the main purpose of the plugin.
 - Tracks file deletions - if you delete less file - plugin will delete .d.ts file

# Usage
```javascript
const { Style2DTS } = require('@revenuegrid/style2dts');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.less/,
        use: [
          'style-loader',
          // Use CSS Modules
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'less-loader'
        ],
      },
    ],
  },
  // Generate typing declarations for all CSS files under `src/` directory.
  plugins: [
    new Style2DTS ({
      globPattern: 'src/**/*.less',
    }),
  ],
};
```
# Options

The available options for the plugin are:

## `globPattern: string`

This is the glob pattern used to match Style Modules in the project. The plugin only generates `.d.ts`
for the matching Style files.  **Currently only Less and CSS files are supported.**  See [node-glob](https://github.com/isaacs/node-glob) for the pattern
syntax.

## `nameFormat?: "camel" | "kebab" | "param" | "dashes" | "none"`

Tells plugin how to generate class names exports. if not specified **camel** is used.

## `exportType?: "named" | "default"`

Tells plugin how to generate .d.ts file content. if not specified **default** is used.

 - **named** - exports several constants per each style entry. Suitable for importing explicit styles.
	Import example: `import { a, b,c } from './style.less;`
 - **default** - exports default object containing all style entries. Suitable for default import.
  	Import example: `import Styles from './style.less;`

# Requirements

 - Webpack version 5.34.0 or  higher.
