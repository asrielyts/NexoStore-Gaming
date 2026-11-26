const path = require('node:path');
module.exports = function (config) {
  const chromium = process.env.CHROME_BIN || (process.platform === 'win32' ? undefined : '/usr/bin/chromium');
  if (chromium) process.env.CHROME_BIN = chromium;
  config.set({
    frameworks: ['jasmine'],
    files: ['tests/**/*.spec.jsx'],
    preprocessors: { 'tests/**/*.spec.jsx': ['webpack'] },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.jsx', '.js'], alias: { '@': path.resolve(__dirname, 'src') } },
      module: {
        rules: [{ test: /\.[jt]sx?$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { plugins: ['istanbul'] } } }]
      },
      output: { publicPath: '/_karma_webpack_/' },
      stats: 'errors-only'
    },
    reporters: ['progress','coverage'],
    coverageReporter: { dir: path.resolve(__dirname,'coverage'), reporters: [{type:'html',subdir:'html'},{type:'text-summary'},{type:'lcovonly',subdir:'.'}] },
    browsers: [process.env.CI ? 'ChromeHeadlessNoSandbox' : 'ChromeHeadlessNoSandbox'],
    customLaunchers: { ChromeHeadlessNoSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-dev-shm-usage'] } },
    singleRun: true,
    client: { clearContext: false },
    browserNoActivityTimeout: 60000,
  });
};
