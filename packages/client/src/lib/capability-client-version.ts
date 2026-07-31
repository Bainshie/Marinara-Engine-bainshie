export function capabilityClientNeedsRefresh(
  loadedVersion: string | undefined,
  installedVersion: string,
  customElementRegistered: boolean,
): boolean {
  return Boolean(loadedVersion && loadedVersion !== installedVersion && customElementRegistered);
}
