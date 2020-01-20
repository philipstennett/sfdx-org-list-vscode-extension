import * as vscode from "vscode";
import * as cp from "child_process";
import { Org } from "./org";

export class OrgListProvider
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined
  > = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this
    ._onDidChangeTreeData.event;

  private scratchOrgs: Array<Org> = [];
  private nonScratchOrgs: Array<Org> = [];

  constructor() {}

  init(): Thenable<void> {
    return this.loadOrgList();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  reload(): void {
    this.loadOrgList().then(() => {
      this._onDidChangeTreeData.fire();
    });
  }

  getTreeItem(element: Org): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    return new Promise<vscode.TreeItem[]>((resolve, reject) => {
      if (element) {
        return resolve(
          element.label === "Scratch Orgs"
            ? this.scratchOrgs
            : this.nonScratchOrgs
        );
      } else {
        let treeItems: vscode.TreeItem[] = [];
        if (this.nonScratchOrgs && this.nonScratchOrgs.length > 0) {
          treeItems.push(
            new vscode.TreeItem(
              "Non Scratch Orgs",
              vscode.TreeItemCollapsibleState.Expanded
            )
          );
        }
        if (this.scratchOrgs && this.scratchOrgs.length > 0) {
          treeItems.push(
            new vscode.TreeItem(
              "Scratch Orgs",
              vscode.TreeItemCollapsibleState.Expanded
            )
          );
        }
        return resolve(treeItems);
      }
    });
  }

  loadOrgList(): Thenable<void> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Loading Org List",
        cancellable: false
      },
      () => {
        return new Promise((resolve, reject) => {
          cp.exec(
            "sfdx force:org:list --json",
            null,
            (error, stdout, stderr) => {
              if (error) {
                return reject("Loading org list failed.");
              }
              let orgTree = JSON.parse(stdout.toString()).result;
              this.nonScratchOrgs = [];
              for (let org of orgTree.nonScratchOrgs) {
                this.nonScratchOrgs.push(
                  new Org(
                    org.alias,
                    org.username,
                    org.connectedStatus,
                    "non-scratch",
                    this,
                    vscode.TreeItemCollapsibleState.None
                  )
                );
              }
              this.scratchOrgs = [];
              for (let org of orgTree.scratchOrgs) {
                this.scratchOrgs.push(
                  new Org(
                    org.alias,
                    org.username,
                    org.connectedStatus,
                    "scratch",
                    this,
                    vscode.TreeItemCollapsibleState.None
                  )
                );
              }
              return resolve();
            }
          );
        });
      }
    );
  }

  removeItem(org: Org): void {
    if (org.type === "non-scratch") {
      this.nonScratchOrgs = this.nonScratchOrgs.filter(
        (x: any) => x.username !== org.username
      );
    } else if (org.type === "scratch") {
      this.scratchOrgs = this.scratchOrgs.filter(
        (x: any) => x.username !== org.username
      );
    }
    this._onDidChangeTreeData.fire();
  }
}
