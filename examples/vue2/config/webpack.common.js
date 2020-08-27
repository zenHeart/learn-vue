const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const NAV = [];

module.exports = {
  entry: {
    vue2: path.join(__dirname, '../index.js')
  },
  module: {
    rules: [
      {
        test: /\.styl(us)?$/,
        use: ['vue-style-loader', 'css-loader', 'stylus-loader']
      },
      {
        test: /\.m?js$/,
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        ),
        use: {
          loader: 'babel-loader',
          options: {
            "plugins": ["transform-vue-jsx"]
          }
        }
      },
      {
        test: /\.vue/,
        use: ['vue-loader']
      },
      {
        test: /\.html$/i,
        exclude: [path.resolve(__dirname, '../examples/vue2/index.html')],
        use: ['raw-loader']
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js'
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      ENVIRONMENT: JSON.stringify(process.env.NODE_ENV || 'development'),
      HAHA: JSON.stringify(NAV)
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'vue2',
      template: './index.html',
      chunks: ['vue2'],
      minify: true
    })
  ],
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json', '.vue']
  }
};
