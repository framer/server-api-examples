type FieldMapping = {
    notionProperty: string;
    framerId: string;
    framerName: string;
    type: "string" | "number" | "boolean" | "date";
};

type Config = {
    AUTO_PUBLISH: boolean;
    TOMBSTONE_PROPERTY: string;
    FIELD_MAPPING: FieldMapping[];
};

export const config: Config = {
    AUTO_PUBLISH: true,
    TOMBSTONE_PROPERTY: "Deleted",

    FIELD_MAPPING: [
        {
            notionProperty: "Title",
            framerId: "title",
            framerName: "Title",
            type: "string",
        },
        {
            notionProperty: "Description",
            framerId: "description",
            framerName: "Description",
            type: "string",
        },
        {
            notionProperty: "Status",
            framerId: "status",
            framerName: "Status",
            type: "string",
        },
        {
            notionProperty: "Created",
            framerId: "created",
            framerName: "Created",
            type: "date",
        },
        {
            notionProperty: "Priority",
            framerId: "priority",
            framerName: "Priority",
            type: "number",
        },
    ],
};

export type { FieldMapping };
