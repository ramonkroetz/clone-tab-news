const { compilerOptions } = require('./tsconfig.json')

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  moduleNameMapper: Object.entries(compilerOptions.paths || {}).reduce((acc, [key, value]) => {
    const regexKey = `^${key.replace('*', '(.*)')}$`
    const mappedPath = `<rootDir>/${value[0].replace('*', '$1')}`
    acc[regexKey] = mappedPath
    return acc
  }, {}),
}
