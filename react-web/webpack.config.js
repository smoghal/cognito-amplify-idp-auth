/* eslint-disable no-undef */
module.exports = {
  // https://webpack.js.org/concepts/mode/
  mode: 'development',
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
    rules: [{
      test: /(\.js$|\.jsx$)/,
      exclude: /(node_modules|bower_components)/,

      use: [{
        loader: 'babel-loader',

        options: {
          presets: ['@babel/preset-env', '@babel/preset-react']
        }
      }]
    }]
  },
  resolve: {
    extensions: [
      '.js', '.jsx'
    ]
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './'
  }

  // plugins: [
  //   new webpack.DefinePlugin({
  //     DEVELOPMENT: JSON.stringify(true),
  //     AWS_REGION: JSON.stringify('us-east-1'),
  //     AWS_COGNITO_IDENTITY_POOL_ID: JSON.stringify('us-east-1:XYZ'),
  //     AWS_COGNITO_USER_POOL_ID: JSON.stringify('us-east-1_XYZ'),
  //     AWS_COGNITO_CLIENT_ID: JSON.stringify('XYZ')
  //   })
  // ]
};
/* eslint-enable no-undef */
