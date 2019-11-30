// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { OrgListProvider, Org } from "./orgList";

export function activate(context: vscode.ExtensionContext) {
  const orgListProvider = new OrgListProvider();
  vscode.window.registerTreeDataProvider("orgList", orgListProvider);
  vscode.commands.registerCommand("orgList.refresh", () =>
    orgListProvider.refresh()
  );
  vscode.commands.registerCommand("orgList.open", (org: Org) => org.open());
}

export function deactivate() {}
