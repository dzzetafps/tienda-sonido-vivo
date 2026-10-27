const { existsSync } = require('node:fs')
const path = require('node:path')

// Respetar CHROME_BIN si el equipo tiene una instalación personalizada.
if (process.platform === 'win32' && !process.env.CHROME_BIN) {
  const ubicaciones = [
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)'],
    process.env.LOCALAPPDATA,
  ]
    .filter(Boolean)
    .map((directorio) => path.join(directorio, 'Google', 'Chrome', 'Application', 'chrome.exe'))

  const chrome = ubicaciones.find((ubicacion) => existsSync(ubicacion))
  if (!chrome) {
    throw new Error('No se encontró Chrome. Define CHROME_BIN con la ruta completa a chrome.exe.')
  }
  process.env.CHROME_BIN = chrome
}

module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    plugins: ['karma-jasmine', 'karma-chrome-launcher'],
    files: [
      { pattern: '.karma/tests.bundle.js', watched: false },
      { pattern: 'public/img/productos/**/*', included: false, watched: false },
    ],
    proxies: { '/img/productos/': '/base/public/img/productos/' },
    browsers: ['ChromeHeadless'],
    reporters: ['progress'],
    singleRun: true,
    autoWatch: false,
    failOnEmptyTestSuite: true,
  })
}
