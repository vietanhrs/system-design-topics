import type { DiagramKind, Level, Priority, Subsection, WorkbookContent } from '@system-design/workbook';

type SubInput = Omit<Subsection, 'example' | 'exercise'> & {
  scenario: string;
  architecture: string[];
  diagram?: string[][];
  diagramFocus?: string;
  diagramKind?: DiagramKind;
  flow: string[];
  tradeoffs: string[];
  failureModes: string[];
  prompt: string;
  tasks: string[];
  expected: string[];
};

const fallbackDiagram = [
  ['Client', 'API/BFF', 'Feature Service'],
  ['Cache', 'Primary DB', 'Search/Graph Index'],
  ['Queue/Stream', 'Workers', 'Observability'],
];

const diagrams: Record<string, string[][]> = {
  'problem-framing': [
    ['Prompt', 'Users', 'Core actions'],
    ['MVP scope', 'NFR targets', 'Out of scope'],
    ['APIs', 'Data flows', 'Risks'],
  ],
  'requirements-and-nfrs': [
    ['Product verbs', 'Functional requirements', 'APIs/events'],
    ['Latency', 'Freshness', 'Availability'],
    ['Privacy', 'Abuse', 'Observability'],
  ],
  'back-of-envelope-estimates': [
    ['MAU/DAU', 'Actions/user', 'Average QPS'],
    ['Peak factor', 'Serving capacity', 'Cache size'],
    ['Mutation rate', 'Queue throughput', 'Worker pool'],
  ],
  'api-contracts': [
    ['Client', 'Gateway', 'Suggestions API'],
    ['Cursor contract', 'Read model', 'Profile hydration'],
    ['Idempotent mutation', 'Source DB', 'Domain event'],
  ],
  'answer-pacing': [
    ['Requirements', 'Estimates', 'API'],
    ['Data model', 'Flows', 'Bottleneck'],
    ['Trade-offs', 'Failures', 'Follow-up'],
  ],
  'sync-request-path': [
    ['Browser/App', 'CDN/Edge', 'API Gateway'],
    ['BFF/Product API', 'Service logic', 'Redis cache'],
    ['Primary DB/read model', 'Downstream service', 'Tracing/logs'],
  ],
  'async-pipelines': [
    ['Source service', 'Transactional outbox', 'Event broker'],
    ['Kafka/Kinesis topic', 'Worker group', 'Derived store'],
    ['Retry queue', 'DLQ', 'Lag dashboard'],
  ],
  'cache-hierarchy': [
    ['Browser cache', 'CDN', 'Gateway cache'],
    ['Redis object cache', 'Read model store', 'Primary DB'],
    ['Invalidation event', 'Versioned key', 'Final auth check'],
  ],
  'partitioning-and-sharding': [
    ['Access pattern', 'Partition key', 'Shard router'],
    ['Shard A', 'Shard B', 'Shard C'],
    ['Hot-key detector', 'Salting/caps', 'Rebalance job'],
  ],
  'search-index-read-models': [
    ['Primary DB', 'Outbox/CDC', 'Stream'],
    ['Indexer worker', 'OpenSearch/Elasticsearch', 'Read API'],
    ['Snapshot', 'Backfill/replay', 'Version cutover'],
  ],
  'entity-modeling': [
    ['User/Profile', 'ConnectionRequest', 'ConnectionEdge'],
    ['Block', 'Dismissal', 'Suggestion'],
    ['Owner service', 'Invariant', 'Domain event'],
  ],
  'database-choice': [
    ['Access pattern', 'Consistency need', 'Store choice'],
    ['Postgres/MySQL', 'KV/Wide-column', 'Graph store'],
    ['Redis', 'Search index', 'Object storage'],
  ],
  'transactions-idempotency-outbox': [
    ['Client retry', 'Idempotency key', 'DB transaction'],
    ['State row', 'Outbox row', 'Commit'],
    ['Relay', 'Broker', 'Idempotent consumer'],
  ],
  'cdc-event-sourcing': [
    ['Source DB log', 'CDC connector', 'Event stream'],
    ['Consumer A', 'Consumer B', 'Read models'],
    ['Snapshot', 'Replay', 'Schema registry'],
  ],
  'consistency-models': [
    ['Operation', 'Correctness need', 'Consistency choice'],
    ['Strong write', 'Read-your-writes', 'Eventual read model'],
    ['Version check', 'Conflict rule', 'Repair job'],
  ],
  'social-graph-model': [
    ['User vertex', 'Connection edge', 'Block edge'],
    ['Adjacency store', 'Canonical edge', 'Privacy policy'],
    ['Graph event', 'Candidate job', 'Suggestions store'],
  ],
  'mutual-candidate-generation': [
    ['User neighbors', 'Two-hop expansion', 'Candidate set'],
    ['Dedup/filter', 'Mutual count', 'Feature vector'],
    ['Fan-out caps', 'Queue workers', 'Read model'],
  ],
  'ranking-feature-store': [
    ['Candidate', 'Feature fetch', 'Ranker'],
    ['Graph features', 'Profile features', 'Behavior features'],
    ['Model version', 'Score', 'Explanation'],
  ],
  'serving-suggestions': [
    ['Client', 'Suggestions API', 'Ranked read model'],
    ['Cache', 'Privacy filter', 'Profile hydration'],
    ['Impression event', 'Analytics', 'Freshness monitor'],
  ],
  'privacy-safety-filters': [
    ['Candidate pool', 'Block/private filter', 'Policy filter'],
    ['Safety classifier', 'Ranker', 'Final serve filter'],
    ['Audit log', 'Appeal/review', 'Abuse metrics'],
  ],
  'full-case-study': [
    ['Requirements', 'Graph source', 'Events'],
    ['Candidate generation', 'Ranking', 'Suggestions store'],
    ['API/cache', 'Privacy checks', 'Metrics/failures'],
  ],
  'notification-system': [
    ['Domain event', 'Preference filter', 'Dedupe'],
    ['Fan-out queue', 'Provider adapter', 'Push/email/SMS'],
    ['Retry/DLQ', 'Delivery state', 'Analytics'],
  ],
  'chat-messaging': [
    ['Sender', 'Message API', 'Conversation shard'],
    ['Message store', 'Realtime fan-out', 'Recipient devices'],
    ['Offline inbox', 'Read receipts', 'Push notification'],
  ],
  'news-feed': [
    ['Creator event', 'Fan-out workers', 'Timeline store'],
    ['Ranker', 'Feed API', 'Client cursor'],
    ['Freshness queue', 'Cache', 'Engagement events'],
  ],
  'search-autocomplete': [
    ['Query prefix', 'Autocomplete API', 'Prefix index'],
    ['Candidate retrieval', 'Ranker', 'Personalization'],
    ['Index builder', 'Freshness stream', 'Metrics'],
  ],
  'rate-limiter': [
    ['Request', 'Limiter middleware', 'Counter store'],
    ['Token bucket', 'Sliding window', 'Policy decision'],
    ['Allow/deny', 'Audit log', 'Abuse dashboard'],
  ],
  'media-upload': [
    ['Client', 'Upload API', 'Pre-signed URL'],
    ['Object storage', 'Scan queue', 'Media workers'],
    ['CDN', 'Metadata DB', 'Processing status'],
  ],
  'slo-latency-budgets': [
    ['Product promise', 'SLO', 'SLI'],
    ['Latency budget', 'Error budget', 'Alert policy'],
    ['Dashboard', 'Incident review', 'Architecture change'],
  ],
  'load-balancing-autoscaling-backpressure': [
    ['Load balancer', 'Service pool', 'Autoscaler'],
    ['Queue depth', 'Backpressure', 'Circuit breaker'],
    ['Rate limit', 'Shedding', 'Recovery'],
  ],
  'graceful-degradation': [
    ['Dependency fails', 'Fallback path', 'Core feature'],
    ['Stale cache', 'Simpler ranking', 'Partial response'],
    ['User signal', 'Alert', 'Repair'],
  ],
  observability: [
    ['Request ID', 'Structured logs', 'Metrics'],
    ['Trace spans', 'Business events', 'Dashboards'],
    ['Alert', 'Runbook', 'Postmortem'],
  ],
  'multi-region-dr': [
    ['Region A', 'Replication stream', 'Region B'],
    ['Global router', 'Failover policy', 'Health checks'],
    ['RPO/RTO', 'Conflict handling', 'DR drill'],
  ],
  'auth-sessions': [
    ['Login', 'Identity provider', 'Session/token'],
    ['Gateway validation', 'Service identity', 'Device state'],
    ['Refresh/revoke', 'Audit log', 'Risk engine'],
  ],
  'authorization-acl': [
    ['Actor', 'Resource', 'Policy engine'],
    ['Relationship graph', 'ACL/role store', 'Decision cache'],
    ['Allow/deny', 'Audit log', 'Policy tests'],
  ],
  'pii-data-handling': [
    ['PII collection', 'Classification', 'Encrypted store'],
    ['Access control', 'Redaction', 'Retention job'],
    ['Deletion request', 'Tombstone', 'Audit evidence'],
  ],
  'abuse-spam-controls': [
    ['User action', 'Risk signals', 'Rules/ML scorer'],
    ['Throttle/challenge', 'Review queue', 'Enforcement'],
    ['Feedback loop', 'Appeals', 'Abuse metrics'],
  ],
  'secure-apis-secrets': [
    ['Client/API', 'Validation', 'AuthN/AuthZ'],
    ['Secrets manager', 'Service credentials', 'Encrypted data'],
    ['Rotation', 'Least privilege', 'Security logs'],
  ],
  'master-answer-template': [
    ['Clarify', 'Estimate', 'Contract'],
    ['Model', 'Architecture', 'Scale'],
    ['Reliability', 'Security', 'Trade-offs'],
  ],
  'system-design-checklist': [
    ['Requirements', 'NFRs', 'APIs'],
    ['Data', 'Flows', 'Bottlenecks'],
    ['Failures', 'Security', 'Observability'],
  ],
  'whiteboard-patterns': [
    ['Online path', 'Async path', 'Read model'],
    ['Cache', 'Index', 'Worker'],
    ['Failure boundary', 'Metrics', 'Follow-up'],
  ],
  'follow-up-questions': [
    ['Interviewer asks', 'Clarify axis', 'Deepen subsystem'],
    ['Scale', 'Consistency', 'Privacy'],
    ['Incident', 'Migration', 'Cost'],
  ],
  'practice-rubric': [
    ['Mock prompt', 'Timed answer', 'Score rubric'],
    ['Structure', 'Correctness', 'Depth'],
    ['Feedback', 'Retry', 'Track progress'],
  ],
};

const technologyNotes: Record<string, string[]> = {
  'problem-framing': [
    'When the prompt is broad, ground assumptions with concrete components you may later use: API gateway, primary store, cache, queue, search index, stream processor, observability stack, and policy service. This keeps the framing connected to implementation without jumping to technology too early.',
  ],
  'requirements-and-nfrs': [
    'Map each NFR to a practical mechanism: Redis/CDN for latency, Kafka/SQS/Kinesis for async freshness, PostgreSQL transactions for invariants, OpenTelemetry/Datadog/Grafana for observability, and policy engines or service checks for privacy.',
  ],
  'back-of-envelope-estimates': [
    'Use the estimates to choose families of technology. Hundreds of QPS may fit one relational cluster; tens of thousands of QPS often require cache/read models; large fan-out points to streams and worker pools; large text search points to OpenSearch/Elasticsearch.',
  ],
  'api-contracts': [
    'In real systems, API contracts are often OpenAPI/Swagger or protobuf/gRPC schemas. Include cursor shape, idempotency-key semantics, retryable status codes, rate-limit headers, and internal request IDs so clients and services can evolve independently.',
  ],
  'answer-pacing': [
    'Use the diagram as a navigation tool: first draw the online path, then add async/event paths, then mark storage ownership and failure boundaries. Interviewers can then choose where to go deeper: cache, queue, consistency, privacy, or scaling.',
  ],
  'entity-modeling': [
    'Turn entities into ownership and storage decisions: transactional entities often live in PostgreSQL/MySQL, high-QPS adjacency or timeline data in DynamoDB/Cassandra/Bigtable, search documents in OpenSearch/Elasticsearch, and immutable media in object storage.',
  ],
  'database-choice': [
    'A strong answer names the operational cost of each store: relational migrations and failover, DynamoDB/Cassandra partition design, Redis memory pressure and eviction, OpenSearch shard/index tuning, object storage lifecycle policies, and graph database traversal limits.',
  ],
  'transactions-idempotency-outbox': [
    'Common implementation pieces are unique constraints, idempotency tables, transactional outbox tables, Debezium/CDC or a polling relay, Kafka/SNS/SQS/Pub/Sub for delivery, and consumer-side dedupe keyed by event_id or aggregate version.',
  ],
  'cdc-event-sourcing': [
    'Use Debezium, DynamoDB Streams, MySQL binlog, Postgres logical replication, Kafka Connect, or cloud CDC services when you need committed database changes to feed indexes and read models. Full event sourcing is rarer and should be justified by audit/replay needs.',
  ],
  'consistency-models': [
    'Tie consistency choices to mechanisms: database transactions and unique constraints for strong invariants, leader reads or session tokens for read-your-writes, event streams for eventual read models, and compare-and-swap/version columns for conflict prevention.',
  ],
  'social-graph-model': [
    'At scale, social graph storage is often adjacency lists in a wide-column/KV store plus relational tables for workflow invariants. Dedicated graph databases can help exploration, but interviews should still address partitioning, hot nodes, and traversal caps.',
  ],
  'mutual-candidate-generation': [
    'Two-hop candidate generation is usually an offline or nearline job using Kafka/Spark/Flink/Beam or queue workers, with caps for high-degree nodes and sampled neighbor sets to control fan-out cost.',
  ],
  'ranking-feature-store': [
    'Ranking stacks commonly combine offline feature stores, online feature stores such as Redis/DynamoDB/Cassandra, model serving via a service endpoint, and experiment frameworks for model/version rollout. Keep explanations safe and avoid exposing sensitive features.',
  ],
  'serving-suggestions': [
    'Serving usually combines Redis for hot ranked pages, a viewer-keyed read model for durable fallback, batched profile hydration, final block/privacy checks, and impression events for analytics and model feedback.',
  ],
  'privacy-safety-filters': [
    'Practical filter systems use policy services, relationship/ACL stores, block lists, risk classifiers, deny lists, and audit logs. Safety filters should run before ranking when possible and again at final serving for stale derived data.',
  ],
  'full-case-study': [
    'A complete production answer should name both source and derived technology: relational request workflow, adjacency graph store, Kafka/Kinesis/Pub/Sub events, Redis cache, suggestions read model, OpenSearch for people search, and dashboards for freshness and quality.',
  ],
  'notification-system': [
    'Common technologies include Kafka/SQS/Pub/Sub for fan-out, Redis or relational stores for dedupe and preferences, APNs/FCM/email/SMS providers for delivery, and DLQs plus provider-specific retry policies.',
  ],
  'chat-messaging': [
    'Messaging systems often use WebSockets or gRPC streams for realtime delivery, a durable message store such as Cassandra/DynamoDB/PostgreSQL, Redis presence, push notification providers, and per-conversation or per-user partitioning for ordering.',
  ],
  'news-feed': [
    'Feeds usually combine fan-out-on-write workers, timeline stores in Cassandra/DynamoDB/Redis Sorted Sets, ranking services, object/profile hydration, and engagement event streams. The key decision is how much work happens at write time vs read time.',
  ],
  'search-autocomplete': [
    'Autocomplete commonly uses prefix tries/FSTs, OpenSearch/Elasticsearch completion suggesters, Redis for hot prefixes, typo-tolerant candidate generation, and separate offline jobs for popularity and personalization signals.',
  ],
  'rate-limiter': [
    'Distributed rate limiters are commonly built with Redis atomic counters/Lua scripts, Envoy/Kong plugins, token bucket or sliding-window algorithms, and separate policy tiers for user, IP, device, API key, and tenant limits.',
  ],
  'media-upload': [
    'Production upload flows usually use pre-signed S3/GCS URLs, multipart upload, antivirus scanning queues, transcoding workers, metadata DB rows, CDN delivery, and lifecycle policies for temporary or deleted objects.',
  ],
  'slo-latency-budgets': [
    'SLO work becomes concrete through Prometheus/Grafana/Datadog/New Relic metrics, OpenTelemetry traces, alert policies tied to burn rate, and dashboards that separate user-visible latency from background freshness.',
  ],
  'load-balancing-autoscaling-backpressure': [
    'Practical controls include L4/L7 load balancers, Kubernetes HPA/KEDA, queue-depth scaling, Envoy circuit breakers, bulkheads, rate limiting, bounded worker pools, and load shedding for optional work.',
  ],
  'graceful-degradation': [
    'Design fallback paths with concrete mechanics: stale Redis/read-model responses, feature flags, simpler ranking models, dependency timeouts, partial responses, and user-safe empty states for optional modules.',
  ],
  observability: [
    'A strong observability answer combines structured logs, metrics, traces, domain events, dashboards, alerts, and runbooks. Use OpenTelemetry for trace propagation and include business labels such as cache_hit, model_version, queue_lag, and freshness_age.',
  ],
  'multi-region-dr': [
    'Real multi-region designs involve Route 53/Cloudflare/global load balancers, database replication, object-storage replication, Kafka MirrorMaker/Pub/Sub replication, failover automation, RPO/RTO targets, and regular DR drills.',
  ],
  'auth-sessions': [
    'Auth implementations often use OAuth2/OIDC providers, JWT or opaque session tokens, refresh-token rotation, device/session tables, Redis token revocation lists, mTLS/service identity, and audit logs for sensitive account events.',
  ],
  'authorization-acl': [
    'Authorization can use RBAC, ABAC, relationship-based access control, policy engines such as OPA/Cedar, ACL tables, and decision caches. The serving path should fail closed when policy data is unavailable for sensitive resources.',
  ],
  'pii-data-handling': [
    'PII handling uses classification, encryption at rest, field-level encryption for sensitive fields, KMS-managed keys, redacted logs, retention jobs, deletion tombstones, and access audits. Keep PII out of analytics and traces unless explicitly minimized.',
  ],
  'abuse-spam-controls': [
    'Abuse systems combine rate limits, reputation stores, device/IP signals, graph anomaly detection, ML/rules engines, challenge flows, manual review tools, enforcement state, and feedback loops from reports and appeals.',
  ],
  'secure-apis-secrets': [
    'Secure API designs should mention input validation, least-privilege service credentials, KMS/Secrets Manager/Vault, TLS/mTLS, secret rotation, scoped tokens, audit logs, and dependency scanning for supply-chain risk.',
  ],
  'master-answer-template': [
    'Use concrete technology only after the shape is clear: source DB, cache, queue/stream, worker pool, read model, search index, object storage, observability, and policy/security services. The template helps avoid naming tools without purpose.',
  ],
  'system-design-checklist': [
    'Run a technology sanity pass before finishing: source of truth, cache key/TTL, async broker, read model/index, partition key, idempotency key, monitoring metric, failure fallback, and privacy/security boundary.',
  ],
  'whiteboard-patterns': [
    'Most diagrams can be assembled from a small set of patterns: online request path, async event pipeline, source-to-read-model projection, cache hierarchy, sharded storage, multi-region failover, and policy enforcement boundary.',
  ],
  'follow-up-questions': [
    'For follow-ups, translate the question into one axis and one mechanism: scale means partition/cache/queue; consistency means transactions/versioning; freshness means stream lag; privacy means policy checks; incidents mean fallback and observability.',
  ],
  'practice-rubric': [
    'When scoring practice, reward concrete production anchors: named storage ownership, API contracts, event schemas, partition keys, cache invalidation, retry/idempotency behavior, diagrams, metrics, and one explicit trade-off per major component.',
  ],
};

