# AGENTS.md

This file establishes the comprehensive protocols and technical guidelines for agentic coding agents working in this NestJS repository.

## 🛑 Critical Protocols / 关键协议

### 1. Communication & Language / 沟通与语言

- **Bilingual Responses**: You MUST reply in both English and Chinese. / 必须使用中英双语回复。
- **Bilingual Comments**: All code comments must be bilingual (English + Chinese). / 所有代码注释必须是双语的（中文+英文）。
- **No Pleasantries**: Skip "I understand", "Here is the code", etc. Go straight to the solution. / 禁止客套话，直接回答。
- **Evidence-Based**: Do not guess. If unsure, verify or ask. Distinguish facts from assumptions. / 拒绝瞎猜，以事实为据。

### 2. Execution Standards / 执行标准

- **Plan First**: For non-trivial tasks, create a plan before editing code. / 复杂任务先制定计划。
- **Read Before Write**: Always read relevant files before making changes. / 修改前必读相关文件。
- **Verify**: Run tests (`pnpm run test`) after changes to ensure stability. / 修改后务必运行测试。

---

## 🛠 Project Commands / 项目命令

### Build & Run / 构建与运行

- **Development**: `pnpm run start:dev`
  - Starts the application in watch mode with `.env.development`.
  - Use this for active development.
- **Production Build**: `pnpm run build`
  - Compiles TypeScript to `dist/`.
  - Run this to verify build stability before completing tasks.
- **Production Start**: `pnpm run start:prod`
  - Runs the compiled code from `dist/main`.

### Code Quality / 代码质量

- **Linting**: `pnpm run lint`
  - Runs ESLint to catch and fix static analysis issues.
  - **Rule**: Always run this before finishing a task.
- **Formatting**: `pnpm run format`
  - Formats all files using Prettier.

### Testing / 测试

- **Run All Tests**: `pnpm run test`
  - Executes all unit tests (`*.spec.ts`).
- **Run Single Test**: `pnpm run test -- src/path/to/file.spec.ts`
  - **Crucial**: Use this when working on a specific feature to save time.
- **E2E Tests**: `pnpm run test:e2e`
  - Runs end-to-end tests located in `test/`.
  - Uses a separate configuration `test/jest-e2e.json`.
- **Coverage**: `pnpm run test:cov`
  - Generates a coverage report in `coverage/`.

---

## 📐 Code Style & Patterns / 代码风格与模式

### 1. General Architecture

- **Framework**: NestJS (v11+) with NodeNext module system.
- **Language**: TypeScript (ES2023, Strict Mode).
- **Style**: Functional where possible, Object-Oriented for DI.
- **Module Pattern**:
  - `imports`: Other modules, TypeORM entities.
  - `providers`: Services, strategies, guards.
  - `controllers`: API endpoints.
  - `exports`: Services used by other modules.

### 2. File Structure & Naming

- **Directory Structure**:
  ```
  src/
  ├── config/                # YAML configs + Loaders + Validators
  ├── common/                # Shared decorators, filters, guards
  ├── features/              # Business logic modules (e.g., demo/)
  │   └── [feature]/
  │       ├── dto/           # Request/Response DTOs
  │       ├── entities/      # TypeORM Entities
  │       ├── *.controller.ts
  │       └── *.service.ts
  └── main.ts                # Application entry
  ```
- **Naming Conventions**:
  - **Files**: `kebab-case` (e.g., `user-profile.service.ts`).
  - **Classes**: `PascalCase` (e.g., `UserProfileService`).
  - **Methods/Variables**: `camelCase` (e.g., `findActiveUsers`).
  - **Interfaces**: `PascalCase` (No `I` prefix).
  - **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).

### 3. TypeScript Guidelines

- **Strict Typing**: Avoid `any`. Use `unknown` if necessary.
- **Explicit Returns**: Always define return types for Controller methods and Service public methods.
  ```typescript
  // Good
  async findAll(): Promise<User[]> { ... }
  ```
- **Interfaces vs Types**: Prefer `interface` for object shapes, `type` for unions/tuples.

### 4. Configuration Pattern

- **YAML Based**: Configuration is stored in `config/*.yaml`.
- **Loader**: Use `configuration.ts` to load YAML.
- **Validation**: Use `validation.ts` with `class-validator` to ensure config integrity.
- **Usage**: Inject `ConfigService` to access values.
  ```typescript
  constructor(private configService: ConfigService) {}
  const port = this.configService.get<number>('port');
  ```

### 5. Database (TypeORM)

- **Entities**: Use `@Entity()` decorator.
- **Columns**: MUST include comments describing the field.
  ```typescript
  @Column({ comment: 'User email address', unique: true })
  email: string;
  ```
- **Readonly**: Use `readonly` for fields that shouldn't change (like `id`, `createdAt`).
- **Repositories**: Inject using `@InjectRepository(Entity)`.

### 6. DTOs & Validation

- **Location**: Place in `dto/` folder within the feature module.
- **Class Validator**: Use decorators heavily (`@IsString()`, `@IsInt()`, `@IsOptional()`).
- **Class Transformer**: Use `@Type(() => Number)` if transformation is needed.
- **Strictness**: Global validation pipe is likely enabled (check `main.ts`).
- **Example**:
  ```typescript
  export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    readonly username: string;
  }
  ```

### 7. Error Handling

- **Exceptions**: Use standard NestJS exceptions (`NotFoundException`, `BadRequestException`).
- **Filters**: Custom exception filters should be in `common/filters`.
- **Async/Await**: Always use `try/catch` or let NestJS global error filter handle synchronous errors. Avoid unhandled promise rejections.

### 8. Imports Order

1. **NestJS**: `@nestjs/*`
2. **Third Party**: `typeorm`, `rxjs`, etc.
3. **Internal - Absolute**: `src/common/*` (if alias configured)
4. **Internal - Relative**: `../dto`, `./user.service`

---

## 🔍 Development Workflow / 开发工作流

1.  **Analysis**: Read `package.json`, `nest-cli.json`, and related `*.spec.ts` files.
2.  **Implementation**:
    - Create DTOs first.
    - Define Entity changes.
    - Implement Service logic.
    - Expose via Controller.
3.  **Validation**:
    - Run `pnpm run format` to fix style.
    - Run `pnpm run lint` to catch errors.
    - Run `pnpm run test -- [file]` to verify logic.
4.  **Refactor**: Ensure no `console.log` remains. Ensure comments are bilingual.

_(Agent Note: This file is the source of truth. If you encounter patterns in the code that contradict this, ask for clarification or follow the code if it seems newer/dominant, but document the discrepancy.)_
