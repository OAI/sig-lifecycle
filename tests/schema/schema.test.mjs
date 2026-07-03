import { describe, expect, it } from "vitest";
import { registerSchema } from "@hyperjump/json-schema-coverage/vitest";

await registerSchema("./src/schemas/validation/schema.yaml");

// Placeholder test suite - add pass/fail test cases as the schema is developed.
describe("Lifecycle schema", () => {
  it("validates an empty Lifecycle Object", async () => {
    await expect({}).to.matchJsonSchema("./src/schemas/validation/schema.yaml");
  });
});
