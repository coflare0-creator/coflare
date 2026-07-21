export function parseLocationName(locationName: string): {
  country: string;
  state: string;
} {
  const parts = locationName
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { country: "", state: "" };
  }

  const country = parts[parts.length - 1];

  let stateIndex = parts.length - 2;

  // Skip a trailing postal code segment (e.g. "102113") if present
  if (stateIndex >= 0 && /^\d+$/.test(parts[stateIndex])) {
    stateIndex -= 1;
  }

  const state = stateIndex >= 0 ? parts[stateIndex] : "";

  return { country, state };
}
