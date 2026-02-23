module.exports = {
  preset: 'jest-expo',

  roots: [
    '<rootDir>/testing',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
  ],

  setupFiles: [
    './jest.setup.js',
  ],

  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*)',
  ],

  testMatch: [
    '**/*.test.{ts,tsx}',
  ],

  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '<rootDir>/lib/**/*.ts',
    '!**/*.d.ts',
  ],

  coverageThreshold: {
    global: {
      statements: 65,
      branches: 65,
      functions: 65,
      lines: 65,
    },
  },
};
