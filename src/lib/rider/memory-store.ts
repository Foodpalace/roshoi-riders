import { DEFAULT_CONFIG } from "./config.ts";
import type { DateRange, RiderStore } from "./store.ts";
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
import { RiderError } from "./types.ts";
import { isActiveDelivery } from "./machine.ts";

export class MemoryStore implements RiderStore {
  config: PlatformConfig = structuredClone(DEFAULT_CONFIG);
  riders = new Map<string, RiderProfile>();
  ridersByUser = new Map<string, string>();
  documents: Array<RiderDocument & { userId: string }> = [];
  offers = new Map<string, DispatchOffer>();
  offerUser = new Map<string, string>();
  deliveries = new Map<string, Delivery>();
  events: DeliveryEvent[] = [];
  otps = new Map<string, OtpRecord>();
  pods: ProofOfDelivery[] = [];
  cash = new Map<string, CashReconciliation>();
  earnings: EarningLine[] = [];
  earningUser = new Map<string, string>();
  settlements: Array<Settlement & { userId: string }> = [];
  tickets: Array<SupportTicket & { userId: string }> = [];
  safety: Array<SafetyIncident & { userId: string }> = [];
  notifications: InAppNotification[] = [];
  audits: AuditLog[] = [];
  signals: Array<FraudSignal & { userId: string }> = [];
  idem = new Map<string, IdempotencyRecord>();
  locations: Array<LocationPing & { userId: string }> = [];
  rateHits: Array<{ userId: string; action: string; at: number }> = [];

  async getConfig() {
    return structuredClone(this.config);
  }
  async saveConfig(cfg: PlatformConfig) {
    this.config = structuredClone(cfg);
  }

  async getRiderByUserId(userId: string) {
    const id = this.ridersByUser.get(userId);
    return id ? structuredClone(this.riders.get(id) ?? null) : null;
  }
  async getRiderById(id: string) {
    const r = this.riders.get(id);
    return r ? structuredClone(r) : null;
  }
  async upsertRider(rider: RiderProfile) {
    this.riders.set(rider.id, structuredClone(rider));
    this.ridersByUser.set(rider.userId, rider.id);
  }

  async insertDocument(doc: RiderDocument, userId: string) {
    this.documents.push({ ...structuredClone(doc), userId });
  }
  async listDocuments(userId: string) {
    return this.documents.filter((d) => d.userId === userId).map((d) => structuredClone(d));
  }

  async getOpenOfferForRider(riderId: string) {
    for (const o of this.offers.values()) {
      if (o.riderId === riderId && o.status === "OPEN") return structuredClone(o);
    }
    return null;
  }
  async getOfferById(id: string) {
    const o = this.offers.get(id);
    return o ? structuredClone(o) : null;
  }
  async insertOffer(offer: DispatchOffer, userId: string) {
    this.offers.set(offer.id, structuredClone(offer));
    this.offerUser.set(offer.id, userId);
  }
  async updateOffer(offer: DispatchOffer) {
    if (!this.offers.has(offer.id)) return false;
    this.offers.set(offer.id, structuredClone(offer));
    return true;
  }
  async casOffer(id: string, riderId: string, nextStatus: DispatchOffer["status"]) {
    const o = this.offers.get(id);
    if (!o || o.riderId !== riderId || o.status !== "OPEN") return null;
    if (nextStatus === "ACCEPTED" && new Date(o.expiresAt).getTime() <= Date.now()) {
      o.status = "EXPIRED";
      return null;
    }
    o.status = nextStatus;
    this.offers.set(id, o);
    return structuredClone(o);
  }

