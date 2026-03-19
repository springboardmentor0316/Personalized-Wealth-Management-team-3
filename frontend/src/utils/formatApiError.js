export default function formatApiError(error, fallback = "Something went wrong") {
  const detail = error?.response?.data?.detail;
  const normalizeLoc = (loc) => {
    if (!loc) return "";
    const parts = Array.isArray(loc) ? loc : [loc];
    const filtered = parts.filter((part) => part !== "body");
    if (filtered.length === 0) return "";
    const last = String(filtered[filtered.length - 1]).replace(/_/g, " ");
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          const loc = normalizeLoc(item.loc);
          if (item.msg && loc) {
            return `${loc}: ${item.msg}`;
          }
          return item.msg || null;
        }
        return null;
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (detail && typeof detail === "object") {
    if (typeof detail.msg === "string" && detail.msg.trim()) {
      return detail.msg;
    }
    if (typeof detail.message === "string" && detail.message.trim()) {
      return detail.message;
    }
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
