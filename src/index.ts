
/* IMPORT */

import vscode from 'vscode';
import * as Commands from './commands';
import Lens from './lens';

/* MAIN */

const activate = (): void => {

  vscode.commands.registerCommand ( 'outdated.bump', Commands.bump );
  vscode.commands.registerCommand ( 'outdated.disable', Commands.disable );
  vscode.commands.registerCommand ( 'outdated.enable', Commands.enable );
  vscode.commands.registerCommand ( 'outdated.refresh', Commands.refresh );

  Lens.refresh ();

  vscode.languages.registerCodeLensProvider ( { language: 'json' }, Lens );
  vscode.workspace.onDidChangeConfiguration ( Lens.refresh );

};

/* EXPORT */

export {activate};
