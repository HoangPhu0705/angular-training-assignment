import { JarType } from '../models/budget-plan.model';

// Presentation only; jar names and rates always come from the API.
export interface JarTheme {
  cssClass: string;
  colorVar: string;
}

export const JAR_THEME: Record<JarType, JarTheme> = {
  livingExpenses: { cssClass: 'jar-living', colorVar: '--f1-jar-living' },
  food: { cssClass: 'jar-food', colorVar: '--f1-jar-food' },
  children: { cssClass: 'jar-children', colorVar: '--f1-jar-children' },
  emergencyFund: { cssClass: 'jar-emergency', colorVar: '--f1-jar-emergency' },
  savings: { cssClass: 'jar-savings', colorVar: '--f1-jar-savings' },
  investment: { cssClass: 'jar-investment', colorVar: '--f1-jar-investment' },
  entertainmentAndTravel: { cssClass: 'jar-travel', colorVar: '--f1-jar-travel' }
};
