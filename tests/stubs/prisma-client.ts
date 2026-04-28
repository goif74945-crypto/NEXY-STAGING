export type PrismaClientStubState = {
  connected: boolean;
};

export class PrismaClient {
  readonly state: PrismaClientStubState;

  constructor() {
    this.state = {
      connected: false,
    };
  }

  async $connect(): Promise<void> {
    return Promise.resolve();
  }

  async $disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

export function createPrismaClientStub(): PrismaClient {
  return new PrismaClient();
}
