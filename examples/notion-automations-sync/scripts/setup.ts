#!/usr/bin/env node  --strip-types
import assert from "node:assert";
import { connect, type ManagedCollection } from "framer-api";
import { config } from "../src/config";

if (process.loadEnvFile) {
    process.loadEnvFile(".env");
}

const projectUrl = process.env.FRAMER_PROJECT_URL;
const apiKey = process.env.FRAMER_API_KEY;
const collectionName = process.env.FRAMER_COLLECTION_NAME;

assert(projectUrl, "FRAMER_PROJECT_URL required");
assert(apiKey, "FRAMER_API_KEY required");
assert(collectionName, "FRAMER_COLLECTION_NAME required");

using framer = await connect(projectUrl, apiKey);

async function findOrCreateCollection(name: string) {
    const existingCollections = await framer.getManagedCollections();
    const existing = existingCollections.find((c) => c.name === name);

    if (existing) {
        console.log(`Found existing collection [id: ${existing.id}]`);
        return existing;
    }

    const collection = await framer.createManagedCollection(name);
    console.log(`Created collection [id: ${collection.id}]`);
    return collection;
}

async function setupFields(collection: ManagedCollection) {
    const fields = config.FIELD_MAPPING.map((mapping) => ({
        type: mapping.type,
        name: mapping.framerName,
        id: mapping.framerId,
    }));

    await collection.setFields(fields);

    const setFields = await collection.getFields();
    console.log(`Set ${setFields.length} fields`);
}

async function logCollectionStatus(collection: ManagedCollection) {
    const itemIds = await collection.getItemIds();
    console.log(`Collection ready [existing items: ${itemIds.length}]`);
}

const collection = await findOrCreateCollection(collectionName);
await setupFields(collection);
await logCollectionStatus(collection);

console.log("\n✅ Setup complete! Collection is ready for webhook integration.");
