import * as vscode from "vscode";
import { OrgListProvider } from "./orgListProvider";
import { Org } from "./org";

export function activate(context: vscode.ExtensionContext) {
  const orgListProvider = new OrgListProvider();
  orgListProvider
    .init()
    .then(() => {
      vscode.window.registerTreeDataProvider("org-list", orgListProvider);
      vscode.commands.registerCommand("org-list.refresh", () =>
        orgListProvider.refresh()
      );

      vscode.commands.registerCommand("org.open", (org: Org) => org.open());
      vscode.commands.registerCommand("org.logout", (org: Org) => org.logout());
      vscode.commands.registerCommand("org.delete", (org: Org) => org.delete());
    })
    .catch(error => vscode.window.showErrorMessage(error));
}

export function deactivate() {}
