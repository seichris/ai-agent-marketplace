import { createValyuServiceApp } from "./app.js";

const port = Number(process.env.VALYU_SERVICE_PORT ?? process.env.PORT ?? 4050);
const valyuApiKey = process.env.VALYU_API_KEY;

if (!valyuApiKey) {
  throw new Error("VALYU_API_KEY is required.");
}

const app = createValyuServiceApp({
  valyuApiKey,
  valyuApiBaseUrl: process.env.VALYU_API_BASE_URL,
  verificationToken: process.env.MARKETPLACE_VERIFICATION_TOKEN
});

app.listen(port, () => {
  console.log(`Valyu service listening on http://localhost:${port}`);
});
