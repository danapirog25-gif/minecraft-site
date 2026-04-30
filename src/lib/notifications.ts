import type { ProductSnapshot } from "@/lib/catalog";
import { formatTalers } from "@/lib/currency";

type OrderNotificationInput = {
  orderId: string;
  playerNickname: string;
  contact: string;
  totalAmount: number;
  products: ProductSnapshot[];
};

function getOrderWebhookUrl() {
  return process.env.ORDER_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || "";
}

export async function notifyOrderCreated(input: OrderNotificationInput) {
  const webhookUrl = getOrderWebhookUrl();
  if (!webhookUrl) {
    return;
  }

  const productList = input.products.map((product) => `- ${product.name} (${formatTalers(product.price)})`).join("\n");
  const content = [
    "**Нове замовлення в Zombie Event Shop**",
    `Гравець: ${input.playerNickname}`,
    `Контакт: ${input.contact}`,
    `Сума: ${formatTalers(input.totalAmount)}`,
    `ID: ${input.orderId}`,
    productList
  ].join("\n");

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });
  } catch (error) {
    console.warn("order notification failed", error);
  }
}
