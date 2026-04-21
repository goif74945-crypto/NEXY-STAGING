export function formatEpochMs(epochMsInput: unknown, localeInput?: unknown): string {
  const epochMs =
    typeof epochMsInput === 'number' && Number.isInteger(epochMsInput) && epochMsInput >= 0
      ? epochMsInput
      : (() => {
          throw new Error('epochMs must be a non-negative integer.');
        })();

  const locale =
    localeInput === undefined
      ? 'en-US'
      : typeof localeInput === 'string' && localeInput.trim().length > 0
        ? localeInput.trim()
        : (() => {
            throw new Error('locale must be a non-empty string when provided.');
          })();

  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(epochMs));
}

export function formatSessionRoleLabel(roleInput: unknown): string {
  const role =
    typeof roleInput === 'string' ? roleInput.trim().toLowerCase() : (() => { throw new Error('Invalid session role.'); })();

  switch (role) {
    case 'owner':
      return 'Owner';
    case 'operator':
      return 'Operator';
    case 'viewer':
      return 'Viewer';
    default:
      throw new Error('Invalid session role.');
  }
}

export function formatIncidentSeverityLabel(severityInput: unknown): string {
  const severity =
    typeof severityInput === 'string'
      ? severityInput.trim().toLowerCase()
      : (() => {
          throw new Error('Invalid incident severity.');
        })();

  switch (severity) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    default:
      throw new Error('Invalid incident severity.');
  }
}

export function formatJobStatusLabel(statusInput: unknown): string {
  const status =
    typeof statusInput === 'string'
      ? statusInput.trim().toLowerCase()
      : (() => {
          throw new Error('Invalid job status.');
        })();

  switch (status) {
    case 'queued':
      return 'Queued';
    case 'running':
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      throw new Error('Invalid job status.');
  }
}

export function formatWorkerStatusLabel(statusInput: unknown): string {
  const status =
    typeof statusInput === 'string'
      ? statusInput.trim().toLowerCase()
      : (() => {
          throw new Error('Invalid worker status.');
        })();

  switch (status) {
    case 'idle':
      return 'Idle';
    case 'busy':
      return 'Busy';
    case 'offline':
      return 'Offline';
    default:
      throw new Error('Invalid worker status.');
  }
}

export function formatRunStatusLabel(statusInput: unknown): string {
  const status =
    typeof statusInput === 'string'
      ? statusInput.trim().toLowerCase()
      : (() => {
          throw new Error('Invalid run status.');
        })();

  switch (status) {
    case 'queued':
      return 'Queued';
    case 'running':
      return 'Running';
    case 'verifying':
      return 'Verifying';
    case 'consensus':
      return 'Consensus';
    case 'stable':
      return 'Stable';
    case 'freeze':
      return 'Freeze';
    case 'failed':
      return 'Failed';
    default:
      throw new Error('Invalid run status.');
  }
}