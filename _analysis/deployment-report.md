# 部署就绪报告

## 构建产物

- 路径：`.vitepress/dist/`
- 大小：17 MB
- 入口：`index.html`（77 KB）
- 学习路径页面：34 个 HTML
- 学习路径章节：15 条全部 200 OK
- Sitemap：60+ URL 全部指向 `https://vue.zenheart.site/`

## 路径 HTTP 状态

| 路径 | 状态 | 大小 |
|---|---|---|
| `/` | 200 | 77 KB |
| `learning-path/01.concept/learning.html` | 200 | 115 KB |
| `learning-path/Vue2/learning.html` | 200 | 115 KB |
| `learning-path/composition/learning.html` | 200 | 115 KB |
| `learning-path/reactivity/learning.html` | 200 | 115 KB |
| `learning-path/watchers/learning.html` | 200 | 115 KB |
| `learning-path/slots/learning.html` | 200 | 115 KB |
| `learning-path/advanced/learning.html` | 200 | 115 KB |
| `learning-path/theory/learning.html` | 200 | 117 KB |
| `learning-path/vue-router/learning.html` | 200 | 115 KB |
| `learning-path/pinia/learning.html` | 200 | 115 KB |
| `learning-path/ecosystem/learning.html` | 200 | 115 KB |
| `learning-path/component-library/learning.html` | 200 | 117 KB |
| `learning-path/performance/learning.html` | 200 | 115 KB |
| `learning-path/engineering/learning.html` | 200 | 115 KB |
| `learning-path/pitfalls/learning.html` | 200 | 115 KB |

## 本地预览验证

```bash
pnpm preview --port 4321
```

已验证所有 16 个页面（含 `/`）都返回 200。`vue.zenheart.site` 部署流程与 GitHub Pages 一致（按 `AGENTS.md` 描述）：推送 `main` 分支触发自动部署，DNS 阿里云解析到 GitHub Pages。

## 部署命令

如需部署到生产环境（`vue.zenheart.site`）：

```bash
cd C:/Users/cheng/code/github/learn-vue
git add -A
git commit -m "feat(site): 194 demos covering Vue 3.5 + ecosystem + patterns"
git push origin main
# GitHub Actions 自动部署，无需手动操作
```

或者手动发布到 GitHub Pages（项目根的 `gh-pages` 分支）：

```bash
pnpm build
# .vitepress/dist/ 已包含 base 路径适配
# 通过 GitHub UI: Settings → Pages → Build from gh-pages branch
```

## 内容安全门禁

- `node scripts/verify-learning-paths.mjs`：仅警告，无失败
- `node scripts/verify-docs.mjs`：40 个 markdown 文件，0 违规
- 全部 demo 遵循 AGENTS.md 隐私门禁（无公司名、Profile JSON、内网 IP）

## 部署后建议

部署到生产后，建议验证以下 URL：

1. `https://vue.zenheart.site/`（首页卡片网格）
2. `https://vue.zenheart.site/learning-path/reactivity/learning#23.toRaw-and-markraw`
3. `https://vue.zenheart.site/learning-path/theory/learning#13.hydration-mismatch`
4. `https://vue.zenheart.site/learning-path/ecosystem/learning#07.vitest-component`

每个 demo 都是 `#NN.topic-name` 锚点直链，可被书签分享。

## 部署检查清单

- [x] `pnpm build` 成功（17 MB，0 error）
- [x] `pnpm preview` 在 `http://localhost:4321/` 启动
- [x] 所有 15 个学习路径首页 HTTP 200
- [x] sitemap.xml 生成，60+ URL
- [x] 内容安全门禁通过
- [x] 部署报告归档到 `_analysis/deployment-report.md`
- [ ] 推送 `main` 触发自动部署（需用户授权）
- [ ] DNS 验证 `vue.zenheart.site` 解析到 GitHub Pages（需用户验证）
