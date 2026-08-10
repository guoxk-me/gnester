# gnester

`gnester` is the microservice-oriented evolution of `gnester-lite`. The current
runtime has an HTTP gateway and a standalone NestJS microservice connected by
NATS request/reply.

`gnester` 是 `gnester-lite` 面向微服务演进的版本。当前运行时由 HTTP gateway 与独立
NestJS microservice 组成，二者通过 NATS request/reply 通信。

## Runtime topology / 运行拓扑

```text
HTTP client
    │ /v1/demo-greeting/*
    ▼
gnester gateway :3000
    │ DemoGreetingPort -> ClientProxy.send
    │ x-request-id NATS header
    ▼
NATS Core
    │ gnester.demo-greeting.v1.get
    │ gnester.demo-greeting.v1.health
    ▼
demo-greeting-service (queue group)
    │ NestFactory.createMicroservice + @MessagePattern
```

- The gateway owns the public HTTP interface and calls only `DemoGreetingPort`.
- Production uses `NatsDemoGreetingAdapter`; focused tests can replace the port.
- The Demo service is broker-only and does not expose an HTTP port.
- Cross-process contracts under `src/contracts` are framework-free and versioned.
- Existing TypeORM, MongoDB, Redis, and schedule demos remain in the gateway during this incremental phase.

- Gateway 拥有公共 HTTP interface，并且只调用 `DemoGreetingPort`。
- 生产环境使用 `NatsDemoGreetingAdapter`；聚焦测试可以替换该 port。
- Demo service 仅连接 broker，不暴露 HTTP 端口。
- `src/contracts` 下的跨进程 contract 不依赖框架，并显式版本化。
- 现有 TypeORM、MongoDB、Redis 与 schedule 示例在本次增量阶段仍保留于 gateway。

## Requirements / 环境要求

- Node.js 24
- pnpm 11
- The official [`nats-server`](https://docs.nats.io/running-a-nats-service/introduction/installation) binary
- MySQL and Redis for the current gateway composition

- Node.js 24
- pnpm 11
- 官方 [`nats-server`](https://docs.nats.io/running-a-nats-service/introduction/installation/) 二进制程序
- 当前 gateway 装配所需的 MySQL 与 Redis

## Install / 安装

```bash
pnpm install
```

## Run the topology / 启动运行拓扑

Terminal 1 — broker / 终端 1 — broker：

```bash
nats-server -a 127.0.0.1 -p 4222
```

Terminal 2 — service / 终端 2 — service：

```bash
pnpm run start:demo-service:dev
```

Terminal 3 — gateway / 终端 3 — gateway：

```bash
pnpm run start:dev
```

Verify the complete HTTP → NATS → service path / 验证完整的 HTTP → NATS → service 路径：

```bash
curl -i http://127.0.0.1:3000/v1/demo-greeting/Codex
curl -i http://127.0.0.1:3000/v1/demo-greeting/health
```

Both responses include `x-request-id`. A valid incoming UUID v4 value is
preserved; otherwise the gateway generates one.

两个响应都包含 `x-request-id`。合法的入站 UUID v4 会被保留，否则由 gateway 生成。

## Quality gates / 质量门禁

```bash
pnpm run format:check
pnpm run lint:check
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:artifact
pnpm run verify:architecture
pnpm run verify:demo-service-start
pnpm run test:e2e
```

Broker-dependent gates start an isolated official NATS server. They resolve
`NATS_SERVER_BIN` first and then `nats-server` from `PATH`; they never reuse a
developer broker.

依赖 broker 的门禁会自行启动隔离的官方 NATS server。脚本优先读取 `NATS_SERVER_BIN`，
否则从 `PATH` 查找 `nats-server`；不会复用开发环境中的 broker。

## Documentation / 文档

- [Architecture / 架构](docs/architecture.md)
- [Migration from gnester-lite / 从 gnester-lite 迁移](docs/gnester-lite-migration.md)
- [Configuration / 配置](docs/configuration.md)
- [Database / 数据库](docs/database.md)
- [Official NestJS microservice transport research / NestJS 官方微服务 transport 调研](docs/research/nestjs-microservices-official.md)
- [NestJS microservices basics / NestJS 微服务基础](https://docs.nestjs.com/microservices/basics)
- [NestJS NATS transport / NestJS NATS transport](https://docs.nestjs.com/microservices/nats)
