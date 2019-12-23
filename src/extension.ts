// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { OrgListProvider } from "./orgList";
import { Org } from "./org";

export function activate(context: vscode.ExtensionContext) {
  const nonScratchProvider = new OrgListProvider(false);
  vscode.window.registerTreeDataProvider(
    "non-scratch-orgs",
    nonScratchProvider
  );
  vscode.commands.registerCommand("non-scratch-orgs.refresh", () =>
    nonScratchProvider.refresh()
  );

  const scratchProvider = new OrgListProvider(true);
  vscode.window.registerTreeDataProvider("scratch-orgs", scratchProvider);
  vscode.commands.registerCommand("scratch-orgs.refresh", () =>
    scratchProvider.refresh()
  );

  vscode.commands.registerCommand("org.open", (org: Org) => org.open());
  vscode.commands.registerCommand("org.logout", (org: Org) => org.logout());
  vscode.commands.registerCommand("org.delete", (org: Org) => org.delete());
}

export function deactivate() {}
