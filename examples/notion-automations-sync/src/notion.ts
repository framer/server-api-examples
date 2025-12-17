import type { PageObjectResponse } from "@notionhq/client";
import type { FieldDataInput } from "framer-api";
import type { FieldMapping } from "./config";

export interface NotionAutomationPayload {
    source: {
        type: "automation";
        automation_id: string;
        action_id: string;
        event_id: string;
        attempt: number;
    };
    data: PageObjectResponse;
}

type PageProperties = PageObjectResponse["properties"];
type PropertyValue = PageProperties[string];

export function extractFieldData(props: PageProperties, mappings: FieldMapping[]): FieldDataInput {
    const fieldData: FieldDataInput = {};

    for (const mapping of mappings) {
        const prop = props[mapping.notionProperty];
        if (!prop) continue;

        switch (mapping.type) {
            case "string":
                fieldData[mapping.framerId] = {
                    type: "string" as const,
                    value: extractText(prop),
                };
                break;
            case "date":
                fieldData[mapping.framerId] = {
                    type: "date" as const,
                    value: extractDate(prop),
                };
                break;
            case "number":
                fieldData[mapping.framerId] = {
                    type: "number" as const,
                    value: extractNumber(prop),
                };
                break;
            case "boolean":
                fieldData[mapping.framerId] = {
                    type: "boolean" as const,
                    value: extractBoolean(prop),
                };
                break;
        }
    }

    return fieldData;
}

function extractText(prop: PropertyValue): string {
    switch (prop.type) {
        case "title":
            return prop.title.map((t) => t.plain_text).join("");
        case "rich_text":
            return prop.rich_text.map((t) => t.plain_text).join("");
        case "select":
            return prop.select?.name ?? "";
        case "status":
            return prop.status?.name ?? "";
        case "multi_select":
            return prop.multi_select.map((s) => s.name).join(", ");
        case "email":
            return prop.email ?? "";
        case "phone_number":
            return prop.phone_number ?? "";
        case "url":
            return prop.url ?? "";
        default:
            return "";
    }
}

function extractDate(prop: PropertyValue): string {
    switch (prop.type) {
        case "date":
            return prop.date?.start ?? new Date().toISOString();
        case "created_time":
            return prop.created_time;
        case "last_edited_time":
            return prop.last_edited_time;
        default:
            return new Date().toISOString();
    }
}

function extractNumber(prop: PropertyValue): number {
    if (prop.type === "number") return prop.number ?? 0;
    return 0;
}

function extractBoolean(prop: PropertyValue): boolean {
    if (prop.type === "checkbox") return prop.checkbox;
    return false;
}

export function isDeleted(props: PageProperties, tombstoneProperty: string): boolean {
    const prop = props[tombstoneProperty];
    if (!prop) return false;
    return prop.type === "checkbox" && Boolean(prop.checkbox);
}
