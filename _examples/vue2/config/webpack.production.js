const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    optimization: {
        minimizer: [new UglifyJsPlugin()]
    },
    output: {
        path: path.join(__dirname, '../dist'),
    },
};
