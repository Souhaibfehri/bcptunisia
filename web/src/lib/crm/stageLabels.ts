const LABELS: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  proposal: "Proposition",
  proposal_sent: "Proposition envoyée",
  negotiation: "Négociation",
  won: "Gagné",
  lost: "Perdu",
  archived: "Archivé",
};

export function crmStageLabel(stage: string): string {
  return LABELS[stage] ?? stage;
}
