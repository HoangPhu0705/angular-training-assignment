// Validates API responses before rendering money; never computes amounts.
import { DefaultJarsResponse, JarType, MonthlyPlanResponse } from '../../models/budget-plan.model';
import { SpendingByJarsResponse } from '../../models/spending.model';
import { isDigitString } from './vnd';

const KNOWN_JAR_TYPES: readonly string[] = [
  'livingExpenses',
  'food',
  'children',
  'emergencyFund',
  'savings',
  'investment',
  'entertainmentAndTravel'
] satisfies JarType[];

function hasSevenKnownUniqueJars(jars: readonly { jarType: string }[]): boolean {
  const types = jars.map((jar) => jar.jarType);
  return types.length === 7 && new Set(types).size === 7 && types.every((type) => KNOWN_JAR_TYPES.includes(type));
}

function hasIntegerRatesTotalling100(jars: readonly { percentage: number }[]): boolean {
  return (
    jars.every((jar) => Number.isInteger(jar.percentage)) && jars.reduce((sum, jar) => sum + jar.percentage, 0) === 100
  );
}

export function isValidDefaultJars(response: DefaultJarsResponse): boolean {
  return (
    response?.currency === 'VND' &&
    Array.isArray(response.jars) &&
    hasSevenKnownUniqueJars(response.jars) &&
    hasIntegerRatesTotalling100(response.jars)
  );
}

export function isValidMonthlyPlan(plan: MonthlyPlanResponse): boolean {
  return (
    plan?.currency === 'VND' &&
    typeof plan.monthlyIncomeVnd === 'string' &&
    isDigitString(plan.monthlyIncomeVnd) &&
    Array.isArray(plan.jars) &&
    hasSevenKnownUniqueJars(plan.jars) &&
    hasIntegerRatesTotalling100(plan.jars) &&
    plan.jars.every((jar) => typeof jar.budgetVnd === 'string' && isDigitString(jar.budgetVnd))
  );
}

export function isValidSpending(response: SpendingByJarsResponse): boolean {
  return (
    response?.currency === 'VND' &&
    Array.isArray(response.jars) &&
    hasSevenKnownUniqueJars(response.jars) &&
    response.jars.every(
      (jar) =>
        typeof jar.plannedBudgetVnd === 'string' &&
        isDigitString(jar.plannedBudgetVnd) &&
        typeof jar.spentBudgetVnd === 'string' &&
        isDigitString(jar.spentBudgetVnd) &&
        Number.isFinite(jar.percentageUsed) &&
        jar.percentageUsed >= 0
    )
  );
}
