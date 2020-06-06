// tslint:disable-next-line:no-require-imports no-var-requires
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config: any) => {
  config.set({
    autoWatch: false,
    browsers: ['ChromeCi'],
    colors: true,
    customLaunchers: {
      ChromeCi: {
        base: 'ChromeHeadless',
        flags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
    files: [
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/proxy.js',
      'node_modules/zone.js/dist/sync-test.js',
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',
      'karma-test-shim.ts',
      'index.ts',
      'jasmine.ts',
      { pattern: 'lib/**/*.ts' },
      { pattern: 'examples-jasmine/**/*.ts' },
      { pattern: 'tests-jasmine/**/*.ts' },
    ],
    frameworks: ['jasmine', 'karma-typescript'],
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },
    reporters: ['dots', 'karma-typescript', 'kjhtml'],
    singleRun: true,

    karmaTypescriptConfig: {
      include: ['karma-test-shim.ts', 'examples-jasmine/**/*', 'lib/**/*', 'tests-jasmine/**/*'],
      tsconfig: 'tsconfig.json',
    },
  });
};
