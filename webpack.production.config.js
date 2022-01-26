var webpack = require("webpack");


module.exports = {	
  entry: [
    './src/index.js'
  ],
  plugins: [
         // put the app in production mode
         new webpack.DefinePlugin({
           'process.env.NODE_ENV': '"production"'
         }),
         // minimize and uglify the code
         new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
             minimize: true,
             compress: {
                 warnings: false
             }
         })
  ],
  output: {
    path: __dirname,
    publicPath: 'http://0.0.0.0:3000/zFilter',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loaders: ['babel']
    }]
  },   
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
