import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash(process.env.ADMIN_PASSWORD ?? "changeme", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cheatsheet.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@cheatsheet.dev",
      hashedPassword,
    },
  });

  await prisma.category.deleteMany({
    where: { name: "HTTP Status Codes", userId: admin.id },
  });

  const http = await prisma.category.create({
    data: {
      name: "HTTP Status Codes",
      icon: "🌐",
      color: "blue",
      description: "Complete HTTP status code reference: 1xx informational, 2xx success, 3xx redirection, 4xx client errors, and 5xx server errors with use cases and examples",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── 1xx Informational ─────────────────────────────────────────────
          {
            title: "1xx — Informational",
            description: "Provisional responses indicating the request was received and processing continues",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "1xx codes",
                  content: `100 Continue
    Server received request headers; client should proceed to send body.
    Used with: Expect: 100-continue header before uploading large files.
    Client sends headers first → server responds 100 → client sends body.

101 Switching Protocols
    Server agrees to upgrade the protocol as requested by the client.
    Used with: Upgrade: websocket header to initiate a WebSocket connection.
    Also used for HTTP/2 upgrade via HTTP/1.1.

102 Processing  (WebDAV)
    Server has received and is processing the request, no response yet.
    Prevents client from timing out on long-running WebDAV operations.

103 Early Hints  (RFC 8297)
    Sent before the final response to allow the client to start preloading
    resources while the server is preparing the response.
    Example:
      HTTP/1.1 103 Early Hints
      Link: </style.css>; rel=preload; as=style
      Link: </script.js>; rel=preload; as=script`,
                },
              ],
            },
          },
          // ── 2xx Success ───────────────────────────────────────────────────
          {
            title: "2xx — Success",
            description: "The request was successfully received, understood, and accepted",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "200–206",
                  content: `200 OK
    Standard success response. Body contains the requested resource.
    Use for: GET, PUT, PATCH, DELETE when returning a body.

201 Created
    Request succeeded and a new resource was created.
    Must include a Location header pointing to the new resource.
    Use for: POST (and sometimes PUT) that creates a resource.
    Example: POST /users → 201 Created, Location: /users/42

202 Accepted
    Request accepted but processing is not yet complete (async operation).
    No guarantee it will be completed; used for fire-and-forget tasks.
    Example: POST /reports/generate → 202 with a job ID to poll.

203 Non-Authoritative Information
    Response was modified by a proxy or intermediary from the origin's 200.
    Rarely used in modern APIs.

204 No Content
    Request succeeded; no body to return.
    Use for: DELETE, PUT/PATCH when you don't return the resource.
    Browser should not navigate away; used in AJAX delete operations.

205 Reset Content
    Instructs the client to reset the document view (e.g. clear a form).
    Similar to 204 but explicitly tells client to reset UI state.

206 Partial Content
    Partial GET response; used with Range header for resumable downloads.
    Response must include Content-Range header.
    Example: Range: bytes=0-1023 → 206 Partial Content`,
                },
                {
                  order: 1, language: "text", label: "207–226",
                  content: `207 Multi-Status  (WebDAV)
    Body contains multiple status codes for batch operations.
    Used in WebDAV PROPFIND, COPY, MOVE, DELETE for multiple resources.

208 Already Reported  (WebDAV)
    Members of a DAV binding already enumerated in a previous part of
    the multi-status response; not included again to avoid duplication.

226 IM Used  (RFC 3229)
    Server fulfilled a GET request using one or more instance manipulations
    (delta encoding). Rarely seen in the wild.`,
                },
              ],
            },
          },
          // ── 3xx Redirection ───────────────────────────────────────────────
          {
            title: "3xx — Redirection",
            description: "Further action is needed to complete the request; client must follow redirect",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "300–308 overview",
                  content: `300 Multiple Choices
    Request has more than one possible response; client should choose.
    Location header may indicate the server's preferred choice.
    Rarely used; content negotiation is preferred.

301 Moved Permanently
    Resource has permanently moved to a new URL (in Location header).
    Browsers cache this aggressively. Method MAY change to GET (in practice does).
    Use for: permanent URL restructuring, HTTP → HTTPS redirect (better: 308).
    SEO: passes link equity to new URL.

302 Found  (a.k.a. "Moved Temporarily")
    Resource temporarily at a different URL. Method MAY change to GET.
    Historically misused. Prefer 307 if you need to preserve method.
    Use for: temporary redirects where you may want to change later.

303 See Other
    Redirect to a different URL using GET, regardless of original method.
    Use for: Post/Redirect/Get pattern (after form POST → redirect to results).
    Example: POST /login → 303 → GET /dashboard

304 Not Modified
    Resource hasn't changed since the version specified by request headers
    (If-Modified-Since or If-None-Match / ETag).
    Body is empty; client should use its cached copy.
    Use for: HTTP caching / conditional GET.

307 Temporary Redirect
    Temporarily redirect to Location URL. Method and body MUST NOT change.
    Use when: temporarily redirecting POST/PUT and must preserve the method.

308 Permanent Redirect
    Permanently redirect to Location URL. Method and body MUST NOT change.
    Use for: permanent HTTP → HTTPS redirect (preserves POST method).
    Like 301 but method-safe.`,
                },
                {
                  order: 1, language: "text", label: "Redirect decision guide",
                  content: `CHOOSING THE RIGHT REDIRECT
  ─────────────────────────────────────────────────────────────────
  Need                                  Use
  ─────────────────────────────────────────────────────────────────
  Permanent redirect, allow GET change  301 Moved Permanently
  Permanent redirect, keep method       308 Permanent Redirect
  Temporary redirect, allow GET change  302 Found
  Temporary redirect, keep method       307 Temporary Redirect
  After POST, redirect to result (GET)  303 See Other
  Caching (resource unchanged)          304 Not Modified
  ─────────────────────────────────────────────────────────────────

POST/REDIRECT/GET PATTERN  (prevents duplicate form submissions)
  1. Browser POSTs form data
  2. Server processes, responds 303 See Other → /success
  3. Browser GETs /success page
  4. User can refresh without re-submitting form

CACHE HEADERS THAT TRIGGER 304
  Client sends:  If-None-Match: "abc123"   (ETag round-trip)
  Client sends:  If-Modified-Since: Tue, 01 Jan 2025 00:00:00 GMT
  Server checks → unchanged → 304 No Body (saves bandwidth)`,
                },
              ],
            },
          },
          // ── 4xx Client Errors ─────────────────────────────────────────────
          {
            title: "4xx — Client Errors",
            description: "The request contains bad syntax or cannot be fulfilled by the server",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "400–410",
                  content: `400 Bad Request
    Server cannot process due to malformed syntax, invalid framing,
    or deceptive request routing.
    Use for: validation failures, malformed JSON, missing required fields.
    Return a body explaining what is wrong.

401 Unauthorized  (misleadingly named — means "unauthenticated")
    Client must authenticate to get the response.
    Must include WWW-Authenticate header describing how to authenticate.
    Use when: no credentials provided or credentials are invalid.
    Different from 403: 401 = "tell me who you are", 403 = "I know who you are, no."

402 Payment Required
    Reserved for future use; originally intended for digital payment systems.
    Some APIs use it for rate-limiting or subscription paywalls (non-standard).

403 Forbidden
    Server understood the request but refuses to authorise it.
    Client is authenticated but lacks permission.
    Don't reveal sensitive resource existence to unauthorised users (use 404).
    Use when: user is logged in but doesn't have the required role/permission.

404 Not Found
    Server cannot find the requested resource. May also be used to hide 403.
    The URL may exist in future (unlike 410).
    Use for: unknown routes, deleted resources (if you don't track deletion).

405 Method Not Allowed
    HTTP method is not supported for this resource.
    Must include Allow header listing supported methods.
    Example: DELETE /users → 405, Allow: GET, POST

406 Not Acceptable
    Server cannot produce a response matching Accept headers sent by client.
    Example: client accepts only application/xml, server only serves JSON.

407 Proxy Authentication Required
    Like 401 but authentication must be done with a proxy.
    Includes Proxy-Authenticate header.

408 Request Timeout
    Server timed out waiting for the request. Client may repeat the request.
    Connection will be closed after sending this response.

409 Conflict
    Request conflicts with current state of the resource.
    Use for: optimistic concurrency conflicts, duplicate unique field,
    editing a resource that was changed since last retrieved.
    Return current state in body so client can resolve conflict.

410 Gone
    Resource existed but has been permanently deleted and will not return.
    More specific than 404 — servers that track deletions can use this.
    Clients/crawlers should remove references to this URL.`,
                },
                {
                  order: 1, language: "text", label: "411–431",
                  content: `411 Length Required
    Server refuses to accept request without a Content-Length header.

412 Precondition Failed
    Precondition in request headers (If-Match, If-Unmodified-Since) failed.
    Use for: optimistic locking — update only if ETag still matches.
    Example: PUT /doc with If-Match: "abc" → resource changed → 412.

413 Content Too Large  (formerly "Payload Too Large")
    Request body exceeds the server's size limit.
    Server may close the connection or include Retry-After if temporary.

414 URI Too Long
    Request URI is longer than the server will interpret.
    Usually caused by query strings or redirect loops.

415 Unsupported Media Type
    Server refuses to accept the request's Content-Type.
    Example: POST with Content-Type: text/xml when server expects JSON.
    Return Accept-Post header indicating supported types.

416 Range Not Satisfiable
    Range header field cannot be satisfied; range falls outside resource size.
    Response includes Content-Range with total size: bytes */1234.

417 Expectation Failed
    Expect request header cannot be met by the server.
    Example: server doesn't support Expect: 100-continue.

418 I'm a Teapot  (RFC 2324 / April Fools')
    Server refuses to brew coffee because it is a teapot.
    Deliberately left unassigned in HTTP; used as an Easter egg.

421 Misdirected Request
    Request directed at a server that cannot produce a response for the
    combination of scheme and authority in the request URI.

422 Unprocessable Content  (formerly "Unprocessable Entity")
    Request was well-formed but contains semantic errors.
    Use for: validation errors where syntax is correct but data is invalid.
    Example: valid JSON but age field is negative.
    Preferred over 400 for semantic/business logic validation failures.

423 Locked  (WebDAV)
    Source or destination resource of a method is locked.

424 Failed Dependency  (WebDAV)
    Method failed because it depended on another action that failed.

425 Too Early  (RFC 8470)
    Server is unwilling to risk processing a request that might be replayed
    (TLS early data / 0-RTT).

426 Upgrade Required
    Server refuses to perform the request using the current protocol.
    Must include Upgrade header with required protocol.
    Example: server requires TLS, client connected over HTTP.

428 Precondition Required
    Server requires the request to be conditional (must use If-Match etc.)
    Prevents lost-update problems; forces optimistic concurrency.

429 Too Many Requests
    Client has sent too many requests in a given time (rate limiting).
    May include Retry-After header.
    Use for: API rate limits, brute force protection.
    Return rate limit info: X-RateLimit-Limit, X-RateLimit-Remaining.

431 Request Header Fields Too Large
    Server won't process request because headers are too large.
    Can apply to a single header or all headers collectively.`,
                },
                {
                  order: 2, language: "text", label: "451 & 4xx guide",
                  content: `451 Unavailable For Legal Reasons  (RFC 7725)
    Server is denying access due to a legal demand (court order, DMCA etc.)
    Name is a reference to Fahrenheit 451.
    Should include a Link header pointing to details about the legal demand.

4XX DECISION GUIDE — which error to use?
  ─────────────────────────────────────────────────────────────────────
  Situation                                   Code
  ─────────────────────────────────────────────────────────────────────
  Malformed JSON / bad syntax                 400 Bad Request
  Validation failure (wrong type, missing)    400 or 422
  No credentials at all                       401 Unauthorized
  Bad credentials / expired token             401 Unauthorized
  Authenticated but lacks permission          403 Forbidden
  Resource doesn't exist                      404 Not Found
  Resource existed but deleted permanently    410 Gone
  Wrong HTTP method for endpoint              405 Method Not Allowed
  Wrong Content-Type header                   415 Unsupported Media Type
  Conflict / concurrent edit collision        409 Conflict
  ETag / If-Match precondition failed         412 Precondition Failed
  Rate limit exceeded                         429 Too Many Requests
  Semantic error (valid syntax, bad logic)    422 Unprocessable Content
  Legal block                                 451 Unavailable For Legal Reasons
  ─────────────────────────────────────────────────────────────────────`,
                },
              ],
            },
          },
          // ── 5xx Server Errors ─────────────────────────────────────────────
          {
            title: "5xx — Server Errors",
            description: "The server failed to fulfil a valid request",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "500–511",
                  content: `500 Internal Server Error
    Catch-all for unexpected server-side errors.
    Don't expose stack traces or internal details in production.
    Log the error internally; return a generic message to the client.

501 Not Implemented
    Server does not support the functionality required to fulfil the request.
    Use when: HTTP method is not supported at all (not just this resource).
    Unlike 405: this means the server never supports it, not just this route.

502 Bad Gateway
    Server, acting as a gateway or proxy, received an invalid response from
    an upstream server.
    Common cause: upstream app server is down, crashed, or returned garbage.
    Common in: Nginx/ALB in front of a Node/Python app that crashed.

503 Service Unavailable
    Server is temporarily unable to handle the request.
    Causes: server overloaded, in maintenance, deploying.
    Should include Retry-After header when duration is known.
    Use for: graceful degradation, circuit breakers, health check failures.

504 Gateway Timeout
    Server acting as gateway didn't get a timely response from upstream.
    Common cause: upstream service is slow or hanging.
    Different from 408 (client timeout) — this is server-to-server timeout.

505 HTTP Version Not Supported
    Server does not support the HTTP version in the request.

506 Variant Also Negotiates  (RFC 2295)
    Transparent content negotiation results in a circular reference.
    Indicates a server configuration error.

507 Insufficient Storage  (WebDAV)
    Server cannot store the representation needed to complete the request.

508 Loop Detected  (WebDAV)
    Server detected an infinite loop while processing the request.

510 Not Extended  (RFC 2774)
    Further extensions to the request are required for the server to fulfil it.

511 Network Authentication Required
    Client needs to authenticate to gain network access.
    Used by captive portals (hotel/airport Wi-Fi login pages).
    Response should contain a link to where the user can authenticate.`,
                },
                {
                  order: 1, language: "text", label: "5xx triage guide",
                  content: `5XX TRIAGE GUIDE
  ─────────────────────────────────────────────────────────────────────
  Code   Most Common Cause                 First Place to Look
  ─────────────────────────────────────────────────────────────────────
  500    Unhandled exception in app code   App error logs / Sentry
  502    Upstream app crashed / bad port   App process running? Port correct?
  503    App overloaded / in maintenance   CPU/memory, deployment status
  504    Upstream too slow                 Slow query logs, timeout config
  ─────────────────────────────────────────────────────────────────────

RETRY STRATEGIES FOR 5xx
  500  — Do NOT retry automatically (idempotent requests only)
  502  — Safe to retry with backoff (transient proxy issue)
  503  — Retry with Retry-After delay if provided
  504  — Retry with exponential backoff; increase timeout if persistent

RETRY-AFTER HEADER
  Retry-After: 120              (seconds to wait)
  Retry-After: Fri, 31 Dec 2025 23:59:59 GMT   (absolute date)

CIRCUIT BREAKER PATTERN
  Closed  → requests flow normally
  Open    → immediately return 503, don't call downstream (fast fail)
  Half-open → allow a probe request; if it succeeds, close; else stay open`,
                },
              ],
            },
          },
          // ── Headers & Caching ─────────────────────────────────────────────
          {
            title: "Status Codes & Caching",
            description: "Which status codes are cacheable, Cache-Control, ETags, and Vary",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Cacheable status codes",
                  content: `CACHEABLE BY DEFAULT (RFC 9110)
  200 OK               — cacheable unless told otherwise
  203 Non-Authoritative — cacheable
  204 No Content       — cacheable
  206 Partial Content  — cacheable
  300 Multiple Choices — cacheable
  301 Moved Permanently — cacheable (aggressively)
  304 Not Modified     — cacheable (triggers cache use)
  308 Permanent Redirect — cacheable
  404 Not Found        — cacheable (negative caching)
  405 Method Not Allowed — cacheable
  410 Gone             — cacheable (aggressive: resource gone forever)
  414 URI Too Long     — cacheable
  501 Not Implemented  — cacheable

NOT CACHEABLE BY DEFAULT
  302 Found            — not cached unless Cache-Control/Expires
  307 Temporary Redirect — not cached by default
  400, 401, 403, 408, 409, 412, 415, 422, 429, 500, 502, 503, 504

FORCE CACHING BEHAVIOUR
  Cache-Control: no-store          — never cache
  Cache-Control: no-cache          — cache but revalidate every time
  Cache-Control: private           — browser only, not CDN
  Cache-Control: public            — CDN may cache
  Cache-Control: max-age=3600      — cache for 1 hour
  Cache-Control: s-maxage=86400    — CDN cache for 24h (overrides max-age)
  Cache-Control: must-revalidate   — after expiry, must revalidate before serving`,
                },
                {
                  order: 1, language: "text", label: "ETags & conditional requests",
                  content: `ETAG  (Entity Tag — fingerprint of resource state)
  ETag: "abc123"            (strong — byte-for-byte identical)
  ETag: W/"abc123"          (weak — semantically equivalent)

CONDITIONAL GET (avoid re-downloading unchanged content)
  1. First request:
     GET /data.json
     ← 200 OK, ETag: "v3", Last-Modified: Mon, 01 Jan 2025 12:00:00 GMT

  2. Subsequent request:
     GET /data.json
     If-None-Match: "v3"
     If-Modified-Since: Mon, 01 Jan 2025 12:00:00 GMT
     ← 304 Not Modified  (no body, use cache)  OR  200 OK (new content)

CONDITIONAL UPDATE  (optimistic locking)
  PUT /resource
  If-Match: "v3"           — only update if ETag still matches
  ← 200 OK (updated)  OR  412 Precondition Failed (someone else changed it)

VARY HEADER  (tell caches which request headers affect the response)
  Vary: Accept-Encoding    — different cache entry per encoding (gzip/br)
  Vary: Accept-Language    — different cache entry per language
  Vary: Accept             — different cache entry per content type
  Vary: *                  — effectively uncacheable (avoid this)`,
                },
              ],
            },
          },
          // ── REST API Conventions ──────────────────────────────────────────
          {
            title: "REST API Status Code Conventions",
            description: "Recommended status codes for standard CRUD operations and common API patterns",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "CRUD operations",
                  content: `GET — Read resource(s)
  200 OK               — resource found, body contains data
  204 No Content       — valid request but empty result (e.g. empty list)
  304 Not Modified     — conditional GET, use cached version
  400 Bad Request      — invalid query parameters
  401 Unauthorized     — not authenticated
  403 Forbidden        — authenticated but no permission
  404 Not Found        — resource doesn't exist

POST — Create resource or trigger action
  201 Created          — resource created, Location: /resource/id
  200 OK               — action completed (non-create POST e.g. search, login)
  202 Accepted         — async operation accepted, check status later
  400 Bad Request      — validation failure
  409 Conflict         — duplicate unique field (e.g. email already exists)
  422 Unprocessable    — valid format but semantic error

PUT — Replace resource (full update)
  200 OK               — updated, returns updated resource
  204 No Content       — updated, no body returned
  201 Created          — resource didn't exist, was created (upsert)
  400 Bad Request      — validation failure
  404 Not Found        — resource to update doesn't exist
  409 Conflict         — concurrent edit conflict
  412 Precondition Failed — If-Match ETag mismatch

PATCH — Partial update
  200 OK               — updated, returns patched resource
  204 No Content       — updated, no body
  400 Bad Request      — malformed patch document
  404 Not Found        — resource doesn't exist
  409 Conflict         — patch cannot be applied to current state
  415 Unsupported Media Type — wrong patch format (expect application/merge-patch+json)
  422 Unprocessable    — valid patch but resulting state is invalid

DELETE — Remove resource
  204 No Content       — deleted, no body (most common)
  200 OK               — deleted, body contains info (e.g. final state)
  202 Accepted         — deletion queued for async processing
  404 Not Found        — resource didn't exist
  409 Conflict         — cannot delete (e.g. has dependents, requires cascade)`,
                },
                {
                  order: 1, language: "text", label: "Auth, pagination & batch",
                  content: `AUTHENTICATION & AUTHORISATION
  POST /auth/login
    200 OK + token      — success
    401 Unauthorized    — wrong credentials
    429 Too Many Requests — brute force protection

  GET /protected-resource
    200 OK              — authorised
    401 Unauthorized    — missing/expired token
    403 Forbidden       — valid token, wrong role/scope

  POST /auth/refresh
    200 OK + new token  — refreshed
    401 Unauthorized    — refresh token expired or revoked

PAGINATION
  GET /users?page=2&limit=20
    200 OK              — returns page of results + pagination metadata
    204 No Content      — valid but page beyond available data
    400 Bad Request     — invalid page/limit values

SEARCH / FILTER
  GET /users?status=active&role=admin
    200 OK              — results (may be empty array, not 404)
    400 Bad Request     — invalid filter parameter

BULK / BATCH OPERATIONS
  POST /users/batch
    200 OK              — all succeeded, body: array of results
    207 Multi-Status    — mixed results, body: per-item status codes
    400 Bad Request     — entire batch rejected (malformed)

ASYNC / LONG-RUNNING JOBS
  POST /exports
    202 Accepted        — job queued, body: { jobId, statusUrl }
  GET /jobs/abc123
    200 OK + { status: "running", progress: 45 }
    200 OK + { status: "done", downloadUrl: "..." }
    500 Internal Error  — job failed`,
                },
              ],
            },
          },
          // ── WebSocket & Non-standard ──────────────────────────────────────
          {
            title: "Non-Standard & Vendor Codes",
            description: "Cloudflare, Nginx, IIS, and other vendor-specific codes you may encounter in logs",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Cloudflare custom codes",
                  content: `CLOUDFLARE SPECIFIC (appear in CF logs, never sent to clients)
  520  Web Server Returns an Unknown Error
       Origin server returned an empty, unknown, or unexpected response.
  521  Web Server Is Down
       Origin server refused the connection from Cloudflare.
  522  Connection Timed Out
       Cloudflare timed out waiting to connect to origin server.
  523  Origin Is Unreachable
       Cloudflare cannot reach the origin (DNS failure, routing issue).
  524  A Timeout Occurred
       Cloudflare connected but origin took too long to respond (>100s).
  525  SSL Handshake Failed
       Cloudflare couldn't complete an SSL handshake with the origin.
  526  Invalid SSL Certificate
       Cloudflare could not validate the SSL certificate on the origin.
  527  Railgun Error
       Request timed out or failed after Railgun connection established.
  530  Origin DNS Error
       Cannot resolve the origin's hostname.`,
                },
                {
                  order: 1, language: "text", label: "Nginx & IIS vendor codes",
                  content: `NGINX SPECIFIC
  444  No Response
       Nginx closed the connection and returned no response to the client.
       Used to deny malicious requests without sending a response at all.
  494  Request Header Too Large
       Client sent headers exceeding large_client_header_buffers limit.
  495  SSL Certificate Error
       Error occurred during client SSL certificate verification.
  496  SSL Certificate Required
       Client did not provide a required SSL certificate.
  497  HTTP Request Sent to HTTPS Port
       Client sent a plain HTTP request to an HTTPS port.
  499  Client Closed Request
       Client closed the connection before Nginx finished the response.
       Common in slow API logs — client (browser/script) gave up.

MICROSOFT IIS
  440  Login Timeout
       User's session expired due to inactivity.
  449  Retry With
       Server requests client retry after performing the appropriate action.
  451  Redirect  (IIS-specific, different from the RFC 7725 meaning)

TWITTER / X API (historical, illustrative)
  420  Enhance Your Calm  (rate limiting, non-standard; now uses 429)

GENERAL NOTE
  Codes above 499 that aren't in 5xx range are vendor-specific extensions.
  They are NOT part of the HTTP standard.
  Always check the specific platform's documentation for their meaning.`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created HTTP Status Codes cheatsheet: ${http.name} (${http.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
