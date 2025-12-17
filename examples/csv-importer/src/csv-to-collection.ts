import assert from "node:assert";
import path from "node:path";
import { type CreateField, connect, type FieldDataEntryInput, type FieldDataInput } from "framer-api";
import { type FieldType, loadCsv } from "./load-csv.ts";

// Configuration

const projectUrl = process.env["EXAMPLE_PROJECT_URL"];
assert(projectUrl, "EXAMPLE_PROJECT_URL environment variable is required");

const csvPath = process.env["CSV_PATH"] ?? path.join(import.meta.dirname, "../data/sample-products.csv");
const collectionName = process.env["COLLECTION_NAME"] ?? "Products";

const { columns, rows, fieldTypes } = loadCsv(csvPath);

assert(columns.includes("slug"), "CSV must contain a 'slug' column");

// The `using` keyword is used to ensure that the Framer client is closed after the block is executed.
// If you don't use the `using` keyword, you need to manually close the client using `await framer.disconnect()`.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using
using framer = await connect(projectUrl);

// Find or Create Collection

const existingCollections = await framer.getCollections();
let collection = existingCollections.find((c) => c.name === collectionName);

if (!collection) {
    collection = await framer.createCollection(collectionName);
}

// Add Missing Fields

const existingFields = await collection.getFields();
const existingFieldNames = new Set(existingFields.map((f) => f.name.toLowerCase()));

const fieldsToCreate = columns
    .filter((column) => column !== "slug" && !existingFieldNames.has(column.toLowerCase()))
    .map(
        (column): CreateField => ({
            type: fieldTypes.get(column) ?? "string",
            name: column,
        }),
    );

if (fieldsToCreate.length > 0) {
    await collection.addFields(fieldsToCreate);
}

// Build Items & Import

const fields = await collection.getFields();
const fieldNameToId = new Map(fields.map((f) => [f.name.toLowerCase(), f.id]));

const existingItems = await collection.getItems();
const slugToExistingId = new Map(existingItems.map((item) => [item.slug, item.id]));

const items = rows.map((row) => {
    const fieldData: FieldDataInput = {};

    for (const column of columns) {
        if (column === "slug") continue;

        const fieldId = fieldNameToId.get(column.toLowerCase());
        if (!fieldId) continue;

        const value = row[column] ?? "";
        const fieldType = fieldTypes.get(column) ?? "string";
        fieldData[fieldId] = toFieldData(value, fieldType);
    }

    const slug = row["slug"];
    assert(slug && slug.length > 0, "slug is required and must be non-empty");
    const existingId = slugToExistingId.get(slug);

    return { id: existingId, slug, fieldData };
});

await collection.addItems(items);

console.log(`Imported ${items.length} items`);

function toFieldData(value: string, type: FieldType): FieldDataEntryInput {
    switch (type) {
        case "boolean":
            return { type: "boolean" as const, value: value.toLowerCase() === "true" };
        case "number":
            return { type: "number" as const, value: parseFloat(value) || 0 };
        case "string":
            return { type: "string" as const, value };
    }
}
