import type { SupabaseClient } from "@supabase/supabase-js";

/** Inclusive calendar days (date-only strings `YYYY-MM-DD`). */
export function inclusiveCalendarDays(startsOn: string, endsOn: string): number {
  const a = new Date(`${startsOn}T12:00:00`);
  const b = new Date(`${endsOn}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return diff + 1;
}

async function applyDeltaToBalanceRow(
  supabase: SupabaseClient,
  employeeId: string,
  leaveTypeId: string,
  year: number,
  delta: number,
): Promise<void> {
  const { data: row } = await supabase
    .from("hr_leave_balances")
    .select("id, balance_days")
    .eq("employee_id", employeeId)
    .eq("leave_type_id", leaveTypeId)
    .eq("year", year)
    .maybeSingle();

  if (row) {
    await supabase
      .from("hr_leave_balances")
      .update({
        balance_days: Number(row.balance_days) + delta,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  } else {
    await supabase.from("hr_leave_balances").insert({
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      year,
      balance_days: delta,
    });
  }
}

/** After HR/manager approves a paid leave request: one movement + balance update (idempotent). */
export async function recordApprovedLeaveConsumption(
  supabase: SupabaseClient,
  params: {
    requestId: string;
    employeeId: string;
    leaveTypeId: string;
    startsOn: string;
    endsOn: string;
    decidedBy: string;
  },
): Promise<{ error?: string }> {
  const { data: lt } = await supabase.from("hr_leave_types").select("paid").eq("id", params.leaveTypeId).maybeSingle();
  if (!lt?.paid) return {};

  const days = inclusiveCalendarDays(params.startsOn, params.endsOn);
  if (days <= 0) return {};
  const year = new Date(`${params.startsOn}T12:00:00`).getFullYear();
  const delta = -days;

  const { error: insErr } = await supabase.from("hr_leave_balance_movements").insert({
    employee_id: params.employeeId,
    leave_type_id: params.leaveTypeId,
    year,
    delta_days: delta,
    reference_type: "leave_request",
    reference_id: params.requestId,
    note: `Congé approuvé ${params.startsOn} → ${params.endsOn} (${days} j.)`,
    created_by: params.decidedBy,
  });

  if (insErr) {
    if (insErr.code === "23505") return {};
    return { error: insErr.message };
  }

  await applyDeltaToBalanceRow(supabase, params.employeeId, params.leaveTypeId, year, delta);
  return {};
}

export async function recordManualBalanceMovement(
  supabase: SupabaseClient,
  params: {
    employeeId: string;
    leaveTypeId: string;
    year: number;
    deltaDays: number;
    note: string;
    createdBy: string;
  },
): Promise<{ error?: string }> {
  const { error: insErr } = await supabase.from("hr_leave_balance_movements").insert({
    employee_id: params.employeeId,
    leave_type_id: params.leaveTypeId,
    year: params.year,
    delta_days: params.deltaDays,
    reference_type: "manual",
    note: params.note,
    created_by: params.createdBy,
  });
  if (insErr) return { error: insErr.message };
  await applyDeltaToBalanceRow(supabase, params.employeeId, params.leaveTypeId, params.year, params.deltaDays);
  return {};
}
