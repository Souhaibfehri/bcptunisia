"use client";

import { useState, useTransition } from "react";
import { createProjectFull } from "@/app/admin/actions";

type Client = { id: string; name: string };
type UserOption = { id: string; email: string; display_name: string | null; role: string };
type MemberEntry = { email: string; role: string };
type MilestoneEntry = { title: string; target_on: string };
type StageEntry = { title: string; tasks: string[] };

const STEPS = ["Client", "Projet", "Équipe", "Structure", "Résumé"] as const;

const TEMPLATE_PRESETS: Record<string, { stages: StageEntry[]; milestones: MilestoneEntry[] }> = {
  standard: {
    stages: [
      { title: "Cadrage & Analyse", tasks: ["Recueil des besoins", "Étude de faisabilité", "Cahier des charges"] },
      { title: "Conception", tasks: ["Maquettes / Wireframes", "Architecture technique", "Validation client"] },
      { title: "Développement", tasks: ["Sprint 1", "Sprint 2", "Tests unitaires"] },
      { title: "Recette & Livraison", tasks: ["Tests d'intégration", "Formation utilisateurs", "Mise en production"] },
    ],
    milestones: [
      { title: "Validation du cadrage", target_on: "" },
      { title: "Livraison v1", target_on: "" },
      { title: "Go-live", target_on: "" },
    ],
  },
  simple: {
    stages: [
      { title: "Préparation", tasks: ["Définition du périmètre"] },
      { title: "Exécution", tasks: ["Réalisation des livrables"] },
      { title: "Clôture", tasks: ["Livraison finale", "Bilan"] },
    ],
    milestones: [
      { title: "Démarrage", target_on: "" },
      { title: "Livraison", target_on: "" },
    ],
  },
};

