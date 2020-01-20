import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";
import { OrgListProvider } from "./orgListProvider";

export class Org extends vscode.TreeItem {
  constructor(
    public alias: string,
    public username: string,
    public status: string,
    public type: string,
    private orgListProvider: OrgListProvider,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(alias, collapsibleState);
  }

  get tooltip(): string {
    return `Status: ${this.status}`;
  }

  get description(): string {
    return this.username;
  }

  open() {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Opening ${this.alias}.`,
        cancellable: false
      },
      () => {
        return new Promise((resolve, reject) => {
          cp.exec(
            "sfdx force:org:open -u " + this.username,
            null,
            (error, stdout, stderr) => {
              if (error) {
                vscode.window.showErrorMessage(`Error opening ${this.alias}.`);
                reject();
              }
              resolve();
            }
          );
        });
      }
    );
  }

  rename() {
    vscode.window.showInputBox().then(name => {
      if (name) {
        this.alias = name;
        this.label = name;
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Changing alias for ${this.username} to ${this.alias}.`,
            cancellable: false
          },
          () => {
            return new Promise((resolve, reject) => {
              cp.exec(
                `sfdx force:alias:set ${this.alias}=${this.username}`,
                null,
                (error, stdout, stderr) => {
                  if (error) {
                    vscode.window.showErrorMessage(
                      `Error changing alias for ${this.username}.`
                    );
                    reject();
                  }
                  this.orgListProvider.reload();
                  resolve();
                }
              );
            });
          }
        );
      }
    });
  }

  logout() {
    vscode.window
      .showInformationMessage(
        `Are you sure you want to log out of ${this.alias}?`,
        "Cancel",
        "Logout"
      )
      .then(selection => {
        if (selection === "Logout") {
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Logging out ${this.alias}.`,
              cancellable: false
            },
            () => {
              return new Promise((resolve, reject) => {
                cp.exec(
                  "sfdx force:auth:logout --noprompt -u " + this.username,
                  null,
                  (error, stdout, stderr) => {
                    if (error) {
                      vscode.window.showErrorMessage(
                        `Error logging out of ${this.alias}.`
                      );
                      reject();
                    }
                    vscode.window.showInformationMessage(
                      `Logged out of ${this.alias}.`
                    );
                    this.orgListProvider.removeItem(this);
                    resolve();
                  }
                );
              });
            }
          );
        }
      });
  }

  delete() {
    vscode.window
      .showInformationMessage(
        `Are you sure you want to delete ${this.alias}?`,
        "Cancel",
        "Delete"
      )
      .then(selection => {
        if (selection === "Delete") {
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Deleting ${this.alias}.`,
              cancellable: false
            },
            () => {
              return new Promise((resolve, reject) => {
                cp.exec(
                  "sfdx force:org:delete --noprompt -u " + this.username,
                  null,
                  (error, stdout, stderr) => {
                    if (error) {
                      vscode.window.showErrorMessage(
                        `Error deleting ${this.alias}.`
                      );
                      reject();
                    }
                    vscode.window.showInformationMessage(
                      `Deleted ${this.alias}.`
                    );
                    this.orgListProvider.removeItem(this);
                    resolve();
                  }
                );
              });
            }
          );
        }
      });
  }

  iconPath = {
    light: path.join(__filename, "..", "..", "media", "cloud.png"),
    dark: path.join(__filename, "..", "..", "media", "cloud.png")
  };

  get contextValue() {
    return this.type + "-org";
  }
}
