import * as vscode from "vscode";
import * as path from "path";
import * as cp from "child_process";

export class OrgListProvider implements vscode.TreeDataProvider<Org> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Org | undefined
  > = new vscode.EventEmitter<Org | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Org | undefined> = this
    ._onDidChangeTreeData.event;

  constructor() {}

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
        for (let org of obj.result.nonScratchOrgs) {
          orgs.push(
            new Org(
              org.alias,
              org.username,
              vscode.TreeItemCollapsibleState.None
            )
          );
        }
        for (let org of obj.result.scratchOrgs) {
          orgs.push(
            new Org(
              org.alias,
              org.username,
              vscode.TreeItemCollapsibleState.None
            )
          );
        }
        return resolve(orgs);
      });
    });
  }
}

export class Org extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.version}`;
  }

  get description(): string {
    return this.version;
  }

  open() {
    cp.exec(
      "sfdx force:org:open -u " + this.label,
      null,
      (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(`Error Opening ${this.label}.`);
        }
        vscode.window.showInformationMessage(`Opening ${this.label}.`);
      }
    );
  }

  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "light",
      "dependency.svg"
    ),
    dark: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "dark",
      "dependency.svg"
    )
  };

  contextValue = "org";
}
