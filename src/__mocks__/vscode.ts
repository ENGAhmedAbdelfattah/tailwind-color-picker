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

export class Position {
  constructor(public line: number, public character: number) { }
}

export class Range {
  constructor(public start: Position, public end: Position) { }

  contains(other: Range | Position): boolean {
    const pos = other instanceof Position ? other : other.start;

    const startsAfter = pos.line > this.start.line || (pos.line === this.start.line && pos.character >= this.start.character);
    const endsBefore = pos.line < this.end.line || (pos.line === this.end.line && pos.character <= this.end.character);

    if (other instanceof Range) {
      const otherEndsBefore = other.end.line < this.end.line || (other.end.line === this.end.line && other.end.character <= this.end.character);
      return startsAfter && otherEndsBefore;
    }

    return startsAfter && endsBefore;
  }

  isEqual(other: Range): boolean {
    return this.start.line === other.start.line &&
      this.start.character === other.start.character &&
      this.end.line === other.end.line &&
      this.end.character === other.end.character;
  }
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