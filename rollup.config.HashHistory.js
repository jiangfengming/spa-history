import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/HashHistory.js',
  plugins: [
    babel()
  ],
  format: 'umd',
  moduleName: 'HashHistory',
  dest: 'HashHistory.js'
}
