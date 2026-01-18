export const window = {
  createTextEditorDecorationType: jest.fn(() => ({})),
  showQuickPick: jest.fn(),
  showInputBox: jest.fn(),
  activeTextEditor: null,
  onDidChangeActiveTextEditor: jest.fn(),
  showInformationMessage: jest.fn(),
};

export const commands = {
  registerCommand: jest.fn(),
};

export const languages = {
  registerHoverProvider: jest.fn(),
};

export const workspace = {
  workspaceFolders: [{ uri: { fsPath: "" } }],
  getConfiguration: jest.fn().mockReturnValue({
    get: jest.fn((key, defaultValue) => defaultValue),
  }),
  createFileSystemWatcher: jest.fn(() => ({
    onDidChange: jest.fn(),
    onDidCreate: jest.fn(),
    onDidDelete: jest.fn(),
    dispose: jest.fn(),
  })),
};

export class Range {
  constructor(public start: any, public end: any) { }
}

export class Position {
  constructor(public line: number, public character: number) { }
}

export class MarkdownString {
  constructor(public value: string) { }
  isTrusted = false;
}

export class Hover {
  constructor(public value: any) { }
}

export class Color {
  constructor(
    public readonly red: number,
    public readonly green: number,
    public readonly blue: number,
    public readonly alpha: number
  ) { }
}

export class ColorInformation {
  constructor(public range: Range, public color: Color) { }
}

export class ColorPresentation {
  label: string;
  constructor(label: string) {
    this.label = label;
  }
}

export const Uri = {
  file: jest.fn(),
};

export enum ColorFormat {
  RGB = 1,
  HEX = 2
}