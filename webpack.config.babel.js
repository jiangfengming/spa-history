export default function(options = {}) {
  let conf = {
    entry: './src/index.js',

    output: {
      path: './dist',
      filename:  options.module ? 'ManagedHistory.js' : 'ManagedHistory.bundle.js',
      library: 'ManagedHistory',
      libraryTarget: 'umd'
    },

    devtool: 'cheap-module-eval-source-map',

    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
      ]
    },

    devServer: {
      contentBase: './examples'
    }
  };

  if (options.module) {
    conf.externals = [/^[a-z\-0-9]+$/];
  }

  return conf;
}
