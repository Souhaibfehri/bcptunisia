import Link from "next/link";
import { CalendarDays, FileText, FolderKanban, Palmtree } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { embedOne } from "@/lib/supabase/embed";
import { Card } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/button-variants";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";

export const dynamic = "force-dynamic";

export default async function WorkspaceHomePage() {
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) return null;

  const { data: emp } = await supabase
    .from("hr_employees")
    .select("id, job_title, employment_status, hire_date, hr_departments ( name )")
    .eq("user_id", profile.id)
    .maybeSingle();

  const { count: pendingLeave } = emp
    ? await supabase
        .from("hr_leave_requests")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", emp.id)
        .eq("status", "pending")
    : { count: 0 };

  const { count: payslipCount } = emp
    ? await supabase
        .from("hr_payslips")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", emp.id)
    : { count: 0 };

  const dep = embedOne<{ name: string }>(emp?.hr_departments);

  return (
    <div className="space-y-8">
      <Card accent elevated className="border-bcp-gold/25 bg-gradient-to-br from-white via-bcp-cream/30 to-bcp-surface/40">
        <SectionHeader
          title="Vue d'ensemble"
          description={`${emp?.job_title || "Fiche employé"}${dep?.name ? ` · ${dep.name}` : ""}`}
        />
        <h2 className="mt-2 text-xl font-semibold text-bcp-navy">{profile.display_name || profile.email || "Bienvenue"}</h2>
        <p className="mt-2 text-xs text-bcp-muted">Statut RH : {emp?.employment_status ?? "—"}</p>
        <Link href="/employee/profile" className={buttonClass({ variant: "primary", size: "sm", className: "mt-5 inline-flex" })}>
          Voir ma fiche
        </Link>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/employee/leave" className="block transition hover:opacity-[0.98]">
          <StatCard
            label="Congés"
            value={pendingLeave ?? 0}
            hint="Demande(s) en attente de traitement"
            tone="amber"
            icon={Palmtree}
            className="h-full border-bcp-border/90 hover:shadow-lg"
          />
        </Link>
        <Link href="/employee/calendar" className="block transition hover:opacity-[0.98]">
          <StatCard
            label="Calendrier"
            value="→"
            hint="Semaine, deux semaines ou mois — congés et équipe"
            tone="navy"
            icon={CalendarDays}
            className="h-full border-bcp-border/90 hover:shadow-lg [&_.text-2xl]:text-lg"
          />
        </Link>
        <Link href="/employee/payslips" className="block transition hover:opacity-[0.98]">
          <StatCard
            label="Bulletins de paie"
            value={payslipCount ?? 0}
            hint="Fichiers disponibles au téléchargement"
            tone="emerald"
            icon={FileText}
            className="h-full border-bcp-border/90 hover:shadow-lg"
          />
        </Link>
        <Link href="/employee/projects" className="block transition hover:opacity-[0.98] sm:col-span-2 lg:col-span-1">
          <StatCard
            label="Projets & tâches"
            value="Ouvrir"
            hint="Affectations et avancement sur les chantiers"
            tone="gold"
            icon={FolderKanban}
            className="h-full border-bcp-border/90 hover:shadow-lg [&_.text-2xl]:text-lg"
          />
        </Link>
      </div>
    </div>
  );
}
