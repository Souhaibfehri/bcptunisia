/**
 * When an employee onboarding/tutorial flow is added, only include CRM / Leads steps
 * if this returns true (same conditions as employee-path CRM in the app).
 */
export function includeCrmStepsInEmployeeTutorial(canAccessEmployeeCrm: boolean): boolean {
  return canAccessEmployeeCrm;
}
