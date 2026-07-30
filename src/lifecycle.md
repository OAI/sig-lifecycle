# Lifecycle Specification

## Version History

| Version | Date | Notes |
| ---- | ---- | ---- |
| 1.0.0 | TBD | Initial release |

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

Compatibility between versions of this specification and versions of the OpenAPI
Specification is determined by publication date. The rules for determining
compatible version pairs are documented in [TODO: link or section].

## Definitions

### Lifecycle Object

A **Lifecycle Object** is ...

#### Fixed Fields

| Field Name | Type | Description |
| ---- | ---- | ---- |
| TODO | TODO | TODO |

### Schema Object

A **Schema Object** is a JSON Schema schema as defined by the OpenAPI Specification
in use. Within this document, Schema Objects behave according to the OAS dialect
in effect in the containing OpenAPI document.

## Specification

### Version `1.0`

This document is the Lifecycle Specification version 1.0.0.

### Notation

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be
interpreted as described in [RFC2119](https://tools.ietf.org/html/rfc2119).

### Schema

Implementations that validate Lifecycle Objects MUST use the schema published at
`https://spec.openapis.org/lifecycle/1.0/schema/WORK-IN-PROGRESS`.

When validating a Lifecycle Object within an OpenAPI document, the Schema Object
schema in effect is determined by the OAS dialect declared in that document.
Standalone validation of Lifecycle Objects uses the standard JSON Schema
2020-12 dialect for Schema Object positions.

## Appendix A — Revision History

TODO: Document notable changes between versions.
