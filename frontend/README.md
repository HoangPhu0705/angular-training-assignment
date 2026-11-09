# Family Finance — Angular Frontend

## Prerequisites

- Node.js 22.22+ or 24.15+, npm 10+
- .NET SDK (backend targets `net8.0`; with only a newer runtime, use `-p:RollForward=Major` below)
- Trusted .NET dev certificate: `dotnet dev-certs https --trust`

## API base URL

Set in `src/environments/environment.ts` (default `https://localhost:54535`).
The frontend must run on port **4400**, the only origin the backend's CORS policy allows (already set in `angular.json`).

## Install and run

```bash
# backend
cd backend/FamilyFinance.Api
dotnet run -p:RollForward=Major

# frontend
cd frontend
npm install
npm start                 # http://localhost:4400
npm test                  # unit tests
npm run test:coverage     # unit tests with coverage
```

## Project structure

```
src/app/
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
    ├── home/              /dashboard
    ├── monthly-planning/  F1  /monthly-planning
    ├── income-allocation/ F2  /monthly-plans/:year/:month
    ├── expenses/          F3  /expenses/new
    └── spending-by-jar/       /monthly-plans/:year/:month/spending
```

Page components load data and hold state; components in `components/` folders only display what they're given; the service owns HTTP.
