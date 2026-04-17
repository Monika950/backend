## GitHub Actions CI/CD Pipeline - Дипломна работа

### Описание на проекта

Този проект представлява NestJS backend приложение с напълно конфигуриран CI/CD pipeline чрез GitHub Actions. Pipeline-ът автоматизира linting, build и testing процесите при всеки push или pull request към main branch.

### Структура на файловете

```
backend/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions workflow конфигурация
├── src/
│   └── modules/
│       ├── auth/
│       │   └── auth.service.spec.ts  # Unit тестове за auth service
│       ├── treasure-hunt/
│       │   └── treasure-hunt.service.spec.ts
│       ├── notifications/
│       │   └── notifications.service.spec.ts
│       ├── uploads/
│       │   └── uploads.service.spec.ts
│       ├── location/
│       │   └── location.service.spec.ts
│       └── user-answer/
│           └── user-answer.service.spec.ts
├── pipeline.txt                      # Документация на pipeline-a
├── doc.txt                           # Reflection документ
└── SCREENSHOTS_INSTRUCTIONS.txt      # Инструкции за screenshots

```

### CI/CD Pipeline Компоненти

#### 1. Lint Job

- **Цел**: Проверка за code style и потенциални грешки
- **Инструмент**: ESLint с TypeScript поддръжка
- **Конфигурация**: eslint.config.mjs (flat config)
- **Правила**: TypeScript recommended + Prettier integration

#### 2. Build Job

- **Цел**: Компилиране на TypeScript код
- **Команда**: `npm run build`
- **Проверява**: Type errors и compilation issues
- **Зависимост**: Изпълнява се след успешен lint

#### 3. Test Job

- **Цел**: Изпълнение на unit тестове с coverage
- **Framework**: Jest с ts-jest
- **Coverage threshold**: 90%
- **Зависимост**: Изпълнява се след успешен build
- **Artifacts**: Coverage report се качва за анализ

### Unit Tests Coverage

Проектът включва unit тестове за следните services:

- ✅ AuthService - authentication и password management
- ✅ TreasureHuntService - treasure hunt CRUD операции
- ✅ NotificationsService - notification system
- ✅ UploadsService - S3 file uploads
- ✅ LocationService - location management
- ✅ UserAnswerService - answer submission

### Технологии

- **Backend Framework**: NestJS
- **Language**: TypeScript
- **Testing**: Jest + @nestjs/testing
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Database**: PostgreSQL (TypeORM)
- **Authentication**: JWT
- **File Storage**: AWS S3

### Как да използвате

1. **Клонирайте репото**:

   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Инсталирайте dependencies**:

   ```bash
   npm install
   ```

3. **Изпълнете тестовете локално**:

   ```bash
   npm run test:cov
   ```

4. **Изпълнете linting**:

   ```bash
   npm run lint
   ```

5. **Build проекта**:
   ```bash
   npm run build
   ```

### GitHub Actions Workflow

Workflow-ът се задейства автоматично при:

- Push към main branch
- Pull request към main branch

### Резултати

- ✅ Lint: Проверка за code style violations
- ✅ Build: TypeScript compilation без грешки
- ✅ Test: Unit tests с >90% coverage
- ✅ Artifacts: Coverage report достъпен за изтегляне

### Документация

- **pipeline.txt**: Подробно описание на GitHub Actions workflow, тестове и linter
- **doc.txt**: Reflection документ с learnings и подобрения
- **SCREENSHOTS_INSTRUCTIONS.txt**: Инструкции за създаване на screenshots

### Автор

Дипломна работа - Автоматизация на CI/CD процеси с GitHub Actions

### Забележки

- TypeScript errors в .spec.ts файловете в IDE са нормални - Jest ги изпълнява успешно
- Environment variables за тестовете са hardcoded в ci.yml
- Coverage threshold е настроен на 90% и може да се промени в ci.yml (ред 111)
