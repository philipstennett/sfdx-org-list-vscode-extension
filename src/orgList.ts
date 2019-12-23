import * as vscode from "vscode";
import * as cp from "child_process";
import { Org } from "./org";

export class OrgListProvider implements vscode.TreeDataProvider<Org> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Org | undefined
  > = new vscode.EventEmitter<Org | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Org | undefined> = this
    ._onDidChangeTreeData.event;

  private isScratch: boolean;

  constructor(isScratch: boolean) {
    this.isScratch = isScratch;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Org): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Org): Thenable<Org[]> {
    return new Promise<Org[]>((resolve, reject) => {
      cp.exec("sfdx force:org:list --json", null, (error, stdout, stderr) => {
        if (error) {
          return resolve([]);
        }
        let obj = JSON.parse(stdout.toString());
        let orgs: Org[] = [];

        if (this.isScratch) {
          for (let org of obj.result.scratchOrgs) {
            orgs.push(
              new Org(
                org.alias,
                org.username,
                vscode.TreeItemCollapsibleState.None
              )
            );
          }
        } else {
          for (let org of obj.result.nonScratchOrgs) {
            orgs.push(
              new Org(
                org.alias,
                org.username,
                vscode.TreeItemCollapsibleState.None
              )
            );
          }
        }
        return resolve(orgs);
      });
    });
  }
}
