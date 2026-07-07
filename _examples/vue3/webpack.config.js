const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env = {}) => ({
  mode: env.prod ? 'production' : 'development',
  devtool: env.prod ? 'source-map' : 'eval-cheap-module-source-map',
  entry: path.resolve(__dirname, './main.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.vue', '.js', '.json'],
    alias: {
      'vue': '@vue/runtime-dom',
      '@': path.resolve(__dirname, '..')
    },
    fallback: {
      buffer: require.resolve('buffer/'),
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.styl(us)?$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.html$/i,
        exclude: [
          path.resolve(__dirname, "../examples/vue2/index.html")
        ],
        type: 'asset/source',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: !env.prod }
          },
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      ignoreOrder: true
    })
  ],
  devServer: {
    hot: true,
    static: {
      directory: __dirname
    },
    client: {
      overlay: true
    },
    open: true
  }
});
