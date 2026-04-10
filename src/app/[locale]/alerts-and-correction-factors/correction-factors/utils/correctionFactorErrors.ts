export const VALIDATION_EVENTS_RESPONSE_MISMATCH =
  'VALIDATION_EVENTS_RESPONSE_MISMATCH';

function getErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  return error.message.trim() || null;
}

interface CorrectionFactorUserFacingErrorOptions {
  fallbackMessage: string;
  mismatchMessage?: string;
}

export function toCorrectionFactorUserFacingError(
  error: unknown,
  { fallbackMessage, mismatchMessage }: CorrectionFactorUserFacingErrorOptions
): string {
  const message = getErrorMessage(error);

  if (!message) {
    return fallbackMessage;
  }

  if (
    mismatchMessage &&
    (message === VALIDATION_EVENTS_RESPONSE_MISMATCH ||
      message.includes(VALIDATION_EVENTS_RESPONSE_MISMATCH))
  ) {
    return mismatchMessage;
  }

  return fallbackMessage;
}
