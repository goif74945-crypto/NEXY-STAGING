export const SESSION_ROLES = ['VIEWER', 'OPERATOR', 'OWNER'] as const;

export type SessionRole = (typeof SESSION_ROLES)[number];

export type SessionDevice = {
  id: string;
  deviceId: string;
  label: string | null;
};

export type ActiveSession = {
  id: string;
  userId: string;
  email: string;
  role: SessionRole;
  device: SessionDevice;
  expiresAt: Date;
};
