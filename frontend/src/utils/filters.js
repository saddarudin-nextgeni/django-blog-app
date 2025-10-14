export function cleanFilters(filters) {
  const cleaned = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (
      (typeof value === "boolean") ||
      (typeof value === "number" && !isNaN(value)) ||
      (value !== "" && value !== null && value !== undefined)
    ) {
      cleaned[key] = value;
    }
  });
  return cleaned;
}