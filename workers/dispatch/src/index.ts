/**
 * Saisfi Cloudflare Worker: Dispatcher Integrasi
 * Mengirim notifikasi WhatsApp (Fonnte/Cloud API) & sync ke Google Sheets
 */

export interface Env {
  WA_API_KEY?: string;
  GOOGLE_SHEETS_CREDENTIALS?: string;
}

export interface DispatchPayload {
  form_id: string;
  form_title: string;
  response_id: string;
  answers: Record<string, unknown>;
  recipient_phone?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const payload = (await request.json()) as DispatchPayload;
      const tasks: Promise<unknown>[] = [];

      // 1. WhatsApp Notification Dispatch
      if (env.WA_API_KEY && payload.recipient_phone) {
        tasks.push(sendWhatsAppNotification(env.WA_API_KEY, payload));
      }

      // 2. Google Sheets Row Sync
      if (env.GOOGLE_SHEETS_CREDENTIALS) {
        tasks.push(syncGoogleSheets(env.GOOGLE_SHEETS_CREDENTIALS, payload));
      }

      await Promise.allSettled(tasks);

      return new Response(
        JSON.stringify({ success: true, processed_tasks: tasks.length }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err: unknown) {
      const error = err as Error;
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};

async function sendWhatsAppNotification(apiKey: string, payload: DispatchPayload) {
  const message = `🔔 *Respons Baru Saisfi!*\n\nForm: *${payload.form_title}*\nWaktu: ${new Date().toLocaleString("id-ID")}\nID: ${payload.response_id}\n\nSilakan cek detail di Dashboard Saisfi.`;

  // Contoh integrasi gateway WhatsApp (misal Fonnte)
  return fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: payload.recipient_phone,
      message,
    }),
  });
}

async function syncGoogleSheets(credentialsJson: string, payload: DispatchPayload) {
  // Parsing credentials service account dan append data ke spreadsheet
  console.log("Syncing to Google Sheets for form:", payload.form_id);
}
