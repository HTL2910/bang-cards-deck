export type VersionedEnvelope<T> = {
  version: number;
  state: T;
};

export function parseVersionedState<T>(
  raw: string | null,
  version: number,
  validate: (value: unknown) => value is T,
): T | null {
  if (raw === null) {
    return null;
  }

  try {
    const envelope: unknown = JSON.parse(raw);
    if (
      typeof envelope !== "object" ||
      envelope === null ||
      !("version" in envelope) ||
      envelope.version !== version ||
      !("state" in envelope) ||
      !validate(envelope.state)
    ) {
      return null;
    }

    return envelope.state;
  } catch {
    return null;
  }
}

export function serializeVersionedState<T>(version: number, state: T): string {
  return JSON.stringify({ version, state } satisfies VersionedEnvelope<T>);
}
