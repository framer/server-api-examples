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

// Deploy to custom domains
const deployed = await framer.deploy(deployment.id);

if (deployed.length > 0) {
    console.log(`✅ Deployed to ${deployed.length} custom domain(s):`);
    for (const hostname of deployed) {
        console.log(`   https://${hostname.hostname}`);
    }
} else {
    console.log("No custom domains to deploy — default hostname is already live.");
}
