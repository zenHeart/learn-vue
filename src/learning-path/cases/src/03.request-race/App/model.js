// 起始缺陷：较旧请求晚返回时会覆盖新请求；卸载后仍会发布。
export function createLatestRequest(publish) {
  return {
    async run(request) { try { publish({ value: await request(), error: null }); } catch (e) { publish({ value: null, error: String(e.message || e) }); } },
    dispose() {}
  };
}
