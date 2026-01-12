import { connect } from "framer-api";
import { config } from "./config";
import { extractFieldData, isDeleted, type NotionAutomationPayload } from "./notion";

async function handleWebhook(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const token = request.headers.get("Authorization");
    if (token !== env.WEBHOOK_TOKEN) {
        return new Response("Unauthorized", { status: 401 });
    }

    const payload = await request.json<NotionAutomationPayload>();

    try {
        const pageId = payload.data.id.replace(/-/gu, "");

        if (payload.data.in_trash || payload.data.archived) {
            return json({ success: true, action: "skipped", reason: "trashed or archived" });
        }

        const parent = payload.data.parent;
        if (env.NOTION_DATABASE_ID && "database_id" in parent && parent.database_id) {
            const normalize = (id: string) => id.replace(/-/gu, "");
            if (normalize(parent.database_id) !== normalize(env.NOTION_DATABASE_ID)) {
                return json({ skipped: true, reason: "Different database" });
            }
        }

        using framer = await connect(env.FRAMER_PROJECT_URL, env.FRAMER_API_KEY);

        const collections = await framer.getManagedCollections();
        const collection = collections.find((c) => c.name === env.FRAMER_COLLECTION_NAME);

        if (!collection) {
            return json(
                {
                    error: `${env.FRAMER_COLLECTION_NAME} collection not found`,
                    available: collections.map((c) => c.name),
                },
                404,
            );
        }

        if (isDeleted(payload.data.properties, config.TOMBSTONE_PROPERTY)) {
            await collection.removeItems([pageId]);
            await publishAndDeploy(framer);
            console.log(`Deleted page ${pageId}`);
            return json({ success: true, action: "deleted", id: pageId, published: config.AUTO_PUBLISH });
        }

        const fieldData = extractFieldData(payload.data.properties, config.FIELD_MAPPING);
        const slug = `item-${pageId}`;

        await collection.addItems([{ id: pageId, slug, fieldData }]);
        await publishAndDeploy(framer);
        console.log(`Upserted page ${pageId} → ${slug}`);

        return json({ success: true, action: "upserted", id: pageId, slug, published: config.AUTO_PUBLISH });
    } catch (error) {
        console.error(`Error processing page:`, error);
        return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
    }
}

async function publishAndDeploy(framer: Awaited<ReturnType<typeof connect>>) {
    if (!config.AUTO_PUBLISH) return null;
    const { deployment } = await framer.publish();
    const hostnames = await framer.deploy(deployment.id);
    return { deploymentId: deployment.id, hostnames };
}

const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export default { fetch: handleWebhook } satisfies ExportedHandler<Env>;
