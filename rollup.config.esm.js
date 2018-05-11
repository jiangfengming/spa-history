import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    format: 'es',
    file: 'dist/spaHistory.esm.js'
  },
  plugins: [
    babel()
  ]
}