const diagramKinds: Record<string, DiagramKind> = {
  'problem-framing': 'flow',
  'requirements-and-nfrs': 'layered',
  'back-of-envelope-estimates': 'flow',
  'api-contracts': 'flow',
  'answer-pacing': 'cycle',
  'sync-request-path': 'flow',
  'async-pipelines': 'pipeline',
  'cache-hierarchy': 'layered',
  'partitioning-and-sharding': 'layered',
  'search-index-read-models': 'pipeline',
  'entity-modeling': 'hub',
  'database-choice': 'layered',
  'transactions-idempotency-outbox': 'flow',
  'cdc-event-sourcing': 'pipeline',
  'consistency-models': 'layered',
  'social-graph-model': 'layered',
  'mutual-candidate-generation': 'pipeline',
  'ranking-feature-store': 'hub',
  'serving-suggestions': 'flow',
  'privacy-safety-filters': 'hub',
  'full-case-study': 'pipeline',
  'notification-system': 'pipeline',
  'chat-messaging': 'pipeline',
  'news-feed': 'pipeline',
  'search-autocomplete': 'pipeline',
  'rate-limiter': 'hub',
  'media-upload': 'pipeline',
  'slo-latency-budgets': 'cycle',
  'load-balancing-autoscaling-backpressure': 'hub',
  'graceful-degradation': 'cycle',
  observability: 'hub',
  'multi-region-dr': 'layered',
  'auth-sessions': 'layered',
  'authorization-acl': 'hub',
  'pii-data-handling': 'flow',
  'abuse-spam-controls': 'hub',
  'secure-apis-secrets': 'layered',
  'master-answer-template': 'flow',
  'system-design-checklist': 'flow',
  'whiteboard-patterns': 'cycle',
  'follow-up-questions': 'hub',
  'practice-rubric': 'cycle',
};

const diagramFocus: Record<string, string> = {
  'entity-modeling': 'Owner service',
  'ranking-feature-store': 'Ranker',
  'privacy-safety-filters': 'Safety classifier',
  'rate-limiter': 'Limiter middleware',
  'load-balancing-autoscaling-backpressure': 'Backpressure',
  observability: 'Trace spans',
  'authorization-acl': 'Policy engine',
  'abuse-spam-controls': 'Rules/ML scorer',
  'follow-up-questions': 'Clarify axis',
};

const optionTables: Record<string, string> = {
  'sync-request-path': `| Option | Use when | Trade-off |
|---|---|---|
| Live downstream calls | Data must be fresh per request | Higher tail latency and dependency risk |
| Denormalized read model | Read latency matters more than perfect freshness | Stale data and rebuild complexity |
| Redis cache-aside | Hot personalized reads repeat often | Invalidation and stampede handling needed |`,
  'async-pipelines': `| Primitive | Best for | Watch out |
|---|---|---|
| Job queue | Simple background work and retries | Limited replay and multi-consumer history |
| Durable stream | Multiple consumers, ordering, replay | More operational overhead |
| Workflow engine | Long-running multi-step processes | More complexity than a queue for simple jobs |`,
  'cache-hierarchy': `| Cache layer | Good for | Correctness risk |
|---|---|---|
| CDN/browser cache | Public or immutable assets | Unsafe for private personalized state |
| Redis/Memcached | Hot objects and read models | Stale keys after privacy/block changes |
| In-process cache | Tiny stable dictionaries | Inconsistent across instances |`,
  'partitioning-and-sharding': `| Strategy | Good for | Failure mode |
|---|---|---|
| Hash partition | Even distribution and simple point reads | Range scans become scatter-gather |
| Range partition | Ordered scans and time windows | Hot latest range |
| Salting hot keys | Celebrity/high-degree users | More complex reads and merges |`,
  'search-index-read-models': `| Read model | Query shape | Refresh model |
|---|---|---|
| OpenSearch/Elasticsearch | Text search, filters, autocomplete | Event-driven indexing with lag |
| KV/wide-column table | Point reads by viewer/entity key | Async projection from source truth |
| Redis sorted set | Small hot ranked lists | Memory cost and eviction policy |`,
  'database-choice': `| Store | Strength | Weakness |
|---|---|---|
| Relational DB | Transactions, constraints, ad-hoc queries | Harder horizontal scale at high write fan-out |
| KV/wide-column | Predictable high-QPS key access | Query flexibility is low |
| Graph DB | Expressive traversal | Partitioning and hot-node scaling still matter |
| Search index | Text/ranking/filter queries | Usually eventual and not source of truth |`,
  'transactions-idempotency-outbox': `| Pattern | Solves | Cost |
|---|---|---|
| Idempotency key | Client retry duplicates | Stores request/mutation state |
| Unique constraint | Natural duplicate prevention | Needs careful conflict response |
| Transactional outbox | DB/broker dual-write loss | Relay, cleanup, and monitoring |`,
  'consistency-models': `| Guarantee | Use for | Avoid using for |
|---|---|---|
| Strong consistency | Money, blocks, ownership, unique edges | Derived ranking freshness |
| Read-your-writes | Dismiss, send request, edit profile | Global feed/recommendation freshness |
| Eventual consistency | Suggestions, search indexes, analytics | Safety-critical authorization |`,
  'mutual-candidate-generation': `| Generation mode | Benefit | Cost |
|---|---|---|
| On-read traversal | Fresh candidates | High latency and hot-node risk |
| Nearline workers | Fresh within minutes | Queue lag and replay complexity |
| Offline batch | Cheap large recompute | Stale between runs |`,
  'ranking-feature-store': `| Signal family | Examples | Risk |
|---|---|---|
| Graph features | Mutual count, shared groups | High-degree bias |
| Profile features | Company, school, location | Privacy leakage |
| Behavior features | Clicks, dismissals, accepts | Feedback loops and manipulation |`,
  'notification-system': `| Delivery mode | Good for | Risk |
|---|---|---|
| Push | Urgent mobile attention | Provider failure and token expiry |
| Email | Durable async communication | Spam complaints and slow feedback |
| In-app inbox | Guaranteed product visibility | Requires read state and storage |`,
  'chat-messaging': `| Choice | Use when | Trade-off |
|---|---|---|
| Per-conversation ordering | Group chat correctness | Hot large groups |
| Per-recipient inbox | Fast device sync | More fan-out writes |
| WebSocket realtime | Active sessions | Connection management and fallback needed |`,
  'news-feed': `| Fan-out strategy | Good for | Cost |
|---|---|---|
| Fan-out on write | Fast reads for normal users | Expensive celebrity writes |
| Fan-out on read | Fresh ranking and fewer writes | Slower reads |
| Hybrid | Practical social feeds | More branching logic |`,
  'search-autocomplete': `| Technique | Strength | Trade-off |
|---|---|---|
| Prefix trie/FST | Very low latency prefixes | Rebuild complexity |
| Search suggester | Ranking, filters, typo support | Index lag and shard tuning |
| Hot-prefix cache | Cheap repeated queries | Cache invalidation and personalization limits |`,
  'rate-limiter': `| Algorithm | Good for | Weakness |
|---|---|---|
| Token bucket | Bursts with average rate | Needs shared state when distributed |
| Sliding window | Fairer recent-window limits | More storage/CPU |
| Fixed window | Simple counters | Boundary bursts |`,
  'media-upload': `| Upload path | Benefit | Risk |
|---|---|---|
| Direct-to-object-storage | Bypasses app servers for large files | Needs signed URLs and metadata reconciliation |
| App-server proxy | Simpler auth/control | Expensive bandwidth and scaling |
| Multipart upload | Large/resumable files | More client and cleanup complexity |`,
  'slo-latency-budgets': `| Metric | Measures | Design impact |
|---|---|---|
| p95/p99 latency | User-visible speed | Forces cache, batching, and timeout choices |
| Error budget | Reliability tolerance | Controls release and incident policy |
| Freshness age | Async data staleness | Drives queue/worker capacity |`,
  'load-balancing-autoscaling-backpressure': `| Control | Protects | Trade-off |
|---|---|---|
| Autoscaling | Sustained traffic growth | Slow reaction and cold starts |
| Backpressure | Downstream stability | Requests wait or fail sooner |
| Load shedding | Core availability | Optional work is dropped |`,
  'multi-region-dr': `| Mode | Benefit | Cost |
|---|---|---|
| Active-passive | Simpler consistency and failover story | Idle capacity and failover delay |
| Active-active | Lower latency and regional resilience | Conflict handling and data replication complexity |
| Backup/restore | Cheapest baseline DR | Higher RTO/RPO |`,
  'authorization-acl': `| Model | Good for | Cost |
|---|---|---|
| RBAC | Coarse roles | Weak for object-level permissions |
| ABAC | Attribute-based policy | Harder debugging |
| Relationship-based auth | Social graph/resource sharing | Needs graph/policy cache |`,
  'abuse-spam-controls': `| Control | Stops | Risk |
|---|---|---|
| Rate limit | Simple volume abuse | False positives for power users |
| Reputation/risk score | Repeated bad actors | Cold-start accounts |
| Manual review | High-risk ambiguous cases | Operational cost |`,
};

const blockExplanations: Record<string, string> = {
  'API Gateway': 'Authenticates, rate-limits, validates, routes requests, and attaches request metadata before traffic reaches product services.',
  'BFF/Product API': 'Shapes product-specific responses for the UI and coordinates a bounded set of backend reads.',
  'Browser/App': 'User-facing client that sends authenticated requests, manages local state, and renders returned data.',
  'CDN/Edge': 'Terminates TLS, serves cacheable assets, and absorbs globally distributed traffic close to users.',
  'Redis cache': 'Low-latency cache for hot personalized reads; correctness depends on keys, TTLs, and invalidation.',
  'Primary DB/read model': 'Durable source or projected store that the online path can read inside the latency budget.',
  'Downstream service': 'Dependency called by the request path; it needs timeouts, batching, and fallback behavior.',
  'Tracing/logs': 'Correlation data for debugging latency, errors, cache hits, and downstream calls by request ID.',
  'Source service': 'Service that owns the business write and emits a domain event after durable commit.',
  'Transactional outbox': 'Outbox record written with business state in one DB transaction to avoid dual-write loss.',
  'Event broker': 'Durable messaging layer that decouples producers and consumers and supports fan-out.',
  'Kafka/Kinesis topic': 'Partitioned event stream; explain partition key, retention, ordering, consumer groups, and lag.',
  'Worker group': 'Horizontally scalable consumers that process async work and must be idempotent under retries.',
  'Derived store': 'Read-optimized projection built from source events; it needs rebuild, versioning, and freshness checks.',
  'Retry queue': 'Buffer for transient failures with backoff so temporary dependency errors do not drop work.',
  DLQ: 'Dead-letter queue for poison messages that failed retries and need triage or replay.',
  'Lag dashboard': 'Operational view of consumer delay and product freshness age.',
  'Browser cache': 'Client-side cache for static or safe short-lived data; private state needs strict cache controls.',
  CDN: 'Edge cache and delivery network for public/static content or carefully scoped API responses.',
  'Gateway cache': 'Near-entry cache for shared responses; cache keys must isolate auth and viewer context.',
  'Redis object cache': 'Server-side object cache for hot records; it needs object versioning and invalidation.',
  'Read model store': 'Query-shaped durable store optimized for UI reads rather than normalized writes.',
  'Primary DB': 'Source-of-truth transactional store for invariants, indexes, backups, and write ownership.',
  'Invalidation event': 'Signal that marks cache/read-model entries stale after writes, deletes, blocks, or privacy changes.',
  'Versioned key': 'Cache/index key that includes schema, model, or entity version to prevent stale mixing.',
  'Final auth check': 'Last serving-path authorization/privacy check that protects users even when derived data is stale.',
  'Shard router': 'Routing layer that maps partition keys to physical shards and supports rebalancing.',
  'Hot-key detector': 'Monitoring logic that finds skewed keys before one partition becomes overloaded.',
  'Salting/caps': 'Hot-key mitigation that splits or bounds high-degree entities such as celebrity graph nodes.',
  'Rebalance job': 'Background job that moves or splits partitions while preserving read/write correctness.',
  'Outbox/CDC': 'Change publishing mechanism that turns committed source changes into downstream events.',
  'Indexer worker': 'Consumer that transforms source changes into search or read-model documents.',
  'OpenSearch/Elasticsearch': 'Search index for text, filters, ranking, and autocomplete; it is usually eventually consistent.',
  'Read API': 'Serving API that reads a projection or index and applies final validation before responding.',
  Snapshot: 'Consistent source capture used to backfill or rebuild derived stores.',
  'Backfill/replay': 'Repair or migration path that rebuilds projections from snapshots and retained events.',
  'Version cutover': 'Controlled switch from old to new read model/index with shadow validation and rollback.',
  'Postgres/MySQL': 'Relational store for transactions, constraints, and moderate relational queries.',
  'KV/Wide-column': 'High-scale key-partitioned store for predictable access patterns such as adjacency lists.',
  'Graph store': 'Graph traversal storage/query layer; partitioning and hot-node limits still matter.',
  'Search index': 'Derived index for text/ranking/filter queries; it should not become hidden source of truth.',
  Redis: 'In-memory data store used for hot caches, counters, ephemeral state, sorted sets, or lightweight coordination.',
  'Object storage': 'Durable blob storage for large files/media, usually paired with metadata and lifecycle policies.',
  'Metadata DB': 'Transactional metadata store for ownership, status, references, and processing state of uploaded objects.',
  'Counter store': 'Shared state for distributed counters such as rate limits, quotas, and sliding windows.',
  'Idempotency key': 'Stable mutation key that lets retries return the same logical result without duplicates.',
  'DB transaction': 'Atomic boundary for state changes and outbox writes that must commit together.',
  'Outbox row': 'Durable event record stored beside state before asynchronous publishing.',
  Relay: 'Publisher that reads unsent outbox rows, sends events, and records progress.',
  Broker: 'Messaging infrastructure that stores and delivers events to consumers.',
  'Idempotent consumer': 'Consumer that safely handles duplicate events using event IDs, versions, or deterministic upserts.',
  'CDC connector': 'Connector that reads database logs and emits committed changes downstream.',
  'Event stream': 'Ordered append-only log used by multiple consumers and replay jobs.',
  'Schema registry': 'Compatibility control for event schemas so producers do not break consumers.',
  'Strong write': 'Transactional write path for correctness-critical operations such as blocks, balances, or unique edges.',
  'Read-your-writes': 'Guarantee that users immediately see their own recent mutation.',
  'Eventual read model': 'Derived view that may lag source truth but improves read latency or query shape.',
  'Version check': 'Guard that prevents stale writes or events from overwriting newer state.',
  'Conflict rule': 'Explicit policy for racing writes, such as reject, merge, CAS, or last-writer-wins.',
  'Repair job': 'Background reconciliation that fixes drift between source truth and derived stores.',
  'API/cache': 'Serving layer combining API contracts with cache or read-model access.',
  'Privacy checks': 'Controls that prevent leaking blocked, private, or unauthorized data.',
  'Metrics/failures': 'Measurements used to detect product degradation and operational failure modes.',
  'Access pattern': 'Concrete read, write, filter, sort, and lookup shape that drives API, index, and storage choices.',
  'Consistency need': 'Correctness requirement that decides whether data must be strong, read-your-writes, or eventually consistent.',
  'Store choice': 'Storage decision that maps an access pattern and consistency need to a concrete database/index/cache.',
  'Service logic': 'Business logic that validates product rules, coordinates reads/writes, and keeps expensive work off the request path.',
  Prompt: 'Initial interview/product request that must be converted into users, use cases, scope, and constraints.',
  Users: 'Actors who use the system and determine access patterns, privacy rules, and success criteria.',
  'Core actions': 'Primary user operations that become APIs, writes, reads, events, and metrics.',
  'MVP scope': 'Smallest useful product boundary that prevents the design from expanding into unrelated systems.',
  'NFR targets': 'Latency, availability, freshness, durability, privacy, and scale targets that drive architecture choices.',
  'Out of scope': 'Explicitly deferred functionality that keeps the interview answer focused.',
  APIs: 'Contracts that expose product operations while hiding internal storage and implementation details.',
  'Data flows': 'Movement of requests, writes, events, and derived data through the system.',
  Risks: 'Known failure, privacy, scaling, or product-quality concerns that need mitigation.',
  'Product verbs': 'User-visible actions that should map cleanly to APIs, events, and state transitions.',
  'Functional requirements': 'Behavior the product must support, such as create, list, dismiss, send, or search.',
  'APIs/events': 'External commands/queries plus internal domain events produced by those operations.',
  Latency: 'Time budget for user-visible operations, usually expressed as p95 or p99.',
  Freshness: 'Maximum acceptable age of served data or derived read models.',
  Availability: 'Expected uptime or successful-response target for the feature.',
  Privacy: 'Rules that decide who may see, store, process, or infer sensitive information.',
  Abuse: 'Misuse patterns such as spam, scraping, fraud, fake accounts, or manipulation.',
  Observability: 'Logs, metrics, traces, and events that make production behavior diagnosable.',
  'MAU/DAU': 'Monthly and daily active-user assumptions used to estimate traffic and storage.',
  'Actions/user': 'Expected user activity rate used to derive reads, writes, and async work.',
  'Average QPS': 'Baseline requests per second before applying peak factors and growth margin.',
  'Peak factor': 'Multiplier used to size systems for busy hours rather than daily averages.',
  'Serving capacity': 'Online capacity needed for request latency under peak traffic.',
  'Cache size': 'Memory/storage estimate for cached objects or pages at target hit rate.',
  'Mutation rate': 'Write/event rate that drives source database and queue capacity.',
  'Queue throughput': 'Rate at which async workers must process messages to maintain freshness.',
  'Worker pool': 'Scalable set of workers sized by throughput, latency, and failure recovery needs.',
  Requirements: 'Functional and non-functional needs that constrain the architecture.',
  Estimates: 'Back-of-envelope sizing for traffic, storage, fan-out, and bottlenecks.',
  API: 'Public or internal contract for invoking product behavior.',
  'Data model': 'Entities, relationships, ownership, and invariants behind the feature.',
  Bottleneck: 'Likely scale or latency limit that deserves deeper design attention.',
  'Trade-offs': 'Explicit choice between competing goals such as freshness, cost, simplicity, and correctness.',
  Failures: 'Expected ways components can fail and how the product degrades or recovers.',
  'Follow-up': 'Next subsystem to explore once the baseline architecture is clear.',
};

const blockExplainPrompts: Record<string, string> = {
  'Browser/App': 'Client state, auth token handling, retry behavior, rendering expectation, and behavior during network failure.',
  'CDN/Edge': 'Cacheability, TLS termination, geo latency, bot protection, invalidation, and which responses must bypass edge cache.',
  'API Gateway': 'Auth validation, rate limits, schema validation, routing rules, request IDs, and p95 gateway overhead.',
  'BFF/Product API': 'Response contract, downstream batching, timeout budget, partial response policy, and client-facing errors.',
  'Redis cache': 'Key shape, TTL, invalidation event, stale-read safety, stampede protection, and memory pressure.',
  'Primary DB/read model': 'Whether it is source or projection, partition key, freshness guarantee, indexes, and fallback on slow reads.',
  'Downstream service': 'Timeout, retry policy, circuit breaker, bulkhead, and whether the response can degrade without it.',
  'Tracing/logs': 'Request ID propagation, span boundaries, log fields, sampling, and how to debug tail latency.',
  'Access pattern': 'Exact query/write shape, cardinality, QPS, sort/filter needs, and whether reads or writes dominate.',
  'Consistency need': 'Required guarantee per operation, stale-read tolerance, conflict rule, and user-visible correctness risk.',
  'Store choice': 'Why this engine fits the access pattern, what indexes/keys it needs, and what operational cost it adds.',
  'Service logic': 'Product invariants, downstream calls, transaction boundaries, timeout budget, and what moves to async workers.',
  Prompt: 'Ambiguities to clarify, assumptions to state, product boundary, and what is explicitly out of scope.',
  Users: 'User types, permissions, traffic contribution, privacy expectations, and success criteria for each actor.',
  'Core actions': 'API command/query, source-of-truth write, read path, event emitted, and success metric for each action.',
  'MVP scope': 'Included flows, deferred features, dependency assumptions, and why the first version is still useful.',
  'NFR targets': 'Numerical latency, availability, freshness, durability, retention, and privacy targets.',
  'Out of scope': 'Deferred functionality, why it is deferred, and what future architecture hook would support it.',
  APIs: 'Endpoint shape, idempotency, pagination, auth, error semantics, and backward compatibility.',
  'Data flows': 'Write path, read path, async path, source of truth, derived state, and failure boundary.',
  Risks: 'Highest-probability failure, highest-impact failure, mitigation, detection metric, and fallback.',
  Latency: 'p50/p95/p99 target, per-hop budget, timeout policy, and what work cannot be on the sync path.',
  Freshness: 'Allowed staleness window, generated_at tracking, queue lag threshold, and stale-serving behavior.',
  Availability: 'SLO target, dependency criticality, fallback mode, and what partial response is acceptable.',
  Privacy: 'Sensitive fields, authorization point, cache invalidation trigger, audit trail, and fail-closed behavior.',
  Abuse: 'Threat model, rate limits, risk signals, enforcement action, false-positive handling, and review loop.',
  Observability: 'Metrics, logs, traces, dashboards, alerts, and runbook owner for this component.',
  'Postgres/MySQL': 'Transactions, unique constraints, indexes, migration/failover plan, and scale limit before sharding.',
  'KV/Wide-column': 'Partition key, sort key, hot-key risk, query limitations, consistency mode, and rebalancing story.',
  'Graph store': 'Traversal depth, partition strategy, high-degree node handling, and why adjacency lists are or are not enough.',
  'Search index': 'Index schema, analyzer/ranking, refresh lag, rebuild path, and why it is not source of truth.',
  Redis: 'Data structure choice, key naming, TTL/eviction policy, memory sizing, persistence need, and failure fallback.',
  'Object storage': 'Bucket/key design, signed access, lifecycle cleanup, replication, consistency, and CDN delivery.',
  'Metadata DB': 'Schema, ownership, status transitions, transaction boundary, and reconciliation with object storage.',
  'Counter store': 'Atomic operation, windowing algorithm, TTL, hot-key handling, and behavior under partial failure.',
  'OpenSearch/Elasticsearch': 'Document shape, shard strategy, analyzer, refresh lag, alias cutover, and backfill/rebuild plan.',
  'Transactional outbox': 'Transaction boundary, relay publishing, exactly-once illusion, dedupe, and stuck row monitoring.',
  'Kafka/Kinesis topic': 'Partition key, ordering scope, retention, replay, consumer lag, and schema compatibility.',
  DLQ: 'Which errors go to DLQ, alert owner, replay procedure, and how poison messages avoid blocking healthy work.',
};

