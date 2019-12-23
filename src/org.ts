import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";

export class Org extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private username: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.username}`;
  }

  get description(): string {
    return this.username;
  }

  open() {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Opening ${this.label}.`,
        cancellable: false
      },
      () => {
        return new Promise((resolve, reject) => {
          cp.exec(
            "sfdx force:org:open -u " + this.username,
            null,
            (error, stdout, stderr) => {
              if (error) {
                vscode.window.showErrorMessage(`Error opening ${this.label}.`);
                reject();
              }
              resolve();
            }
          );
        });
      }
    );
  }

  logout() {
    vscode.window
      .showInformationMessage(
        `Are you sure you want to log out of ${this.label}?`,
        "Cancel",
        "Logout"
      )
      .then(selection => {
        if (selection === "Logout") {
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Logging out ${this.label}.`,
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
                        `Error logging out of ${this.label}.`
                      );
                      reject();
                    }
                    vscode.window.showInformationMessage(
                      `Logged out of ${this.label}.`
                    );
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
        `Are you sure you want to delete ${this.label}?`,
        "Cancel",
        "Delete"
      )
      .then(selection => {
        if (selection === "Delete") {
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Deleting ${this.label}.`,
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
                        `Error deleting ${this.label}.`
                      );
                      reject();
                    }
                    vscode.window.showInformationMessage(
                      `Deleted ${this.label}.`
                    );
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

  contextValue = "org";
}
