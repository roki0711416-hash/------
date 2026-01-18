export type MachineType = "juggler" | "hanahana" | "smartAT";

// Legacy kind used by the tap-based graph endpoint.
export type SlumpGraphKind = "jugg" | "hanahana" | "smart-at";

export function parseMachineType(v: unknown): MachineType | null {
  if (v === "juggler" || v === "hanahana" || v === "smartAT") return v;
  return null;
}

export function parseSlumpGraphKind(v: unknown): SlumpGraphKind | null {
  if (v === "jugg" || v === "hanahana" || v === "smart-at") return v;
  return null;
}

export function machineTypeToSlumpGraphKind(t: MachineType): SlumpGraphKind {
  if (t === "juggler") return "jugg";
  if (t === "hanahana") return "hanahana";
  return "smart-at";
}

export function slumpGraphKindToMachineType(k: SlumpGraphKind): MachineType {
  if (k === "jugg") return "juggler";
  if (k === "hanahana") return "hanahana";
  return "smartAT";
}
