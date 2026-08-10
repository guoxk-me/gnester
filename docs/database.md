# Database Guide / 数据库指南

This project uses NestJS + TypeORM by default, and includes opt-in NestJS + Mongoose examples for MongoDB. Keep database changes small, module-scoped, and covered by tests.

本项目默认使用 NestJS + TypeORM，并提供可选的 NestJS + Mongoose MongoDB 示例。数据库改动应保持小范围、按模块组织，并配套测试。

## Runtime Setup / 运行时配置

- Single database is the default. 多数情况下默认使用单数据库。
- `src/app-single-database.imports.ts` registers the primary connection.
- `src/app-multi-database.imports.ts` registers the primary connection plus the named secondary connection.
- Set `enableMultiDatabase` in `src/app-features.ts` only after every target environment provides explicit `SECONDARY_DB_*` values.
- `name: SECONDARY_DATA_SOURCE` must stay at the top level of `TypeOrmModule.forRootAsync()`.
- Runtime entity globs must not include `src/**/*.entity.ts`; app runtime uses compiled JS plus `autoLoadEntities`.

Primary database env keys prefer `PRIMARY_DB_*`, with legacy `DB_*` fallback.

主库环境变量优先使用 `PRIMARY_DB_*`，旧的 `DB_*` 仍作为兼容回退。

## Feature Modules / 功能模块

Primary database feature:

- Entity: `src/features/demo-database/entities/demo.entity.ts`
- Module: `src/features/demo-database/demo-database.module.ts`
- Repository registration: `TypeOrmModule.forFeature([Demo])`
- Injection: `@InjectRepository(Demo)`

Secondary database feature:

- Entity: `src/features/demo-multi-database/entities/demo-audit.entity.ts`
- Module: `src/features/demo-multi-database/demo-multi-database.module.ts`
- Repository registration: `TypeOrmModule.forFeature([DemoAudit], SECONDARY_DATA_SOURCE)`
- Injection: `@InjectRepository(DemoAudit, SECONDARY_DATA_SOURCE)`

When adding a new entity, put it under the owning feature module and register it with `forFeature()`.

新增 entity 时，应放到所属 feature module 下，并通过 `forFeature()` 注册。

## Migrations / 迁移

Place generated migrations in `src/migrations/`.

请将生成的迁移文件放在 `src/migrations/`。

Commands:

```bash
pnpm migration:create src/migrations/CreateExample
pnpm migration:generate src/migrations/CreateExample
pnpm migration:run
pnpm migration:revert
```

Secondary database commands:

```bash
pnpm migration:secondary:generate src/migrations/CreateSecondaryExample
pnpm migration:secondary:run
pnpm migration:secondary:revert
```

Do not rely on `synchronize` for production changes. Use migrations instead.

生产变更不要依赖 `synchronize`，请使用 migration。

## How To Change / 修改入口

- Database options: `config/database.config.ts`
- Env validation: `config/validation.ts`
- Env examples: `.env.development`, `.env.test`, `.env.production`
- Primary DataSource for CLI: `config/typeorm.data-source.ts`
- Secondary DataSource for CLI: `config/typeorm.secondary-data-source.ts`
- Database tests: `config/database.config.spec.ts` and feature `*.spec.ts`

If startup says `Unable to connect to the database`, check the nested error first. A syntax error usually means TypeORM loaded the wrong file type, not that MySQL is down.

如果启动日志显示 `Unable to connect to the database`，先看内层错误。若是 syntax error，通常是 TypeORM 加载了错误文件类型，不一定是 MySQL 不可用。

## Verification / 验证

After database changes, run:

```bash
pnpm run format
pnpm run lint
pnpm run test
pnpm run build
```

If connection behavior changed, also start the app with the target `.env` and confirm `TypeOrmCoreModule dependencies initialized`.

如果改动影响连接行为，还应使用目标 `.env` 启动应用，并确认出现 `TypeOrmCoreModule dependencies initialized`。

## MongoDB With Mongoose / 使用 Mongoose 接入 MongoDB

NestJS official MongoDB integration uses `@nestjs/mongoose` with `mongoose`.

NestJS 官方 MongoDB 集成使用 `@nestjs/mongoose` 和 `mongoose`。

Installed packages:

```bash
pnpm add @nestjs/mongoose mongoose
```

Runtime setup:

