# Multi-Database Demo / 多数据库示例

This demo shows Nest + TypeORM named database connections. `AppModule` owns the second `forRootAsync` registration, and this feature module only owns `forFeature` and repository injection.

这个示例展示 Nest + TypeORM 的命名数据库连接。第二个 `forRootAsync` 连接注册由 `AppModule` 负责，本 feature module 只负责 `forFeature` 和 repository 注入。

Key points / 关键点：

- `AppModule` conditionally registers `TypeOrmModule.forRootAsync({ name: SECONDARY_DATA_SOURCE, ... })`.
- `name` is outside `useFactory`, which is required by Nest's multiple database guidance.
- `TypeOrmModule.forFeature([DemoAudit], SECONDARY_DATA_SOURCE)` registers repositories against that named data source.
- `@InjectRepository(DemoAudit, SECONDARY_DATA_SOURCE)` injects the repository from the second database.
- The main app stays single-database unless `ENABLE_MULTI_DATABASE=true`.
- `name` 放在 `useFactory` 外层，这是 Nest 多数据库配置的要求。
- 主应用默认保持单数据库，只有 `ENABLE_MULTI_DATABASE=true` 时才启用第二数据库。

To try it / 试用方式：

1. Configure `SECONDARY_DB_*` environment variables or let them default to the local database settings.
2. Set `ENABLE_MULTI_DATABASE=true` before starting the app.
3. Ensure the secondary database exists and is reachable before starting the app.
