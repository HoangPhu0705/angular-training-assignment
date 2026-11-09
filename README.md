# Family Finance Management — Angular Frontend

Angular frontend for a family monthly budget app. A month's income is split across seven
fixed jars, expenses are recorded against a jar, and spending is tracked per jar. All amounts
are whole VND, and the backend API is authoritative for every financial calculation.

## Features

| Feature | Route | What it does |
|---|---|---|
| F1 Monthly planning | `/monthly-planning` | Pick year/month, enter income, see the seven default jars, create the plan |
| F2 Income allocation | `/monthly-plans/:year/:month` | Show income and each jar's rate and backend-calculated budget |
| F3 Add expense | `/expenses/new` | Date, jar, amount, description; shows the jar's spent/remaining after saving |
| Spending by jar | `/monthly-plans/:year/:month/spending` | Planned vs spent per jar with progress bars, 0% and over-budget states |
| Home | `/dashboard` | Choose a month and jump to its plan, spending or a new expense |

Every page handles loading, missing plan (404), validation, conflict and general error states.

## Prerequisites

- Node.js 22.22+ or 24.15+, npm 10+
- The Family Finance REST API running locally (provided in `backend/`), which needs the .NET SDK
  (targets `net8.0`; with only a newer runtime, use `-p:RollForward=Major`)
- Trusted .NET dev certificate: `dotnet dev-certs https --trust`

## API base URL

Set `apiBaseUrl` in `frontend/src/environments/environment.ts` (default `https://localhost:54535`).

The frontend must run on port **4400**, the only origin the API's CORS policy allows
(already configured in `frontend/angular.json`).

## Install and run

```bash
# 1. Start the API
cd backend/FamilyFinance.Api
dotnet run -p:RollForward=Major

# 2. Start the frontend (in another terminal)
cd frontend
npm install
npm start                 # http://localhost:4400
```

## Tests

```bash
cd frontend
npm test                  # unit tests (Vitest)
npm run test:coverage     # unit tests with coverage report in frontend/coverage/
```

## Demo flow

1. `/monthly-planning`: create a plan for a month with a positive income.
2. You land on the allocation page with the seven jar budgets.
3. Add expense: pick a date and jar, enter amount and description, save.
4. Spending by jar: see the saved expense reflected in that jar's spent amount and progress.

## Project structure

```
frontend/src/app/
├── app.routes.ts          Routes (lazy-loaded pages)
├── constants/             API endpoint URLs
├── models/                Types matching the API contract
├── core/
│   ├── services/          budget-plan-api.service.ts: all HTTP calls
│   ├── guards/            Rejects invalid /monthly-plans/:year/:month URLs
│   ├── http/, rxjs/       Error mapping, loading/success/error state helper
│   └── utils/             Date, period and VND string helpers
├── shared/
│   ├── components/        Page shell, header, sidebar, jar card, progress bar, loading/error/missing-plan states
│   ├── directives/        Digits-only input
│   ├── pipes/             VND formatting
│   └── validators/        Form validators
└── features/              One folder per page
    ├── home/
    ├── monthly-planning/
    ├── income-allocation/
    ├── expenses/
    └── spending-by-jar/
```

Page components load data and hold state, components in `components/` folders only display
what they are given, and the API service owns all HTTP calls. The frontend never calculates
money; VND values stay digit strings and are only formatted for display.

Requirements, API specifications and test cases are in `docs/`.
