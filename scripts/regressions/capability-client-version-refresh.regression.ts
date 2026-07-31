import assert from "node:assert/strict";
import { capabilityClientNeedsRefresh } from "../../packages/client/src/lib/capability-client-version";

assert.equal(
  capabilityClientNeedsRefresh("1.2.2", "1.2.3", true),
  true,
  "A registered client from an older package version must require a page refresh",
);
assert.equal(
  capabilityClientNeedsRefresh("1.2.3", "1.2.3", true),
  false,
  "A registered client at the installed version must remain ready",
);
assert.equal(
  capabilityClientNeedsRefresh(undefined, "1.2.3", false),
  false,
  "A fresh page must load the installed client without asking for another refresh",
);
assert.equal(
  capabilityClientNeedsRefresh("1.2.2", "1.2.3", false),
  false,
  "A stale version marker without a registered element can safely load the installed client",
);

console.info("Capability client version refresh regression passed.");
