export const window = {
  createTextEditorDecorationType: jest.fn(() => ({})),
  showQuickPick: jest.fn(),
  showInputBox: jest.fn(),
  activeTextEditor: null,
  onDidChangeActiveTextEditor: jest.fn(),
};

export const commands = {
  registerCommand: jest.fn(),
};

export const languages = {
  registerHoverProvider: jest.fn(),
};

export const workspace = {
  workspaceFolders: [{ uri: { fsPath: "" } }],
};

export class Range {
  constructor(public start: any, public end: any) {}
}

export class Position {
  constructor(public line: number, public character: number) {}
}

export class MarkdownString {
  constructor(public value: string) {}
  isTrusted = false;
}

export class Hover {
  constructor(public value: any) {}
}

export const Uri = {
  file: jest.fn(),
};
