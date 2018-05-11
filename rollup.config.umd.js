import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'spaHistory',
    file: 'dist/spaHistory.umd.js'
  },
  plugins: [
    babel()
  ]
}
