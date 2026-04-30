export function toMessageSystemUserFacingError(
  error: unknown,
  options: { fallbackMessage: string }
): string {
  console.error('Message system request failed', error);

  return options.fallbackMessage;
}
