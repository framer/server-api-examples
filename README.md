<h1 align="center" margin="0">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://misc.framerstatic.com/framer-api/package-logo-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://misc.framerstatic.com/framer-api/package-logo.svg">
    <img alt="Framer Server API" src="https://misc.framerstatic.com/framer-api/package-logo.svg" width="200">
  </picture>
</h1>
<br>
<h3 align="center" style="margin: 0;">
Framer Server API Examples
</h3>

<br>

![server-api](https://misc.framerstatic.com/framer-api/server-api-header.png?v1)

This repository contains [examples](./examples) for the Framer Server API. Each example is a standalone project that can be run independently.

## How to run examples

You need to obtain a Framer project URL and API key. You can get the API key from the Framer project settings and find the project URL in the browser URL bar.

Then, you need to set the `EXAMPLE_PROJECT_URL` and `FRAMER_API_KEY` environment variables.

## How to connect and get a framer client

```ts
const projectUrl = "https://framer.com/projects/Sites--aabbccddeeff";

const framer = await connect(projectUrl, apiKey);
// ... your code here ...
await framer.disconnect();
```

Starting with Node.js v24, you can use the `using` keyword to ensure that the Framer client is closed after the block is executed.

```ts
using framer = await connect(projectUrl, apiKey);

// ... your code here ...
// The disconnect is automatically called when the block is exited.
```

You can also use the environment variable `FRAMER_API_KEY` to set the API key and omit the API key parameter.

```ts
using framer = await connect(projectUrl);
```

## Documentation

- [Introduction](https://www.framer.com/developers/server-api-introduction)
- [Quick Start](https://www.framer.com/developers/server-api-quick-start)
- [Reference](https://www.framer.com/developers/server-api-reference)
- [FAQ](https://www.framer.com/developers/server-api-faq)
- [framer-api on npm](https://www.npmjs.com/package/framer-api)

## Feedback

Have questions or feedback? Email us at <server-api-feedback@framer.com>
