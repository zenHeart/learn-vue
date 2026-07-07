const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    devtool: 'source-map',
    devServer: {
        open: true,
        openPage: 'index.html',
        contentBase: path.resolve('dist')
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js'
    },
};
