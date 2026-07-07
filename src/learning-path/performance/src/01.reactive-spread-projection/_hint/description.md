# 优化方案提示

开启「优化后」开关，核心在 `listProjectionModel.js` 的 `buildProjectionOptimized`：toRaw 浅拷贝 + 保留 memberList 响应式引用。
