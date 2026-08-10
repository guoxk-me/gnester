# Architecture / 架构

## Current phase / 当前阶段

The repository now has a native NestJS request/reply microservice seam. Existing
database modules remain in the gateway to avoid colliding with active MongoDB
and multi-database work; this is an inspected transitional state, not the target
ownership model.

本仓库现已具备原生 NestJS request/reply 微服务边界。为避免与进行中的 MongoDB 和多数据源
工作冲突，现有数据库 module 暂时仍由 gateway 装配；这是已确认的过渡状态，不是目标所有权模型。

## Runtime path / 运行路径

```text
HTTP request
  -> gateway controller
  -> caller-owned DemoGreetingPort
  -> NatsDemoGreetingAdapter / ClientProxy.send
  -> NATS Core subject + queue group
  -> standalone NestFactory.createMicroservice process
  -> @MessagePattern controller
```

The request/reply subjects are:

- `gnester.demo-greeting.v1.get`
- `gnester.demo-greeting.v1.health`

Request/reply subject 如下：

- `gnester.demo-greeting.v1.get`
- `gnester.demo-greeting.v1.health`

## Deployable processes / 可部署进程

### Gateway / 网关

- Entry point: `src/main.ts`
- Composition root: `src/app.module.ts`
- Public interface: versioned HTTP routes on `PORT`
- Remote dependency: `DemoGreetingPort`
- Transport adapter: `ClientsModule` + `ClientProxy` + NATS

- 入口：`src/main.ts`
- 装配根：`src/app.module.ts`
- 公共 interface：`PORT` 上的版本化 HTTP 路由
- 远程依赖：`DemoGreetingPort`
- Transport adapter：`ClientsModule` + `ClientProxy` + NATS

The gateway connects its required broker during Nest bootstrap. Each remote
request has a bounded timeout, validates the response allowlist, and translates
transport failure to a stable HTTP 503 response.

Gateway 在 Nest 启动阶段连接其必需的 broker。每次远程请求都有有界超时，会校验响应白名单，
并将 transport 故障转换为稳定的 HTTP 503 响应。

### Demo greeting service / Demo greeting 服务

- Entry point: `src/processes/demo-greeting-service.main.ts`
- Composition root: `src/processes/demo-greeting-service.module.ts`
- Bootstrap: `NestFactory.createMicroservice(..., Transport.NATS)`
- Interface: two `@MessagePattern` handlers; no HTTP listener
- Replica coordination: `DEMO_GREETING_NATS_QUEUE_GROUP`
- No database, Redis, or gateway implementation imports

- 入口：`src/processes/demo-greeting-service.main.ts`
- 装配根：`src/processes/demo-greeting-service.module.ts`
- 启动方式：`NestFactory.createMicroservice(..., Transport.NATS)`
- Interface：两个 `@MessagePattern` handler；没有 HTTP listener
- 副本协调：`DEMO_GREETING_NATS_QUEUE_GROUP`
- 不导入数据库、Redis 或 gateway 私有实现

Queue-group members compete for each request, so scaling replicas does not cause
every instance to execute the same synchronous request.

同一 queue group 的成员竞争处理每个请求，因此横向扩容不会让所有实例重复执行同一同步请求。

## RPC boundary policy / RPC 边界策略

The same policy is registered globally by production bootstrap and real-broker
tests:

生产启动入口与真实 broker 测试全局注册同一套策略：

1. The gateway accepts only UUID v4 `x-request-id` values or generates a new one, returns it in the HTTP response, and propagates it as a NATS header.  
   Gateway 仅接受 UUID v4 格式的 `x-request-id`，否则生成新值；该值同时写回 HTTP 响应并通过 NATS header 传播。
2. `ValidationPipe` transforms DTOs, allowlists fields, rejects extra fields, and raises a stable RPC validation error.  
   `ValidationPipe` 转换 DTO、执行字段白名单、拒绝额外字段，并抛出稳定的 RPC 校验错误。
3. The RPC interceptor logs subject, outcome, request ID, and duration without logging payloads or credentials.  
   RPC interceptor 记录 subject、结果、request ID 与耗时，不记录 payload 或凭据。
4. The RPC exception filter returns allowlisted error objects and never exposes stack traces over NATS.  
   RPC exception filter 仅返回白名单错误对象，绝不通过 NATS 暴露堆栈。

No RPC guard or `@EventPattern` flow is registered in the current implementation.
Authentication, authorization, and business events will be added only with a
concrete requirement.

当前实现未注册 RPC guard，也没有 `@EventPattern` 流程。只有在出现明确需求后，才会加入认证、
授权与业务事件。

## Dependency direction / 依赖方向

```text
composition roots (main / processes)
        ├── bootstrap
        ├── examples/features
        └── platform (future)

gateway implementation ──> contracts <── service implementation
bootstrap ────────────────> config
```

Rules enforced by `pnpm run verify:architecture`:

- `contracts` may depend only on other contracts or Node built-ins.
- `platform` must not depend on bootstrap, examples, or process composition.
- Gateway and service implementations may share contracts but not import each other.
- Platform modules must not use `@Global()`.

`pnpm run verify:architecture` 强制以下规则：

- `contracts` 只能依赖其他 contract 或 Node 内置 module。
- `platform` 不得依赖 bootstrap、examples 或进程装配代码。
- Gateway 与 service 实现可以共享 contract，但不得互相导入。
- Platform module 不得使用 `@Global()`。

## Transport semantics / Transport 语义

NATS Core is used here for synchronous request/reply. It does not persist or
replay messages: a broker and a responding service must be live, and the current
health subject verifies that message path rather than acting as an HTTP platform
probe.

这里使用 NATS Core 完成同步 request/reply。它不会持久化或回放消息：broker 与响应服务必须在线；
当前 health subject 验证的是消息路径，而不是 HTTP 平台探针。

The project does not claim durable command or event delivery. When a real
business flow requires acknowledgement, retry, redelivery, or dead-lettering,
RabbitMQ is the first transport to evaluate together with idempotency and
transactional outbox/inbox ownership.

项目当前不宣称 command 或 event 的持久投递能力。当真实业务流需要确认、重试、重新投递或死信时，
应优先评估 RabbitMQ，并同时定义幂等与事务性 outbox/inbox 所有权。

## Ownership target / 所有权目标

Each future production feature will own its use cases, persistence adapters,
entities/schemas, and migrations inside one deployable module. The gateway will
not import repositories or share database entities with downstream modules.

未来每个正式 feature 都应在单一可部署 module 内拥有其用例、持久化 adapter、entity/schema
与 migration。Gateway 不得导入 repository，也不得与下游 module 共享数据库 entity。
