# Config Guide / 配置指南

This document tells agents and developers how to understand and modify configuration in this project.

本文档用于让 AI agent 和开发者快速理解并修改本项目配置。

Official docs / 官方文档：[NestJS Configuration](https://docs.nestjs.com/techniques/configuration)

## Mental Model / 配置分层

Use two config layers:

使用两层配置：

- `config/config.yaml`: commit-safe static defaults.  
  可提交到仓库的非敏感静态默认值。
- `.env.*`: environment-specific values and secrets.  
  环境相关配置和敏感信息。

Simple rule / 简单规则：

```text
Safe to show in a public PR? -> YAML
可以安全出现在公开 PR？-> YAML

Secret or environment-specific? -> .env / secret manager
密钥或环境相关？-> .env / 密钥管理系统
```

## Current Flow / 当前加载流程

Config is wired in `src/app.module.ts`:

配置入口在 `src/app.module.ts`：

```ts
ConfigModule.forRoot({
  load: [configuration],
  envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
  isGlobal: true,
  cache: true,
  validate,
});
```

Load behavior / 加载行为：

- `NODE_ENV=development` -> `.env.development`
- `NODE_ENV=test` -> `.env.test`
- `NODE_ENV=production` -> `.env.production`
- Runtime env values override `.env` file values.  
  运行时环境变量优先于 `.env` 文件。

## Key Files / 关键文件

- `config/config.yaml`: static YAML config.  
  静态 YAML 配置。
- `config/configuration.ts`: loads and validates YAML.  
  加载并校验 YAML。
- `config/validation.ts`: validates `.env.*` and runtime env.  
  校验 `.env.*` 与运行时环境变量。
- `config/database.config.ts`: builds TypeORM config.  
  构建 TypeORM 配置。
- `src/app.module.ts`: connects config to Nest modules.  
  将配置接入 Nest 模块。
- `nest-cli.json`: copies YAML files into `dist/config`.  
  构建时复制 YAML 到 `dist/config`。

## Current Values / 当前配置

YAML:

```yaml
app:
  name: gnester

cache:
  ttl: 60000
```

Env variables:

```text
NODE_ENV
PORT
DB_TYPE
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_DATABASE
DB_SYNCHRONIZE
DB_AUTO_LOAD_ENTITIES
DB_RETRY_ATTEMPTS
DB_RETRY_DELAY
REDIS_URL
```

Notes / 注意：

- `cache.ttl` comes from YAML.  
  `cache.ttl` 来自 YAML。
- `REDIS_URL` comes from env.  
  `REDIS_URL` 来自 env。
- `DB_SYNCHRONIZE` is forced off in production by `config/database.config.ts`.  
  `DB_SYNCHRONIZE` 在生产环境会被 `config/database.config.ts` 强制关闭。

## How To Add Config / 如何新增配置

### Add static non-sensitive config / 新增非敏感静态配置

1. Add the value to `config/config.yaml`.  
   添加到 `config/config.yaml`。
2. Add validation in `config/configuration.ts`.  
   在 `config/configuration.ts` 中添加校验。
3. Read it with `ConfigService`, for example:  
   使用 `ConfigService` 读取，例如：

```ts
const ttl = configService.get<number>('cache.ttl', 60000);
```

### Add env or secret config / 新增环境或敏感配置

1. Add the value to the correct `.env.*` file or secret manager.  
   添加到对应 `.env.*` 文件或密钥管理系统。
2. Add validation in `config/validation.ts`.  
   在 `config/validation.ts` 中添加校验。
3. Read required values with `getOrThrow()`.  
   必填值使用 `getOrThrow()` 读取。

```ts
const redisUrl = configService.getOrThrow<string>('REDIS_URL');
```

## Change Checklist / 修改检查清单

After changing config, run:

修改配置后运行：

```bash
pnpm run format
pnpm run build
pnpm run lint
pnpm run test
```

Also check / 同时检查：

- Do not put secrets in `config/config.yaml`.  
  不要把密钥放入 `config/config.yaml`。
- Keep `.env.production` aligned with runtime safety rules.  
  保持 `.env.production` 与运行时安全策略一致。
- If YAML structure changes, confirm `nest-cli.json` still copies it to `dist/config`.  
  如果 YAML 结构变化，确认 `nest-cli.json` 仍会复制到 `dist/config`。

## Known Improvements / 已知可优化点

- Make YAML validation reject unknown fields.  
  让 YAML 校验拒绝未知字段。
- Make boolean env parsing reject invalid values such as `maybe`.  
  让布尔环境变量解析拒绝 `maybe` 等非法值。
- Centralize database defaults in `config/validation.ts` or a typed config factory.  
  将数据库默认值集中到 `config/validation.ts` 或类型化配置工厂中。