- `enableMongodb: false` in `src/app-features.ts` keeps MongoDB examples disabled by default.
- `enableMongodb: true` registers the default MongoDB connection and `DemoMongodbModule`.
- `enableMongodb: true` plus `enableMultiMongodb: true` registers named primary and secondary MongoDB connections.
- `config/mongodb.config.ts` builds Mongoose connection options from `MONGO_*` and `SECONDARY_MONGO_*` env keys.
- `src/app-mongodb.imports.ts` shows the single default connection pattern.
- `src/app-multi-mongodb.imports.ts` shows the multi-connection pattern.

运行时配置：

- `src/app-features.ts` 中的 `enableMongodb: false` 默认禁用 MongoDB 示例。
- `enableMongodb: true` 注册默认 MongoDB 连接和 `DemoMongodbModule`。
- `enableMongodb: true` 且 `enableMultiMongodb: true` 注册命名主 MongoDB 连接和命名次 MongoDB 连接。
- `config/mongodb.config.ts` 从 `MONGO_*` 和 `SECONDARY_MONGO_*` 环境变量构建 Mongoose 连接配置。
- `src/app-mongodb.imports.ts` 展示单默认连接模式。
- `src/app-multi-mongodb.imports.ts` 展示多连接模式。

Single MongoDB feature:

- Schema: `src/features/demo-mongodb/schemas/demo-mongo.schema.ts`
- Module: `src/features/demo-mongodb/demo-mongodb.module.ts`
- Model registration: `MongooseModule.forFeature([{ name: DemoMongo.name, schema: DemoMongoSchema }])`
- Injection: `@InjectModel(DemoMongo.name)`
- Connection injection: `@InjectConnection()`
- Session example: `DemoMongodbService.createMany()`

单 MongoDB 功能模块：

- Schema：`src/features/demo-mongodb/schemas/demo-mongo.schema.ts`
- Module：`src/features/demo-mongodb/demo-mongodb.module.ts`
- Model 注册：`MongooseModule.forFeature([{ name: DemoMongo.name, schema: DemoMongoSchema }])`
- 注入：`@InjectModel(DemoMongo.name)`
- 连接注入：`@InjectConnection()`
- Session 示例：`DemoMongodbService.createMany()`

Multi MongoDB feature:

- Connection names: `PRIMARY_MONGO_CONNECTION` and `SECONDARY_MONGO_CONNECTION`
- Secondary schema: `src/features/demo-multi-mongodb/schemas/demo-mongo-audit.schema.ts`
- Secondary module: `src/features/demo-multi-mongodb/demo-multi-mongodb.module.ts`
- Named model registration: `MongooseModule.forFeature(..., SECONDARY_MONGO_CONNECTION)`
- Named model injection: `@InjectModel(DemoMongoAudit.name, SECONDARY_MONGO_CONNECTION)`

多 MongoDB 功能模块：

- 连接名：`PRIMARY_MONGO_CONNECTION` 和 `SECONDARY_MONGO_CONNECTION`
- 次库 Schema：`src/features/demo-multi-mongodb/schemas/demo-mongo-audit.schema.ts`
- 次库 Module：`src/features/demo-multi-mongodb/demo-multi-mongodb.module.ts`
- 命名 Model 注册：`MongooseModule.forFeature(..., SECONDARY_MONGO_CONNECTION)`
- 命名 Model 注入：`@InjectModel(DemoMongoAudit.name, SECONDARY_MONGO_CONNECTION)`

Example env:

```bash
# src/app-features.ts: enableMongodb: true
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=gnester_dev
MONGO_AUTO_CREATE=true

# src/app-features.ts: enableMultiMongodb: true
SECONDARY_MONGO_URI=mongodb://localhost:27017
SECONDARY_MONGO_DATABASE=gnester_dev_audit
SECONDARY_MONGO_AUTO_CREATE=true
```

Production keeps `autoCreate` disabled even if `MONGO_AUTO_CREATE=true`.

生产环境即使设置了 `MONGO_AUTO_CREATE=true`，运行时也会关闭 `autoCreate`。

MongoDB routes:

- `POST /demo-mongodb`
- `POST /demo-mongodb/many`
- `GET /demo-mongodb`
- `GET /demo-mongodb/:id`
- `PATCH /demo-mongodb/:id`
- `DELETE /demo-mongodb/:id`

MongoDB 路由：

- `POST /demo-mongodb`
- `POST /demo-mongodb/many`
- `GET /demo-mongodb`
- `GET /demo-mongodb/:id`
- `PATCH /demo-mongodb/:id`
- `DELETE /demo-mongodb/:id`
