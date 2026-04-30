export function toMessageSystemUserFacingError(
  error: unknown,
  options: { fallbackMessage: string }
): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return options.fallbackMessage;
}
