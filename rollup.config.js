import babel from 'rollup-plugin-babel';

export default {
  moduleName: 'ManagedHistory',
  entry: 'src/index.js',
  format: 'umd',
  plugins: [babel()],
  dest: 'dist/index.js',
  sourceMap: true
};
