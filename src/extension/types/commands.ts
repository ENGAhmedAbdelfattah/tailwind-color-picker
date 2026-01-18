import * as vscode from "vscode";

export type PickArgs = {
  range: vscode.Range;
  variants: string;
  utility: string;
};

