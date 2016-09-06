export default function(options = {}) {
  let conf = {
    entry: './src/index.js',

    output: {
      path: __dirname + '/dist',
      publicPath: '/dist/',
      filename: options.module ? 'SpaHistory.js' : 'SpaHistory.bundle.js',
      library: 'SpaHistory',
      libraryTarget: 'umd'
    },

    module: {
      loaders: []
    },

    devServer: {
      noInfo: true,
      host: '0.0.0.0',
      port: 8010,
      historyApiFallback: true
    }
  };

  if (options.module) {
    conf.externals = [/^[a-z\-0-9]+$/];
  }

  if (options.debug) {
    conf.debug = true;
    conf.devtool = 'source-map';
  } else {
    conf.module.loaders.push({
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: [['es2015', { modules: false }]],
        plugins: [
          'add-module-exports'
        ]
      }
    });
  }

  return conf;
}
