export const eliminateArraysAndObjects = (headers: Record<string, string | string[] | {} | undefined>) => {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value[0];
    }
  }

  return result;
}
