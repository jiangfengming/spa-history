import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.mjs',

  output: {
    format: 'esm',
    file: 'dist/spaHistory.mjs'
  },

  plugins: [
    babel()
  ],

  external: ['cast-string']
}
