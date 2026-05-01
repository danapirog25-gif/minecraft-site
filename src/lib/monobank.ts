import crypto from "crypto";

const MONOBANK_API_URL = "https://api.monobank.ua";
const MONOBANK_JAR_LINK_BASE_URL = "https://send.monobank.ua/jar";

type BasketItem = {
  name: string;
  qty: number;
  sum: number;
  code?: string;
};

export type MonoInvoiceInput = {
  orderId: string;
  amount: number;
  destination: string;
  basketOrder: BasketItem[];
  redirectPath?: string;
  mockPaymentPath?: string;
};

export type MonoInvoice = {
  invoiceId: string;
  pageUrl: string;
};

let cachedPublicKey: string | null = null;

export function getAppUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function isMonoMockMode(): boolean {
  return process.env.MONOBANK_MOCK_MODE === "true";
}

export function isMonoJarMode(): boolean {
  return process.env.MONOBANK_JAR_MODE === "true";
}

export function getMonoJarSendId(): string | null {
  return process.env.MONOBANK_JAR_SEND_ID || process.env.MONOBANK_JAR_ID || null;
}

export function getMonoJarPaymentUrl(): string {
  const sendId = getMonoJarSendId();

  if (!sendId) {
    throw new Error("MONOBANK_JAR_SEND_ID is not configured");
  }

  return `${MONOBANK_JAR_LINK_BASE_URL}/${sendId}`;
}

export async function createMonoInvoice(input: MonoInvoiceInput): Promise<MonoInvoice> {
  const appUrl = getAppUrl();

  if (isMonoMockMode()) {
    return {
      invoiceId: `mock_${input.orderId}`,
      pageUrl: `${appUrl}${input.mockPaymentPath ?? `/api/dev/mock-payment?orderId=${encodeURIComponent(input.orderId)}`}`
    };
  }

  const token = process.env.MONOBANK_TOKEN;
  if (!token) {
    throw new Error("MONOBANK_TOKEN is not configured");
  }

  const response = await fetch(`${MONOBANK_API_URL}/api/merchant/invoice/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Token": token,
      "X-Cms": "Zombie Event Shop"
    },
    body: JSON.stringify({
      amount: input.amount,
      ccy: 980,
      merchantPaymInfo: {
        reference: input.orderId,
        destination: input.destination,
        basketOrder: input.basketOrder
      },
      redirectUrl: `${appUrl}${input.redirectPath ?? `/payment/success?orderId=${encodeURIComponent(input.orderId)}`}`,
      webHookUrl: `${appUrl}/api/monobank/webhook`
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`monobank invoice create failed: ${response.status} ${details}`);
  }

  const data = (await response.json()) as Partial<MonoInvoice>;
  if (!data.invoiceId || !data.pageUrl) {
    throw new Error("monobank invoice create response is missing invoiceId or pageUrl");
  }

  return {
    invoiceId: data.invoiceId,
    pageUrl: data.pageUrl
  };
}

async function fetchPublicKey(forceRefresh = false): Promise<string> {
  if (!forceRefresh) {
    const envPublicKey = process.env.MONOBANK_PUBLIC_KEY;
    if (envPublicKey) {
      return envPublicKey;
    }

    if (cachedPublicKey) {
      return cachedPublicKey;
    }
  }

  const token = process.env.MONOBANK_TOKEN;
  if (!token) {
    throw new Error("MONOBANK_TOKEN is required to fetch webhook public key");
  }

  const response = await fetch(`${MONOBANK_API_URL}/api/merchant/pubkey`, {
    headers: {
      "X-Token": token
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`monobank public key fetch failed: ${response.status} ${details}`);
  }

  const data = (await response.json()) as { key?: string };
  if (!data.key) {
    throw new Error("monobank public key response is missing key");
  }

  cachedPublicKey = data.key;
  return data.key;
}

function verifySignatureWithKey(rawBody: string, signature: string, publicKey: string): boolean {
  const verifier = crypto.createVerify("SHA256");
  verifier.update(rawBody);
  verifier.end();

  return verifier.verify(Buffer.from(publicKey, "base64"), Buffer.from(signature, "base64"));
}

export async function verifyMonoWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (process.env.MONOBANK_SKIP_WEBHOOK_SIGNATURE === "true") {
    return true;
  }

  if (!signature) {
    return false;
  }

  try {
    const key = await fetchPublicKey();
    const isValid = verifySignatureWithKey(rawBody, signature, key);

    if (isValid || process.env.MONOBANK_PUBLIC_KEY) {
      return isValid;
    }

    const refreshedKey = await fetchPublicKey(true);
    return verifySignatureWithKey(rawBody, signature, refreshedKey);
  } catch (error) {
    console.error("monobank webhook signature verification failed", error);
    return false;
  }
}

export function mapMonobankStatus(status: string): "pending" | "paid" | "failed" {
  if (status === "success") {
    return "paid";
  }

  if (["failure", "reversed", "expired"].includes(status)) {
    return "failed";
  }

  return "pending";
}
