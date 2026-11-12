export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', 'app.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }],
    [
      'jest-html-reporters',
      {
        publicPath: 'reports',
        filename: 'test-report.html',
        pageTitle: 'Relatório de Testes — Sistema de Climatização',
        openReport: false,
        expand: true,
      },
    ],
  ],
};