export function ProjectOnboardingWizard({
  clients,
  internalUsers,
  clientUsers,
}: {
  clients: Client[];
  internalUsers: UserOption[];
  clientUsers: UserOption[];
}) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [objective, setObjective] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [status, setStatus] = useState("active");

  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("client_contact");

  const [milestones, setMilestones] = useState<MilestoneEntry[]>([]);
  const [msTitle, setMsTitle] = useState("");
  const [msDate, setMsDate] = useState("");

  const [stages, setStages] = useState<StageEntry[]>([]);
  const [stageTitle, setStageTitle] = useState("");

  const addMember = () => {
    if (!memberEmail.trim()) return;
    setMembers((prev) => [...prev, { email: memberEmail.trim(), role: memberRole }]);
    setMemberEmail("");
  };

  const addMilestone = () => {
    if (!msTitle.trim()) return;
    setMilestones((prev) => [...prev, { title: msTitle.trim(), target_on: msDate }]);
    setMsTitle("");
    setMsDate("");
  };

  const addStage = () => {
    if (!stageTitle.trim()) return;
    setStages((prev) => [...prev, { title: stageTitle.trim(), tasks: [] }]);
    setStageTitle("");
  };

  const addTaskToStage = (idx: number, taskTitle: string) => {
    if (!taskTitle.trim()) return;
    setStages((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, tasks: [...s.tasks, taskTitle.trim()] } : s)),
    );
  };

  const clientLabel = clientId
    ? clients.find((c) => c.id === clientId)?.name ?? "—"
    : newClientName || "—";

  const canNext = () => {
    if (step === 0) return clientId || newClientName.trim();
    if (step === 1) return name.trim();
    return true;
  };

  const handleSubmit = () => {
    const payload = {
      client_id: clientId,
      new_client_name: newClientName.trim() || undefined,
      name: name.trim(),
      summary: summary.trim() || null,
      objective: objective.trim() || null,
      starts_on: startsOn || null,
      ends_on: endsOn || null,
      status,
      members,
      milestones,
      stages,
    };
    const fd = new FormData();
    fd.set("payload", JSON.stringify(payload));
    startTransition(() => {
      createProjectFull(fd);
    });
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i <= step && setStep(i)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
              i === step
                ? "bg-bcp-navy text-white shadow-sm"
                : i < step
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-bcp-surface text-bcp-muted"
            }`}
          >
            {i < step ? <span className="text-[0.65rem]">&#10003;</span> : <span>{i + 1}.</span>}
            {label}
          </button>
        ))}
      </div>

      {/* Step 0: Client */}
      {step === 0 && (
        <div className="space-y-4 rounded-2xl border border-bcp-border bg-white p-6">
          <h2 className="text-sm font-semibold text-bcp-anthracite">Sélectionner ou créer un client</h2>
          <select
            value={clientId}
            onChange={(e) => { setClientId(e.target.value); setNewClientName(""); }}
            className="w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
          >
            <option value="">— Nouveau client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {!clientId && (
            <div>
              <input
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Nom de la nouvelle entreprise"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${!clientId && !newClientName.trim() ? "border-amber-300" : "border-bcp-border"}`}
              />
              {!clientId && !newClientName.trim() && (
                <p className="mt-1 text-xs text-amber-600">Sélectionnez un client existant ou saisissez un nouveau nom.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Project Details */}
      {step === 1 && (
        <div className="space-y-4 rounded-2xl border border-bcp-border bg-white p-6">
          <h2 className="text-sm font-semibold text-bcp-anthracite">Détails du projet</h2>
          <div>
            <label className="text-xs text-bcp-muted">Nom du projet *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${!name.trim() ? "border-amber-300" : "border-bcp-border"}`}
            />
            {!name.trim() && <p className="mt-1 text-xs text-amber-600">Le nom du projet est obligatoire.</p>}
            {name.trim() && <p className="mt-1 text-xs text-bcp-muted">{name.trim().length} caractère(s)</p>}
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Résumé</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Objectif / Périmètre</label>
            <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs text-bcp-muted">Date de début</label>
              <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Date de fin cible</label>
              <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Statut initial</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm">
                <option value="active">Actif</option>
                <option value="draft">Brouillon</option>
                <option value="on_hold">En pause</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Team */}
      {step === 2 && (
        <div className="space-y-4 rounded-2xl border border-bcp-border bg-white p-6">
          <h2 className="text-sm font-semibold text-bcp-anthracite">Assigner l'équipe</h2>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px] flex-1">
              <label className="text-xs text-bcp-muted">E-mail</label>
              <input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} type="email" placeholder="email@exemple.com" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Rôle</label>
              <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)} className="mt-1 rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="project_manager">Chef de projet</option>
                <option value="team_member">Équipe interne</option>
                <option value="client_contact">Contact client</option>
              </select>
            </div>
            <button type="button" onClick={addMember} className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">Ajouter</button>
          </div>

          {internalUsers.length > 0 && (
            <div className="mt-3 space-y-3">
              {!members.some((m) => m.role === "project_manager") && internalUsers.length > 0 && (
                <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                  <p className="text-xs font-medium text-violet-700">Suggestion : assigner un chef de projet</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {internalUsers
                      .filter((u) => u.role === "admin" || u.role === "super_admin" || u.role === "project_manager")
                      .slice(0, 5)
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setMembers((prev) => [...prev, { email: u.email, role: "project_manager" }])}
                          className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 hover:bg-violet-200"
                        >
                          + {u.display_name || u.email}
                        </button>
                      ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-bcp-muted">Raccourci : utilisateurs internes</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {internalUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        if (!members.some((m) => m.email === u.email)) {
                          setMembers((prev) => [...prev, { email: u.email, role: "team_member" }]);
                        }
                      }}
                      className="rounded-full border border-bcp-border px-2 py-0.5 text-xs hover:bg-bcp-surface"
                    >
                      + {u.display_name || u.email}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {members.length > 0 && (
            <ul className="mt-4 space-y-1">
              {members.map((m, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-bcp-surface/60 px-3 py-2 text-sm">
                  <span>{m.email} <span className="text-xs text-bcp-muted">({m.role})</span></span>
                  <button type="button" onClick={() => setMembers((prev) => prev.filter((_, j) => j !== i))} className="text-xs text-red-500">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Step 3: Structure */}
      {step === 3 && (
        <div className="space-y-6 rounded-2xl border border-bcp-border bg-white p-6">
          <h2 className="text-sm font-semibold text-bcp-anthracite">Structure initiale (optionnel)</h2>

          {stages.length === 0 && milestones.length === 0 && (
            <div className="rounded-xl border border-dashed border-bcp-gold/40 bg-bcp-cream/30 p-4">
              <p className="text-xs font-medium text-bcp-anthracite">Modèles de démarrage rapide</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(TEMPLATE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setStages(preset.stages); setMilestones(preset.milestones); }}
                    className="rounded-full border border-bcp-gold/50 bg-white px-3 py-1.5 text-xs font-medium text-bcp-anthracite shadow-sm hover:bg-bcp-gold/10"
                  >
                    {key === "standard" ? "Projet standard (4 étapes)" : "Projet simple (3 étapes)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-bcp-muted">Jalons</p>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <input value={msTitle} onChange={(e) => setMsTitle(e.target.value)} placeholder="Titre du jalon" className="min-w-[160px] flex-1 rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <input type="date" value={msDate} onChange={(e) => setMsDate(e.target.value)} className="rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <button type="button" onClick={addMilestone} className="rounded-full border border-bcp-border px-3 py-2 text-xs font-medium">+ Jalon</button>
            </div>
            {milestones.length > 0 && (
              <ul className="mt-2 space-y-1">
                {milestones.map((ms, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-bcp-surface/60 px-3 py-1.5 text-sm">
                    <span>{ms.title} {ms.target_on && <span className="text-xs text-bcp-muted">({ms.target_on})</span>}</span>
                    <button type="button" onClick={() => setMilestones((prev) => prev.filter((_, j) => j !== i))} className="text-xs text-red-500">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-bcp-muted">Étapes (pipeline)</p>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <input value={stageTitle} onChange={(e) => setStageTitle(e.target.value)} placeholder="Titre de l'étape" className="min-w-[160px] flex-1 rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <button type="button" onClick={addStage} className="rounded-full border border-bcp-border px-3 py-2 text-xs font-medium">+ Étape</button>
            </div>
            {stages.map((s, si) => (
              <div key={si} className="mt-3 rounded-xl border border-bcp-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-bcp-anthracite">{s.title}</p>
                  <button type="button" onClick={() => setStages((prev) => prev.filter((_, j) => j !== si))} className="text-xs text-red-500">✕</button>
                </div>
                {s.tasks.map((t, ti) => (
                  <p key={ti} className="ml-4 mt-1 text-xs text-bcp-muted">• {t}</p>
                ))}
                <TaskAdder onAdd={(title) => addTaskToStage(si, title)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4 rounded-2xl border border-bcp-border bg-white p-6">
          <h2 className="text-sm font-semibold text-bcp-anthracite">Résumé du projet</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-bcp-muted">Client</dt><dd className="font-medium text-bcp-anthracite">{clientLabel}</dd></div>
            <div><dt className="text-xs text-bcp-muted">Nom</dt><dd className="font-medium text-bcp-anthracite">{name}</dd></div>
            {summary && <div className="sm:col-span-2"><dt className="text-xs text-bcp-muted">Résumé</dt><dd className="text-bcp-anthracite">{summary}</dd></div>}
            {objective && <div className="sm:col-span-2"><dt className="text-xs text-bcp-muted">Objectif</dt><dd className="text-bcp-anthracite">{objective}</dd></div>}
            {startsOn && <div><dt className="text-xs text-bcp-muted">Début</dt><dd>{startsOn}</dd></div>}
            {endsOn && <div><dt className="text-xs text-bcp-muted">Fin cible</dt><dd>{endsOn}</dd></div>}
          </dl>
          {members.length > 0 && (
            <div>
              <p className="text-xs font-medium text-bcp-muted">Équipe ({members.length})</p>
              <ul className="mt-1 space-y-0.5 text-sm">{members.map((m, i) => <li key={i}>{m.email} — {m.role}</li>)}</ul>
            </div>
          )}
          {milestones.length > 0 && (
            <div>
              <p className="text-xs font-medium text-bcp-muted">Jalons ({milestones.length})</p>
              <ul className="mt-1 space-y-0.5 text-sm">{milestones.map((ms, i) => <li key={i}>{ms.title} {ms.target_on && `(${ms.target_on})`}</li>)}</ul>
            </div>
          )}
          {stages.length > 0 && (
            <div>
              <p className="text-xs font-medium text-bcp-muted">Étapes ({stages.length})</p>
              <ul className="mt-1 space-y-0.5 text-sm">{stages.map((s, i) => <li key={i}>{s.title} — {s.tasks.length} tâche(s)</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full border border-bcp-border px-4 py-2 text-xs font-medium text-bcp-muted disabled:opacity-30"
        >
          ← Précédent
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-semibold text-bcp-anthracite disabled:opacity-40"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="rounded-full bg-bcp-navy px-6 py-2 text-xs font-semibold text-white disabled:opacity-40"
          >
            {isPending ? "Création…" : "Créer le projet"}
          </button>
        )}
      </div>
    </div>
  );
}

function TaskAdder({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Nouvelle tâche"
        className="min-w-0 flex-1 rounded-lg border border-bcp-border px-2 py-1 text-xs"
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(val); setVal(""); } }}
      />
      <button type="button" onClick={() => { onAdd(val); setVal(""); }} className="text-xs font-medium text-bcp-gold">+ Tâche</button>
    </div>
  );
}
