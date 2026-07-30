# Lifecycle Specification

## Abstract

TODO: One or two sentences summarizing what the Lifecycle Object is and the
problem it solves.

## Version 1.0.0

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this
document are to be interpreted as described in [BCP 14](https://tools.ietf.org/html/bcp14)
[RFC2119](https://tools.ietf.org/html/rfc2119)
[RFC8174](https://tools.ietf.org/html/rfc8174) when, and only when, they
appear in all capitals, as shown here.

TODO: Confirm license. OAI companion specifications typically use the
[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).

## Introduction

TODO: Introduce the extension and what problem it solves.

## Relationship to the OpenAPI Specification

The Lifecycle Specification defines the **Lifecycle Object**, which appears
within an OpenAPI document under the `features` field introduced in OpenAPI 3.3:

```yaml
features:
  lifecycle:
    # Lifecycle Object fields here
```

Compatibility between versions of this specification and versions of the
OpenAPI Specification is determined by publication date. The rules for
determining compatible version pairs are documented under
[Compatibility](#compatibility).

## Definitions

### Lifecycle

TODO: A short, informal description of what a Lifecycle is conceptually —
not the field-by-field schema. The Fixed Fields for the Lifecycle Object
live under [Schema](#schema) below.

### Schema Object

A **Schema Object** is a JSON Schema schema as defined by the OpenAPI
Specification in use. Within this document, Schema Objects behave according
to the OAS dialect in effect in the containing OpenAPI document.

## Specification

### Versions

The Lifecycle Specification is versioned using a `major`.`minor`.`patch`
scheme. The `major`.`minor` portion of the version string (for example,
`1.0`) designates the Lifecycle feature set in effect. `patch` releases
address errors in, or provide clarifications to, this document without
changing the feature set; tooling SHOULD treat all patch releases within a
`major`.`minor` line as equivalent.

#### Compatibility

TODO: Document the rules for determining which versions of this
specification are compatible with which versions of the OpenAPI
Specification (referenced from
[Relationship to the OpenAPI Specification](#relationship-to-the-openapi-specification)
above).

### Schema

In the following description, if a field is not explicitly **REQUIRED** or
described with a MUST or SHALL, it can be considered OPTIONAL.

#### Lifecycle Object

A **Lifecycle Object** is ...

##### Fixed Fields

| Field Name | Type | Description |
| ---- | ---- | ---- |
| TODO | TODO | TODO |

This object MAY be extended with [Specification Extensions](#specification-extensions).

Implementations that validate Lifecycle Objects MUST use the schema
published at `https://spec.openapis.org/lifecycle/1.0/schema/WORK-IN-PROGRESS`.
When validating a Lifecycle Object within an OpenAPI document, the Schema
Object schema in effect is determined by the OAS dialect declared in that
document. Standalone validation of Lifecycle Objects uses the standard JSON
Schema 2020-12 dialect for Schema Object positions.

TODO: Replace `WORK-IN-PROGRESS` with a dated schema identifier before
publication (e.g. `2026-MM-DD`), matching OAI hosting convention.

### Specification Extensions

TODO: Decide whether `x-` prefixed extension fields are permitted on the
Lifecycle Object, and document the pattern (field name pattern, reserved
prefixes, allowed value types) if so.

## Appendix A: Revision History

| Version | Date | Notes |
| ---- | ---- | ---- |
| 1.0.0 | TBD | Initial release |
