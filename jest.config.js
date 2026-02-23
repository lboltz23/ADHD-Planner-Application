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
    'src/constants/theme.ts',
    'src/components/taskColors.ts',
    'src/components/Confirmation.tsx',
    'src/components/TitleInput.tsx',
    'src/hooks/use-Safe-Back.ts',
    'src/types/index.ts',
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
