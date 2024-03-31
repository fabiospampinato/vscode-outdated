# Outdated

<p align="center">
  <img src="https://raw.githubusercontent.com/fabiospampinato/vscode-outdated/master/resources/logo.png" width="128" alt="Logo">
</p>

A super quick way to update npm dependencies, via a code lens.

Clicking the code lens will update the dependency's version in the current `package.json` file.

This extension requires `npm-cli` to be installed and it only works for npm dependencies listead in `package.json` files.

## Install

Follow the instructions in the [Marketplace](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-outdated), or run the following in the command palette:

```sh
ext install fabiospampinato.vscode-outdated
```

## Usage

It adds 4 commands to the command palette:

```js
'Outdated: Toggle' // Enable or disable the code lens
'Outdated: Disable' // Disable the code lens
'Outdated: Enable' // Enable the code lens
'Outdated: Refresh' // Force refresh the code lens
```

## Settings

```js
{
  "outdated.enabled": true // Whether the code lens is enabled or not
}
```

## Demo

![Demo](resources/demo.png)

## License

MIT © Fabio Spampinato
