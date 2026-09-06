import type {
  AuditLog,
  CashReconciliation,
  Delivery,
  DeliveryEvent,
  DispatchOffer,
  EarningLine,
  FraudSignal,
  IdempotencyRecord,
  InAppNotification,
  LocationPing,
  OtpRecord,
  PlatformConfig,
  ProofOfDelivery,
  RiderDocument,
  RiderProfile,
  SafetyIncident,
  Settlement,
  SupportTicket,
} from "./types.ts";

export type DateRange = { from: string; to: string };

export interface RiderStore {
  getConfig(): Promise<PlatformConfig>;
  saveConfig(cfg: PlatformConfig): Promise<void>;

  getRiderByUserId(userId: string): Promise<RiderProfile | null>;
  getRiderById(id: string): Promise<RiderProfile | null>;
  upsertRider(rider: RiderProfile): Promise<void>;
  insertDocument(doc: RiderDocument, userId: string): Promise<void>;
  listDocuments(userId: string): Promise<RiderDocument[]>;

  getOpenOfferForRider(riderId: string): Promise<DispatchOffer | null>;
  getOfferById(id: string): Promise<DispatchOffer | null>;
  insertOffer(offer: DispatchOffer, userId: string): Promise<void>;
  updateOffer(offer: DispatchOffer): Promise<boolean>;
  /** Exclusive CAS: OPEN + matching rider → nextStatus. Second writer loses. */
  casOffer(
    id: string,
    riderId: string,
    nextStatus: DispatchOffer["status"],
  ): Promise<DispatchOffer | null>;

  getActiveDeliveryForRider(riderId: string): Promise<Delivery | null>;
  getDeliveryById(id: string): Promise<Delivery | null>;
  listDeliveriesForUser(userId: string, range?: DateRange): Promise<Delivery[]>;
  insertDelivery(d: Delivery): Promise<void>;
  updateDelivery(d: Delivery): Promise<void>;

  insertEvent(e: DeliveryEvent, userId: string): Promise<void>;
  listEvents(deliveryId: string): Promise<DeliveryEvent[]>;

  getOtp(deliveryId: string): Promise<OtpRecord | null>;
  saveOtp(r: OtpRecord, userId: string): Promise<void>;

  insertPod(p: ProofOfDelivery, userId: string): Promise<void>;
  listPod(deliveryId: string): Promise<ProofOfDelivery[]>;

  getCash(deliveryId: string): Promise<CashReconciliation | null>;
  saveCash(c: CashReconciliation, userId: string): Promise<void>;

  appendEarning(line: EarningLine, userId: string): Promise<void>;
  listEarnings(userId: string, range?: DateRange): Promise<EarningLine[]>;
  /** Historical lines must never be updated. Always throws. */
  mutateEarning(_id: string): Promise<never>;

  listSettlements(userId: string): Promise<Settlement[]>;
  insertSettlement(s: Settlement, userId: string): Promise<void>;
  updateSettlementStatus(
    id: string,
    userId: string,
    status: Settlement["status"],
    confirmedPaidAt: string | null,
  ): Promise<void>;

  insertTicket(t: SupportTicket, userId: string): Promise<void>;
  listTickets(userId: string): Promise<SupportTicket[]>;

  insertSafety(s: SafetyIncident, userId: string): Promise<void>;
  listSafety(userId: string): Promise<SafetyIncident[]>;

  insertNotification(n: InAppNotification): Promise<void>;
  listNotifications(userId: string): Promise<InAppNotification[]>;

  appendAudit(a: AuditLog): Promise<void>;
  insertSignal(s: FraudSignal, userId: string): Promise<void>;

  getIdempotency(userId: string, key: string): Promise<IdempotencyRecord | null>;
  saveIdempotency(r: IdempotencyRecord): Promise<void>;

  insertLocation(p: LocationPing, userId: string): Promise<void>;
  pruneLocations(userId: string, keepAfterIso: string, maxRows: number): Promise<void>;
  latestLocation(userId: string): Promise<LocationPing | null>;

  hitRateLimit(userId: string, action: string, windowMs: number, max: number): Promise<boolean>;
}
