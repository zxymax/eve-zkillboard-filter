var webpack = require('webpack');
var WebpackServer = require('webpack-dev-server');
var config = require('./webpack.production.config');

new WebpackServer(webpack(config), {
  hot: false,
  inline: true,
  historyApiFallback: true,
  headers: { 'Access-Control-Allow-Origin': '*' }
}).listen(3000, '0.0.0.0', function (err, result) {
  if (err) {
 //   console.log(err);
  }
  console.log('Listening at 0.0.0.0:3000');
});
