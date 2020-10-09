const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'production',
  target: 'web',
  devtool: false,
  entry: './src/index.ts',
  output: {
    libraryExport: 'default',
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
})
