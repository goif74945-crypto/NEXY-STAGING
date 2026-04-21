import { z } from 'zod';

import {
  SessionRecordSchema,
  SessionSubjectSchema,
  createSessionRecord,
  isSessionActive,
  revokeAllOtherSessions,
  revokeSession,
  type SessionRecord,
} from '../../packages/auth/session';

export const SessionRepositoryStateSchema = z
  .object({
    records: z.array(SessionRecordSchema),
  })
  .strict();
export type SessionRepositoryState = z.infer<typeof SessionRepositoryStateSchema>;

export const SessionRepositoryQuerySchema = z
  .object({
    session_id: z.string().trim().min(1).max(128).optional(),
    subject: SessionSubjectSchema.optional(),
    current_epoch_ms: z.number().int().nonnegative().optional(),
  })
  .strict();
export type SessionRepositoryQuery = z.infer<typeof SessionRepositoryQuerySchema>;

function compareSessions(left: SessionRecord, right: SessionRecord): -1 | 0 | 1 {
  if (left.issued_at_epoch_ms < right.issued_at_epoch_ms) {
    return -1;
  }

  if (left.issued_at_epoch_ms > right.issued_at_epoch_ms) {
    return 1;
  }

  if (left.session_id < right.session_id) {
    return -1;
  }

  if (left.session_id > right.session_id) {
    return 1;
  }

  return 0;
}

function sortSessions(records: readonly SessionRecord[]): SessionRecord[] {
  return [...records].sort((left, right) => compareSessions(left, right));
}

function ensureNoDuplicateSessionIds(records: readonly SessionRecord[]): void {
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.session_id)) {
      throw new Error(`Duplicate session_id: ${record.session_id}`);
    }

    seen.add(record.session_id);
  }
}

function parseStateInternal(input: unknown): SessionRepositoryState {
  const state = SessionRepositoryStateSchema.parse(input);
  ensureNoDuplicateSessionIds(state.records);

  return SessionRepositoryStateSchema.parse({
    records: sortSessions(state.records),
  });
}

export function parseSessionRepositoryState(input: unknown): SessionRepositoryState {
  return parseStateInternal(input);
}

export function validateSessionRepositoryState(input: unknown): boolean {
  const schemaResult = SessionRepositoryStateSchema.safeParse(input);

  if (!schemaResult.success) {
    return false;
  }

  try {
    ensureNoDuplicateSessionIds(schemaResult.data.records);
    return true;
  } catch {
    return false;
  }
}

export function createEmptySessionRepositoryState(): SessionRepositoryState {
  return SessionRepositoryStateSchema.parse({
    records: [],
  });
}

export function insertSessionRecord(
  stateInput: unknown,
  recordInput: unknown,
): SessionRepositoryState {
  const state = parseStateInternal(stateInput);
  const record = SessionRecordSchema.parse(recordInput);

  if (state.records.some((existingRecord) => existingRecord.session_id === record.session_id)) {
    throw new Error(`Duplicate session_id: ${record.session_id}`);
  }

  return SessionRepositoryStateSchema.parse({
    records: sortSessions([...state.records, record]),
  });
}

export function replaceSessionRecord(
  stateInput: unknown,
  recordInput: unknown,
): SessionRepositoryState {
  const state = parseStateInternal(stateInput);
  const record = SessionRecordSchema.parse(recordInput);

  const hasExistingRecord = state.records.some(
    (existingRecord) => existingRecord.session_id === record.session_id,
  );

  if (!hasExistingRecord) {
    throw new Error(`Session not found: ${record.session_id}`);
  }

  return SessionRepositoryStateSchema.parse({
    records: sortSessions(
      state.records.map((existingRecord) =>
        existingRecord.session_id === record.session_id ? record : existingRecord,
      ),
    ),
  });
}

export function getSessionById(
  stateInput: unknown,
  sessionIdInput: unknown,
): SessionRecord | null {
  const state = parseStateInternal(stateInput);
  const session_id = z.string().trim().min(1).max(128).parse(sessionIdInput);

  return state.records.find((record) => record.session_id === session_id) ?? null;
}

export function listSessionsBySubject(
  stateInput: unknown,
  subjectInput: unknown,
): SessionRecord[] {
  const state = parseStateInternal(stateInput);
  const subject = SessionSubjectSchema.parse(subjectInput);

  return sortSessions(
    state.records.filter((record) => record.subject === subject),
  );
}

export function listActiveSessions(
  stateInput: unknown,
  currentEpochMsInput: unknown,
): SessionRecord[] {
  const state = parseStateInternal(stateInput);
  const current_epoch_ms = z.number().int().nonnegative().parse(currentEpochMsInput);

  return sortSessions(
    state.records.filter((record) => isSessionActive(record, current_epoch_ms)),
  );
}

export function revokeSessionById(
  stateInput: unknown,
  sessionIdInput: unknown,
  revokedAtEpochMsInput: unknown,
): SessionRepositoryState {
  const state = parseStateInternal(stateInput);
  const session_id = z.string().trim().min(1).max(128).parse(sessionIdInput);
  const revoked_at_epoch_ms = z.number().int().nonnegative().parse(revokedAtEpochMsInput);

  const existingRecord = state.records.find((record) => record.session_id === session_id);

  if (!existingRecord) {
    return state;
  }

  const nextRecord = revokeSession({
    record: existingRecord,
    revoked_at_epoch_ms,
  });

  return replaceSessionRecord(state, nextRecord);
}

export function revokeAllOtherSessionsForSubject(
  stateInput: unknown,
  subjectInput: unknown,
  keepSessionIdInput: unknown,
  revokedAtEpochMsInput: unknown,
): SessionRepositoryState {
  const state = parseStateInternal(stateInput);
  const subject = SessionSubjectSchema.parse(subjectInput);
  const keep_session_id = z.string().trim().min(1).max(128).parse(keepSessionIdInput);
  const revoked_at_epoch_ms = z.number().int().nonnegative().parse(revokedAtEpochMsInput);

  const subjectRecords = listSessionsBySubject(state, subject);

  if (subjectRecords.length === 0) {
    return state;
  }

  const updatedSubjectRecords = revokeAllOtherSessions({
    records: subjectRecords,
    keep_session_id,
    revoked_at_epoch_ms,
  });

  const nonSubjectRecords = state.records.filter((record) => record.subject !== subject);

  return SessionRepositoryStateSchema.parse({
    records: sortSessions([...nonSubjectRecords, ...updatedSubjectRecords]),
  });
}