# Framer Server API Examples

This repository contains examples for the Framer Server API. Each example is a standalone project that can be run independently.

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