function describeBlock(label: string) {
  if (blockExplanations[label]) return blockExplanations[label];
  if (label.includes('API')) return `${label} defines a request/response boundary; explain auth, validation, pagination or idempotency, latency, and error behavior.`;
  if (label.includes('cache') || label.includes('Cache')) return `${label} reduces latency or backend load; explain key design, TTL, invalidation, and stale-data safety.`;
  if (label.includes('queue') || label.includes('Queue')) return `${label} buffers asynchronous work; explain retry policy, ordering, idempotency, and lag monitoring.`;
  if (label.includes('event') || label.includes('Event')) return `${label} communicates a committed domain change; explain schema, producer, consumers, ordering, and replay.`;
  if (label.includes('store') || label.includes('DB') || label.includes('model') || label.includes('Store')) return `${label} stores state for a specific access pattern; explain ownership, partition key, consistency, and rebuild path.`;
  if (label.includes('filter') || label.includes('Policy') || label.includes('Privacy')) return `${label} enforces product, privacy, or safety constraints; explain when it runs and whether it fails open or closed.`;
  if (label.includes('metric') || label.includes('Metric') || label.includes('Dashboard') || label.includes('Alert')) return `${label} supports operations; explain which signal it tracks, threshold, owner, and action.`;
  if (label.includes('Rank') || label.includes('Score')) return `${label} affects ordering or prioritization; explain inputs, model/rule version, fairness, and fallback.`;
  if (label.includes('Graph') || label.includes('edge')) return `${label} represents or processes relationship data; explain direction, partitioning, hot nodes, and privacy constraints.`;
  return `${label} is a distinct responsibility in this design; explain its input, output, owner, scaling limit, and failure fallback.`;
}

function explainPrompt(label: string) {
  if (blockExplainPrompts[label]) return blockExplainPrompts[label];
  if (label === 'CDN') return 'Cache policy, purge strategy, regional latency, origin fallback, and safe handling of private responses.';
  if (label.includes('API')) return `Request/response fields, auth context, pagination/idempotency, validation errors, and p95 latency for ${label}.`;
  if (label.includes('cache') || label.includes('Cache') || label === 'CDN') return `Cache key, TTL, invalidation trigger, stale-read policy, and stampede protection for ${label}.`;
  if (label.includes('queue') || label.includes('Queue') || label === 'DLQ') return `Producer, consumer group, retry/backoff, poison-message handling, idempotency key, and lag alarm for ${label}.`;
  if (label.includes('event') || label.includes('Event') || label.includes('stream') || label.includes('Stream')) return `Event schema, ordering key, retention, replay path, consumer ownership, and compatibility rules for ${label}.`;
  if (label.includes('DB') || label.includes('store') || label.includes('Store') || label.includes('model')) return `Source-vs-derived ownership, partition/sort key, consistency guarantee, rebuild path, and backup/restore story for ${label}.`;
  if (label.includes('filter') || label.includes('Policy') || label.includes('Privacy') || label.includes('auth')) return `Policy inputs, fail-open/fail-closed behavior, cacheability, audit logging, and stale-data protection for ${label}.`;
  if (label.includes('Rank') || label.includes('Score') || label.includes('features') || label.includes('Feature')) return `Feature freshness, model/rule version, online latency, explanation safety, and fallback ranking for ${label}.`;
  if (label.includes('Graph') || label.includes('edge') || label.includes('neighbors')) return `Edge direction, uniqueness, partition key, high-degree handling, privacy rules, and update fan-out for ${label}.`;
  if (label.includes('metric') || label.includes('Metric') || label.includes('Dashboard') || label.includes('Alert') || label.includes('logs') || label.includes('Trace')) return `Signal definition, labels/dimensions, alert threshold, owner, and incident action for ${label}.`;
  if (label.includes('Region') || label.includes('Failover') || label.includes('RPO') || label.includes('DR')) return `Traffic routing, replication lag, RPO/RTO, conflict handling, failover trigger, and drill plan for ${label}.`;
  if (label.includes('Upload') || label.includes('Media') || label.includes('Object storage') || label.includes('CDN')) return `Ownership, size limits, signed access, processing state, cleanup, and delivery path for ${label}.`;
  return `Concrete inputs/outputs, service owner, latency or freshness target, scale limit, and fallback behavior for ${label}.`;
}

function textDiagram(rows: string[][]) {
  return ['```txt', ...rows.map((row) => row.join(' -> ')), '```'].join('\n');
}

function stageTable(rows: string[][]) {
  const blocks = rows.flat();
  return [
    '| Block | What does it do? | What to explain |',
    '|---|---|---|',
    ...blocks.map((block) => `| ${block} | ${describeBlock(block)} | ${explainPrompt(block)} |`),
  ].join('\n');
}

function sub(input: SubInput): Subsection {
  const {
    scenario,
    architecture,
    diagram,
    diagramFocus: inputDiagramFocus,
    diagramKind,
    flow,
    tradeoffs,
    failureModes,
    prompt,
    tasks,
    expected,
    ...rest
  } = input;

  const resolvedDiagram = diagram ?? diagrams[rest.id] ?? fallbackDiagram;

  return {
    ...rest,
    theory: [
      ...rest.theory,
      textDiagram(resolvedDiagram),
      stageTable(resolvedDiagram),
      ...(optionTables[rest.id] ? [optionTables[rest.id]] : []),
      ...(technologyNotes[rest.id] ?? []),
    ],
    example: {
      scenario,
      architecture,
      diagram: resolvedDiagram,
      diagramFocus: inputDiagramFocus ?? diagramFocus[rest.id],
      diagramKind: diagramKind ?? diagramKinds[rest.id] ?? 'flow',
      flow,
      tradeoffs,
      failureModes,
    },
    exercise: { prompt, tasks, expected },
  };
}

const reqTasks = [
  'State functional and non-functional requirements before naming technologies.',
  'Draw one write path and one read path.',
  'Name the primary storage model, cache/index strategy, and async jobs.',
  'Call out one bottleneck, one failure mode, and one mitigation.',
];

const genericExpected = [
  'Clear APIs or contracts, not only boxes on a diagram.',
  'A source of truth plus derived read models or indexes where needed.',
  'A latency/scale target and a reason each component exists.',
  'Explicit trade-offs: freshness vs cost, consistency vs availability, simplicity vs flexibility.',
];

