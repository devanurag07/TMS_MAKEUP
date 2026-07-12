import { getStoredSalon, type CurrentSalonPayload } from "@/core/utils/salon-storage";

export type SalonServiceId = "makeup-advisor";

const SERVICE_FLAG_KEY: Record<
  SalonServiceId,
  keyof Pick<CurrentSalonPayload, "makeup_enabled">
> = {
  "makeup-advisor": "makeup_enabled",
};

export function isSalonServiceEnabled(
  service: SalonServiceId,
  salon?: CurrentSalonPayload | null
): boolean {
  const data = salon ?? getStoredSalon();
  if (!data) return true;

  const flag = data[SERVICE_FLAG_KEY[service]];
  return flag !== false;
}
