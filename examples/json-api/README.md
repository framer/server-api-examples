# JSON API

A simple HTTP/JSON server that exposes Framer collections via REST endpoints using [Hono](https://hono.dev).

## Usage

```bash
EXAMPLE_PROJECT_URL="https://framer.com/projects/..." npm run dev
```

The server runs on port 3000 by default.

## Endpoints

### List Collections

```
GET /collections
```

Returns all collections in the project.

### List Items

```
GET /collections/:collectionId
```

Returns all items in a collection by ID.

### Get Item

```
GET /collections/:collectionId/:itemId
```

Returns a single item with its field data.

