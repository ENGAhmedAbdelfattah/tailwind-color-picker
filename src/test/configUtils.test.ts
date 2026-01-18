import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getExtensionConfig } from "../extension/utils/configUtils";

// Mock vscode
jest.mock("vscode", () => ({
  workspace: {
    workspaceFolders: [{ uri: { fsPath: "/mock/workspace" } }],
    getConfiguration: jest.fn(() => ({
      get: jest.fn((key, defaultValue) => defaultValue)
    }))
  }
}));

// Mock fs
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

describe("configUtils", () => {
  const mockConfigPath = path.join("/mock/workspace", "tailwind-color-picker.json");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return value from tailwind-color-picker.json if it exists", () => {
    (fs.existsSync as jest.Mock).mockImplementation((p) => p === mockConfigPath);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      cssFilePath: "custom/path.css",
      utilities: ["custom-util"]
    }));

    const cssPath = getExtensionConfig("cssFilePath", "default.css");
    const utils = getExtensionConfig("utilities", ["default-util"]);

    expect(cssPath).toBe("custom/path.css");
    expect(utils).toEqual(["custom-util"]);
  });

  it("should fallback to VS Code settings if config file does not exist", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const mockGet = jest.fn((key, defaultValue) => "from-vscode");
    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({ get: mockGet });

    const cssPath = getExtensionConfig("cssFilePath" as any, "default.css");
    expect(cssPath).toBe("from-vscode");
    expect(mockGet).toHaveBeenCalledWith("cssFilePath", "default.css");
  });

  it("should fallback to VS Code settings if config file exists but key is missing", () => {
    (fs.existsSync as jest.Mock).mockImplementation((p) => p === mockConfigPath);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      utilities: ["only-utils"]
    }));

    const mockGet = jest.fn((key, defaultValue) => defaultValue);
    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({ get: mockGet });

    const cssPath = getExtensionConfig("cssFilePath", "default.css");
    expect(cssPath).toBe("default.css");
    expect(mockGet).toHaveBeenCalled();
  });
});
