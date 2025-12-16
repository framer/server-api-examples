import { readFileSync } from "node:fs";
import Papa from "papaparse";

export type FieldType = "string" | "number" | "boolean";

export interface CsvData {
    columns: string[];
    rows: Record<string, string>[];
    fieldTypes: Map<string, FieldType>;
}

export function loadCsv(path: string): CsvData {
    const csvContent = readFileSync(path, "utf-8");
    const { data: rows, meta } = Papa.parse<Record<string, string>>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        transform: (value: string) => value.trim(),
    });

    if (!meta.fields) {
        throw new Error("CSV file has no header row");
    }

    const fieldTypes = new Map(inferFieldTypes(rows, meta.fields));

    return { columns: meta.fields, rows, fieldTypes };
}

function inferFieldType(values: string[]): FieldType {
    const nonEmptyValues = values.filter((v) => v !== "");
    if (nonEmptyValues.length === 0) return "string";

    const allBooleans = nonEmptyValues.every((v) => v === "true" || v === "false");
    if (allBooleans) return "boolean";

    const allNumbers = nonEmptyValues.every((v) => !Number.isNaN(parseFloat(v)) && Number.isFinite(Number(v)));
    if (allNumbers) return "number";

    return "string";
}

/**
 * Infer the field types from the data in the CSV file.
 * Returns the column name and the inferred field type.
 */
function inferFieldTypes(rows: Record<string, string>[], columns: string[]): [string, FieldType][] {
    return columns.map((column) => {
        const values = rows.map((row) => row[column] ?? "");
        return [column, inferFieldType(values)];
    });
}
