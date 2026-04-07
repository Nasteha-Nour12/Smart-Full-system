import { sms_api_key, sms_api_url, sms_from, sms_to } from "../config/config.js";

export const sendSms = async ({ message, to = sms_to }) => {
  const payload = {
    to,
    from: sms_from,
    message,
  };

  if (!sms_api_url || !sms_api_key || !to) {
    return {
      sent: false,
      providerConfigured: false,
      reason: "SMS provider is not configured",
      payload,
    };
  }

  const response = await fetch(sms_api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sms_api_key}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "SMS provider request failed");
  }

  return {
    sent: true,
    providerConfigured: true,
    data,
    payload,
  };
};
