import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.mjs',

  output: {
    format: 'umd',
    name: 'spaHistory',
    file: 'dist/spaHistory.js'
  },

  plugins: [
    babel()
  ]
}
