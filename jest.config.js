module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Run tests inside src/test
  testMatch: ["<rootDir>/src/test/**/*.test.ts"],

  moduleFileExtensions: ["ts", "js", "json"],

  // IMPORTANT: map vscode to the correct mock path
  moduleNameMapper: {
    "^vscode$": "<rootDir>/__mocks__/vscode.ts",
  },

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        isolatedModules: true,
      },
    ],
  },

  rootDir: ".",
};
