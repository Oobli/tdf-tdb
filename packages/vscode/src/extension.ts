import * as vscode from "vscode";
import { inspectTBFHeader } from "./tbf";

export function activate(context: vscode.ExtensionContext): void {
  const inspectCommand = vscode.commands.registerCommand(
    "tdf.inspectTBF",
    async (uri?: vscode.Uri) => {
      const documentUri =
        uri ??
        vscode.window.activeTextEditor?.document.uri;

      if (!documentUri || !documentUri.fsPath.endsWith(".tbf")) {
        vscode.window.showWarningMessage(
          "Select a .tbf file first."
        );
        return;
      }

      try {
        const bytes = await vscode.workspace.fs.readFile(documentUri);
        const header = inspectTBFHeader(bytes);

        vscode.window.showInformationMessage(
          `Valid TBF file · Version ${header.major}.${header.minor} · ${bytes.length} bytes`
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        vscode.window.showErrorMessage(
          `TBF inspection failed: ${message}`
        );
      }
    }
  );

  context.subscriptions.push(inspectCommand);
}

export function deactivate(): void {}