# arciera/server

[![Node.js CI](https://github.com/arciera/server/actions/workflows/nodejs.yml/badge.svg)](https://github.com/arciera/server/actions/workflows/nodejs.yml)

[**`Download`**](https://github.com/arciera/server/releases/latest) &middot; [**`Documentation`**](https://github.com/ariera/server/wiki)

A Minecraft server written in TypeScript. Modern, multi-threaded, modular and built for performance.

## Running

To run arciera/server you need [**Node.js 18 or higher**](https://nodejs.org/en/download).

Download `server.mjs` from the [latest release](https://github.com/arciera/server/releases/latest). Alternatively, you
can clone the repository and run `npm run bundle` to build the server yourself. You will find the bundled server
in `build/index.js`.

To start the server:

```shell
node server.mjs
```

To stop the server, send `SIGINT` by pressing <kbd>Ctrl</kbd>+<kbd>C</kbd> (`^C`).

## Issues

If you find any bugs or issues, or have any suggestions, please [open an issue](https://github.com/arciera/server/issues/new).

Fixing bugs is our utmost priority.

## FAQ

<details>
    <summary>I can't join the world!</summary>

> Arciera server is a bare-bones server and does not have a world. If you want to connect to a world, you need to use a plugin that provides a world. Any additional features beyond simply establishing a connection require a plugin.
</details>

## Contributing

All contributions are most welcome!

If you would like to contribute a new feature, make sure that it is within the scope of the project. Arciera server aims to be minimal and lightweight and sometimes creating a plugin might be more suitable.

To contribute, [fork the repository](https://github.com/arciera/server/fork), make your changes and open a pull request.
