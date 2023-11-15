const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const server = require('./webpack.dev.server');

module.exports = merge(common, server, {
  output: {
    publicPath: '/js',
    filename: 'origo.js',
    library: {
      type: 'var',
      export: 'default',
      name: 'Origo'
    }
  },
    devtool: 'eval-cheap-source-map'
});
