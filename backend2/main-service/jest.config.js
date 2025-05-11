// // main-service/jest.config.js
// export default {
//   testEnvironment: 'node',
//   clearMocks: true,
//   collectCoverage: true,
//   collectCoverageFrom: [
//     'controllers//*.js',
//     'routes//*.js',
//     // Exclude files not directly part of your testable API logic or that are heavily mocked
//     '!middlewares/authMiddleware.js', // You are mocking this directly in tests
//     '!models//*.js',                // You are mocking these directly in tests
//     '!server.js',                     // Usually not directly unit tested this way
//     '!config//*.js',                // Configuration files
//     '!utils//*.js',                 // Utility files, include if you want to test them
//   ],
//   coverageDirectory: 'coverage',
//   coverageReporters: ['json', 'text', 'lcov', 'clover', 'html'], // Added 'html' for a nice report
//   moduleFileExtensions: ['js', 'json', 'node'], // 'js' is primary for your project

//   // Use babel-jest to transpile tests and any JS files
//   transform: {
//     '^.+\\.js$': 'babel-jest',
//   },

//   // By default, Jest doesn't transform node_modules.
//   // If you have node_modules that are ESM and need transpilation (uncommon for your setup),
//   // you might need to adjust this. For now, the default is usually fine.
//   // transformIgnorePatterns: [
//   //   '/node_modules/',
//   //   '\\.pnp\\.[^\\/]+$',
//   // ],

//   // If you have a global setup file for tests (e.g., for mocks, DB setup/teardown)
//   // setupFilesAfterEnv: ['./tests/setup.js'],

//   // If you still face issues with ESM vs CJS interop with some specific modules,
//   // you might need to explicitly tell Jest about them.
//   // moduleNameMapper: {
//   //   // Example if a CJS module was causing issues with ESM import:
//   //   // 'some-cjs-module': '<rootDir>/node_modules/some-cjs-module/index.js'
//   // },
// };



// main-service/jest.config.js
export default {
    testEnvironment: 'node',
    clearMocks: true,
    collectCoverage: true,
  
    // --- FOCUS ON FARMER SECTION ---
    // 1. Only run test files from the tests/farmer/ directory
    testMatch: [
      '<rootDir>/tests/farmer//*.test.js',
    ],
  
    // 2. Collect coverage ONLY from farmer-related controllers and routes
    //    that are actually targeted by the tests specified in testMatch.
    collectCoverageFrom: [
      '<rootDir>/controllers/farmer//*.js', // Coverage from farmer controllers
      '<rootDir>/routes/farmer//*.js',    // Coverage from farmer routes
      // IMPORTANT: Do NOT list other controller/route paths here if you don't want them in the report
      // when only running farmer tests.
    ],
    // --- END FOCUS ON FARMER SECTION ---
  
    // This option can further refine what appears in the coverage report.
    // It ensures that only files that have at least one test covering them
    // are included in the report. This can be useful if collectCoverageFrom
    // is still too broad or if some utility files are pulled in by tests.
    // For your current need (only farmer files), the collectCoverageFrom above should be sufficient.
    // considerCoverageFromGit: false, // Default, might not be needed to change.
    // coveragePathIgnorePatterns: [ // More granular exclusion if needed
    //   '/node_modules/',
    //   '<rootDir>/config/',
    //   '<rootDir>/middlewares/', // if not specifically testing middlewares
    //   '<rootDir>/models/',      // if models are just data structures and fully mocked
    //   '<rootDir>/server.js',
    //   '<rootDir>/utils/'        // unless specific utils are tested
    // ],
  
  
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'text', 'lcov', 'clover', 'html'],
    moduleFileExtensions: ['js', 'json', 'node'],
  
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
  };