const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const portfinder = require('portfinder');

const webpackConfig = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/main.js'),
  devtool: 'inline-source-map',
  devServer: {
    host: 'localhost',
    port: 5000,
    hot: true,
    open: false,
    quiet: true,
    clientLogLevel: 'error',
    disableHostCheck: true
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g)$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html')
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = webpackConfig.devServer.port;
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err);
    } else {
      webpackConfig.devServer.port = port;
      webpackConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [
              `启动成功: http://${webpackConfig.devServer.host}:${port}`
            ]
          }
        })
      );
      resolve(webpackConfig);
    }
  });
});
