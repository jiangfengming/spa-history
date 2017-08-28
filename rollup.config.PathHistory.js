import babel from 'rollup-plugin-babel'

export default {
  input: 'src/PathHistory.js',
  output: {
    format: 'umd',
    name: 'PathHistory',
    file: 'PathHistory.js'
  },
  plugins: [
    babel()
  ]
}
