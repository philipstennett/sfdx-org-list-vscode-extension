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

  private orgTree: any;

  constructor() {}

  init(): Promise<void> {
    return this.loadOrgList();
  }

  refresh(): void {
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
        let orgs: Org[] = [];
        if (element.label === "Non Scratch Orgs") {
          for (let org of this.orgTree.nonScratchOrgs) {
            orgs.push(
              new Org(
                org.alias,
                org.username,
                "non-scratch",
                this,
                vscode.TreeItemCollapsibleState.None
              )
            );
          }
        } else if (element.label === "Scratch Orgs") {
          for (let org of this.orgTree.scratchOrgs) {
            orgs.push(
              new Org(
                org.alias,
                org.username,
                "scratch",
                this,
                vscode.TreeItemCollapsibleState.None
              )
            );
          }
        }
        return resolve(orgs);
      } else {
        let treeItems: vscode.TreeItem[] = [];
        if (
          this.orgTree.nonScratchOrgs &&
          this.orgTree.nonScratchOrgs.length > 0
        ) {
          treeItems.push(
            new vscode.TreeItem(
              "Non Scratch Orgs",
              vscode.TreeItemCollapsibleState.Expanded
            )
          );
        }
        if (this.orgTree.scratchOrgs && this.orgTree.scratchOrgs.length > 0) {
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

  loadOrgList(): Promise<void> {
    return new Promise((resolve, reject) => {
      cp.exec("sfdx force:org:list --json", null, (error, stdout, stderr) => {
        if (error) {
          return reject("Loading org list failed.");
        }
        this.orgTree = JSON.parse(stdout.toString()).result;
        console.debug("got orgs");
        return resolve();
      });
    });
  }

  removeItem(org: Org): void {
    if (org.type === "non-scratch") {
      this.orgTree.nonScratchOrgs = this.orgTree.nonScratchOrgs.filter(
        (x: any) => x.username !== org.username
      );
    } else if (org.type === "scratch") {
      this.orgTree.scratchOrgs = this.orgTree.scratchOrgs.filter(
        (x: any) => x.username !== org.username
      );
    }
    this._onDidChangeTreeData.fire();
  }
}
