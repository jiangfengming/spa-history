import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  plugins: [babel({
    exclude: 'node_modules/**'
  })],
  format: 'umd',
  moduleName: 'SpaHistory',
  dest: 'dist/SpaHistory.js'
}
