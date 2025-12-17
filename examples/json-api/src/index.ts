import assert from "node:assert";
import { serve } from "@hono/node-server";
import { connect, type Framer } from "framer-api";
import { Hono } from "hono";

const projectUrl = process.env["EXAMPLE_PROJECT_URL"];
assert(projectUrl, "EXAMPLE_PROJECT_URL environment variable is required");

interface Variables {
    framer: Framer;
}

const app = new Hono<{ Variables: Variables }>();

// Middleware to connect to Framer and set the framer client in the context.
// Will not share the instance between requests
app.use(async (c, next) => {
    // The `using` keyword is used to ensure that the Framer client is closed after the block is executed.
    // This will automatically end the connection when the request is complete
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using
    using framer = await connect(projectUrl);
    c.set("framer", framer);
    await next();
});

app.get("/collections", async (c) => {
    const allCollections = await c.var.framer.getCollections();

    const collections = allCollections.map((col) => ({
        id: col.id,
        name: col.name,
    }));

    return c.json({ collections });
});

app.get("/collections/:collectionId", async (c) => {
    const collectionId = c.req.param("collectionId");
    const allCollections = await c.var.framer.getCollections();
    const collection = allCollections.find((col) => col.id === collectionId);

    if (!collection) {
        return c.json({ error: "Collection not found" }, 404);
    }

    const allItems = await collection.getItems();

    const items = allItems.map((item) => ({
        id: item.id,
        slug: item.slug,
    }));

    return c.json({ items });
});

app.get("/collections/:collectionId/:itemId", async (c) => {
    const collectionId = c.req.param("collectionId");
    const itemId = c.req.param("itemId");
    const allCollections = await c.var.framer.getCollections();
    const collection = allCollections.find((col) => col.id === collectionId);

    if (!collection) {
        return c.json({ error: "Collection not found" }, 404);
    }

    const allItems = await collection.getItems();

    const item = allItems.find((i) => i.id === itemId);

    if (!item) {
        return c.json({ error: "Item not found" }, 404);
    }

    return c.json(item);
});

serve(app, (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
});
