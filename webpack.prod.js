const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  target: 'web',
  entry: './src/index.ts',
})
