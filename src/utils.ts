
/* IMPORT */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import escapeRegex from 'string-escape-regex';
import {exec, getConfig} from 'vscode-extras';
import zeptoid from 'zeptoid';
import type {Dependency, Options} from './types';

/* MAIN */

//TODO: Parse version ranges properly, supporting in some way all possible kinds of ranges also
//TODO: Version ranges and versions aren't really the same thing, there should be better separation between those two concepts here

const getDependenciesFromPackage = ( pkg: unknown ): Dependency[] => {

  const dependencies: Dependency[] = [];

  if ( !isObject ( pkg ) ) return dependencies;

  for ( const property of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'] ) {

    if ( !( property in pkg ) ) continue;

    const map = pkg[property];

    if ( !isObject ( map ) ) continue;

    for ( const [name, current] of Object.entries ( map ) ) {

      if ( !isString ( name ) || !isString ( current ) ) continue;

      dependencies.push ({ name, current });

    }

  }

  return dependencies;

};

const getDependenciesFromRegistry = async ( deps: Dependency[] ): Promise<Dependency[]> => {

  /* PACKAGE.JSON */

  const dependenciesMap = Object.fromEntries ( deps.map ( ({ name, current }) => [name, current] ) );
  const pkg = { dependencies: dependenciesMap };
  const pkgContent = JSON.stringify ( pkg );
  const pkgFolderPath = path.join ( os.tmpdir (), zeptoid () );
  const pkgFilePath = path.join ( pkgFolderPath, 'package.json' );

  await fs.mkdir ( pkgFolderPath, { recursive: true } );
  await fs.writeFile ( pkgFilePath, pkgContent );

  /* OUTDATED */

  const outdatedResult = await exec ( 'npm', ['outdated', '--json'], { cwd: pkgFolderPath } );
  const outdated = JSON.parse ( outdatedResult.stdout.toString () );

  /* RESULT */

  const dependencies: Dependency[] = [];

  for ( const name in outdated ) {

    const value = outdated[name];
    const current = dependenciesMap[name];
    const latest = isString ( value.latest ) ? value.latest : undefined;
    const wanted = isString ( value.wanted ) ? value.wanted : undefined;

    dependencies.push ({ name, current, latest, wanted });

  }

  return dependencies;

};

const getOptions = (): Options => {

  const config = getConfig ( 'outdated' );
  const enabled = isBoolean ( config?.enabled ) ? config.enabled : true;

  return { enabled };

};

const getVersionComparison = ( a: string, b: string ): -1 | 0 | 1 => { // -1: a < b, 0: a === b, 1: a > b

  if ( a === b ) return 0;

  const as = getVersionSections ( a );
  const bs = getVersionSections ( b );

  if ( !as && !bs ) return 0;
  if ( !as ) return -1;
  if ( !bs ) return 1;

  if ( as.major < bs.major ) return -1;
  if ( as.major > bs.major ) return 1;

  if ( as.minor < bs.minor ) return -1;
  if ( as.minor > bs.minor ) return 1;

  if ( as.patch < bs.patch ) return -1;
  if ( as.patch > bs.patch ) return 1;

  if ( as.suffix < bs.suffix ) return -1;
  if ( as.suffix > bs.suffix ) return 1;

  return 0;

};

const getVersionSections = ( version: string ): { prefix: string, major: number, minor: number, patch: number, suffix: string } | undefined => {

  const re = /^(\^|~|>=?|<=?|=)?(\d+)(?:\.(\d+))?(?:\.(\d+))?(-[a-z]+(?:\.\d+))?$/;
  const match = version.match ( re );

  if ( !match ) return;

  const prefix = match[1] || '';
  const major = Number ( match[2] );
  const minor = Number ( match[3] || 0 );
  const patch = Number ( match[4] || 0 );
  const suffix = match[5] || '';

  return { prefix, major, minor, patch, suffix };

};

const getVersionUnprefixed = ( version: string ): string => {

  const prefixRe = /^(\^|~|>=?|<=?|=)/;
  const versionUnprefixed = version.replace ( prefixRe, '' );

  return versionUnprefixed;

};

const isBoolean = ( value: unknown ): value is boolean => {

  return typeof value === 'boolean';

};

const isObject = ( value: unknown ): value is Record<string, unknown> => {

  return typeof value === 'object' && value !== null;

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

/* EXPORT */

export {escapeRegex, getDependenciesFromPackage, getDependenciesFromRegistry, getOptions, getVersionComparison, getVersionSections, getVersionUnprefixed, isBoolean, isObject, isString};
