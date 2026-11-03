/** Janela curta de proteção contra cadastros repetidos vindos do mesmo IP. */
export const NEWSLETTER_LIMITS = {
    maxSubscribeAttempts: 5,
    windowInMinutes: 1
} as const;
