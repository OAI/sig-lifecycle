import { readdirSync, readFileSync } from "node:fs";
import YAML from "yaml";
import { registerSchema, toMatchJsonSchema } from "@oai/build-infra/schema/vitest";
import { describe, expect, test } from "@oai/build-infra/test";

expect.extend({ toMatchJsonSchema });

const schemaUri = "https://spec.openapis.org/lifecycle/1.0/schema/WORK-IN-PROGRESS";
await registerSchema("./src/schemas/validation/schema.yaml");

describe("Lifecycle schema", () => {
  for (const entry of readdirSync("tests/schema/pass", { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".yaml")) continue;

    test(`pass/${entry.name}`, async () => {
      const document = YAML.parse(readFileSync(`tests/schema/pass/${entry.name}`, "utf8"));
      await expect(document).toMatchJsonSchema(schemaUri);
    });
  }

  for (const entry of readdirSync("tests/schema/fail", { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".yaml")) continue;

    test(`fail/${entry.name}`, async () => {
      const document = YAML.parse(readFileSync(`tests/schema/fail/${entry.name}`, "utf8"));
      await expect(document).not.toMatchJsonSchema(schemaUri);
    });
  }
});
