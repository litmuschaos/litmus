export function getFormattedFileName(fileName: string): string {
  return fileName.trim().replace(/\W+/g, '-').toLowerCase();
}

export function generateUpgradeInfrastructureName({
  infrastructureName,
  latestVersion
}: {
  infrastructureName: string;
  latestVersion: string;
}): string {
  return `${infrastructureName}-upgrade-v${latestVersion}.yml`;
}

export function generateUpgradeInfrastructureFileName({
  infrastructureName,
  latestVersion
}: {
  infrastructureName: string;
  latestVersion: string;
}): string {
  return `kubectl apply -f ${generateUpgradeInfrastructureName({
    infrastructureName,
    latestVersion
  })}`;
}
