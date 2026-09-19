export function createLatestRequest(publish) {
  let revision = 0, disposed = false;
  return {
    async run(request) {
      const mine = ++revision;
      try { const value = await request(); if (!disposed && mine === revision) publish({ value, error: null }); }
      catch (error) { if (!disposed && mine === revision) publish({ value: null, error: String(error.message || error) }); }
    },
    dispose() { disposed = true; revision++; }
  };
}
