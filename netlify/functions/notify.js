/* ============================================================
   Netlify Serverless Function — notify.js
   Proxies Telegram messages server-side.
   Credentials live ONLY in Netlify Environment Variables —
   never in the repo or any frontend file.
   ============================================================ */

exports.handler = async function (event) {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return { statusCode: 500, body: "Telegram credentials not configured." };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON body." };
  }

  const { text } = payload;
  if (!text) {
    return { statusCode: 400, body: "Missing required field: text." };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          chat_id:    CHAT_ID,
          text:       text,
          parse_mode: "HTML"
        })
      }
    );
    const result = await response.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(result)
    };
  } catch (err) {
    return { statusCode: 500, body: "Telegram API error: " + err.message };
  }
};