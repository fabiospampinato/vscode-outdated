
/* MAIN */

type Dependency = {
  name: string, // The name in package.json
  current: string, // The version in package.json
  latest?: string, // The maximum version matching the "*" version range
  wanted?: string // The maximum version matching the version range in package.json
};

type Options = {
  enabled: boolean,
  badges: {
    enabled: boolean
  }
};

/* EXPORT */

export type {Dependency, Options};
