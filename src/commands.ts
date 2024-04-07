
/* IMPORT */

import vscode from 'vscode';
import Lens from './lens';
import {escapeRegex, getOptions} from './utils';

/* MAIN */

const bump = async ( uri: string, name: string, version: string, versionNext: string ): Promise<void> => {

  if ( version === versionNext ) return;

  const document = vscode.workspace.textDocuments.find ( document => document.uri.toString () === uri );

  if ( !document ) return;

  const lineRe = new RegExp ( `^(\\s*"${escapeRegex ( name )}":\\s*")${escapeRegex ( version )}(")`, 'm' );
  const lineMatch = lineRe.exec ( document.getText () );

  if ( !lineMatch ) return;

  const editor = await vscode.window.showTextDocument ( document );

  await editor.edit ( edit => {

    const start = document.positionAt ( lineMatch.index + lineMatch[1].length );
    const end = document.positionAt ( lineMatch.index + lineMatch[0].length - 1 );
    const range = new vscode.Range ( start, end );

    edit.replace ( range, versionNext );

  });

};

const disable = (): void => {

  toggle ( false );

};

const enable = (): void => {

  toggle ( true );

};

const toggle = ( force?: boolean ): void => {

  force ??= !getOptions ().enabled;

  vscode.workspace.getConfiguration ( 'outdated' ).update ( 'enabled', force, true );

};

const toggleBadges = ( force?: boolean ): void => {

  force ??= !getOptions ().badges.enabled;

  vscode.workspace.getConfiguration ( 'outdated' ).update ( 'badges.enabled', force, true );

};

const refresh = (): void => {

  Lens.refresh ();

};

/* EXPORT */

export {bump, disable, enable, toggle, toggleBadges, refresh};
