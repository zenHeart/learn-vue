<template>
  <div class="demo">
    <h2>流式 SSR vs 完整 bundle</h2>

    <section class="card">
      <h3>① 性能基线（同页面估算）</h3>
      <table class="t">
        <thead>
          <tr>
            <th>模式</th>
            <th>TTFB</th>
            <th>FCP</th>
            <th>LCP</th>
            <th>下载完成</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>完整 bundle</td>
            <td class="bad">200-400ms</td>
            <td class="bad">400-600ms</td>
            <td>800-1200ms</td>
            <td>800-1200ms</td>
          </tr>
          <tr>
            <td>流式</td>
            <td class="good">30-80ms</td>
            <td class="ok">200-400ms</td>
            <td>800-1200ms</td>
            <td>800-1200ms</td>
          </tr>
          <tr>
            <td>流式 + Suspense 拆分</td>
            <td class="good">30-80ms</td>
            <td class="good">100-200ms</td>
            <td class="ok">600-900ms</td>
            <td>800-1200ms</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h3>② 流式 SSR：浏览器收到顺序（时序图）</h3>
      <p class="hint">每段内容独立 flush；浏览器能并行 parse、提前渲染。</p>
      <div class="timeline">
        <div class="row">
          <span class="t-label">t = 0</span>
          <span class="bar head">head</span>
          <span class="t-note">TTFB 完成，浏览器开始 parse HTML</span>
        </div>
        <div class="row">
          <span class="t-label">t = 20ms</span>
          <span class="bar head">header 导航</span>
        </div>
        <div class="row">
          <span class="t-label">t = 120ms</span>
          <span class="bar main">main 首屏卡片</span>
          <span class="t-note">FCP 命中</span>
        </div>
        <div class="row">
          <span class="t-label">t = 350ms</span>
          <span class="bar susp">Suspense fallback「评论加载中…」</span>
        </div>
        <div class="row">
          <span class="t-label">t = 600ms</span>
          <span class="bar main">评论已就绪（async setup resolve）</span>
          <span class="t-note">LCP 命中</span>
        </div>
        <div class="row">
          <span class="t-label">t = 600ms</span>
          <span class="bar head">footer + script 注入</span>
          <span class="t-note">stream end，hydration 开始</span>
        </div>
      </div>
    </section>

    <section class="card">
      <h3>③ 完整 bundle：单段返回</h3>
      <p class="hint">一整段 HTML 在服务端凑齐后才返回；TTFB = FCP。</p>
      <div class="timeline">
        <div class="row">
          <span class="t-label">t = 0</span>
          <span class="bar empty">request 到达服务端</span>
        </div>
        <div class="row">
          <span class="t-label">t = 580ms</span>
          <span class="bar head">完整 HTML（head + header + main + footer）</span>
          <span class="t-note">TTFB = FCP = 580ms</span>
        </div>
      </div>
    </section>

    <section class="card">
      <h3>④ 何时选哪个</h3>
      <table class="t">
        <thead>
          <tr><th>场景</th><th>推荐</th></tr>
        </thead>
        <tbody>
          <tr><td>页面小、所有内容同步</td><td>完整 bundle</td></tr>
          <tr><td>页面大、个性化、慢查询</td><td>流式 + Suspense</td></tr>
          <tr><td>CDN 缓存层需要整段 HTML</td><td>完整 bundle</td></tr>
          <tr><td>Edge runtime / Workers</td><td>流式（renderToWebStream）</td></tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.demo { max-width: 820px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
.t { width: 100%; border-collapse: collapse; font-size: 12px; }
.t th, .t td { padding: 6px 10px; border-bottom: 1px solid #e5e5e5; text-align: left; }
.t th { color: #666; font-weight: 500; }
.good { color: #18a058; font-weight: 600; }
.ok { color: #b45309; font-weight: 600; }
.bad { color: #c92a2a; font-weight: 600; }

.timeline { padding: 8px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; }
.timeline .row { display: flex; gap: 8px; align-items: center; padding: 4px 0; font-size: 12px; }
.t-label { width: 80px; color: #888; font-family: ui-monospace, monospace; font-size: 11px; }
.bar { padding: 4px 12px; border-radius: 4px; font-size: 11px; color: #fff; }
.bar.head { background: #4263eb; }
.bar.main { background: #2f9e44; }
.bar.susp { background: #f59f00; color: #333; }
.bar.empty { background: #ced4da; color: #333; }
.t-note { color: #888; font-size: 11px; font-style: italic; }
</style>