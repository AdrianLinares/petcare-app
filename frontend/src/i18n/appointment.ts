import { TFunction } from "i18next";

const KNOWN_TYPES = [
  "checkup",
  "vaccination",
  "emergency",
  "surgery",
  "dental",
  "grooming",
  "followup",
  "consultation",
];

/**
 * Translate an appointment type value to its display name.
 * Normalizes the raw type to lowercase if it doesn't match a known enum,
 * then falls back to the raw value if no i18n key exists.
 */
export const translateAppointmentType = (t: TFunction, type: string): string => {
  const key = KNOWN_TYPES.includes(type) ? type : type.toLowerCase();
  return t(`appointment.types.${key}`, type);
};

/**
 * Translate an appointment status value to its display name.
 * Falls back to the raw status value if no i18n key exists.
 */
export const translateAppointmentStatus = (t: TFunction, status: string): string => {
  return t(`appointment.status.${status}`, status);
};
