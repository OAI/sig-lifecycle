# Lifecycle Specification

## Version History

| Version | Date | Notes |
| ---- | ---- | ---- |
| 1.0.0 | TBD | Initial release |

## Introduction

OpenAPI's only built-in signal for the end of an operation's life is the
`deprecated` boolean on the Operation Object. It says an operation is going
away, but nothing about *when*, *why*, where to migrate to, or what replaces
it. HTTP already has standard, structured ways to communicate this at
runtime — the `Deprecation` header ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745))
and the `Sunset` header ([RFC 8594](https://www.rfc-editor.org/rfc/rfc8594)) —
but there is no standard, design-time way to describe that information in an
OpenAPI description, so providers fall back to prose in `info.description`,
one-off `x-` extensions, or per-operation custom headers, none of which are
interoperable or reliably machine-readable.

This matters more as OpenAPI descriptions feed more than human-facing
documentation. Doc-gen and SDK-gen tools need a stable place to source
`@deprecated` annotations and migration links. AI agents and MCP servers that
register OpenAPI operations as tools need a design-time signal they can fold
into a tool's description *before* it is ever invoked, and a runtime signal
(from response headers) they can act on *after* invocation. A structured
Lifecycle Object serves both without requiring either kind of consumer to
parse prose.

This specification defines that object and a deterministic mapping from its
fields to the `Deprecation`, `Sunset`, and `Link` headers, so tooling can treat
the metadata as either documentation or a generation source for those
headers, per its needs.

**Scope.** The Lifecycle Object applies at the Operation Object level only. An
earlier draft explored a root-level, document-wide object (see
[Appendix A](#appendix-a--revision-history)), but SIG discussion concluded
that a single OpenAPI document does not necessarily describe exactly one API,
so a document-wide deprecation signal does not generalize; see
[sig-lifecycle discussion #5](https://github.com/OAI/sig-lifecycle/discussions/5).
Applying the same lifecycle metadata uniformly across many operations remains
the job of [Overlays](https://spec.openapis.org/overlay/latest.html), not of
this object.

**Non-goal.** This SAF does not replace `deprecated: true`, which
remains the coarse signal tooling already recognizes (for example, to gray out
an operation in Swagger UI). The Lifecycle Object is additional detail used
alongside it.

## Relationship to the OpenAPI Specification

The Lifecycle Specification is a companion specification defining a
[Standardized API Feature](https://github.com/OAI/OpenAPI-Specification/blob/v3.3-dev/src/oas.md#standardized-api-features)
(SAF) for OpenAPI 3.3 and later — see
[OAI/OpenAPI-Specification discussion #5310](https://github.com/OAI/OpenAPI-Specification/discussions/5310)
for background on the SAF concept, and
[OAI/OpenAPI-Specification#5447](https://github.com/OAI/OpenAPI-Specification/pull/5447)
for how SAFs are declared.

An OpenAPI document opts in to this specification by naming it in the
`features` field of the OpenAPI Object, which maps SAF names to the version
of each companion specification in use:

```yaml
openapi: 3.3.0
features:
  security: 1.0.0
  lifecycle: 1.0.0
```

Because the default value of `features` is `{"security": "1.0.0"}`, a
document that sets `features` explicitly MUST also list `security` to keep
the OAS 3.2-compatible security behavior. As required by the OAS, all
documents in a multi-document OpenAPI Description MUST declare the same SAFs.

When `lifecycle` is declared in `features`, the Operation Object gains the
`lifecycle` field defined in [Operation Object Fields](#operation-object-fields).
The Lifecycle Object is scoped to individual operations (see Introduction):

```yaml
paths:
  /flights:
    get:
      deprecated: true
      lifecycle:
        # Lifecycle Object fields here
```

**Editor's note.** The placement of the Lifecycle Object is provisional.
SAFs are expected to place their objects under a container field that the OAS
will define on the OpenAPI, Path Item, and Operation Objects, so that SAFs
do not add fields directly to core objects. Once the OAS defines that
container, the Lifecycle Object will move under it, and the `lifecycle` field
described in [Operation Object Fields](#operation-object-fields) will be
replaced.

Compatibility between versions of this specification and versions of the OpenAPI
Specification is determined by publication date. The rules for determining
compatible version pairs are documented in [TODO: link or section].

## Definitions

### Operation Object Fields

When a document declares `lifecycle` in its `features` field, the following
field is added to the [Operation Object](https://spec.openapis.org/oas/latest.html#operation-object):

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `lifecycle` | [Lifecycle Object](#lifecycle-object) | Deprecation and sunset details for this operation. |

A `lifecycle` field on an Operation Object in a document that does not
declare `lifecycle` in `features` is not governed by this specification.

### Lifecycle Object

A **Lifecycle Object** describes the deprecation and sunset status of a
single operation: when the deprecation took effect, why, when the operation
will stop accepting requests, and links to related resources such as a
migration guide, a replacement, and a sunset policy. It is optional, and is
meant to complement — not replace — `deprecated: true` on the same Operation
Object.

#### Lifecycle Object Fixed Fields

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `date` | `string` (date-time) | **REQUIRED.** The date the deprecation takes or took effect. |
| `reason` | `string` | A human-readable explanation of why the operation is deprecated. |
| `sunset` | [Sunset Object](#sunset-object) | Sunset details for this operation. |
| `externalLinks` | [[External Documentation Object](https://spec.openapis.org/oas/latest.html#external-documentation-object)] | Links to resources related to this operation's deprecation and sunset. Each entry MUST include `kind`. See [Lifecycle Link Kinds](#lifecycle-link-kinds). |

`externalLinks` uses the same array of External Documentation Objects as the
`externalLinks` field on the OpenAPI, Operation, Tag, and Schema Objects (see
the [Docs Links proposal](https://github.com/OAI/OpenAPI-Specification/blob/main/proposals/2026-08-01-Docs-Links.md)),
including its `summary` and `kind` fields. This specification therefore
requires an OpenAPI Specification version that defines those fields.

Links that concern the operation's deprecation or sunset belong in
`lifecycle.externalLinks`. Other resources, such as general API reference
documentation, belong in the Operation Object's own `externalLinks`. Only
entries in `lifecycle.externalLinks` participate in the
[Header Mapping](#header-mapping).

#### Relationship to `deprecated`

The Operation Object's `deprecated` field is the authoritative signal of
whether an operation is deprecated, and takes precedence over the Lifecycle
Object. The Lifecycle Object only adds detail to an operation that
`deprecated` already marks as deprecated.

An Operation Object with a `lifecycle` field SHOULD set `deprecated: true`.

If `deprecated` is absent or `false`, tools MUST treat the operation as not
deprecated, even if a `lifecycle` field is present. In that case, tools:

* MUST NOT generate `Deprecation`, `Sunset`, or `Link` headers from the
  Lifecycle Object;
* MUST NOT present the operation as deprecated or scheduled for sunset, for
  example in generated documentation, `@deprecated` annotations, or tool
  descriptions;
* MAY warn that the `lifecycle` field is ignored.

This specification does not change the meaning of `deprecated: true` when
there is no `lifecycle` field. An operation can be marked deprecated without
this SAF, as before, which allows APIs to adopt the Lifecycle Object
gradually. The full value comes from using both: `deprecated: true` as the
signal that existing tools already recognize, and the Lifecycle Object for
the dates, reason, and links that tools need to explain the deprecation and
generate headers.

#### Lifecycle Link Kinds

This specification defines the following `kind` values for entries in
`lifecycle.externalLinks`. Each value is the name of an IANA-registered link
relation, so a link's `kind` is also the `rel` of the `Link` header it maps to.

| `kind` | Meaning | Cardinality | Link relation |
| ---- | ---- | ---- | ---- |
| `deprecation` | Human-readable information about the deprecation, typically a migration guide. | SHOULD appear at most once. | [RFC 9745 §3](https://www.rfc-editor.org/rfc/rfc9745#section-3) |
| `successor-version` | The operation or API that replaces this one. | MAY appear more than once, for example when both a v2 and a v3 replace this operation. | [RFC 5829](https://www.rfc-editor.org/rfc/rfc5829) |
| `sunset` | A human-readable sunset policy. | SHOULD appear at most once. | [RFC 8594 §6](https://www.rfc-editor.org/rfc/rfc8594#section-6) |

Entries MAY use other `kind` values, such as `changelog` or `announcement`.
Entries with other values are documentation only and have no header
equivalent.

#### Example

```yaml
paths:
  /v1/flights:
    get:
      operationId: listFlights_v1
      summary: List all flights
      deprecated: true
      lifecycle:
        date: "2025-01-15T00:00:00Z"
        reason: "Replaced by v2 API with improved performance."
        sunset:
          date: "2025-07-01T00:00:00Z"
        externalLinks:
          - kind: deprecation
            summary: Migration guide
            url: https://docs.example.com/migrate
          - kind: successor-version
            summary: Flights API v2
            url: https://api.example.com/v2/openapi.yaml
          - kind: sunset
            summary: API sunset policy
            url: https://docs.example.com/sunset-policy
```

#### Complete OpenAPI Description Example

This example is **informative**. It shows the Lifecycle SAF in a complete
OpenAPI 3.3 document. The document uses `externalLinks` at three levels:

* at the root, for documentation about the whole API;
* on the Operation Object, for general resources about one operation;
* in the Lifecycle Object, for links about the operation's deprecation and
  sunset, including documentation-only kinds such as `changelog` and
  `announcement`.

```yaml
openapi: 3.3.0
features:
  security: 1.0.0   
  lifecycle: 1.0.0
info:
  title: Flights API
  version: 2.0.0
externalLinks:
  - url: https://docs.example.com/flights
    summary: Flights API documentation
    kind: api-docs
  - url: https://docs.example.com/changelog
    summary: Flights API changelog
    kind: changelog
paths:
  /v1/flights:
    get:
      operationId: listFlights_v1
      summary: List all flights
      deprecated: true
      externalLinks:
        - url: https://docs.example.com/flights/v1
          summary: Flights API v1 reference
          kind: api-docs
      lifecycle:
        date: "2025-01-15T00:00:00Z"
        reason: "Replaced by v2 API with improved performance."
        sunset:
          date: "2025-07-01T00:00:00Z"
        externalLinks:
          - kind: deprecation
            summary: Migrating from Flights v1 to v2
            description: |
              Step-by-step guide covering renamed query parameters and the
              new cursor-based pagination.
            url: https://docs.example.com/migrate
          - kind: successor-version
            summary: Flights API v2
            description: Use `listFlights_v2` (`GET /v2/flights`) instead.
            url: https://api.example.com/v2/openapi.yaml
          - kind: sunset
            summary: API sunset policy
            url: https://docs.example.com/sunset-policy
          - kind: changelog
            summary: Changelog entry announcing the v1 deprecation
            url: https://docs.example.com/changelog#2025-01-15
          - kind: announcement
            summary: Sunset announcement
            description: |
              Timeline, support contacts, and FAQ for the retirement of
              `GET /v1/flights`.
            url: https://status.example.com/announcements/flights-v1-sunset
      responses:
        "200":
          description: A list of flights.
  /v2/flights:
    get:
      operationId: listFlights_v2
      summary: List all flights
      externalLinks:
        - url: https://docs.example.com/flights/v2
          summary: Flights API v2 reference
          kind: api-docs
      responses:
        "200":
          description: A page of flights.
```

Applying the [Header Mapping](#header-mapping), a server would emit the
following headers in responses to `GET /v1/flights`:

```http
Deprecation: @1736899200
Sunset: Tue, 01 Jul 2025 00:00:00 GMT
Link: <https://docs.example.com/migrate>; rel="deprecation"; type="text/html"
Link: <https://api.example.com/v2/openapi.yaml>; rel="successor-version"
Link: <https://docs.example.com/sunset-policy>; rel="sunset"
```

Each header comes from one Lifecycle Object field:

| Header | Source in the Lifecycle Object |
| ---- | ---- |
| `Deprecation: @1736899200` | `date: "2025-01-15T00:00:00Z"` |
| `Sunset: Tue, 01 Jul 2025 00:00:00 GMT` | `sunset.date: "2025-07-01T00:00:00Z"` |
| `Link: <…/migrate>; rel="deprecation"` | `externalLinks` entry with `kind: deprecation` |
| `Link: <…/v2/openapi.yaml>; rel="successor-version"` | `externalLinks` entry with `kind: successor-version` |
| `Link: <…/sunset-policy>; rel="sunset"` | `externalLinks` entry with `kind: sunset` |

The `changelog` and `announcement` entries in `lifecycle.externalLinks`, and
the Operation Object's own `externalLinks`, do not generate headers.
`GET /v2/flights` has no Lifecycle Object, so its responses carry none of
these headers.

### Sunset Object

A **Sunset Object** describes when an operation is expected to stop accepting
requests entirely. A link to a sunset policy is given in the Lifecycle
Object's `externalLinks` with `kind: sunset`.

#### Sunset Object Fixed Fields

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `date` | `string` (date-time) | **REQUIRED.** The date after which the operation is expected to stop accepting requests. |

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

The Lifecycle Object contains no Schema Objects, so validation does not depend
on the OAS dialect in effect in the containing document. The schema includes
its own definition of the External Documentation Object, as extended by the
[Docs Links proposal](https://github.com/OAI/OpenAPI-Specification/blob/main/proposals/2026-08-01-Docs-Links.md),
and requires `kind` on each entry in `externalLinks`.

### Header Mapping

This section is **informative**. The Lifecycle Object describes deprecation
and sunset *behavior*; the HTTP headers below are a byproduct a server MAY
choose to generate from that description at runtime. An OpenAPI description
alone does not cause a server to emit these headers — that requires runtime
support in the API implementation or gateway. Headers are only generated for
operations with `deprecated: true`; see
[Relationship to `deprecated`](#relationship-to-deprecated).

Tools that do generate headers from a Lifecycle Object SHOULD use the
following mapping:

| Lifecycle Object field | Generated header | RFC |
| ---- | ---- | ---- |
| `date` | `Deprecation: @<epoch-seconds>` | [RFC 9745 §2.1](https://www.rfc-editor.org/rfc/rfc9745#section-2.1), timestamp format per [RFC 9651 §3.3.7](https://www.rfc-editor.org/rfc/rfc9651#section-3.3.7) |
| `sunset.date` | `Sunset: <IMF-fixdate>` | [RFC 8594 §3](https://www.rfc-editor.org/rfc/rfc8594#section-3), date format per [RFC 9110 §5.6.7](https://www.rfc-editor.org/rfc/rfc9110#section-5.6.7) |
| `externalLinks` entry with `kind: deprecation` | `Link: <url>; rel="deprecation"; type="text/html"` | [RFC 9745 §3](https://www.rfc-editor.org/rfc/rfc9745#section-3) + [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288) |
| `externalLinks` entry with `kind: successor-version` | `Link: <url>; rel="successor-version"` | [RFC 5829](https://www.rfc-editor.org/rfc/rfc5829) + [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288) |
| `externalLinks` entry with `kind: sunset` | `Link: <url>; rel="sunset"` | [RFC 8594 §6](https://www.rfc-editor.org/rfc/rfc8594#section-6) + [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288) |

Each `externalLinks` entry with one of these kinds generates its own `Link`
header, so two `successor-version` entries generate two headers. Entries with
any other `kind` do not generate headers.

`reason`, and the `summary` and `description` of every `externalLinks` entry,
have no header equivalent — they are documentation-only fields, intended for
doc-gen and SDK-gen tools (for example, as the body of a generated
`@deprecated` annotation).

Applied to the [example](#example) above, a compliant server would emit:

```http
Deprecation: @1736899200
Sunset: Tue, 01 Jul 2025 00:00:00 GMT
Link: <https://docs.example.com/migrate>; rel="deprecation"; type="text/html"
Link: <https://api.example.com/v2/openapi.yaml>; rel="successor-version"
Link: <https://docs.example.com/sunset-policy>; rel="sunset"
```

## Appendix A — Revision History

Prior to April 2026, drafts of this specification explored a root-level,
document-wide `lifecycle` object with `stage`/`stageDate` fields and
`deprecation`/`sunset` as independent siblings, intended to describe the
lifecycle of an entire API in one place. SIG discussion raised two problems
with that shape:

* A single OpenAPI document does not necessarily describe exactly one API, so
  there is no reliable document-wide "this API" for such an object to
  describe.
* A global object competes with [Overlays](https://spec.openapis.org/overlay/latest.html)
  as the SIG's established answer for applying the same metadata across many
  operations, without the flexibility of choosing which operations it
  applies to.

From April 2026 onward, the design shifted to the operation-scoped model in
this document: `deprecation` (renamed `Lifecycle Object`, placed in the
Operation Object's `lifecycle` field, and enabled through the root `features`
declaration per the [SAF](https://github.com/OAI/OpenAPI-Specification/pull/5447)
convention) is the primary object, with `sunset` nested inside it, and
`gracePeriod` was dropped as derivable from `deprecation.date` and
`sunset.date` together.

In October 2026, the separate `migration`, `replacement`, and `sunset.policy`
link fields were replaced by a single `externalLinks` array in the Lifecycle
Object, aligning with the
[Docs Links proposal](https://github.com/OAI/OpenAPI-Specification/blob/main/proposals/2026-08-01-Docs-Links.md).
Link kinds use IANA link relation names, so each link maps directly to a
`Link` header. See
[sig-lifecycle discussion #5](https://github.com/OAI/sig-lifecycle/discussions/5)
for the full history.

## Appendix B — Usage with AI Agents and MCP Tooling

This section is **informative**.

Servers that expose OpenAPI operations as tools (for example, MCP servers)
can use the Lifecycle Object in two distinct phases:

1. **Tool registration (design-time, from the spec).** When registering an
   operation as a tool, a server can fold `reason`, and the `deprecation` and
   `successor-version` links, into the tool's description — for example, prefixing
   it with `"⚠ DEPRECATED — sunset 2025-07-01. Use listFlights_v2 instead."` A
   well-behaved LLM client that reads this before deciding whether to invoke
   the tool should prefer the replacement from the outset, without ever
   calling the deprecated one.
2. **Tool invocation (runtime, from response headers).** If the tool is
   invoked anyway, a server acting as a proxy can inspect the `Deprecation`,
   `Sunset`, and `Link` response headers (see [Header Mapping](#header-mapping))
   and wrap the result with a structured warning naming the sunset deadline
   and the successor tool, giving the LLM what it needs to relay the warning
   or retry with the replacement.

Writing the `successor-version` link's `summary` and `description` clearly (in language an
LLM would recognize as migration- or deprecation-related) is what makes phase
1 effective — the mechanism is ordinary metadata, but the wording carries the
signal.