  async getActiveDeliveryForRider(riderId: string) {
    for (const d of this.deliveries.values()) {
      if (d.riderId === riderId && isActiveDelivery(d.state)) return structuredClone(d);
    }
    return null;
  }
  async getDeliveryById(id: string) {
    const d = this.deliveries.get(id);
    return d ? structuredClone(d) : null;
  }
  async listDeliveriesForUser(userId: string, range?: DateRange) {
    return [...this.deliveries.values()]
      .filter((d) => d.userId === userId)
      .filter((d) => {
        if (!range) return true;
        return d.createdAt >= range.from && d.createdAt <= range.to;
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((d) => structuredClone(d));
  }
  async insertDelivery(d: Delivery) {
    this.deliveries.set(d.id, structuredClone(d));
  }
  async updateDelivery(d: Delivery) {
    this.deliveries.set(d.id, structuredClone(d));
  }

  async insertEvent(e: DeliveryEvent, _userId?: string) {
    this.events.push(structuredClone(e));
  }
  async listEvents(deliveryId: string) {
    return this.events.filter((e) => e.deliveryId === deliveryId).map((e) => structuredClone(e));
  }

  async getOtp(deliveryId: string) {
    const r = this.otps.get(deliveryId);
    return r ? structuredClone(r) : null;
  }
  async saveOtp(r: OtpRecord, _userId?: string) {
    this.otps.set(r.deliveryId, structuredClone(r));
  }

  async insertPod(p: ProofOfDelivery, _userId?: string) {
    this.pods.push(structuredClone(p));
  }
  async listPod(deliveryId: string) {
    return this.pods.filter((p) => p.deliveryId === deliveryId);
  }

  async getCash(deliveryId: string) {
    const c = this.cash.get(deliveryId);
    return c ? structuredClone(c) : null;
  }
  async saveCash(c: CashReconciliation, _userId?: string) {
    this.cash.set(c.deliveryId, structuredClone(c));
  }

  async appendEarning(line: EarningLine, userId: string) {
    this.earnings.push(structuredClone(line));
    this.earningUser.set(line.id, userId);
  }
  async listEarnings(userId: string, range?: DateRange) {
    return this.earnings
      .filter((e) => this.earningUser.get(e.id) === userId)
      .filter((e) => {
        if (!range) return true;
        return e.at >= range.from && e.at <= range.to;
      });
  }
  async mutateEarning(_id: string): Promise<never> {
    throw new RiderError("EARNINGS_IMMUTABLE", "Historical earnings cannot be changed", 403);
  }

  async listSettlements(userId: string) {
    return this.settlements.filter((s) => s.userId === userId).map((s) => structuredClone(s));
  }
  async insertSettlement(s: Settlement, userId: string) {
    this.settlements.push({ ...structuredClone(s), userId });
  }
  async updateSettlementStatus(
    id: string,
    userId: string,
    status: Settlement["status"],
    confirmedPaidAt: string | null,
  ) {
    const s = this.settlements.find((x) => x.id === id && x.userId === userId);
    if (!s) throw new RiderError("NOT_FOUND", "Settlement not found", 404);
    s.status = status;
    s.confirmedPaidAt = confirmedPaidAt;
  }

  async insertTicket(t: SupportTicket, userId: string) {
    this.tickets.push({ ...structuredClone(t), userId });
  }
  async listTickets(userId: string) {
    return this.tickets.filter((t) => t.userId === userId).map((t) => structuredClone(t));
  }

  async insertSafety(s: SafetyIncident, userId: string) {
    this.safety.push({ ...structuredClone(s), userId });
  }
  async listSafety(userId: string) {
    return this.safety.filter((s) => s.userId === userId).map((s) => structuredClone(s));
  }

  async insertNotification(n: InAppNotification) {
    this.notifications.push(structuredClone(n));
  }
  async listNotifications(userId: string) {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async appendAudit(a: AuditLog) {
    this.audits.push(structuredClone(a));
  }
  async insertSignal(s: FraudSignal, userId: string) {
    this.signals.push({ ...structuredClone(s), userId });
  }

  async getIdempotency(userId: string, key: string) {
    return this.idem.get(`${userId}:${key}`) ?? null;
  }
  async saveIdempotency(r: IdempotencyRecord) {
    this.idem.set(`${r.userId}:${r.key}`, structuredClone(r));
  }

  async insertLocation(p: LocationPing, userId: string) {
    this.locations.push({ ...structuredClone(p), userId });
  }
  async pruneLocations(userId: string, keepAfterIso: string, maxRows: number) {
    this.locations = this.locations
      .filter((p) => p.userId !== userId || p.at >= keepAfterIso)
      .filter((p, _i, arr) => {
        if (p.userId !== userId) return true;
        const mine = arr.filter((x) => x.userId === userId).sort((a, b) => (a.at < b.at ? 1 : -1));
        return mine.indexOf(p) < maxRows;
      });
  }
  async latestLocation(userId: string) {
    const mine = this.locations.filter((p) => p.userId === userId).sort((a, b) => (a.at < b.at ? 1 : -1));
    return mine[0] ?? null;
  }

  async hitRateLimit(userId: string, action: string, windowMs: number, max: number) {
    const now = Date.now();
    this.rateHits = this.rateHits.filter((h) => now - h.at < windowMs * 4);
    const n = this.rateHits.filter(
      (h) => h.userId === userId && h.action === action && now - h.at < windowMs,
    ).length;
    this.rateHits.push({ userId, action, at: now });
    return n >= max;
  }
}
