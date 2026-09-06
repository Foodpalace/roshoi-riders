/** Notification adapters. In-app is implemented. Push/SMS/WhatsApp wait for Window 5. */

export type NotifyChannel = "in-app" | "push" | "sms" | "whatsapp";

export type NotifyPayload = {
  userId: string;
  title: string;
  body: string;
  kind: string;
};

export async function dispatchNotification(
  channels: NotifyChannel[],
  payload: NotifyPayload,
): Promise<{ sent: NotifyChannel[]; skipped: NotifyChannel[] }> {
  const sent: NotifyChannel[] = [];
  const skipped: NotifyChannel[] = [];
  for (const ch of channels) {
    if (ch === "in-app") sent.push(ch);
    else skipped.push(ch);
  }
  void payload;
  return { sent, skipped };
}
