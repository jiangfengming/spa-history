import babel from 'rollup-plugin-babel'

export default {
  input: 'src/HashHistory.js',
  output: {
    format: 'umd',
    name: 'HashHistory',
    file: 'HashHistory.js'
  },
  plugins: [
    babel()
  ]
}
