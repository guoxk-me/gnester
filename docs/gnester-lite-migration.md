# Migration from gnester-lite / 从 gnester-lite 迁移

## Source assessment / 源项目评估

Inspected on 2026-08-10, `gnester-lite` is a mature single-process production
template, not a microservice topology. Its reusable value is in platform
mechanisms and delivery gates rather than its removable Demo catalog.

在 2026-08-10 的检查中，`gnester-lite` 是成熟的单进程生产模板，而不是微服务拓扑。其可复用
价值主要来自 platform 机制与交付门禁，而不是可删除的 Demo catalog。

Both repositories had uncommitted work during inspection. This migration is
therefore incremental and never copies one worktree over the other.

检查时两个仓库均存在未提交改动。因此迁移采用增量方式，不会用一个工作树整体覆盖另一个。

## Capability disposition / 能力处置

| Capability / 能力                                                    | Decision / 决策                                                                        |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Framework-free contracts and dependency rules / 无框架契约与依赖规则 | Migrated / 已迁移                                                                      |
| Layered env-file precedence and validation / 分层 env 优先级与校验   | Migrated per process / 已按进程迁移                                                    |
| HTTP validation and URI versioning / HTTP 校验与 URI 版本            | Kept at the gateway boundary / 保留在 gateway 边界                                     |
| Remote transport / 远程 transport                                    | Replaced phase-one HTTP with native NestJS NATS / 用原生 NestJS NATS 替换第一阶段 HTTP |
| Pino and Sentry / Pino 与 Sentry                                     | Next platform phase / 下一 platform 阶段                                               |
| Role-aware platform health / 按角色平台健康检查                      | Next platform phase / 下一 platform 阶段                                               |
| Better Auth, CSRF, i18n envelope / Better Auth、CSRF、i18n envelope  | Gateway-only later / 后续仅迁移到 gateway                                              |
| TypeORM and migrations / TypeORM 与 migration                        | Move only after a business owner is selected / 确定业务所有者后再迁移                  |
| BullMQ / BullMQ                                                      | Keep as a job queue; do not treat as an event bus / 保留为任务队列，不作为事件总线     |
| Demo catalog / Demo catalog                                          | Do not bulk-copy / 不批量复制                                                          |

## Implemented migration slice / 已实现的迁移切片

- A standalone Demo service created with `NestFactory.createMicroservice`.
- Gateway-to-service request/reply through `ClientProxy` and NATS Core.
- Versioned subjects: `gnester.demo-greeting.v1.get` and `gnester.demo-greeting.v1.health`.
- A caller-owned port with a production NATS adapter and bounded request timeouts.
- NATS queue-group configuration for competing service replicas.
- `x-request-id` propagation across HTTP and NATS.
- Global RPC `ValidationPipe`, exception filter, and metadata-only interceptor.
- Process-specific environment validation and safe dotenv precedence.
- Architecture, artifact, production-start, and real-broker end-to-end gates.

- 使用 `NestFactory.createMicroservice` 创建的独立 Demo service。
- Gateway 与 service 通过 `ClientProxy` 和 NATS Core 完成 request/reply。
- 版本化 subject：`gnester.demo-greeting.v1.get` 与 `gnester.demo-greeting.v1.health`。
- 调用方拥有的 port、生产 NATS adapter 与有界请求超时。
- 用于 service 副本竞争消费的 NATS queue-group 配置。
- `x-request-id` 在 HTTP 与 NATS 之间传播。
- 全局 RPC `ValidationPipe`、异常 filter 与仅记录元数据的 interceptor。
- 按进程校验环境配置，以及安全的 dotenv 优先级。
- 架构、构建产物、生产启动与真实 broker 端到端门禁。

The current implementation has no RPC guard and no `@EventPattern`; those
features are not claimed by the migration.

当前实现没有 RPC guard，也没有 `@EventPattern`；本次迁移不虚构这些能力。

## Next phases / 后续阶段

### English

1. Select the first real business boundary and move only its use cases,
   persistence adapters, database, and migrations into a dedicated process.
2. Add role-aware platform probes, draining, bounded shutdown, and structured
   privacy-aware observability.
3. Remove database/Redis/schedule ownership from the gateway only after behavior
   and network contract tests prove parity.
4. Add per-process images, migration jobs, and deployment topology.
5. For a durable command or event requirement, evaluate RabbitMQ first and
   define acknowledgement, retry, idempotency, and outbox/inbox semantics before
   adding handlers.

### 中文

1. 选定首个真实业务边界，仅将其用例、持久化 adapter、数据库与 migration 迁入独立进程。
2. 增加按角色平台探针、排空、有界关闭，以及兼顾隐私的结构化可观测性。
3. 只有在行为与网络 contract 测试证明等价后，才从 gateway 移除数据库、Redis 与 schedule 所有权。
4. 增加按进程镜像、migration job 与部署拓扑。
5. 出现持久 command 或 event 需求时优先评估 RabbitMQ；先定义确认、重试、幂等与 outbox/inbox
   语义，再增加 handler。

## Explicitly deferred / 明确延后

- Inventing identity, user, order, payment, or audit service boundaries.
- Moving the current in-progress MongoDB and multi-database work.
- Sharing TypeORM entities or repositories across processes.
- Adding Redis, MQTT, Kafka, gRPC, custom transport, or Nest TCP without a concrete requirement.
- Claiming NATS Core provides durable storage, replay, or guaranteed delivery.
- Adding guards, authentication, authorization, or business event handlers without policy requirements.

- 臆造 identity、user、order、payment 或 audit service 边界。
- 搬迁当前进行中的 MongoDB 与多数据源工作。
- 在进程间共享 TypeORM entity 或 repository。
- 在没有明确需求时引入 Redis、MQTT、Kafka、gRPC、custom transport 或 Nest TCP。
- 声称 NATS Core 提供持久存储、回放或保证投递。
- 在没有策略需求时增加 guard、认证、授权或业务 event handler。