const levels: Level[] = [
  {
    id: 'interview-operating-system',
    order: 1,
    title: 'Interview Operating System',
    tagline: 'A repeatable loop for turning vague feature prompts into a structured architecture.',
    outcome: 'You can drive a design interview instead of waiting for the interviewer to rescue the prompt.',
    subsections: [
      sub({
        id: 'problem-framing',
        title: 'Problem framing and scope',
        summary: 'Convert "design X" into users, use cases, boundaries, and explicit assumptions.',
        priority: 'P0',
        duration: '35m',
        tags: ['requirements', 'scope', 'interview loop'],
        fastTrack: [
          'Start with users, core actions, success criteria, and out-of-scope items.',
          'Separate MVP requirements from stretch requirements so the design does not explode.',
          'Repeat assumptions out loud; interviewers reward controlled ambiguity.',
        ],
        theory: [
          'Most system design prompts are intentionally underspecified. Your first job is not to draw boxes; it is to discover the product shape. Ask who uses the system, what action they perform, how often, and what correctness or latency means for that action.',
          'Good scoping prevents accidental over-engineering. For a connection suggestion system, "suggest people a user may know" is core; importing address books, ads ranking, and full social feed integration can be explicitly deferred.',
          'Define read and write surfaces. A feature usually has at least one write path that changes source data and one read path that serves product UI. Many weak answers only discuss read serving and forget the write/update pipeline.',
          'Keep a parking lot for follow-ups: privacy, abuse, multi-region, machine learning, and analytics. Mention them early, then decide which ones are in scope for the first-pass design.',
        ],
        scenario:
          'A product manager asks for a "people you may know" feature. Frame the MVP as suggestions from existing first-degree connections, mutual connections, workplace/school signals, and block/privacy filters, excluding imported contacts and ads.',
        architecture: [
          'Client asks a Suggestions API for a paginated ranked list.',
          'Connection Service owns the source graph: user, edge, status, block, privacy.',
          'Candidate Generation jobs produce possible suggestions from two-hop graph expansion.',
          'Ranking Service scores candidates and writes a read-optimized Suggestions Store.',
        ],
        flow: [
          'Clarify actors: viewer, candidate user, existing connections, blocked users.',
          'Define core action: view suggestions, dismiss suggestion, send connection request.',
          'Set MVP constraints: p95 read latency under 200 ms, eventual freshness acceptable within minutes.',
          'Mark out-of-scope: importing contacts, paid recommendations, graph neural networks.',
        ],
        tradeoffs: [
          'A narrower MVP is easier to reason about and safer to ship, but may miss some high-quality suggestions.',
          'Precomputing suggestions improves read latency but makes freshness eventual.',
          'A realtime graph query can be fresher but expensive for high-degree users.',
        ],
        failureModes: [
          'Unclear scope leads to a design that mixes graph search, ML, privacy, and notifications without priorities.',
          'Ignoring negative signals can suggest blocked or already-dismissed users.',
          'No success metric makes it impossible to choose between freshness, ranking quality, and cost.',
        ],
        prompt: 'Take any product feature prompt and spend five minutes framing it before drawing architecture.',
        tasks: reqTasks,
        expected: genericExpected,
      }),
      sub({
        id: 'requirements-and-nfrs',
        title: 'Functional and non-functional requirements',
        summary: 'Turn product behavior into latency, availability, consistency, durability, and privacy targets.',
        priority: 'P0',
        duration: '40m',
        tags: ['nfr', 'slo', 'constraints'],
        fastTrack: [
          'Functional requirements say what users can do; NFRs say how well the system must behave.',
          'Pick numbers: QPS, p95 latency, freshness window, availability target, data retention.',
          'Correctness varies by feature: payments need strong consistency; suggestions tolerate eventual consistency.',
        ],
        theory: [
          'Functional requirements define operations such as create connection, accept connection, list suggestions, dismiss suggestion, and explain why a person is suggested. They become APIs, events, and storage writes.',
          'Non-functional requirements drive architecture. Low-latency reads push you toward cache and precomputed read models. High freshness pushes you toward streaming updates. Strong consistency pushes you toward transactions or careful coordination.',
          'State freshness explicitly. Suggestions can be stale for minutes; chat delivery should feel realtime; account balance cannot be stale. This one sentence changes the storage and processing strategy.',
          'Privacy is an NFR, not a garnish. A suggestions system must enforce blocks, private profiles, visibility rules, and minors/sensitive accounts before ranking or serving results.',
        ],
        scenario:
          'For connection suggestions, define: list suggestions, dismiss, connect, explain mutual friends, no blocked/private candidates, p95 < 200 ms, suggestions refresh within 10 minutes after graph changes.',
        architecture: [
          'Requirements doc maps operations to APIs and storage ownership.',
          'SLOs feed into API budgets, cache TTL, queue lag alarms, and ranking freshness checks.',
          'Privacy Policy Service is called during candidate filtering and final serving.',
          'Metrics pipeline tracks impressions, hides, requests sent, accepts, and complaints.',
        ],
        flow: [
          'Write functional requirements as verbs on product objects.',
          'Attach NFR targets to the most important read/write paths.',
          'Classify consistency per operation: strong, read-your-writes, eventual, best effort.',
          'Use NFRs to justify each major architecture decision.',
        ],
        tradeoffs: [
          'Strict freshness costs more compute and cache invalidation complexity.',
          'Higher availability may mean serving stale read models during pipeline failures.',
          'Detailed explanations improve trust but may reveal sensitive graph information.',
        ],
        failureModes: [
          'No latency target leads to vague cache decisions.',
          'No freshness target leads to accidental realtime complexity.',
          'No privacy requirement leads to unsafe suggestions even when ranking is good.',
        ],
        prompt: 'Write requirements for "Design LinkedIn connection suggestions" as if you had one whiteboard panel.',
        tasks: reqTasks,
        expected: [
          'Functional list includes view suggestions, dismiss, connect, and explanation.',
          'NFR list includes latency, freshness, availability, privacy, abuse, and observability.',
          'Consistency is weaker for suggestion freshness but stronger for blocks and existing connections.',
          'The architecture choices trace directly back to the targets.',
        ],
      }),
      sub({
        id: 'back-of-envelope-estimates',
        title: 'Back-of-envelope estimates',
        summary: 'Use rough math to size traffic, storage, fan-out, queues, and indexes.',
        priority: 'P0',
        duration: '45m',
        tags: ['capacity', 'qps', 'storage'],
        fastTrack: [
          'Estimate active users, reads per user, writes per user, payload size, and fan-out.',
          'Use the math to find bottlenecks; do not calculate for decoration.',
          'State assumptions and round aggressively: interviews care about reasoning, not perfect arithmetic.',
        ],
        theory: [
          'Capacity estimates identify the dominant pressure. A suggestion feature may have high read QPS, moderate graph writes, and heavy offline candidate generation. A chat feature has more write/read realtime pressure.',
          'Always separate online request QPS from offline/async work. A single connection event may update many candidate lists, but the user-facing accept request should not synchronously recompute all suggestions.',
          'Storage estimates must include indexes and derived views. The source connection edge table is small compared with expanded candidate tables or feature vectors if you store many candidates per active user.',
          'Use estimates to justify partitioning. If graph expansion for celebrity/high-degree users explodes, cap fan-out, sample, or treat high-degree nodes differently.',
        ],
        scenario:
          'Assume 100M monthly active users, 20M daily active, each opens suggestions twice daily, 20 results per page, 10M connection mutations per day. Online reads are around 460 QPS average before peak multiplier; offline jobs handle graph deltas.',
        architecture: [
          'Traffic model feeds API autoscaling and cache capacity.',
          'Edge counts and degree distribution feed graph storage partitioning.',
          'Candidate count per active user feeds Suggestions Store storage estimate.',
          'Mutation rate feeds queue throughput and worker pool sizing.',
        ],
        flow: [
          'Start with DAU and actions per user per day to estimate reads.',
          'Apply peak factor, usually 5x to 10x, for serving QPS.',
          'Estimate writes separately: connection created, removed, blocked, dismissed.',
          'Estimate derived data: candidates per user times active users times metadata size.',
        ],
        tradeoffs: [
          'Storing more precomputed candidates improves ranking flexibility but increases storage and refresh cost.',
          'Recomputing on read lowers storage but creates tail latency and graph hot spots.',
          'Approximate counters and sketches may be enough for ranking features.',
        ],
        failureModes: [
          'Average-only QPS underestimates peak traffic.',
          'Ignoring fan-out hides the true cost of graph updates.',
          'Ignoring high-degree users creates pathological expensive queries.',
        ],
        prompt: 'Estimate capacity for a people-suggestions service at 100M MAU.',
        tasks: [
          'Estimate read QPS with a peak multiplier.',
          'Estimate connection mutation events per second.',
          'Estimate storage for 500 candidates per active user.',
          'Call out one hot partition or high-degree-node risk.',
        ],
        expected: [
          'Reads and writes are separated.',
          'Peak traffic is used for serving capacity.',
          'Derived candidate storage is included.',
          'The design includes caps, sampling, or special handling for high-degree nodes.',
        ],
      }),
      sub({
        id: 'api-contracts',
        title: 'API and contract design',
        summary: 'Design contracts around product flows, idempotency, pagination, and evolution.',
        priority: 'P0',
        duration: '45m',
        tags: ['api', 'contracts', 'pagination'],
        fastTrack: [
          'Expose product operations, not database tables.',
          'Include pagination, idempotency keys, versioning, and error semantics.',
          'For ranked lists, return stable cursors and enough metadata for explanation/debugging.',
        ],
        theory: [
          'APIs are part of the architecture. They define service boundaries, consistency expectations, and what the client can safely retry. A good interview answer includes at least the critical endpoints.',
          'For list APIs, use cursor pagination when ranking can change. Offset pagination can skip or duplicate items when results are inserted or removed between pages.',
          'For mutating operations, include idempotency. Dismissing a suggestion or sending a connection request should be safe under retries and network timeouts.',
          'Design for evolution. Add optional fields, version ranking models internally, and avoid making clients depend on implementation-only ranking scores.',
        ],
        scenario:
          'Connection suggestions API: GET /v1/suggestions?cursor=..., POST /v1/suggestions/{candidateId}/dismiss, POST /v1/connections/requests with idempotency key.',
        architecture: [
          'API Gateway handles auth, rate limit, request IDs, and schema validation.',
          'Suggestions API reads a ranked cursor from Suggestions Store and re-checks privacy filters.',
          'Connection API writes source-of-truth graph edges and emits events.',
          'Analytics events record impression, dismiss, request, and accept.',
        ],
        flow: [
          'Client sends auth token and optional cursor.',
          'API validates viewer, fetches candidate IDs, hydrates profiles, and applies final filters.',
          'Mutation endpoints write idempotently and emit domain events.',
          'Events update derived suggestions asynchronously.',
        ],
        tradeoffs: [
          'Returning explanations improves UX but couples API to feature generation.',
          'Hydrating profiles inside Suggestions API simplifies clients but adds fan-out.',
          'Strict cursor stability may reduce ranking freshness inside a session.',
        ],
        failureModes: [
          'Non-idempotent connection requests create duplicates under retries.',
          'Offset pagination breaks when ranking refreshes.',
          'Missing final authorization check leaks candidates from stale derived stores.',
        ],
        prompt: 'Design the public API contract for connection suggestions.',
        tasks: [
          'Write the list endpoint with request and response fields.',
          'Write at least two mutation endpoints.',
          'Define pagination and idempotency behavior.',
          'Define error cases for blocked, already connected, and rate limited.',
        ],
        expected: [
          'The API uses cursor pagination.',
          'Mutations are idempotent and retry-safe.',
          'Server revalidates privacy and connection state.',
          'Responses include explainable reason metadata without exposing private graph details.',
        ],
      }),
      sub({
        id: 'answer-pacing',
        title: 'Trade-off language and interview pacing',
        summary: 'Keep answers structured, verbalize decisions, and leave room for follow-up depth.',
        priority: 'P1',
        duration: '30m',
        tags: ['communication', 'trade-offs'],
        fastTrack: [
          'Use a fixed sequence: requirements, estimates, APIs, data model, flows, scaling, reliability.',
          'Say "I choose X because Y; the cost is Z; I mitigate with W."',
          'Do not dive into one subsystem until the interviewer agrees it is the interesting part.',
        ],
        theory: [
          'Interview pacing is a system design skill. A correct detail delivered too early can hurt because it prevents the interviewer from seeing your end-to-end reasoning.',
          'Trade-off language turns boxes into senior judgment. Every cache, queue, index, and consistency choice should have a reason and a cost.',
          'Use progressive depth. First draw the simple architecture. Then deepen the bottleneck: graph expansion, ranking freshness, privacy filtering, or queue lag.',
          'Invite follow-ups with clear checkpoints: "If this direction makes sense, I will go deeper on candidate generation and ranking."',
        ],
        scenario:
          'During a suggestions design interview, you spend two minutes framing, two minutes on estimates, five minutes on architecture, then ask whether to deepen graph generation or ranking.',
        architecture: [
          'Whiteboard is organized by layers: client/API, source of truth, async pipeline, read model, observability.',
          'Decision log sits on the side of the diagram.',
          'Risk list includes freshness, privacy, abuse, high-degree nodes, and ranking quality.',
          'Follow-up branches are prepared but not all expanded at once.',
        ],
        flow: [
          'Summarize the prompt and assumptions.',
          'State the baseline architecture.',
          'Name the highest-risk subsystem.',
          'Ask permission to deepen the most relevant part.',
        ],
        tradeoffs: [
          'A crisp baseline may omit advanced details, but it gives the interviewer a map.',
          'Going deep too early may show expertise but lose product fit.',
          'Asking for direction can feel slower, but it aligns with the interviewer.',
        ],
        failureModes: [
          'Technology-first answers with no requirements.',
          'Unbounded rambling through every possible subsystem.',
          'No explicit trade-offs, making the design sound accidental.',
        ],
        prompt: 'Practice a seven-minute answer for "Design connection suggestions" without drawing every detail.',
        tasks: [
          'Use a timer and follow the fixed sequence.',
          'State at least three trade-offs.',
          'Pause once to ask which area to deepen.',
          'End with risks and monitoring.',
        ],
        expected: [
          'The answer is structured and time-boxed.',
          'The interviewer can interrupt at clear boundaries.',
          'Every major choice has a reason and a cost.',
          'The final minute covers reliability and privacy risks.',
        ],
      }),
    ],
  },
  {
    id: 'architecture-building-blocks',
    order: 2,
    title: 'Core Architecture Building Blocks',
    tagline: 'The reusable primitives behind most product feature designs.',
    outcome: 'You can compose APIs, queues, caches, stores, indexes, and workers for different feature shapes.',
    subsections: [
      sub({
        id: 'sync-request-path',
        title: 'Synchronous request path',
        summary: 'Design the online path from client to API gateway to service to data source.',
        priority: 'P0',
        duration: '40m',
        tags: ['api gateway', 'bff', 'latency'],
        fastTrack: [
          'The sync path must fit the user-facing latency budget.',
          'Do not put expensive fan-out or full recomputation on the request path.',
          'Gate every request with auth, rate limit, validation, and observability.',
        ],
        theory: [
          'The synchronous path is the part users wait for. It usually contains client, edge/CDN, API gateway, BFF or product API, service logic, cache, and one or more stores.',
          'A request path should be boring and bounded. It can hydrate data, enforce privacy, and read precomputed state, but expensive graph traversal, image processing, or global ranking belongs in async jobs.',
          'Common real-world components are CloudFront/Fastly/Cloudflare at the edge, Kong/Envoy/API Gateway for routing and auth, a BFF for product-specific response shaping, Redis or Memcached for hot objects, and PostgreSQL/MySQL/DynamoDB/Cassandra/OpenSearch depending on the read shape.',
          'Budget the path. If p95 is 200 ms, each hop gets a slice: gateway, service, cache, database, downstream calls, serialization, and network.',
          'Treat downstream calls as a tail-latency risk. Batch where possible, set timeouts shorter than the user-facing deadline, use circuit breakers for optional dependencies, and return partial data when the core product action can still succeed.',
          'Use request IDs, structured logs, metrics, and distributed traces from the first design. Debuggability is not optional in production architecture.',
        ],
        scenario:
          'GET /suggestions reads a precomputed ranked list from cache/store, hydrates profile snippets, applies final block/privacy checks, and returns a cursor.',
        architecture: [
          'Cloudflare/Fastly/CloudFront terminates TLS, serves static assets, and applies coarse bot protection.',
          'Kong/Envoy/API Gateway handles JWT/session validation, rate limits, schema validation, routing, and request tracing.',
          'Suggestions API/BFF reads Redis first, then a viewer-keyed read model such as DynamoDB/Cassandra/PostgreSQL partitioned by viewer_id.',
          'Profile snippets are denormalized into the suggestions read model or hydrated through a batched Profile Service call to avoid N+1 fan-out.',
          'OpenTelemetry traces, RED metrics, and structured logs carry request_id, viewer_id hash, cache status, and downstream latency.',
        ],
        flow: [
          'Client requests a page of suggestions with viewer auth and cursor.',
          'Gateway validates token and injects request metadata.',
          'Service reads candidate IDs and reason codes from read model.',
          'Service filters, hydrates, logs impression events, and returns response.',
        ],
        tradeoffs: [
          'Denormalized profile snippets reduce latency but may be stale.',
          'Calling Profile Service live improves freshness but adds tail latency.',
          'Cache-first serving improves p95 but requires careful invalidation for privacy changes.',
        ],
        failureModes: [
          'N+1 profile calls create high tail latency.',
          'Missing timeouts lets downstream services exhaust request threads.',
          'Serving stale cache after a block/privacy change creates a safety issue.',
        ],
        prompt: 'Draw the online request path for a ranked suggestions page.',
        tasks: reqTasks,
        expected: genericExpected,
      }),
      sub({
        id: 'async-pipelines',
        title: 'Async pipelines: queues, workers, streams',
        summary: 'Move expensive, retryable, and fan-out work away from user-facing requests.',
        priority: 'P0',
        duration: '45m',
        tags: ['queues', 'workers', 'events'],
        fastTrack: [
          'Use queues for decoupling, retries, buffering, and fan-out.',
          'Make consumers idempotent because messages can be duplicated.',
          'Monitor lag; a healthy API with a stuck queue can still serve stale product data.',
        ],
        theory: [
          'Async pipelines are the backbone of scalable product systems. A connection acceptance event can update graph indexes, suggestions, notifications, analytics, and search without blocking the accept request.',
          'Choose the primitive by need. A simple queue is enough for background jobs; a durable log or stream is better when multiple consumers need ordered replayable events.',
          'Common choices are SQS/RabbitMQ/Sidekiq/BullMQ for job queues, Kafka/Kinesis/Pub/Sub/Pulsar for durable event streams, and Celery/Temporal/Airflow for workflow-style jobs. The interview signal is explaining ordering, replay, retention, and consumer isolation.',
          'Retries create duplicates, so consumers need idempotency keys, deterministic writes, or version checks. Exactly-once is rare in practice; design for at-least-once delivery.',
          'Use the transactional outbox pattern when the event must correspond to a committed database change. The service writes business state and an outbox row in one transaction; a relay publishes later so the system avoids unsafe DB-plus-broker dual writes.',
          'Lag is a product metric. If candidate generation is 30 minutes behind, suggestions may be technically served but product freshness is broken.',
          'Every production pipeline needs a dead-letter queue, replay story, schema/version compatibility, consumer dashboards, and a plan for poison messages that would otherwise block an ordered partition.',
        ],
        scenario:
          'ConnectionAccepted events are appended to a stream. Candidate workers update two-hop suggestions; notification workers create "new connection" notifications; analytics consumers update metrics.',
        architecture: [
          'Connection Service writes source state and an outbox row in the same transaction.',
          'Outbox relay publishes domain events to Kafka/Kinesis/Pub/Sub with event_id, aggregate_id, version, occurred_at, and schema_version.',
          'Independent consumer groups update graph candidates, notifications, search indexes, analytics, and ML feature stores without blocking each other.',
          'Workers write idempotently using event_id dedupe tables, deterministic upserts, or monotonic aggregate versions.',
          'Dead-letter queues, replay tooling, and lag alarms expose stuck consumers, poison messages, and freshness breaches.',
        ],
        flow: [
          'User accepts a connection request.',
          'Service commits edge update and outbox event.',
          'Relay publishes event with idempotency key and version.',
          'Consumers update derived stores independently.',
        ],
        tradeoffs: [
          'Async processing gives low write latency but introduces eventual consistency.',
          'A stream supports replay and multiple consumers but costs more operational maturity than a simple job queue.',
          'Batching improves throughput but increases freshness delay.',
        ],
        failureModes: [
          'Consumer crash after partial write creates duplicate work without idempotency.',
          'Poison message blocks ordered partitions.',
          'Queue lag silently makes read models stale.',
        ],
        prompt: 'Design the async update path after a user accepts a connection request.',
        tasks: [
          'Identify the event producer and source-of-truth transaction.',
          'List at least three consumers.',
          'Define retry, idempotency, and dead-letter behavior.',
          'Name lag metrics and freshness alerts.',
        ],
        expected: [
          'The user-facing write is not blocked by derived updates.',
          'Consumers can safely retry.',
          'Events have stable IDs and versions.',
          'The design includes queue lag and DLQ monitoring.',
        ],
      }),
      sub({
        id: 'cache-hierarchy',
        title: 'Cache hierarchy and invalidation',
        summary: 'Use CDN, application cache, object cache, and client cache without violating correctness.',
        priority: 'P0',
        duration: '45m',
        tags: ['cache', 'ttl', 'invalidation'],
        fastTrack: [
          'Cache immutable/public data aggressively; cache private or safety-sensitive data carefully.',
          'Every cache needs a key, TTL, invalidation path, and stale-read policy.',
          'Privacy and block changes often require cache busting or final revalidation.',
        ],
        theory: [
          'Caching improves latency and cost by avoiding repeated work. In system design, explain what is cached, where it is cached, how long it lives, and what happens when it is stale.',
          'Cache levels differ. CDN is best for public assets; application cache is good for hot read models; object cache can store profile snippets; client cache improves navigation.',
          'Typical technologies are browser HTTP cache, CDN edge cache, reverse proxies such as Varnish/Nginx, Redis or Memcached for server-side hot data, in-process LRU caches for tiny stable dictionaries, and database buffer/cache layers you usually do not control directly.',
          'Invalidation is easier with immutable keys and versioned data. Mutable personalized lists are harder; use TTLs, event-driven invalidation, or final safety filters.',
          'Choose a cache pattern deliberately: cache-aside for most API reads, write-through when the cache must update with writes, write-behind when lower write latency matters, and refresh-ahead for expensive hot keys. Each pattern changes failure behavior.',
          'Protect hot keys with request coalescing/singleflight, soft TTL plus background refresh, jittered expiry, and fallback limits. Otherwise a cache miss storm can take down the database exactly when traffic is highest.',
          'Never let cache bypass correctness boundaries. Blocks, authorization, deleted accounts, and private content must be checked on the serving path or invalidated quickly.',
        ],
        scenario:
          'Suggestion pages use Redis for ranked candidate IDs with a short TTL, profile snippets cached by profile version, and final privacy checks before returning results.',
        architecture: [
          'Client uses HTTP cache for static bundle and short memory cache for current list.',
          'CDN uses immutable hashed asset keys and short TTLs only for safe public API responses.',
          'API uses Redis cache-aside keyed by viewer ID, model version, cursor bucket, and locale/experiment context.',
          'Profile cache keys include profile version or updated_at so stale snippets naturally fall away after profile edits.',
          'Connection/block/privacy/delete events invalidate viewer and candidate related keys, while the serving path still performs final authorization checks.',
          'Soft TTL, jitter, and singleflight prevent stampedes when a high-traffic suggestion page expires.',
        ],
        flow: [
          'Read cache for viewer suggestions.',
          'On hit, re-check privacy and hydrate profiles.',
          'On miss, read Suggestions Store and repopulate cache.',
          'On block/delete/privacy event, invalidate or mark affected keys stale.',
        ],
        tradeoffs: [
          'Short TTL reduces unsafe staleness but increases backend load.',
          'Event invalidation improves freshness but is harder to make complete.',
          'Caching denormalized lists is fast but can duplicate data across users.',
        ],
        failureModes: [
          'Cache stampede when a hot key expires.',
          'Stale cache serves blocked or deleted users.',
          'Poor key design mixes model versions or viewer contexts.',
        ],
        prompt: 'Design caching for GET /suggestions under a 200 ms p95 target.',
        tasks: [
          'Choose cache layers and keys.',
          'Define TTL and invalidation events.',
          'Add stampede protection.',
          'Add final correctness checks.',
        ],
        expected: [
          'Cache keys include viewer and ranking/model version.',
          'Safety-sensitive changes invalidate or are rechecked.',
          'Miss path is bounded and protected.',
          'The answer states freshness and stale-serving policy.',
        ],
      }),
      sub({
        id: 'partitioning-and-sharding',
        title: 'Partitioning and sharding',
        summary: 'Scale data by choosing partition keys that match access patterns and avoid hot spots.',
        priority: 'P0',
        duration: '45m',
        tags: ['sharding', 'partition keys', 'hot spots'],
        fastTrack: [
          'Pick partition keys from access patterns, not from aesthetics.',
          'Watch high-degree users and celebrity nodes; they create hot partitions.',
          'Use replication, fan-out caps, salting, or special-case storage for hot keys.',
        ],
        theory: [
          'Partitioning splits data so storage and traffic can scale horizontally. The partition key determines which queries are cheap and which ones need scatter-gather.',
          'For social graph edges, common queries are "neighbors of user" and "edge between A and B". Store by user ID for adjacency reads, and keep a canonical edge key for existence checks.',
          'Partitioning can be hash-based for even distribution, range-based for ordered scans, geo-based for locality, tenant-based for isolation, or composite when access patterns require multiple dimensions. The key should come from the dominant query, not from entity names.',
          'Common storage systems expose these choices differently: Cassandra/DynamoDB use partition keys heavily, PostgreSQL/MySQL need explicit sharding or partition tables at large scale, Elasticsearch/OpenSearch split indexes into shards, and Kafka partitions events by key for ordering and consumer scaling.',
          'Hot keys matter more than averages. Users with millions of followers or connections can overload a single partition or make two-hop expansion explode.',
          'Mitigations include salting hot keys, splitting large adjacency lists into buckets, caching hot reads, capping fan-out, treating celebrity/high-degree users with separate pipelines, and moving analytics to offline systems instead of online scatter-gather.',
          'Sharding introduces operational complexity: rebalancing, cross-shard transactions, secondary indexes, and uneven traffic. Mention how you handle growth.',
          'A good design separates source partitioning from read-model partitioning. The graph source may be keyed by user_id for adjacency, while suggestions are keyed by viewer_id and search indexes are sharded by document ID or routing key.',
        ],
        scenario:
          'Connection edges are stored in adjacency partitions by user ID. A separate canonical edge table keyed by min(userA,userB):max(userA,userB) supports idempotent existence checks.',
        architecture: [
          'Graph adjacency store partitioned by user_id in Cassandra/DynamoDB/wide-column storage for fast neighbor reads.',
          'Canonical edge store for unique pair constraints.',
          'High-degree users have capped expansion and sampled neighbor sets.',
          'Derived suggestions store partitioned by viewer_id for fast serving reads.',
          'Shard router, hot-key detector, and background rebalancing jobs track uneven traffic and move/split partitions safely.',
        ],
        flow: [
          'Connection write updates canonical edge and both adjacency lists.',
          'Candidate generation reads adjacency for changed users.',
          'Workers avoid full expansion for high-degree nodes.',
          'Serving reads suggestions by viewer partition.',
        ],
        tradeoffs: [
          'User-based partitioning makes neighbor reads cheap but cross-user analytics harder.',
          'Duplicating adjacency improves reads but makes writes multi-row.',
          'Special handling for high-degree users improves stability but may reduce recommendation recall.',
        ],
        failureModes: [
          'Celebrity partition overload.',
          'Cross-shard transaction complexity on graph writes.',
          'Scatter-gather queries timing out under peak load.',
        ],
        prompt: 'Choose partition keys for a social graph and suggestions read model.',
        tasks: reqTasks,
        expected: [
          'Access patterns drive partition keys.',
          'Source graph and derived suggestions can use different keys.',
          'High-degree nodes are explicitly handled.',
          'The design avoids full graph scans on read.',
        ],
      }),
      sub({
        id: 'search-index-read-models',
        title: 'Search indexes and read models',
        summary: 'Build derived data that matches read queries without corrupting the source of truth.',
        priority: 'P1',
        duration: '40m',
        tags: ['index', 'read model', 'denormalization'],
        fastTrack: [
          'Source of truth is optimized for correctness; read models are optimized for query speed.',
          'Derived indexes need rebuild, replay, versioning, and freshness monitoring.',
          'Search/index stores are usually eventually consistent.',
        ],
        theory: [
          'Many systems keep a normalized source store and one or more derived read models. This is not duplication by accident; it is deliberate denormalization for query shape.',
          'A search index supports text queries, ranking, filters, and autocomplete. A suggestions store supports viewer-keyed ranked lists. A feed store supports timeline reads.',
          'Common read-model technologies include Elasticsearch/OpenSearch/Solr for search, Redis Sorted Sets for small hot leaderboards or ranked lists, DynamoDB/Cassandra for high-QPS key-value reads, materialized views in PostgreSQL for moderate scale, and ClickHouse/BigQuery/Snowflake for analytics-oriented reads.',
          'Derived stores need lifecycle thinking: backfill, rebuild, replay from events, shadow version, cutover, and rollback.',
          'The source of truth emits changes through outbox or CDC. Indexer workers transform those changes into query-shaped documents, record offsets/checkpoints, and expose freshness metrics such as indexing lag and generated_at age.',
          'Version read models when changing schemas or ranking logic. Build v2 beside v1, shadow compare results, cut traffic gradually, and keep a rollback path until the new index has proven correctness and latency.',
          'Never let derived stores become the only place where critical truth exists unless that is an explicit event-sourcing design.',
        ],
        scenario:
          'A Suggestions Store contains top 500 candidates per active viewer with candidate_id, score bucket, reason codes, model version, and generated_at. It is rebuilt from graph events.',
        architecture: [
          'Primary graph DB owns edges and block state.',
          'Event stream feeds candidate generation and ranking.',
          'Suggestions Store is partitioned by viewer_id and versioned by model/schema version.',
          'OpenSearch/Elasticsearch owns text search documents and is rebuilt from profile events.',
          'Rebuild jobs recompute from graph/profile snapshots plus event replay, then cut over aliases or versioned tables.',
          'Freshness monitors compare stream offsets, generated_at age, and missing-document rates.',
        ],
        flow: [
          'Graph event arrives.',
          'Worker updates affected viewer candidate sets.',
          'Ranker writes a versioned read model.',
          'Serving reads by viewer and validates freshness/version.',
        ],
        tradeoffs: [
          'Read models make serving fast but add consistency and rebuild complexity.',
          'Storing top N candidates limits storage but may miss long-tail suggestions.',
          'Versioned read models enable safe rollout but double storage during migrations.',
        ],
        failureModes: [
          'Backfill overwrites newer incremental updates.',
          'Model version mismatch between API and stored rows.',
          'No rebuild path after data corruption.',
        ],
        prompt: 'Design a read model for ranked connection suggestions.',
        tasks: [
          'Define fields, partition key, and sort key.',
          'Define how it is built and refreshed.',
          'Define rebuild and model-version rollout.',
          'Define staleness detection.',
        ],
        expected: [
          'Read model is separate from source graph.',
          'It includes model version and generated_at.',
          'It can be rebuilt from source data/events.',
          'Serving has a fallback for missing or stale data.',
        ],
      }),
    ],
  },
  {
    id: 'data-modeling-consistency',
    order: 3,
    title: 'Data Modeling and Consistency',
    tagline: 'Model ownership, storage choices, write semantics, and correctness under retries.',
    outcome: 'You can choose databases and consistency guarantees based on feature behavior.',
    subsections: [
      sub({
        id: 'entity-modeling',
        title: 'Entity modeling and ownership boundaries',
        summary: 'Define entities, relationships, invariants, and which service owns each write.',
        priority: 'P0',
        duration: '40m',
        tags: ['entities', 'ownership', 'invariants'],
        fastTrack: [
          'Name source-of-truth entities before picking databases.',
          'One service should own each invariant; other services consume events or APIs.',
          'Derived data is allowed, but ownership must stay clear.',
        ],
        theory: [
          'Entity modeling is the bridge from product requirements to storage. For a social product, entities include User, Profile, ConnectionEdge, ConnectionRequest, Block, Dismissal, Suggestion, and Impression.',
          'Ownership boundaries prevent write conflicts. Connection Service owns edges and requests; Profile Service owns profile fields; Suggestions Service owns derived ranked lists; Analytics owns metrics.',
          'Invariants define correctness: no duplicate connection edge, no suggestion for already connected users, no suggestion across a block, no request beyond rate limits.',
          'Data ownership does not mean data isolation. Services can maintain denormalized copies, but they should update them from owned events and tolerate eventual consistency.',
        ],
        scenario:
          'A user sends a connection request. Connection Service owns request state and unique pair constraints, while Suggestions Service consumes the event to hide that candidate later.',
        architecture: [
          'User/Profile service owns profile data.',
          'Connection service owns requests, edges, and blocks.',
          'Suggestions service owns ranked derived candidates.',
          'Analytics service owns events and experimentation metrics.',
        ],
        flow: [
          'Define domain objects and invariants.',
          'Assign write ownership to services.',
          'Expose read APIs or events for consumers.',
          'Keep derived data repairable from source truth.',
        ],
        tradeoffs: [
          'Clear ownership reduces conflicts but can add service calls.',
          'Denormalization improves read speed but creates sync complexity.',
          'A monolithic service is simpler early but can become an ownership bottleneck.',
        ],
        failureModes: [
          'Two services write the same invariant differently.',
          'Derived stores become impossible to rebuild.',
          'Missing invariant allows duplicate or invalid relationships.',
        ],
        prompt: 'Model the core entities for a connection suggestions product.',
        tasks: reqTasks,
        expected: [
          'Entities include users, profiles, edges, requests, blocks, dismissals, suggestions, impressions.',
          'Ownership boundaries are explicit.',
          'Invariants are named.',
          'Derived stores are rebuildable.',
        ],
      }),
      sub({
        id: 'database-choice',
        title: 'Relational vs document vs KV vs graph',
        summary: 'Choose storage engines by access pattern, consistency, indexing, and operations.',
        priority: 'P0',
        duration: '45m',
        tags: ['database', 'graph', 'kv'],
        fastTrack: [
          'Relational is strong for transactions and constraints; KV is strong for simple high-QPS reads.',
          'Graph databases help traversal, but adjacency lists in a wide-column/KV store often scale better.',
          'Search engines are derived indexes, not primary transactional stores.',
        ],
        theory: [
          'Database choice is not a personality test. Map data shape and access patterns to storage properties: transactions, query flexibility, indexing, latency, scale, operational maturity, and cost.',
          'Relational databases are excellent for connection requests, unique constraints, account state, and transactional workflows. They can also handle moderate graph tables with indexes.',
          'KV or wide-column stores are good for adjacency lists and viewer-keyed read models at high scale. They trade ad-hoc query flexibility for predictable access.',
          'Graph databases make traversal expressive, but at very large social scale you still need partitioning, caching, and caps. In interviews, justify why you need one instead of assuming it.',
        ],
        scenario:
          'Use relational storage for connection requests and canonical edges, wide-column/KV adjacency for neighbor lists, Redis for hot suggestion pages, and a search index for people search.',
        architecture: [
          'PostgreSQL/MySQL for request workflow and uniqueness constraints.',
          'Wide-column adjacency store keyed by user_id.',
          'Redis for hot viewer suggestion pages.',
          'OpenSearch/Elasticsearch for people search, built from profile events.',
        ],
        flow: [
          'Write request state transactionally.',
          'On accept, update edge source and publish event.',
          'Update adjacency and suggestion read models asynchronously.',
          'Search index consumes profile changes separately.',
        ],
        tradeoffs: [
          'Multiple stores match different queries but increase operational complexity.',
          'A single relational DB is simpler but may not handle graph fan-out at large scale.',
          'A graph DB improves traversal semantics but may introduce scaling and operational constraints.',
        ],
        failureModes: [
          'Choosing a graph DB without addressing partitioning.',
          'Using search as source of truth for mutable user state.',
          'Ignoring transaction needs for connection request invariants.',
        ],
        prompt: 'Pick storage engines for users, connections, suggestions, and people search.',
        tasks: [
          'List access patterns first.',
          'Choose source-of-truth stores.',
          'Choose derived stores/indexes.',
          'State one operational cost for each extra store.',
        ],
        expected: [
          'Storage choices map to access patterns.',
          'Transactional invariants use an appropriate store.',
          'Search and suggestions are derived from source truth.',
          'The design avoids one-size-fits-all database claims.',
        ],
      }),
      sub({
        id: 'transactions-idempotency-outbox',
        title: 'Transactions, idempotency, and outbox',
        summary: 'Make writes safe under retries and publish events without losing state changes.',
        priority: 'P0',
        duration: '45m',
        tags: ['idempotency', 'outbox', 'transactions'],
        fastTrack: [
          'Every retryable mutation needs an idempotency key or natural unique constraint.',
          'Write state and outbox event in the same transaction.',
          'Consumers must be idempotent because event delivery is usually at-least-once.',
        ],
        theory: [
          'Distributed systems fail in the gaps: request timeout after commit, event publish succeeds but DB write fails, consumer writes partial data then crashes. Idempotency and outbox patterns close many of these gaps.',
          'Idempotency makes repeated requests produce the same effect. A connection request can be keyed by viewer_id, candidate_id, and operation type, or by a client-provided idempotency key.',
          'The transactional outbox pattern stores domain events in the same DB transaction as the state change. A relay later publishes events to the broker, avoiding dual-write loss.',
          'Consumers still need dedupe or deterministic upserts. If CandidateWorker sees the same event twice, the suggestions store should not double-count mutual friends.',
        ],
        scenario:
          'POST /connections/requests writes a request row with unique requester/candidate, writes an outbox ConnectionRequested event, and returns the existing row on retry.',
        architecture: [
          'Connection API validates and starts a DB transaction.',
          'Connection table uses unique constraints for pair/state.',
          'Outbox table stores event_id, aggregate_id, version, payload.',
          'Relay publishes events and marks outbox rows sent.',
        ],
        flow: [
          'Client sends idempotency key.',
          'Service checks or inserts mutation record.',
          'Service commits state and outbox event together.',
          'Relay publishes; consumers dedupe by event_id.',
        ],
        tradeoffs: [
          'Outbox adds relay complexity but avoids unsafe dual writes.',
          'Idempotency storage consumes space but prevents duplicate user-visible actions.',
          'Strict transactions are simpler inside one DB but harder across services.',
        ],
        failureModes: [
          'Timeout causes client retry and duplicate connection request.',
          'DB commit succeeds but event publish fails, leaving derived stores stale.',
          'Consumer retry double-applies score increments.',
        ],
        prompt: 'Design POST /connections/requests so it is safe under retries and event publishing failures.',
        tasks: [
          'Define idempotency key and unique constraints.',
          'Show transaction boundaries.',
          'Add outbox relay behavior.',
          'Add consumer dedupe behavior.',
        ],
        expected: [
          'State and outbox are committed atomically.',
          'Retries return the same logical result.',
          'Events include IDs and versions.',
          'Consumers are safe under duplicate delivery.',
        ],
      }),
      sub({
        id: 'cdc-event-sourcing',
        title: 'Change data capture and event logs',
        summary: 'Use event streams to build derived models, replay history, and decouple services.',
        priority: 'P1',
        duration: '40m',
        tags: ['cdc', 'events', 'replay'],
        fastTrack: [
          'CDC streams committed database changes; event sourcing stores events as the primary state.',
          'Replayability is powerful for rebuilds, audits, and new consumers.',
          'Schema evolution and ordering must be designed, not hoped for.',
        ],
        theory: [
          'Change data capture reads committed changes from a source database log and publishes them downstream. It is useful when services need reliable updates without modifying every write path.',
          'Event sourcing makes the event log the source of truth and materializes current state by folding events. It is powerful but changes how you query, debug, and evolve state.',
          'For most interview feature designs, an outbox or CDC stream feeding read models is enough. Full event sourcing should be justified by audit, replay, temporal queries, or collaboration semantics.',
          'Events need versioning, compatibility rules, ordering keys, retention, replay controls, and poison-message handling.',
        ],
        scenario:
          'Profile changes are captured from Profile DB and replayed into People Search index and Suggestions profile snippets.',
        architecture: [
          'Source DB transaction log or outbox produces events.',
          'Broker stores ordered partitions by aggregate ID.',
          'Index builders consume events to update read models.',
          'Backfill jobs can replay from snapshots plus logs.',
        ],
        flow: [
          'A profile row changes.',
          'CDC emits ProfileUpdated with version.',
          'Consumers update search and denormalized snippets.',
          'Replay can rebuild a corrupted index.',
        ],
        tradeoffs: [
          'CDC avoids app-level publish code but exposes database-level changes.',
          'Event sourcing gives full history but complicates querying and migrations.',
          'Long retention helps replay but costs storage.',
        ],
        failureModes: [
          'Breaking event schema change crashes consumers.',
          'Out-of-order events overwrite newer data.',
          'Replay without idempotency corrupts derived state.',
        ],
        prompt: 'Design how profile updates reach search and suggestions read models.',
        tasks: [
          'Choose outbox or CDC and justify.',
          'Define event schema and version.',
          'Define replay/backfill path.',
          'Define ordering and idempotency behavior.',
        ],
        expected: [
          'The source of truth remains clear.',
          'Derived stores can be rebuilt.',
          'Schema versioning is mentioned.',
          'Consumers are idempotent and order-aware.',
        ],
      }),
      sub({
        id: 'consistency-models',
        title: 'Consistency models and conflict handling',
        summary: 'Decide which operations need strong consistency, read-your-writes, or eventual consistency.',
        priority: 'P0',
        duration: '45m',
        tags: ['consistency', 'conflicts', 'cap'],
        fastTrack: [
          'Use strong consistency for invariants; eventual consistency for derived experience data.',
          'Read-your-writes matters after user actions, even if global freshness is eventual.',
          'Name conflict resolution: reject, merge, last-write-wins, version check, or manual review.',
        ],
        theory: [
          'Consistency is not binary. Different operations in one feature can require different guarantees. Blocks and connection edges need stronger guarantees than suggestion ranking freshness.',
          'Read-your-writes is often the product requirement people forget. After dismissing a suggestion, the user should not immediately see it again, even if the global suggestions pipeline is eventual.',
          'Conflict handling needs a rule. Two users can send requests at the same time, a block can race with a suggestion impression, and profile updates can race with index updates.',
          'CAP/PACELC is useful when discussing distributed replicas: under partition, choose availability or consistency; else decide latency vs consistency cost.',
        ],
        scenario:
          'Dismissing a suggestion writes a viewer-candidate tombstone synchronously so the item disappears immediately, while full suggestion recomputation remains async.',
        architecture: [
          'Connection/block state uses transactional writes and unique constraints.',
          'Dismissal tombstones are checked on the serving path.',
          'Suggestion ranking read model is eventually consistent.',
          'Version checks prevent stale derived updates from overwriting newer state.',
        ],
        flow: [
          'User dismisses a candidate.',
          'API writes tombstone by viewer_id/candidate_id.',
          'Serving path excludes tombstoned candidates immediately.',
          'Async worker later removes or downranks the candidate in read model.',
        ],
        tradeoffs: [
          'Serving-path tombstones add a lookup but preserve user trust.',
          'Strong consistency everywhere would raise latency and reduce availability.',
          'Eventual ranking freshness is acceptable if final filters protect correctness.',
        ],
        failureModes: [
          'Dismissed candidates reappear due to stale read model.',
          'A block races with cache serving and leaks a profile.',
          'Last-write-wins overwrites semantically newer state.',
        ],
        prompt: 'Classify consistency requirements for connection suggestions operations.',
        tasks: [
          'Classify connect, block, dismiss, impression, ranking refresh.',
          'Define read-your-writes behavior.',
          'Define conflict rules for racing requests and blocks.',
          'Tie choices to latency and availability.',
        ],
        expected: [
          'Critical invariants are strong or transactionally guarded.',
          'Derived rankings are eventual.',
          'Dismiss/block are checked in the serving path.',
          'Conflicts have explicit resolution rules.',
        ],
      }),
    ],
  },
  {
    id: 'social-graph-recommendations',
    order: 4,
    title: 'Social Graph and Recommendation Systems',
    tagline: 'Design the full friends/connection suggestions case from graph data to ranked serving.',
    outcome: 'You can answer Facebook/LinkedIn style people-suggestion prompts end to end.',
    subsections: [
      sub({
        id: 'social-graph-model',
        title: 'Social graph data model',
        summary: 'Represent users, directed/undirected edges, statuses, blocks, and visibility.',
        priority: 'P0',
        duration: '50m',
        tags: ['graph', 'connections', 'blocks'],
        fastTrack: [
          'Model edge type and direction: friendship is usually undirected; follow is directed.',
          'Keep request state separate from accepted edge state.',
          'Blocks and privacy are first-class graph constraints, not post-processing nice-to-haves.',
        ],
        theory: [
          'A social graph is a set of vertices and edges, but product semantics matter. Facebook friendship is mutual; LinkedIn connection is mutual after accept; following is directed; blocking is a negative directed relationship.',
          'Store edge status carefully: pending, accepted, rejected, blocked, removed. Request workflow and final graph edge may use separate tables to keep invariants simpler.',
          'Adjacency reads dominate many features: friends list, mutual friends, suggestions, feed fan-out, privacy checks. Optimize for "neighbors of user" and "does edge exist".',
          'Privacy constraints shape the model. You may need visibility flags, private profiles, blocked pairs, minors/sensitive account policies, and "do not suggest" tombstones.',
        ],
        scenario:
          'A LinkedIn-like graph has User, Profile, ConnectionRequest, ConnectionEdge, BlockEdge, Dismissal, and Organization/School affiliation signals.',
        architecture: [
          'Connection Service owns requests and accepted edges.',
          'Adjacency store keeps outgoing accepted connections by user_id.',
          'Block store keeps directed blocks and is checked synchronously.',
          'Affiliation and profile stores provide secondary suggestion signals.',
        ],
        flow: [
          'Send request creates pending request with unique pair.',
          'Accept request creates accepted edge for both adjacency directions.',
          'Block creates directed block and removes/hides affected suggestions.',
          'Graph events drive candidate generation updates.',
        ],
        tradeoffs: [
          'Duplicating undirected edges in two adjacency lists speeds reads but doubles writes.',
          'Storing request and accepted edge separately clarifies workflow but adds joins/events.',
          'Strict block enforcement adds serving-path cost but is mandatory for safety.',
        ],
        failureModes: [
          'Pending requests treated as accepted edges.',
          'Blocked users still appear through stale suggestions.',
          'High-degree adjacency lists become hot and expensive to expand.',
        ],
        prompt: 'Design the data model for a LinkedIn-like connection graph.',
        tasks: [
          'Define entities and relationships.',
          'State whether edges are directed or undirected.',
          'Add request, accepted, block, and dismissal states.',
          'Choose access patterns and indexes.',
        ],
        expected: [
          'The model distinguishes workflow state from graph state.',
          'Adjacency and existence queries are supported.',
          'Blocks/privacy are source-of-truth constraints.',
          'The answer handles high-degree users.',
        ],
      }),
      sub({
        id: 'mutual-candidate-generation',
        title: 'Mutual friends candidate generation',
        summary: 'Generate candidates from two-hop graph expansion without blowing up cost.',
        priority: 'P0',
        duration: '60m',
        tags: ['candidate generation', 'mutual friends', 'two-hop'],
        fastTrack: [
          'Candidate generation finds possible answers; ranking orders them.',
          'Two-hop expansion is: friends of my friends minus existing edges/blocks/self.',
          'Cap, sample, batch, and precompute; do not do full graph expansion on every read.',
        ],
        theory: [
          'Mutual-friend suggestions are usually generated by two-hop expansion. For viewer U, read neighbors N(U), then for each neighbor V read N(V), count candidates C that are not U, not already connected, not blocked, not dismissed, and allowed by privacy.',
          'This can explode. If U has 5,000 connections and each has 5,000 connections, naive expansion touches 25M edges. Real systems cap degree, sample high-degree nodes, precompute offline, and update incrementally from graph changes.',
          'Candidate generation should be separated from ranking. Generation optimizes recall under cost constraints; ranking optimizes precision and business goals.',
          'Store reason features such as mutual_count and top mutual names carefully. Explanations should not reveal hidden/private relationships.',
          'Freshness can be eventual. A new connection does not need to update every possible suggestion synchronously, but blocks and accepted connections must be removed quickly.',
        ],
        scenario:
          'After user A connects with B, workers update candidates for A, B, and affected neighbors. For viewer A, candidate C may get mutual_count +1 if B connects both A and C.',
        architecture: [
          'Graph event stream publishes ConnectionAccepted and ConnectionRemoved.',
          'Candidate workers read bounded adjacency lists and update candidate counters.',
          'Candidate store is keyed by viewer_id and candidate_id with reason features.',
          'Filter service removes self, existing connections, blocks, private users, and dismissals.',
        ],
        flow: [
          'ConnectionAccepted(A,B) enters stream.',
          'Worker reads neighbors of A and B with degree caps.',
          'For each neighbor C, increment mutual-count candidates for opposite user.',
          'Ranker later scores candidates and writes top N per viewer.',
        ],
        tradeoffs: [
          'Incremental updates are fresher but complex under removals and duplicate paths.',
          'Batch recomputation is simpler and correct but less fresh and compute-heavy.',
          'Sampling high-degree nodes lowers cost but may miss good candidates.',
        ],
        failureModes: [
          'Naive online two-hop traversal causes timeouts.',
          'Counter drift after connection removal or duplicate event.',
          'Explanations reveal private mutual connections.',
        ],
        prompt: 'Design candidate generation for "People You May Know" based on mutual friends.',
        tasks: [
          'Write the two-hop generation algorithm.',
          'Add filters for self, existing edge, blocks, privacy, and dismissals.',
          'Choose online, batch, or incremental update strategy.',
          'Handle high-degree users and removals.',
        ],
        expected: [
          'The algorithm is correct and bounded.',
          'Generation is separated from ranking.',
          'High-degree nodes are capped/sampled.',
          'Privacy filters are applied before serving and explanation.',
        ],
      }),
      sub({
        id: 'ranking-feature-store',
        title: 'Ranking signals and feature store',
        summary: 'Score candidates with graph, profile, behavior, and safety features.',
        priority: 'P0',
        duration: '55m',
        tags: ['ranking', 'features', 'ml'],
        fastTrack: [
          'Ranking combines multiple signals; mutual count alone is a baseline.',
          'Feature freshness and online/offline skew are common ranking problems.',
          'Never rank before applying hard safety/privacy filters.',
        ],
        theory: [
          'Candidate generation creates a recall set; ranking orders it. Baseline ranking can use weighted signals: mutual_count, shared employer/school, location, common groups, profile completeness, recent activity, and negative feedback.',
          'A feature store can provide consistent offline training and online serving features. In interviews, you do not need to design a full ML platform, but you should mention feature freshness, model versioning, and explainability.',
          'Ranking systems need feedback loops. Impressions, clicks, dismissals, connection requests, accepts, reports, and blocks train or tune the model.',
          'Hard filters come before ranking: existing connection, pending request, block, privacy, policy restrictions. Ranking should not "score around" safety rules.',
        ],
        scenario:
          'Rank candidates with mutual_count, shared_company, shared_school, profile_similarity, candidate_activity, prior_dismissal_penalty, and model_version.',
        architecture: [
          'Feature builders compute graph and profile features from streams and snapshots.',
          'Feature Store serves online features by viewer-candidate pair.',
          'Ranking Service scores candidates and writes ordered lists.',
          'Experimentation service assigns model/ranking variant.',
        ],
        flow: [
          'Candidate set is fetched for a viewer.',
          'Features are joined from candidate store and feature store.',
          'Hard filters remove unsafe candidates.',
          'Model scores and top N are persisted with version and reason codes.',
        ],
        tradeoffs: [
          'Complex ML ranking improves quality but adds training, monitoring, and debugging cost.',
          'Precomputing scores speeds serving but reduces realtime personalization.',
          'Online scoring is fresher but increases request latency and dependency risk.',
        ],
        failureModes: [
          'Training-serving skew makes online ranking worse than offline evaluation.',
          'Feedback loops over-amplify popular or spam accounts.',
          'No model versioning makes rollback difficult.',
        ],
        prompt: 'Design a ranking layer for connection suggestions after candidates are generated.',
        tasks: [
          'List baseline ranking features.',
          'Define hard filters vs soft scoring signals.',
          'Define model version and experiment handling.',
          'Define feedback metrics and online monitoring.',
        ],
        expected: [
          'Ranking is separate from generation.',
          'Hard filters always win.',
          'Features have freshness/versioning strategy.',
          'Metrics include accept rate, hide rate, report/block rate, and latency.',
        ],
      }),
      sub({
        id: 'serving-suggestions',
        title: 'Suggestion serving path',
        summary: 'Serve ranked lists quickly while preserving freshness, privacy, and explainability.',
        priority: 'P0',
        duration: '50m',
        tags: ['serving', 'read model', 'pagination'],
        fastTrack: [
          'Serving should read precomputed ranked results, not recompute the graph.',
          'Apply final filters at serving time because derived stores can be stale.',
          'Return cursor, reason codes, and stable IDs for feedback events.',
        ],
        theory: [
          'The serving path turns ranked candidates into a product response. It reads a viewer-keyed read model, filters invalid candidates, hydrates profile snippets, records impressions, and returns paginated results.',
          'Final filters are mandatory. Even if candidate generation and ranking applied filters, state can change between generation and serving: blocks, deleted accounts, new connections, pending requests, dismissals.',
          'Pagination should be stable. Cursor can encode rank window, generated_at, model version, and last candidate ID. Avoid offset pagination when ranking refreshes.',
          'Explanations must be safe. "12 mutual connections" is usually safer than naming private mutual users. If names are shown, verify visibility for each mutual.',
        ],
        scenario:
          'GET /suggestions reads top candidates from store, removes stale/unsafe candidates, hydrates profile cards, and returns reason text like "12 mutual connections".',
        architecture: [
          'Suggestions Store contains ranked candidate IDs and reason metadata.',
          'Serving API checks blocks, existing edges, pending requests, dismissals.',
          'Profile hydration is batched and cached by profile version.',
          'Impression events are emitted asynchronously.',
        ],
        flow: [
          'Fetch candidate page by viewer_id and cursor.',
          'Run final negative filters.',
          'Hydrate visible profile snippets and safe reason text.',
          'Emit impression events and return cursor.',
        ],
        tradeoffs: [
          'Final filtering adds latency but prevents unsafe stale results.',
          'Returning more candidates per internal page reduces empty pages after filtering but costs more reads.',
          'Denormalized profile snippets improve latency but may be stale.',
        ],
        failureModes: [
          'Filtered page returns too few items due to stale candidates.',
          'Reason text leaks hidden mutual connections.',
          'Cursor breaks when model version changes mid-session.',
        ],
        prompt: 'Design GET /suggestions for a mobile app.',
        tasks: [
          'Define read model fields and cursor.',
          'Add final filters and hydration.',
          'Add impression logging.',
          'Handle stale/empty pages gracefully.',
        ],
        expected: [
          'No expensive graph traversal happens on read.',
          'Serving path revalidates safety-sensitive state.',
          'Pagination is cursor-based and stable enough.',
          'The response supports explainability and feedback.',
        ],
      }),
      sub({
        id: 'privacy-safety-filters',
        title: 'Privacy, blocks, and safety filters',
        summary: 'Prevent harmful or policy-violating recommendations before they reach ranking or UI.',
        priority: 'P0',
        duration: '45m',
        tags: ['privacy', 'safety', 'policy'],
        fastTrack: [
          'Treat blocks, privacy, minors, deactivated users, and reports as hard filters.',
          'Apply filters during generation and again during serving.',
          'Log enough decisions to audit unsafe suggestions without storing unnecessary PII.',
        ],
        theory: [
          'Recommendation systems can harm users if they ignore negative relationships or sensitive contexts. Privacy and safety are design requirements, not compliance footnotes.',
          'Hard filters include self, existing connections, pending requests, blocks in either direction, deactivated/deleted accounts, private profiles, previously dismissed candidates, abuse risk, legal/geographic restrictions, and sensitive account policies.',
          'Filters should run at multiple points. Generation filters reduce wasted work; serving filters protect against stale derived data; post-ranking filters protect against model mistakes.',
          'Auditability matters. Keep reason codes and policy decision logs with privacy-safe identifiers so incidents can be investigated.',
        ],
        scenario:
          'A user blocks another user. The block event invalidates suggestion cache, updates candidate stores, and serving immediately checks the block store before returning any cached list.',
        architecture: [
          'Policy/Privacy Service evaluates viewer-candidate visibility.',
          'Block store is low-latency and strongly updated.',
          'Candidate pipeline consumes block/privacy events for cleanup.',
          'Serving API performs final policy checks and emits decision logs.',
        ],
        flow: [
          'Block event is written transactionally.',
          'Cache/read models are invalidated or marked stale.',
          'Workers remove invalid candidates from derived stores.',
          'Serving rejects blocked pairs even if stale data remains.',
        ],
        tradeoffs: [
          'Central policy checks add latency but reduce duplicated unsafe logic.',
          'Pre-filtering saves ranking cost but may miss policy changes after generation.',
          'Detailed audit logs help incidents but must minimize sensitive data retention.',
        ],
        failureModes: [
          'One-way block semantics are misunderstood.',
          'Policy update does not reach all derived stores.',
          'Cached suggestions ignore recent block events.',
        ],
        prompt: 'Add privacy and safety to a connection suggestions architecture.',
        tasks: [
          'List hard filters.',
          'Place filters in generation, ranking, and serving.',
          'Define cache invalidation for block/privacy changes.',
          'Define audit logging and alerts.',
        ],
        expected: [
          'Hard filters are not ranking features.',
          'Serving has a final source-of-truth check.',
          'Block/privacy changes invalidate or override stale derived state.',
          'The design includes auditability and safety metrics.',
        ],
      }),
      sub({
        id: 'full-case-study',
        title: 'Full case study: connection suggestions',
        summary: 'A complete answer template for Facebook/LinkedIn-style friends suggestions.',
        priority: 'P0',
        duration: '75m',
        tags: ['case study', 'end-to-end', 'recommendations'],
        fastTrack: [
          'Architecture: source graph -> events -> candidate generation -> ranking -> read model -> serving.',
          'Use precompute for latency; use final filters for correctness; use feedback for ranking quality.',
          'Mention high-degree nodes, privacy, stale data, queue lag, model versioning, and metrics.',
        ],
        theory: [
          'A strong answer starts with scope: suggest people a viewer may know based on mutual connections and profile signals; allow dismiss and connect; exclude blocked/existing/private users; p95 read under 200 ms; freshness within minutes.',
          'Data model: users/profiles, connection requests, accepted edges, block edges, dismissals, candidate features, ranked suggestions, impressions, feedback events.',
          'Write path: connection/block/dismiss mutations update source truth and emit events through outbox. Async consumers update graph adjacency, candidate counters, rankings, caches, metrics, and search snippets.',
          'Read path: Suggestions API reads viewer-keyed ranked list from cache/store, performs final filters, hydrates profile snippets, returns cursor and safe explanation, and emits impression events.',
          'Scaling: partition graph by user_id, suggestions by viewer_id, cap high-degree expansion, batch updates, monitor queue lag, precompute top candidates, cache hot pages, and use backfill/replay for rebuilds.',
          'Reliability: serve stale-but-safe suggestions during ranking pipeline failure, fall back to popular same-company/same-school candidates, protect block/privacy correctness, and alert on freshness/model errors.',
        ],
        scenario:
          'Design LinkedIn connection suggestions for 100M MAU. A user should see people they may know, usually explained by mutual connections, shared company/school, or profile similarity.',
        architecture: [
          'Connection Service owns requests, accepted edges, blocks, and dismissals.',
          'Graph Store keeps adjacency lists plus canonical edge uniqueness.',
          'Event Stream carries graph/profile/feedback mutations to candidate and ranking workers.',
          'Candidate Store and Feature Store feed Ranking Service; Suggestions Store serves top N per viewer.',
          'Suggestions API reads cache/store, revalidates privacy, hydrates profiles, returns cursor, emits impressions.',
        ],
        flow: [
          'User accepts connection; service commits edge and outbox event.',
          'Candidate workers update two-hop mutual candidates for affected viewers with caps and dedupe.',
          'Ranker joins features, applies hard filters, scores candidates, writes versioned top N.',
          'Client reads suggestions; API re-filters and returns profile cards with safe reason codes.',
          'Dismiss/connect/impression events feed ranking and remove invalid candidates.',
        ],
        tradeoffs: [
          'Precomputation improves p95 latency but gives eventual freshness.',
          'Incremental graph updates are fresher but harder to keep correct than batch recomputation.',
          'More ranking features improve quality but increase feature freshness and explainability complexity.',
          'Final serving filters cost latency but are required for privacy correctness.',
        ],
        failureModes: [
          'Queue lag causes stale or low-quality suggestions.',
          'High-degree users create expansion blowups and hot partitions.',
          'Block/privacy changes are missed by cache or derived stores.',
          'Ranking model overfits engagement and increases spam/report rates.',
        ],
        prompt: 'Give a full 30-minute system design answer for connection suggestions.',
        tasks: [
          'Spend five minutes on requirements and estimates.',
          'Draw source truth, event pipeline, candidate/ranking pipeline, and serving path.',
          'Deep dive into mutual-friend generation and privacy filtering.',
          'End with metrics, failure modes, and trade-offs.',
        ],
        expected: [
          'The answer is end-to-end, not only an ML/ranking answer.',
          'The read path is fast and precomputed.',
          'The write path is reliable and event-driven.',
          'The design explicitly handles privacy, high-degree nodes, stale data, and observability.',
        ],
      }),
    ],
  },
  {
    id: 'product-feature-patterns',
    order: 5,
    title: 'Designing Product Features',
    tagline: 'Common interview feature prompts and the reusable architecture patterns behind them.',
    outcome: 'You can adapt the same primitives to notifications, chat, feed, search, rate limiting, and media.',
    subsections: [
      sub({
        id: 'notification-system',
        title: 'Notification system',
        summary: 'Design fan-out, preference checks, provider delivery, retries, and dedupe.',
        priority: 'P0',
        duration: '45m',
        tags: ['notifications', 'fan-out', 'delivery'],
        fastTrack: [
          'Notification systems are event-driven: event -> preference/filter -> template -> delivery.',
          'Separate in-app notification storage from push/email/SMS provider delivery.',
          'Use dedupe, rate limits, quiet hours, retries, and provider fallback.',
        ],
        theory: [
          'Notifications start from domain events: connection request, accepted request, mention, message, security alert. A notification service should not poll every source service.',
          'The pipeline must evaluate user preferences, quiet hours, channels, language, device tokens, templates, dedupe keys, and rate limits before delivery.',
          'In-app notifications are stored as product state; push/email/SMS are external delivery attempts with provider-specific retries and receipts.',
          'Reliability means at-least-once event handling with dedupe. For most notifications, duplicate suppression matters more than exactly-once delivery.',
        ],
        scenario:
          'When a user receives a connection request, the system creates an in-app notification and optionally sends mobile push if preferences allow it.',
        architecture: [
          'Domain events enter Notification Stream.',
          'Notification Service evaluates preferences and templates.',
          'In-app Notification Store keeps inbox state.',
          'Delivery workers send push/email and record attempts.',
        ],
        flow: [
          'ConnectionRequested event is consumed.',
          'Preferences and rate limits are checked.',
          'In-app row is inserted with dedupe key.',
          'Push job is sent to provider with retry and receipt tracking.',
        ],
        tradeoffs: [
          'Fan-out on write gives fast inbox reads but higher write amplification.',
          'Fan-out on read is simpler for low volume but expensive for large inboxes.',
          'Aggressive push improves engagement but increases opt-outs and abuse risk.',
        ],
        failureModes: [
          'Provider timeout creates duplicate push without dedupe.',
          'Preference changes are not applied to queued jobs.',
          'Notification storm after a batch event.',
        ],
        prompt: 'Design notifications for connection requests and acceptances.',
        tasks: reqTasks,
        expected: [
          'Events drive notification creation.',
          'Preferences and rate limits are checked.',
          'In-app state is separated from provider attempts.',
          'Retries and dedupe are explicit.',
        ],
      }),
      sub({
        id: 'chat-messaging',
        title: 'Chat and messaging',
        summary: 'Design conversations, message ordering, delivery state, realtime fan-out, and offline sync.',
        priority: 'P1',
        duration: '55m',
        tags: ['chat', 'websocket', 'ordering'],
        fastTrack: [
          'Message send must be idempotent and ordered per conversation.',
          'Realtime delivery uses WebSocket/SSE, but durable storage is the source of truth.',
          'Offline clients sync with cursor or sequence number.',
        ],
        theory: [
          'Messaging systems combine durable writes with realtime delivery. The durable message store is source of truth; WebSocket delivery is an optimization for low-latency updates.',
          'Ordering is usually per conversation, not global. Use conversation-scoped sequence numbers or timestamp plus tie-breaker, assigned by the server.',
          'Delivery state is separate from message state: sent, delivered, read receipts, edited, deleted. Receipts can be eventually consistent.',
          'Clients need offline sync: fetch messages after last sequence, reconcile optimistic sends, and handle duplicates by client_message_id.',
        ],
        scenario:
          'A two-user chat supports send, receive realtime, read receipts, and offline mobile sync.',
        architecture: [
          'Chat API writes messages with conversation-scoped sequence numbers.',
          'Message Store is partitioned by conversation_id.',
          'Realtime Gateway maintains WebSocket connections by user_id.',
          'Delivery workers fan out message events to online devices and push notifications.',
        ],
        flow: [
          'Client sends message with client_message_id.',
          'Server writes durable message and assigns sequence.',
          'Event is published to realtime gateway.',
          'Offline clients later sync from last_seen_sequence.',
        ],
        tradeoffs: [
          'Strict per-conversation ordering may reduce throughput for hot rooms.',
          'WebSocket gives low latency but needs connection state and reconnect handling.',
          'Read receipts improve UX but add write volume.',
        ],
        failureModes: [
          'Duplicate messages after retry without client_message_id.',
          'Out-of-order delivery due to multiple gateway nodes.',
          'Lost messages if realtime delivery is treated as durable.',
        ],
        prompt: 'Design one-to-one chat for a social app.',
        tasks: reqTasks,
        expected: [
          'Durable storage is source of truth.',
          'Ordering scope is clear.',
          'Realtime and offline sync are both handled.',
          'Idempotent sends and duplicate handling are included.',
        ],
      }),
      sub({
        id: 'news-feed',
        title: 'News feed and activity feed',
        summary: 'Design fan-out-on-write/read, ranking, pagination, and freshness for a social feed.',
        priority: 'P1',
        duration: '55m',
        tags: ['feed', 'fan-out', 'ranking'],
        fastTrack: [
          'Feeds choose between fan-out-on-write, fan-out-on-read, or hybrid.',
          'Celebrity/high-fanout producers often need special handling.',
          'Ranking and pagination require stable cursors and freshness trade-offs.',
        ],
        theory: [
          'A feed system serves a personalized ordered stream of activities. The source events are posts, likes, connections, follows, and recommendations; the served feed is a derived ranked read model.',
          'Fan-out-on-write precomputes each follower timeline when content is created. It makes reads fast but writes expensive. Fan-out-on-read computes from followed producers at request time. Hybrid handles normal users with write fan-out and celebrities on read.',
          'Ranking may combine recency, affinity, content quality, engagement, diversity, and negative feedback. It requires experiments and monitoring for spam or filter bubbles.',
          'Pagination must handle new items and re-ranking. Cursor can encode time/rank position and feed generation version.',
        ],
        scenario:
          'Design LinkedIn home feed mixing posts from connections, company pages, and recommended content.',
        architecture: [
          'Activity Stream receives post and engagement events.',
          'Fan-out workers write per-user feed candidates.',
          'Ranking Service scores candidates and enforces diversity.',
          'Feed API serves cached pages with cursor and impression logging.',
        ],
        flow: [
          'Producer creates content.',
          'Event is published and fan-out workers distribute to followers or candidate pools.',
          'Ranker builds viewer feed windows.',
          'Client reads feed; impressions and feedback feed ranking.',
        ],
        tradeoffs: [
          'Fan-out-on-write lowers read latency but amplifies writes.',
          'Fan-out-on-read handles celebrity producers but increases request-time compute.',
          'Heavy ranking improves relevance but complicates explainability.',
        ],
        failureModes: [
          'Celebrity post overloads fan-out workers.',
          'Duplicate or missing items across pages.',
          'Ranking feedback loop promotes low-quality engagement bait.',
        ],
        prompt: 'Design a home feed for a professional network.',
        tasks: reqTasks,
        expected: [
          'The answer chooses fan-out strategy with rationale.',
          'Hot producers are handled.',
          'Ranking, pagination, and feedback are included.',
          'Failure modes include freshness and duplicate pages.',
        ],
      }),
      sub({
        id: 'search-autocomplete',
        title: 'Search autocomplete',
        summary: 'Design prefix search, ranking, typo tolerance, freshness, and low-latency serving.',
        priority: 'P1',
        duration: '45m',
        tags: ['search', 'autocomplete', 'index'],
        fastTrack: [
          'Autocomplete must be very low latency, often under 50-100 ms.',
          'Use prefix indexes/tries/search engine suggesters plus caching for hot prefixes.',
          'Ranking uses popularity, personalization, freshness, and typo tolerance.',
        ],
        theory: [
          'Autocomplete is a read-heavy, latency-sensitive feature. It returns suggestions after each keystroke, so it needs aggressive caching, compact indexes, and request cancellation on the client.',
          'Data is usually derived from searchable entities: users, companies, posts, products, or queries. Updates flow through CDC/events into a search index.',
          'Ranking combines textual match, popularity, personalization, freshness, and safety filters. Prefix-only match is rarely enough for a production product.',
          'Hot prefixes such as "a" or "an" can be cached or handled with precomputed top results. Deep prefixes can query the index directly.',
        ],
        scenario:
          'People search autocomplete returns profiles and companies as the user types, respecting visibility and blocked users.',
        architecture: [
          'Profile/company events update Search Index.',
          'Autocomplete API queries prefix suggester and hot-prefix cache.',
          'Personalization layer boosts connected/shared-company results.',
          'Policy filters remove blocked/private candidates.',
        ],
        flow: [
          'Client debounces and cancels stale requests.',
          'API checks hot prefix cache.',
          'Search index returns candidates with scores.',
          'API applies personalization and policy filters.',
        ],
        tradeoffs: [
          'Index freshness improves user trust but increases ingestion pressure.',
          'Personalization improves relevance but reduces cache hit rate.',
          'Typo tolerance helps UX but can increase false positives and cost.',
        ],
        failureModes: [
          'Hot prefix overwhelms search cluster.',
          'Private/deleted profile remains in index.',
          'Out-of-order client responses show stale suggestions.',
        ],
        prompt: 'Design people-search autocomplete for a social app.',
        tasks: reqTasks,
        expected: [
          'Search index is derived from source events.',
          'Hot prefix cache and low latency are addressed.',
          'Client cancellation and stale responses are handled.',
          'Visibility filters are applied.',
        ],
      }),
      sub({
        id: 'rate-limiter',
        title: 'Rate limiter',
        summary: 'Design abuse controls with token bucket, sliding window, distributed counters, and fairness.',
        priority: 'P0',
        duration: '45m',
        tags: ['rate limit', 'abuse', 'redis'],
        fastTrack: [
          'Rate limiting is a correctness and abuse-control feature, not only performance protection.',
          'Choose key dimensions: user, IP, device, endpoint, organization, or token.',
          'Token bucket allows bursts; sliding window is stricter but more expensive.',
        ],
        theory: [
          'Rate limiters protect services and users from abuse, accidental loops, credential stuffing, spam requests, and cost spikes. The limit key and algorithm are product decisions.',
          'Token bucket grants a steady refill rate plus burst capacity. Fixed window is simple but has boundary spikes. Sliding window log is accurate but costly; sliding counter approximates it.',
          'Distributed rate limiting often uses Redis or an edge service. You must handle clock, atomic increments, TTL, regional consistency, and fail-open/fail-closed behavior.',
          'Good designs include headers, retry-after, dashboards, per-plan limits, and bypasses for internal trusted traffic.',
        ],
        scenario:
          'Limit connection requests to prevent spam: per-user daily cap, per-target incoming cap, IP burst cap, and stricter limits for new accounts.',
        architecture: [
          'API Gateway enforces coarse IP and token limits.',
          'Abuse Service enforces user/target/product limits.',
          'Redis stores counters or token buckets with TTL.',
          'Risk engine can lower limits for suspicious accounts.',
        ],
        flow: [
          'Request arrives with user, IP, endpoint.',
          'Gateway checks fast counters.',
          'Product service checks semantic limits before write.',
          'Rejected requests return 429 with retry-after or product-specific error.',
        ],
        tradeoffs: [
          'Fail-open preserves availability but weakens abuse defense.',
          'Fail-closed protects systems but can block legitimate traffic during Redis outage.',
          'Global limits are fairer but cost more latency than regional limits.',
        ],
        failureModes: [
          'Single Redis hot key for global endpoint limit.',
          'Boundary burst with fixed windows.',
          'Attackers rotate IPs because user/device dimensions are missing.',
        ],
        prompt: 'Design rate limiting for connection requests.',
        tasks: [
          'Choose limit dimensions and algorithms.',
          'Define storage and atomicity.',
          'Define fail-open/fail-closed behavior.',
          'Add monitoring and abuse metrics.',
        ],
        expected: [
          'Limits include product semantics, not only raw QPS.',
          'Algorithm choice is justified.',
          'Distributed counter failure behavior is explicit.',
          'The design handles bursts and hot keys.',
        ],
      }),
      sub({
        id: 'media-upload',
        title: 'File and media upload',
        summary: 'Design direct upload, virus scanning, processing, CDN delivery, and metadata consistency.',
        priority: 'P2',
        duration: '40m',
        tags: ['media', 'object storage', 'cdn'],
        fastTrack: [
          'Use pre-signed direct upload to object storage for large files.',
          'Process media asynchronously: scan, transcode, thumbnail, metadata extraction.',
          'Serve via CDN with immutable object keys and access control when needed.',
        ],
        theory: [
          'Large uploads should avoid sending bytes through app servers. The app creates a pre-signed upload URL, the client uploads to object storage, and the backend tracks metadata state.',
          'Processing is asynchronous. Workers scan for malware, validate type/size, transcode video, generate thumbnails, and write final metadata.',
          'Use state machines: pending_upload, uploaded, processing, ready, rejected, deleted. The UI can poll or subscribe to processing status.',
          'Security includes content-type validation, virus scanning, access control, signed downloads for private media, and deletion lifecycle.',
        ],
        scenario:
          'A user uploads a profile video intro. The system stores original media, scans it, transcodes adaptive versions, and serves through CDN.',
        architecture: [
          'Upload API creates metadata row and pre-signed URL.',
          'Object storage receives client upload directly.',
          'Object-created event triggers scanning/transcoding workers.',
          'CDN serves ready variants with signed URLs if private.',
        ],
        flow: [
          'Client requests upload session.',
          'Client uploads bytes to storage.',
          'Processing workers validate and transform.',
          'Metadata state becomes ready and UI displays media.',
        ],
        tradeoffs: [
          'Direct upload reduces app load but requires client complexity.',
          'Async processing improves reliability but adds readiness delay.',
          'Private media signed URLs reduce leakage but lower CDN cacheability.',
        ],
        failureModes: [
          'Metadata says ready before processing succeeds.',
          'Unscanned content is served publicly.',
          'Orphaned objects remain after abandoned uploads.',
        ],
        prompt: 'Design a safe media upload pipeline for profile videos.',
        tasks: reqTasks,
        expected: [
          'Bytes go directly to object storage.',
          'Processing is async and stateful.',
          'Security scanning and access control are included.',
          'Deletion/orphan cleanup is handled.',
        ],
      }),
    ],
  },
  {
    id: 'scalability-reliability-ops',
    order: 6,
    title: 'Scalability, Reliability, and Operations',
    tagline: 'Operate the system under load, failures, incidents, and growth.',
    outcome: 'You can discuss SLOs, bottlenecks, graceful degradation, observability, and multi-region design.',
    subsections: [
      sub({
        id: 'slo-latency-budgets',
        title: 'SLOs and latency budgets',
        summary: 'Translate product expectations into measurable service-level objectives.',
        priority: 'P0',
        duration: '40m',
        tags: ['slo', 'latency', 'availability'],
        fastTrack: [
          'Define p95/p99 latency, availability, freshness, error rate, and correctness metrics.',
          'Budget latency per dependency; tail latency dominates user experience.',
          'SLOs should include derived data freshness for async systems.',
        ],
        theory: [
          'An SLO is a measurable promise: GET /suggestions p95 < 200 ms, success rate 99.9%, candidate freshness p95 < 10 minutes, block enforcement 100% on serving path.',
          'Latency budgets force architecture discipline. If the API calls five downstream services serially, p95 can fail even when each dependency looks healthy.',
          'Async systems need freshness SLOs. Queue lag, read-model generated_at, and stale cache rate are just as important as HTTP latency.',
          'Error budgets guide trade-offs. If you are burning budget, you may reduce ranking complexity, serve fallback, or pause risky launches.',
        ],
        scenario:
          'Connection suggestions SLO: API p95 200 ms, p99 500 ms, 99.9% availability, 95% of suggestions generated within 10 minutes, zero known block/privacy violations.',
        architecture: [
          'Gateway, API, cache, DB, and workers emit metrics by route/model version.',
          'Freshness monitors compare generated_at against current time.',
          'SLO dashboards split latency by dependency.',
          'Alerting targets user impact, not only CPU.',
        ],
        flow: [
          'Define user-visible journeys.',
          'Set SLOs and latency budget per journey.',
          'Instrument each hop.',
          'Use budget burn to trigger mitigation.',
        ],
        tradeoffs: [
          'Tighter SLOs increase cost and reduce design flexibility.',
          'p99 optimization often requires removing dependency fan-out.',
          'Serving fallback improves availability but may reduce ranking quality.',
        ],
        failureModes: [
          'Only average latency is monitored.',
          'Queue lag is invisible until product quality drops.',
          'Alerts fire on host metrics without user impact context.',
        ],
        prompt: 'Define SLOs for a connection suggestions feature.',
        tasks: reqTasks,
        expected: [
          'SLOs include latency, availability, freshness, and safety.',
          'Latency budget is broken down by component.',
          'Async freshness is measured.',
          'Alerts map to user impact.',
        ],
      }),
      sub({
        id: 'load-balancing-autoscaling-backpressure',
        title: 'Load balancing, autoscaling, and backpressure',
        summary: 'Keep services stable under spikes, slow dependencies, and uneven traffic.',
        priority: 'P1',
        duration: '45m',
        tags: ['load balancing', 'autoscaling', 'backpressure'],
        fastTrack: [
          'Autoscaling must watch useful signals: QPS, CPU, queue lag, latency, saturation.',
          'Backpressure is better than uncontrolled retries.',
          'Protect dependencies with timeouts, bulkheads, circuit breakers, and bounded queues.',
        ],
        theory: [
          'Load balancing spreads traffic across healthy instances, but it does not fix slow downstream dependencies. A service can be horizontally scaled and still fail because it overwhelms a database or queue.',
          'Autoscaling signals differ by service. APIs scale on request rate/CPU/latency; workers scale on queue lag and processing time; ranking jobs scale on batch deadlines.',
          'Backpressure tells callers to slow down or accept degraded service. Without it, retries can amplify load and create a cascading failure.',
          'Use timeouts, retries with jitter, circuit breakers, bulkheads, and concurrency limits to protect the request path.',
        ],
        scenario:
          'A new product launch doubles suggestions traffic. API scales horizontally, Redis cache absorbs hot reads, and candidate worker autoscaling responds to increased graph event lag.',
        architecture: [
          'Load balancer routes to healthy API instances.',
          'Autoscaler scales API by CPU/QPS and workers by queue lag.',
          'Circuit breaker disables optional profile enrichment during dependency failure.',
          'Rate limiter and load shedding protect the core API.',
        ],
        flow: [
          'Traffic spike increases API QPS.',
          'Cache hit rate and API latency are monitored.',
          'Worker lag triggers scale-out.',
          'If dependencies degrade, API serves simpler fallback suggestions.',
        ],
        tradeoffs: [
          'Aggressive autoscaling improves resilience but can increase cost and thrash.',
          'Load shedding preserves core availability but drops optional quality.',
          'Retries improve transient success but can amplify incidents.',
        ],
        failureModes: [
          'Retry storm after Redis timeout.',
          'Worker autoscaling on CPU misses queue lag.',
          'Unbounded queues exhaust memory.',
        ],
        prompt: 'Add scaling and backpressure to the suggestions architecture.',
        tasks: reqTasks,
        expected: [
          'APIs and workers scale on different signals.',
          'Backpressure and load shedding are explicit.',
          'Dependency protection is included.',
          'The system can degrade gracefully.',
        ],
      }),
      sub({
        id: 'graceful-degradation',
        title: 'Failure modes and graceful degradation',
        summary: 'Keep the core product usable when ranking, cache, queues, or dependencies fail.',
        priority: 'P0',
        duration: '45m',
        tags: ['resilience', 'fallback', 'incident'],
        fastTrack: [
          'List failures by component and decide fail-open, fail-closed, or fallback.',
          'Safety/privacy should fail closed; optional quality can fail open or degrade.',
          'Fallbacks must be tested before incidents.',
        ],
        theory: [
          'Graceful degradation means preserving the most important user value while reducing optional quality. For suggestions, the core is safe candidate serving; advanced ranking and explanations can degrade.',
          'Failure policy depends on risk. If privacy service is unavailable, do not serve risky personalized suggestions. If ranking model is unavailable, serve last known safe ranked list or simple mutual-count ranking.',
          'Design fallbacks intentionally: stale safe cache, batch fallback, empty state, reduced page size, simpler profile hydration, or temporarily disabling a feature.',
          'Practice incident thinking in interviews. Explain what alarms fire, what user impact is, what mitigation is automatic, and what operator action exists.',
        ],
        scenario:
          'Ranking pipeline is down for 30 minutes. Serving API continues using last safe Suggestions Store version, freshness banner remains internal, and alerts fire on generated_at lag.',
        architecture: [
          'Serving path can read last known safe model version.',
          'Fallback ranker can sort by mutual_count and recency.',
          'Privacy checks remain mandatory.',
          'Feature flag can disable suggestions or hide explanations.',
        ],
        flow: [
          'Detect component failure or SLO burn.',
          'Switch to safe fallback automatically.',
          'Preserve safety checks.',
          'Alert and expose dashboards for recovery.',
        ],
        tradeoffs: [
          'Serving stale suggestions preserves availability but hurts relevance.',
          'Failing closed protects privacy but may reduce product surface.',
          'Multiple fallbacks increase test matrix complexity.',
        ],
        failureModes: [
          'Fallback bypasses privacy filters.',
          'Stale cache has no max age.',
          'Operators discover fallback is broken during incident.',
        ],
        prompt: 'Describe degradation behavior for each major suggestions subsystem.',
        tasks: [
          'List failure of cache, DB, ranking, queue, profile service, privacy service.',
          'Classify fail-open/fail-closed/fallback.',
          'Define alerts and user impact.',
          'Define recovery and backfill.',
        ],
        expected: [
          'Safety-critical paths fail closed.',
          'Quality layers degrade safely.',
          'Fallbacks have max age and monitoring.',
          'Recovery includes replay/backfill for missed events.',
        ],
      }),
      sub({
        id: 'observability',
        title: 'Observability and debugging',
        summary: 'Instrument logs, metrics, traces, events, and decision records for production diagnosis.',
        priority: 'P0',
        duration: '45m',
        tags: ['metrics', 'tracing', 'debugging'],
        fastTrack: [
          'Metrics answer "is it broken"; traces answer "where"; logs/decision records answer "why".',
          'Recommendation systems need product quality metrics, not only infra metrics.',
          'Carry request_id, viewer_id hash, model_version, generated_at, and reason codes through the path.',
        ],
        theory: [
          'Observability should be part of the design diagram. A feature with multiple derived stores and async workers is impossible to operate without request tracing, queue metrics, model version metrics, and decision logs.',
          'For suggestions, track API latency/error/cache hit, queue lag, candidate generation throughput, ranking job duration, read model freshness, empty result rate, filter rejection counts, accept/dismiss/report rates.',
          'Decision records help debug "why was user X shown candidate Y?" Store privacy-safe reason codes, feature snapshots, model version, and filter outcomes with retention limits.',
          'Traces should include downstream calls and correlation IDs. Async traces can carry event_id from source mutation through workers to read model writes.',
        ],
        scenario:
          'A user reports seeing a blocked person. Debugging uses request_id, model_version, cache key, filter logs, block event ID, and read model generated_at.',
        architecture: [
          'Structured logs with request_id and event_id.',
          'Metrics dashboards for API, cache, queues, workers, ranking, freshness.',
          'Distributed traces across API and downstream services.',
          'Decision logs for candidate filter/ranking outcomes.',
        ],
        flow: [
          'Request enters with request_id.',
          'Each component emits metrics and structured logs.',
          'Async events carry event_id and causation_id.',
          'Incident debugging correlates source event to served response.',
        ],
        tradeoffs: [
          'Detailed logs improve debugging but must avoid PII and control cost.',
          'High-cardinality metrics are useful but can overload monitoring systems.',
          'Sampling traces reduces cost but may miss rare incidents.',
        ],
        failureModes: [
          'No correlation between source event and derived result.',
          'PII leaks into logs.',
          'Only infra metrics exist, hiding product quality regressions.',
        ],
        prompt: 'Design observability for connection suggestions.',
        tasks: reqTasks,
        expected: [
          'Metrics cover latency, errors, cache, lag, freshness, and quality.',
          'Logs/traces carry correlation IDs.',
          'Decision logs are privacy-safe.',
          'Alerts map to user impact and SLOs.',
        ],
      }),
      sub({
        id: 'multi-region-dr',
        title: 'Multi-region and disaster recovery',
        summary: 'Discuss active-active/active-passive, data replication, failover, and regional consistency.',
        priority: 'P2',
        duration: '45m',
        tags: ['multi-region', 'disaster recovery'],
        fastTrack: [
          'Multi-region is driven by latency, availability, data residency, and disaster recovery.',
          'Active-active improves latency/availability but creates conflict and consistency complexity.',
          'Define RPO/RTO before drawing replication.',
        ],
        theory: [
          'Multi-region design is expensive. In interviews, introduce it when requirements demand global low latency, disaster recovery, or data residency.',
          'Active-passive is simpler: one write region, replicated standby, failover on disaster. Active-active serves local writes in multiple regions but needs conflict resolution and global uniqueness.',
          'RPO is acceptable data loss; RTO is acceptable recovery time. These targets drive replication mode, backup frequency, and failover automation.',
          'For suggestions, derived read models can be regionally rebuilt. Source graph, blocks, and account state need stronger replication and recovery guarantees.',
        ],
        scenario:
          'A global professional network runs regional read serving for suggestions, but source connection writes are routed to a home region per user with replicated read models.',
        architecture: [
          'Home-region routing for source graph writes.',
          'Cross-region event replication for derived suggestions.',
          'Regional caches/read models for low-latency reads.',
          'Backups and replayable logs for disaster recovery.',
        ],
        flow: [
          'Write goes to user home region.',
          'Events replicate to other regions.',
          'Regional rankers/read models update local serving stores.',
          'Failover promotes standby or reroutes traffic based on RPO/RTO.',
        ],
        tradeoffs: [
          'Single write region simplifies consistency but increases latency for distant users.',
          'Active-active lowers latency but introduces conflicts.',
          'Replicating derived stores improves reads but increases lag and cost.',
        ],
        failureModes: [
          'Split-brain writes create conflicting graph edges.',
          'Region failover loses unreplicated events beyond RPO.',
          'Data residency rules are violated by global replication.',
        ],
        prompt: 'Add global availability to the suggestions architecture.',
        tasks: [
          'Define latency, residency, RPO, and RTO requirements.',
          'Choose active-passive or active-active.',
          'Define source and derived data replication.',
          'Define failover and conflict behavior.',
        ],
        expected: [
          'The design does not add multi-region without a reason.',
          'Source truth and derived stores have different replication needs.',
          'RPO/RTO are explicit.',
          'Conflicts and failover are addressed.',
        ],
      }),
    ],
  },
  {
    id: 'security-privacy-abuse',
    order: 7,
    title: 'Security, Privacy, and Abuse',
    tagline: 'Protect accounts, data, APIs, and users while preserving product utility.',
    outcome: 'You can add security and privacy depth to any feature design answer.',
    subsections: [
      sub({
        id: 'auth-sessions',
        title: 'Authentication, sessions, and tokens',
        summary: 'Secure user identity, session lifecycle, token validation, and device state.',
        priority: 'P1',
        duration: '35m',
        tags: ['auth', 'sessions', 'tokens'],
        fastTrack: [
          'Auth answers who the caller is; authorization answers what they can access.',
          'Tokens need expiration, rotation, revocation, audience, issuer, and device binding where needed.',
          'Sensitive mutations should consider step-up auth and anomaly detection.',
        ],
        theory: [
          'Authentication establishes caller identity. In most product designs, the API gateway validates session cookies or bearer tokens and passes trusted identity claims to services.',
          'Token design must cover expiration, refresh, revocation, signing keys, audience, issuer, and replay risk. Long-lived tokens improve UX but raise compromise risk.',
          'Device sessions matter for mobile/social products: push tokens, suspicious login detection, logout-all-devices, and session revocation after password change.',
          'High-risk actions such as changing email, exporting data, or mass connection requests may need step-up authentication.',
        ],
        scenario:
          'Suggestions API requires a valid user session; connection request mutation additionally checks account state and risk score.',
        architecture: [
          'Identity service issues sessions/tokens.',
          'API Gateway validates token and injects user claims.',
          'Risk service evaluates suspicious mutations.',
          'Audit logs record sensitive account actions.',
        ],
        flow: [
          'Client sends session token.',
          'Gateway validates signature, expiry, issuer, audience.',
          'Service performs authorization and risk checks.',
          'Sensitive failures are logged and rate limited.',
        ],
        tradeoffs: [
          'Short token TTL improves security but increases refresh traffic.',
          'Gateway validation centralizes auth but services still need authorization.',
          'Step-up auth improves safety but adds friction.',
        ],
        failureModes: [
          'Service trusts user_id from client payload.',
          'Revoked sessions remain usable due to cache.',
          'Auth is confused with authorization.',
        ],
        prompt: 'Add authentication/session handling to a suggestions API.',
        tasks: reqTasks,
        expected: [
          'Identity is validated before service logic.',
          'Authorization remains in product services.',
          'Token lifecycle and revocation are considered.',
          'Sensitive mutations can use risk/step-up checks.',
        ],
      }),
      sub({
        id: 'authorization-acl',
        title: 'Authorization and ACLs',
        summary: 'Enforce viewer-candidate permissions, roles, ownership, and policy decisions.',
        priority: 'P0',
        duration: '40m',
        tags: ['authorization', 'acl', 'policy'],
        fastTrack: [
          'Authorization is checked on every read and write path, including cached/derived data.',
          'Central policy services help consistency, but services own domain-specific checks.',
          'Do not trust derived indexes to enforce access alone.',
        ],
        theory: [
          'Authorization decides whether an authenticated caller can perform an action or view data. In system design, mention it at API, service, cache, and derived store boundaries.',
          'ACLs can be role-based, relationship-based, attribute-based, or policy-engine based. Social products often use relationship and privacy attributes: connection degree, block state, profile visibility.',
          'Derived stores can lag behind policy changes. Serving APIs should perform final authorization for sensitive data rather than trusting old indexes.',
          'Authorization decisions should be observable. Policy denial counts and audit logs help detect bugs and abuse attempts.',
        ],
        scenario:
          'A viewer can only see a candidate suggestion if the candidate profile is visible to them and neither side has blocked the other.',
        architecture: [
          'Policy Service evaluates viewer-candidate relationship and attributes.',
          'Block/Privacy stores are low-latency dependencies.',
          'Serving API performs final policy check after reading suggestions.',
          'Decision logs store policy result and reason code.',
        ],
        flow: [
          'Request identity is authenticated.',
          'API fetches candidate IDs.',
          'Policy check runs for each candidate or batch.',
          'Denied candidates are dropped before hydration/response.',
        ],
        tradeoffs: [
          'Central policy improves consistency but adds a dependency.',
          'Batch policy checks reduce latency but complicate partial failures.',
          'Caching policy decisions improves speed but needs careful invalidation.',
        ],
        failureModes: [
          'Policy check is skipped on cache hit.',
          'Derived suggestions include private candidates.',
          'Batch policy failure returns unsafe default allow.',
        ],
        prompt: 'Design authorization for viewing connection suggestions.',
        tasks: reqTasks,
        expected: [
          'The answer distinguishes authn from authz.',
          'Viewer-candidate policy is checked in serving path.',
          'Caches/indexes do not bypass policy.',
          'Denied decisions are observable.',
        ],
      }),
      sub({
        id: 'pii-data-handling',
        title: 'PII data handling and retention',
        summary: 'Minimize sensitive data, control retention, support deletion, and avoid log leaks.',
        priority: 'P1',
        duration: '35m',
        tags: ['pii', 'retention', 'deletion'],
        fastTrack: [
          'Collect and store the minimum PII needed for the feature.',
          'Derived stores and logs must respect deletion and retention.',
          'Avoid storing raw PII in metrics, traces, and debug logs.',
        ],
        theory: [
          'Personally identifiable information includes names, emails, phone numbers, locations, photos, employer, school, and relationship data. A suggestions system can reveal sensitive graph relationships if mishandled.',
          'Data minimization means storing IDs and reason codes where possible instead of raw profile details in every derived store.',
          'Deletion and retention must propagate to caches, search indexes, suggestions stores, logs, analytics, backups, and ML features. Derived stores need deletion events and compaction policies.',
          'Access to PII should be audited and permissioned. Debug tooling should use redaction and short retention.',
        ],
        scenario:
          'A user deletes their account. Source stores mark deletion, derived suggestions remove the user, profile snippets are invalidated, and search index deletes the document.',
        architecture: [
          'User/Profile source stores own PII.',
          'Derived stores keep IDs, versioned snippets, and reason codes.',
          'Deletion events fan out to indexes, caches, and analytics retention pipelines.',
          'Logs redact names/emails and use hashed identifiers.',
        ],
        flow: [
          'Deletion request is authorized and recorded.',
          'Source user/profile is deleted or tombstoned.',
          'Deletion event propagates to derived stores.',
          'Audits verify removal from search/cache/suggestions.',
        ],
        tradeoffs: [
          'Hard delete improves privacy but can complicate recovery/audit.',
          'Tombstones preserve integrity but retain some data.',
          'Denormalized snippets improve latency but increase deletion surface.',
        ],
        failureModes: [
          'Deleted user remains in search or suggestions.',
          'PII appears in high-cardinality metrics or logs.',
          'Backups/restores resurrect deleted data without replaying deletion events.',
        ],
        prompt: 'Add PII deletion and retention handling to a social suggestions system.',
        tasks: reqTasks,
        expected: [
          'PII source ownership is clear.',
          'Derived stores receive deletion events.',
          'Logs and metrics are redacted.',
          'Retention and backup behavior are addressed.',
        ],
      }),
      sub({
        id: 'abuse-spam-controls',
        title: 'Abuse, spam, and fraud controls',
        summary: 'Protect users from spammy requests, fake accounts, scraping, and manipulation.',
        priority: 'P0',
        duration: '45m',
        tags: ['abuse', 'spam', 'risk'],
        fastTrack: [
          'Abuse controls combine rate limits, reputation, risk scoring, friction, and monitoring.',
          'Recommendation systems can amplify bad actors; ranking must include safety signals.',
          'Track negative feedback: hides, reports, blocks, spam flags, low accept rate.',
        ],
        theory: [
          'Social features are abuse magnets. Attackers may send mass connection requests, scrape suggestions, create fake accounts to appear as mutual connections, or manipulate ranking signals.',
          'Controls exist at multiple layers: signup/device reputation, API rate limits, graph mutation limits, ranking demotion, trust tiers, CAPTCHA/step-up friction, and manual/ML review.',
          'Abuse metrics should feed ranking. Candidates with high report/block rates or suspicious graph patterns should be filtered or downranked.',
          'Do not rely only on IP limits. Attackers rotate IPs; combine user, device, account age, graph behavior, and target feedback.',
        ],
        scenario:
          'New accounts are limited to fewer connection requests per day, suspicious accounts are excluded from suggestions, and high block/report rates downrank candidates.',
        architecture: [
          'Risk Service scores users and actions.',
          'Rate limiter enforces user/IP/device/target limits.',
          'Ranking pipeline includes trust and negative feedback features.',
          'Abuse review pipeline consumes reports and anomaly events.',
        ],
        flow: [
          'Connection request checks risk and rate limits.',
          'Feedback events update reputation features.',
          'Ranker filters or downranks suspicious candidates.',
          'Alerts trigger when spam metrics spike.',
        ],
        tradeoffs: [
          'Strict limits reduce spam but can hurt legitimate growth.',
          'Risk scoring improves defense but can create false positives.',
          'Manual review improves accuracy but does not scale alone.',
        ],
        failureModes: [
          'Fake accounts game mutual-friend ranking.',
          'Scraper enumerates suggestions pages.',
          'Negative feedback is delayed and spam spreads before features update.',
        ],
        prompt: 'Add anti-spam controls to connection suggestions and requests.',
        tasks: [
          'List abuse scenarios.',
          'Add controls at API, graph mutation, ranking, and monitoring layers.',
          'Define feedback signals.',
          'Define false-positive mitigation.',
        ],
        expected: [
          'Controls are multi-layered.',
          'Ranking includes safety/trust signals.',
          'Rate limits are semantic and distributed.',
          'Metrics include reports, blocks, low accept rate, and scraping behavior.',
        ],
      }),
      sub({
        id: 'secure-apis-secrets',
        title: 'Secure APIs and secrets',
        summary: 'Protect APIs with validation, least privilege, encryption, secret rotation, and safe defaults.',
        priority: 'P2',
        duration: '35m',
        tags: ['security', 'secrets', 'validation'],
        fastTrack: [
          'Validate schemas and enforce least privilege at service and data layers.',
          'Encrypt sensitive data in transit and at rest; rotate secrets and signing keys.',
          'Use safe defaults for timeouts, retries, CORS, SSRF, uploads, and admin APIs.',
        ],
        theory: [
          'Secure API design includes input validation, output filtering, authn/authz, rate limiting, replay protection, audit logging, and dependency hardening.',
          'Secrets should live in a secret manager, not config files. Rotate database credentials, API keys, signing keys, and provider tokens. Services should use least-privilege credentials.',
          'Encrypt data in transit with TLS and sensitive data at rest with managed keys. Consider field-level encryption for highly sensitive values.',
          'Common design risks include SSRF through URL fetchers, unsafe file upload, overly broad CORS, missing timeouts, verbose errors, and unaudited admin endpoints.',
        ],
        scenario:
          'Suggestions API validates cursor format, rejects oversized requests, uses least-privilege read credentials, and does not expose internal ranking scores.',
        architecture: [
          'API Gateway performs schema validation and request size limits.',
          'Services use secret manager and per-service credentials.',
          'Data stores enforce least-privilege access.',
          'Audit service records sensitive admin and data access.',
        ],
        flow: [
          'Request is validated before business logic.',
          'Service calls dependencies with scoped credentials.',
          'Response is filtered to public fields.',
          'Sensitive access is logged and monitored.',
        ],
        tradeoffs: [
          'Strict validation can reject old clients unless versioned carefully.',
          'Fine-grained credentials improve security but add operations overhead.',
          'Encryption and audit logging add cost but reduce incident blast radius.',
        ],
        failureModes: [
          'Cursor injection or malformed input causes expensive queries.',
          'Service credential can read/write unrelated tables.',
          'Internal model scores leak to clients.',
        ],
        prompt: 'Harden the suggestions API and data access layer.',
        tasks: reqTasks,
        expected: [
          'Validation and output filtering are included.',
          'Secrets and credentials are managed and scoped.',
          'Encryption and audit are mentioned.',
          'Common API attack surfaces are addressed.',
        ],
      }),
    ],
  },
  {
    id: 'twenty-four-hour-sprint',
    order: 8,
    title: '24-Hour Interview Sprint',
    tagline: 'Compress the workbook into templates, drills, and scoring rubrics.',
    outcome: 'You can run mock interviews and quickly identify missing depth before the real interview.',
    subsections: [
      sub({
        id: 'master-answer-template',
        title: 'Master answer template',
        summary: 'A reusable 30-45 minute structure for almost any feature design prompt.',
        priority: 'P0',
        duration: '30m',
        tags: ['template', 'mock interview'],
        fastTrack: [
          'Use the same sequence every time: scope, requirements, estimates, APIs, data, flows, scale, reliability.',
          'State one deep dive area and ask the interviewer where to go deeper.',
          'End with metrics, trade-offs, and failure modes.',
        ],
        theory: [
          'Template: clarify prompt; list functional requirements; list NFRs; estimate scale; define APIs; define data model; draw high-level architecture; walk write path; walk read path; discuss scaling; discuss reliability/security; summarize trade-offs.',
          'The template is not rigid. It is a safety rail that prevents missing important categories under pressure.',
          'For feature architecture interviews, always include product feedback loops and observability. Systems do not stop at serving a response.',
          'Your final summary should sound like a decision: "I chose precomputed read models because reads dominate and 10-minute freshness is acceptable; I protect correctness with final block/privacy checks."',
        ],
        scenario:
          'Apply the template to connection suggestions, notifications, feed, autocomplete, and rate limiting.',
        architecture: [
          'Top-level diagram has client/API, source store, async pipeline, derived read model, serving cache, observability.',
          'Side panel lists assumptions and trade-offs.',
          'Deep dive panel focuses on the highest-risk subsystem.',
          'Metrics panel covers SLO and product quality.',
        ],
        flow: [
          'Start with scope and requirements.',
          'Estimate scale and identify bottleneck.',
          'Draw architecture and walk paths.',
          'Deep dive, then close with operations and risks.',
        ],
        tradeoffs: [
          'A template improves completeness but should not sound memorized.',
          'Deep dives show expertise but must be tied to requirements.',
          'Ending with risks shows maturity even if design is not perfect.',
        ],
        failureModes: [
          'Skipping APIs/data model and drawing boxes only.',
          'No write path for derived read models.',
          'No failure or observability discussion.',
        ],
        prompt: 'Use the template for "Design friends suggestions" in 30 minutes.',
        tasks: [
          'Write one sentence per template section.',
          'Draw the architecture in five boxes.',
          'Deep dive candidate generation.',
          'End with trade-offs and metrics.',
        ],
        expected: [
          'Every template section is covered.',
          'The answer has both write and read paths.',
          'The deep dive is relevant to the prompt.',
          'The close includes SLOs, failure modes, and trade-offs.',
        ],
      }),
      sub({
        id: 'system-design-checklist',
        title: 'System design checklist',
        summary: 'A compact checklist to run before and during the interview.',
        priority: 'P0',
        duration: '25m',
        tags: ['checklist', 'review'],
        fastTrack: [
          'If you cannot name source of truth, read model, and invalidation path, the design is incomplete.',
          'If a mutation can be retried, it needs idempotency.',
          'If data is cached or derived, final authorization/privacy checks still matter.',
        ],
        theory: [
          'Checklist categories: users and use cases; functional requirements; NFRs; estimates; APIs; source-of-truth data; indexes/read models; write path; read path; async pipeline; consistency; caching; partitioning; reliability; security/privacy; observability; metrics; trade-offs.',
          'The checklist catches common gaps. Many answers forget deletions, retries, stale caches, high-degree hot spots, and how derived data is rebuilt.',
          'For recommendation features, add: candidate generation, ranking signals, hard filters, feedback events, model versioning, experimentation, quality metrics, and abuse controls.',
          'Use the checklist silently while speaking. Do not read it like a script.',
        ],
        scenario:
          'Before finishing a suggestions design, scan for source truth, read model, cache invalidation, block/privacy final check, queue lag, high-degree caps, ranking metrics, and rebuild path.',
        architecture: [
          'Checklist lives beside the diagram as short bullets.',
          'Each major box maps to one owner and one SLO.',
          'Every derived store has a rebuild/replay path.',
          'Every user action has an event/metric.',
        ],
        flow: [
          'Run checklist after baseline architecture.',
          'Fill missing sections before deep dive.',
          'Use follow-up time for the weakest area.',
          'Close by summarizing risks and mitigations.',
        ],
        tradeoffs: [
          'Checklist coverage improves completeness but can slow pacing.',
          'Some checklist items are not relevant to every prompt.',
          'Skipping irrelevant items is also senior judgment.',
        ],
        failureModes: [
          'Checklist becomes a monologue.',
          'All boxes exist but no ownership/invariants.',
          'No distinction between core and optional requirements.',
        ],
        prompt: 'Audit your connection suggestions design with the checklist.',
        tasks: [
          'Find three missing pieces.',
          'Add one metric per missing piece.',
          'Add one failure mode per missing piece.',
          'Rewrite the final summary.',
        ],
        expected: [
          'The design has clear source truth and derived stores.',
          'Retries, cache, privacy, and observability are covered.',
          'The answer does not overbuild irrelevant sections.',
          'The final summary is concise and decision-oriented.',
        ],
      }),
      sub({
        id: 'whiteboard-patterns',
        title: 'Whiteboard architecture patterns',
        summary: 'Recognize the small set of diagrams that cover most feature interviews.',
        priority: 'P1',
        duration: '35m',
        tags: ['patterns', 'whiteboard'],
        fastTrack: [
          'Most feature designs are combinations of CRUD, event pipeline, read model, ranking, and realtime patterns.',
          'Draw data ownership and flow arrows, not random service boxes.',
          'Add observability and failure paths to make the diagram production-grade.',
        ],
        theory: [
          'Pattern 1: request/response CRUD with source DB and cache. Pattern 2: event-driven pipeline with derived read model. Pattern 3: fan-out feed/notification. Pattern 4: search/index ingestion. Pattern 5: realtime gateway. Pattern 6: recommendation candidate/ranking/serving.',
          'A good whiteboard diagram distinguishes source truth from derived views and sync from async paths.',
          'Use arrows with verbs: writes, emits, consumes, indexes, ranks, serves, invalidates. This makes the architecture explainable.',
          'Add failure boundaries: queues, retries, DLQ, cache fallback, circuit breaker, feature flag, and metrics.',
        ],
        scenario:
          'Connection suggestions uses recommendation pattern plus event pipeline plus read model plus cache. Chat uses CRUD plus realtime gateway plus notification pattern.',
        architecture: [
          'Source-of-truth store sits under owner service.',
          'Event stream connects source mutations to derived services.',
          'Read model/cache sits on serving path.',
          'Monitoring surrounds both sync and async paths.',
        ],
        flow: [
          'Pick the dominant pattern for the prompt.',
          'Add source write path.',
          'Add derived read path.',
          'Add reliability and observability.',
        ],
        tradeoffs: [
          'Patterns speed up design but can hide product-specific constraints.',
          'A generic diagram is a starting point, not the final answer.',
          'Too many boxes reduce clarity.',
        ],
        failureModes: [
          'Diagram has services but no data flow.',
          'Async events are drawn but not tied to source transaction.',
          'Read model appears without build/rebuild path.',
        ],
        prompt: 'Map five common prompts to whiteboard patterns.',
        tasks: [
          'Classify suggestions, notifications, chat, feed, and autocomplete.',
          'Draw one common base diagram.',
          'Add one unique subsystem per prompt.',
          'Add one failure mode per prompt.',
        ],
        expected: [
          'Patterns are adapted, not copied blindly.',
          'Every prompt has source and read paths.',
          'Unique constraints are identified.',
          'Reliability and metrics are present.',
        ],
      }),
      sub({
        id: 'follow-up-questions',
        title: 'Common interviewer follow-ups',
        summary: 'Prepare depth for scale, consistency, privacy, ranking, and incident questions.',
        priority: 'P0',
        duration: '35m',
        tags: ['follow-ups', 'depth'],
        fastTrack: [
          'Expect follow-ups on bottlenecks, stale data, high-degree users, privacy, and failure recovery.',
          'Answer follow-ups by tying back to requirements and trade-offs.',
          'Have one deep answer ready for the core subsystem of each prompt.',
        ],
        theory: [
          'Common follow-ups: What happens at 10x scale? How do you handle celebrity users? How do you prevent stale suggestions? How do you remove a blocked user immediately? How do you debug a bad recommendation? How do you roll back a ranking model?',
          'For each follow-up, identify the stressed dimension: traffic, data size, fan-out, consistency, latency, privacy, reliability, or ML quality.',
          'Strong answers modify the design rather than adding vague "more servers". Add partitioning, caching, async batching, caps, fallback, model versioning, or observability as needed.',
          'When asked about a failure, walk detection, mitigation, recovery, and prevention.',
        ],
        scenario:
          'Interviewer asks: "A blocked user still appears in suggestions. How do you debug and fix it?" You trace block event, cache invalidation, read model generated_at, serving final filter, and decision logs.',
        architecture: [
          'Trace request_id from served response.',
          'Check block source store and event stream.',
          'Check cache key/version and read model freshness.',
          'Patch final serving filter and backfill derived stores if needed.',
        ],
        flow: [
          'Identify impacted invariant.',
          'Check source truth first.',
          'Trace derived data and cache.',
          'Mitigate immediately, then repair root cause.',
        ],
        tradeoffs: [
          'Immediate cache purge may increase backend load but protects safety.',
          'Backfilling derived data fixes correctness but can lag.',
          'Failing closed for policy service reduces unsafe serving but may hide suggestions.',
        ],
        failureModes: [
          'Debugging derived store without checking source truth.',
          'Fixing cache but not pipeline root cause.',
          'No logs to explain why candidate passed filters.',
        ],
        prompt: 'Answer five follow-ups for connection suggestions.',
        tasks: [
          '10x traffic.',
          'High-degree users.',
          'Blocked user shown.',
          'Ranking model regression.',
          'Queue lag for 30 minutes.',
        ],
        expected: [
          'Each answer identifies the stressed dimension.',
          'Each answer changes or deepens the architecture.',
          'Privacy/safety follow-ups prioritize correctness.',
          'Operational follow-ups include detection, mitigation, and recovery.',
        ],
      }),
      sub({
        id: 'practice-rubric',
        title: 'Practice drills and scoring rubric',
        summary: 'Score mock interviews on structure, correctness, depth, trade-offs, and communication.',
        priority: 'P1',
        duration: '30m',
        tags: ['practice', 'rubric'],
        fastTrack: [
          'Score answers by structure, requirements, data model, flows, scaling, reliability, and trade-offs.',
          'Record one mock answer and audit missing pieces immediately.',
          'Practice the same prompt twice: first broad, second deep.',
        ],
        theory: [
          'A useful rubric makes practice objective. Score 1-5 across: requirements, estimates, APIs, data model, architecture, read/write flows, scaling, reliability, security/privacy, observability, trade-offs, communication.',
          'Mock drills should be time-boxed. Do a 10-minute outline, a 30-minute full answer, and a 5-minute follow-up recovery drill.',
          'Improvement comes from replay. After each mock, write the top three missing pieces and re-answer only those sections.',
          'For feature design, correctness beats novelty. A simple reliable architecture with clear trade-offs is stronger than a complex trendy one with missing invariants.',
        ],
        scenario:
          'Mock prompt: Design friends suggestions. Score yourself, then repeat only the candidate generation and privacy sections until they are crisp.',
        architecture: [
          'Rubric rows map to workbook levels.',
          'Practice log stores prompt, score, missing pieces, and next drill.',
          'Follow-up bank stresses one dimension at a time.',
          'Final pass focuses on concise communication.',
        ],
        flow: [
          'Run a timed mock.',
          'Score with rubric.',
          'Pick weakest two categories.',
          'Repeat targeted drills.',
        ],
        tradeoffs: [
          'Rubrics can feel mechanical but expose gaps quickly.',
          'Repeating one prompt improves depth but should be balanced with variety.',
          'Practicing aloud is slower than reading but transfers better to interviews.',
        ],
        failureModes: [
          'Reading notes without speaking.',
          'Practicing only the favorite subsystem.',
          'No feedback loop after mocks.',
        ],
        prompt: 'Run a 24-hour sprint with three mock prompts.',
        tasks: [
          'Mock 1: connection suggestions.',
          'Mock 2: notifications.',
          'Mock 3: autocomplete or rate limiter.',
          'Score each and repeat weakest section.',
        ],
        expected: [
          'Scores improve across mocks.',
          'Missing sections are tracked.',
          'Answers become shorter and clearer.',
          'Final mock includes end-to-end design plus follow-ups.',
        ],
      }),
    ],
  },
];

export const workbook: WorkbookContent = {
  title: 'System Design Topics',
  subtitle:
    'A practical workbook for feature-level system design interviews: architecture, data modeling, scale, reliability, privacy, and recommendation systems.',
  repoUrl: 'https://github.com/vietanhrs/system-design-topics',
  levels,
};

export const allPriorities: Priority[] = ['P0', 'P1', 'P2'];
