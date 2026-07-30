import { describe, expect, it } from "@oai/build-infra/test";
import { registerSchema } from "@oai/build-infra/schema/vitest";

await registerSchema("./src/schemas/validation/schema.yaml");

// Placeholder test suite - add pass/fail test cases as the schema is developed.
describe("Lifecycle schema", () => {
  it("validates an empty Lifecycle Object", async () => {
    await expect({}).to.matchJsonSchema("./src/schemas/validation/schema.yaml");
  });
});
