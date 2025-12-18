import assert from "node:assert";
import { connect } from "framer-api";

const projectUrl = process.env["EXAMPLE_PROJECT_URL"];
assert(projectUrl, "EXAMPLE_PROJECT_URL environment variable is required");

using framer = await connect(projectUrl);

// Show changes
const changedPaths = await framer.getChangedPaths();
const entries = Object.entries(changedPaths);
const totalChanges = entries.reduce((sum, [, paths]) => sum + paths.length, 0);

if (totalChanges === 0) {
    console.log("⛔️ No changes to publish.");
    process.exit(0);
}

console.log(`📄 ${totalChanges} change(s):`);
for (const [type, paths] of entries) {
    for (const path of paths) {
        console.log(`   ${type}: ${path}`);
    }
}

// Publish
const { deployment } = await framer.publish();
console.log(`🚀 Published deployment ${deployment.id}`);

const deployedHostnames = await framer.deploy(deployment.id);
console.log(`✅ Deployed to:`);
for (const hostname of deployedHostnames) {
    console.log(`   https://${hostname.hostname}`);
}
