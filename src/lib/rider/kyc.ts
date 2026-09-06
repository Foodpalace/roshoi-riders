import { RiderError, type KycStatus } from "./types.ts";

/** Rider-initiated KYC moves. VERIFIED / SUSPENDED are admin/Window 4 only. */
export const RIDER_KYC_TRANSITIONS: Record<KycStatus, ReadonlyArray<KycStatus>> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["SUBMITTED"],
  UNDER_REVIEW: ["SUBMITTED"],
  REJECTED: ["SUBMITTED"],
  VERIFIED: [],
  SUSPENDED: [],
};

export const ADMIN_KYC_STATUSES: ReadonlyArray<KycStatus> = [
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
];

export function assertNotSelfVerify(next: KycStatus): void {
  if (next === "VERIFIED" || next === "SUSPENDED") {
    throw new RiderError("KYC_FORBIDDEN", "Partners cannot verify or suspend themselves", 403);
  }
}

export function assertRiderKycSubmit(from: KycStatus): void {
  if (from === "SUSPENDED") {
    throw new RiderError("KYC", "Suspended partners cannot resubmit verification", 403);
  }
  if (from === "VERIFIED") {
    throw new RiderError("KYC", "Already verified", 400);
  }
  const allowed = RIDER_KYC_TRANSITIONS[from];
  if (!allowed.includes("SUBMITTED") && from !== "SUBMITTED" && from !== "UNDER_REVIEW") {
    throw new RiderError("KYC", "Verification cannot be submitted in this state", 400);
  }
}

export function isKycBlockingLiveDuty(status: KycStatus): boolean {
  return status !== "VERIFIED";
}
