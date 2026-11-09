export type JarType =
  'livingExpenses' | 'food' | 'children' | 'emergencyFund' | 'savings' | 'investment' | 'entertainmentAndTravel';

export interface DefaultJar {
  jarType: JarType;
  name: string;
  percentage: number;
  suggestedLogic: string;
}

export interface DefaultJarsResponse {
  currency: 'VND';
  totalPercentage: number;
  jars: DefaultJar[];
}

export interface CreateMonthlyPlanRequest {
  year: number;
  month: number;
  monthlyIncomeVnd: string;
}

export interface MonthlyPlanJar {
  jarType: JarType;
  name: string;
  percentage: number;
  budgetVnd: string;
}

export interface MonthlyPlanResponse {
  id: number;
  year: number;
  month: number;
  monthlyIncomeVnd: string;
  currency: 'VND';
  createdAtUtc: string;
  jars: MonthlyPlanJar[];
}
