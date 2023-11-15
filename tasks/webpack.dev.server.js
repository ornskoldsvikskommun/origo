const webpack = require('webpack');

module.exports = {
    devServer: {
        devMiddleware: {
            mimeTypes: { manifest: 'text/cache-manifest' }
        },
        static: {
            directory: './'
        },
        port: 9966
    }
}