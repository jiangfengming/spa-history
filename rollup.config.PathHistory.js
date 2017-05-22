import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/PathHistory.js',
  plugins: [
    babel()
  ],
  format: 'umd',
  moduleName: 'PathHistory',
  dest: 'PathHistory.js'
}
