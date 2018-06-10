const webpack = require('webpack');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/index.jsx'
  ],
  output: {
    path: __dirname,
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015', 'stage-1']
      }
    },
    {
      // https://aws.amazon.com/blogs/developer/using-webpack-and-the-aws-sdk-for-javascript-to-create-and-bundle-an-application-part-1/
      test: /.json$/,
      loaders: ['json-loader']
    }]
  },
  resolve: {
    extensions: [ '.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './'
  }
};
