const path = require('path')
// const JavaScriptObfuscator = require('webpack-obfuscator')
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

module.exports = {
  entry: WebpackWatchedGlobEntries.getEntries(
    [path.resolve(__dirname, 'src/payloads/*.js')]
  ),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/scripts/'
  },
  devServer: {
    host: HOST,
    port: PORT,
    contentBase: path.join(__dirname, 'dist'),
    hot: false,
    inline: false,
    disableHostCheck: true
  },
  performance: {
    hints: false
  },
  plugins: [
    // new JavaScriptObfuscator(),
    new WebpackWatchedGlobEntries()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          // eslint options (if necessary)
        }
      }
    ]
  }
}
