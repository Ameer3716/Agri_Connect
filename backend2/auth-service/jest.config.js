export default {
    testEnvironment: "node",
    // extensionsToTreatAsEsm line removed as .js is inferred from package.json type: "module"
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
  };