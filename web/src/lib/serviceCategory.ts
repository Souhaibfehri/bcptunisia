import type { DivisionId } from "@/data/services";

export function divisionToFormCategory(id: DivisionId): string {
  const m: Record<DivisionId, string> = {
    "fire-safety": "fire",
    "electronic-security": "security",
    "industrial-fluids": "fluids",
    "industrial-electrical": "electrical",
    "engineering-services": "engineering",
  };
  return m[id];
}
