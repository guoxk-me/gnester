# Database Guide / 数据库指南

This project uses NestJS + TypeORM. Keep database changes small, module-scoped, and covered by tests.

本项目使用 NestJS + TypeORM。数据库改动应保持小范围、按模块组织，并配套测试。

## Runtime Setup / 运行时配置

- Single database is the default. 多数情况下默认使用单数据库。
- `src/app-single-database.imports.ts` registers the primary connection.
- `src/app-multi-database.imports.ts` registers the primary connection plus the named secondary connection.
- Set `ENABLE_MULTI_DATABASE=true` only when the secondary database is needed.
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
