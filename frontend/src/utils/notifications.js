const STORAGE_KEY = "ses-notifications";
const EVENT_NAME = "ses-notifications-updated";
const MAX_NOTIFICATIONS = 50;

const safeParse = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const emitUpdate = () => {
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const getNotifications = () => {
  return safeParse(localStorage.getItem(STORAGE_KEY));
};

export const addNotification = ({ title, message, type = "info" }) => {
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title || "Notification",
    message: message || "",
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const current = getNotifications();
  const next = [item, ...current].slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitUpdate();
  return item;
};

export const markAllNotificationsRead = () => {
  const current = getNotifications();
  const next = current.map((item) => ({ ...item, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitUpdate();
};

export const subscribeNotifications = (callback) => {
  const handler = () => callback(getNotifications());
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};
