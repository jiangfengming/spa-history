import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.mjs',

  output: {
    format: 'cjs',
    file: 'dist/spaHistory.js'
  },

  plugins: [
    babel()
  ]
}
