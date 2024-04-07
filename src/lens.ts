
/* IMPORT */

import JSONC from 'tiny-jsonc';
import vscode from 'vscode';
import {escapeRegex, getDependenciesFromPackage, getDependenciesFromRegistry, getVersionComparison, getVersionSections, getVersionUnprefixed, getOptions} from './utils';

/* MAIN */

//TODO: Detect line numbers properly, from the AST
//TODO: Ensure this doesn't query NPM too much, it's unclear how much stuff npm-cli caches

class CodeLensProvider implements vscode.CodeLensProvider {

  /* VARIABLES */

  private _onDidChangeCodeLenses = new vscode.EventEmitter<void> ();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  /* API */

  provideCodeLenses = async ( document: vscode.TextDocument, token: vscode.CancellationToken ): Promise<vscode.CodeLens[]> => {

    const options = getOptions ();

    if ( !options.enabled ) return [];

    const uri = document.uri.toString ();
    const content = document.getText ();

    try {

      const pkg = JSONC.parse ( content );
      const dependenciesFromPackage = getDependenciesFromPackage ( pkg );

      if ( !dependenciesFromPackage.length ) return [];

      const dependenciesFromRegistry = await getDependenciesFromRegistry ( dependenciesFromPackage );

      if ( !dependenciesFromRegistry.length ) return [];
      if ( token.isCancellationRequested ) return [];

      const lenses: vscode.CodeLens[] = [];

      for ( const { name, current, latest, wanted } of dependenciesFromRegistry ) {

        const currentSections = getVersionSections ( current );

        if ( !currentSections ) continue; //TODO: Maybe show an error if this happens

        const versionNextWanted = wanted && getVersionComparison ( wanted, current ) === 1 ? wanted : undefined;
        const versionNextLatest = latest && getVersionComparison ( latest, current ) === 1 ? latest : undefined;
        const versionNext = versionNextWanted || versionNextLatest || getVersionUnprefixed ( current );

        const lineRe = new RegExp ( `^\\s*"${escapeRegex ( name )}":\\s*"${escapeRegex ( current )}"`, 'm' );
        const lineMatch = lineRe.exec ( content );

        if ( !lineMatch ) continue;

        const line = document.lineAt ( document.positionAt ( lineMatch.index ).line );
        const next = `${currentSections.prefix}${versionNext}`;

        const hasBadges = true; //TODO: Add a setting for this
        const badgeCurrent = hasBadges ? '$(circle-filled)' : '';
        const badgeNext = hasBadges ? '$(circle-outline)' : '';

        const lens = new vscode.CodeLens ( line.range, {
          title: ( current === next ) ? `${badgeCurrent}latest` : `${badgeNext}update to ${next}`,
          command: 'outdated.bump',
          arguments: [uri, name, current, next]
        });

        lenses.push ( lens );

      }

      return lenses;

    } catch {

      return [];

    }

  };

  refresh = (): void => {

    vscode.workspace.onDidChangeConfiguration ( () => {
      this._onDidChangeCodeLenses.fire ();
    });

  };

}

/* EXPORT */

export default new CodeLensProvider ();
