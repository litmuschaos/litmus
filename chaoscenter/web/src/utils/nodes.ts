export function isValidNodeType(type: string): boolean {
  // TODO: add to common.ts in @api/entities when enums are finalised
  const validTypes = ['chaosengine'];
  return validTypes.includes(type.toLowerCase());
}
