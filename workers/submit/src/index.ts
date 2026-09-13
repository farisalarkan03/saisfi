/**
 * Saisfi Cloudflare Worker: Submit Form Publik
 * Lapisan edge proteksi: Turnstile, KV Rate Limit, Supabase Service Role
 * Sesuai panduan di saisfi-implementasi-supabase-cloudflare.md
 */

export interface Env {
  RATE_LIMIT_KV?: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  TURNSTILE_SECRET?: string;
  DISPATCH_WORKER_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Enable CORS for frontend requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, cf-turnstile-response",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Match route: /api/submit/:slug
    const match = url.pathname.match(/^\/api\/submit\/([^/]+)$/);
    if (!match) {
      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const slug = match[1];
    const clientIp = request.headers.get("cf-connecting-ip") || "anonymous";

    try {
      // 1. Rate-limit check via Cloudflare KV (misal: maks 15 submit / menit per IP)
      if (env.RATE_LIMIT_KV) {
        const rateKey = `rate:${clientIp}:${slug}`;
        const currentCount = await env.RATE_LIMIT_KV.get(rateKey);
        const count = currentCount ? parseInt(currentCount, 10) : 0;

        if (count >= 15) {
          return new Response(
            JSON.stringify({
              error: "Terlalu banyak pengiriman. Harap tunggu beberapa saat.",
            }),
            { status: 429, headers: { "Content-Type": "application/json" } }
          );
        }

        await env.RATE_LIMIT_KV.put(rateKey, (count + 1).toString(), {
          expirationTtl: 60, // reset per 60 detik
        });
      }

      // Parse payload
      const body = await request.json() as {
        turnstileToken?: string;
        answers: Record<string, unknown>; // question_id -> value
      };

      // 2. Cek Cloudflare Turnstile token jika secret dikonfigurasi
      if (env.TURNSTILE_SECRET && body.turnstileToken) {
        const formData = new FormData();
        formData.append("secret", env.TURNSTILE_SECRET);
        formData.append("response", body.turnstileToken);
        formData.append("remoteip", clientIp);

        const turnstileRes = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          { method: "POST", body: formData }
        );
        const turnstileResult = await turnstileRes.json() as { success: boolean };
        if (!turnstileResult.success) {
          return new Response(
            JSON.stringify({ error: "Verifikasi bot (Turnstile) gagal" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // 3. Ambil form id dari Supabase REST API
      const formLookupUrl = `${env.SUPABASE_URL}/rest/v1/forms?slug=eq.${encodeURIComponent(
        slug
      )}&status=eq.published&select=id,title,owner_id`;
      const formRes = await fetch(formLookupUrl, {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });

      const forms = await formRes.json() as Array<{ id: string; title: string; owner_id: string }>;
      if (!forms || forms.length === 0) {
        return new Response(
          JSON.stringify({ error: "Formulir tidak ditemukan atau belum diterbitkan" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const form = forms[0];

      // 4. Insert response ke tabel responses
      const responseInsertUrl = `${env.SUPABASE_URL}/rest/v1/responses`;
      const userAgent = request.headers.get("user-agent") || "";
      const resRecord = await fetch(responseInsertUrl, {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          form_id: form.id,
          meta: {
            ip_hash: await hashString(clientIp),
            user_agent: userAgent,
          },
        }),
      });

      const createdResponses = await resRecord.json() as Array<{ id: string }>;
      if (!createdResponses || createdResponses.length === 0) {
        throw new Error("Gagal menyimpan respons formulir");
      }

      const responseId = createdResponses[0].id;

      // 5. Insert answers ke tabel answers
      const answersToInsert = Object.entries(body.answers).map(([questionId, value]) => ({
        response_id: responseId,
        question_id: questionId,
        value: typeof value === "object" ? JSON.stringify(value) : JSON.stringify(value),
      }));

      if (answersToInsert.length > 0) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/answers`, {
          method: "POST",
          headers: {
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answersToInsert),
        });
      }

      // 6. Opsional: Kirim webhook ke dispatcher worker (WhatsApp/Sheets)
      if (env.DISPATCH_WORKER_URL) {
        fetch(env.DISPATCH_WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            form_id: form.id,
            form_title: form.title,
            response_id: responseId,
            answers: body.answers,
          }),
        }).catch((err) => console.error("Dispatch integration error:", err));
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Jawaban berhasil dikirim",
          responseId,
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (err: unknown) {
      const error = err as Error;
      return new Response(
        JSON.stringify({ error: error.message || "Internal server error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};

// Helper: hash IP
async function hashString(str: string): Promise<string> {
  const enc = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}
