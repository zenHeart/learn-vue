<template>
  <div class="tracing-demo">
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab 1: DevTools 演示 -->
    <div v-if="activeTab === 'devtools'" class="tab-content">
      <h3>Vue DevTools 追踪 Props</h3>
      <Example text="选择任意组件，在 DevTools 中查看 Props 来源">
        <div class="component-tree">
          <div class="tree-node root">
            <span class="node-label">App.vue</span>
            <div class="tree-children">
              <div class="tree-node level-1">
                <span class="node-label" @click="selected = 'parent'" :class="{ selected: selected === 'parent' }">
                  ParentComponent.vue
                  <span class="props-preview">:userId="123" :name="'Alice'"</span>
                </span>
                <div class="tree-children">
                  <div class="tree-node level-2">
                    <span class="node-label" @click="selected = 'child'" :class="{ selected: selected === 'child' }">
                      ChildComponent.vue
                      <span class="props-preview">props: { userId, name }</span>
                    </span>
                    <div class="info-box" v-if="selected === 'child'">
                      <p><strong>Props 来源分析：</strong></p>
                      <ul>
                        <li><code>userId: 123</code> ← 来自 <code>App.vue:5</code></li>
                        <li><code>name: "Alice"</code> ← 来自 <code>App.vue:5</code></li>
                      </ul>
                      <p class="tip">💡 在 DevTools 中点击 prop 可以跳转到定义位置</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="selected = null" class="reset-btn">重置选择</button>
      </Example>

      <div class="code-block">
        <h4>DevTools 操作步骤</h4>
        <pre><code>1. 打开 Chrome DevTools → Vue 面板
2. 选择目标组件
3. 在 Props 行悬停，查看高亮来源
4. 点击可直接跳转到源码位置</code></pre>
      </div>
    </div>

    <!-- Tab 2: provide/inject 演示 -->
    <div v-if="activeTab === 'provide'" class="tab-content">
      <h3>provide/inject 追踪</h3>
      <Example text="跨层级传值追踪">
        <div class="provide-demo">
          <div class="level ancestor">
            <h4>祖先组件 (provide)</h4>
            <pre><code>provide('app-theme', themeRef);</code></pre>
            <label>
              选择主题：
              <select v-model="theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
          <div class="connector">↓ provide('app-theme', ...)</div>
          <div class="level middle">
            <h4>中间组件 (无修改)</h4>
            <pre><code>// 不需要做任何事
&lt;GrandChild /&gt;</code></pre>
          </div>
          <div class="connector">↓ 直接传递</div>
          <div class="level grandchild">
            <h4>孙组件 (inject)</h4>
            <pre><code>const theme = inject('app-theme');
console.log('来源:', theme);</code></pre>
            <div class="theme-preview" :class="theme">
              <p>当前主题: {{ theme }}</p>
              <p>来源: App.vue (provide)</p>
            </div>
          </div>
        </div>
      </Example>

      <div class="code-block">
        <h4>provide/inject 追踪技巧</h4>
        <pre><code>// 方法一：具名 key
provide('来自-Header的-user', userData);

// 方法二：Symbol
const THEME_KEY = Symbol('theme');
provide(THEME_KEY, theme);

// 方法三：附加元信息
provide('app-theme', {
  value: theme,
  from: 'App.vue'
});</code></pre>
      </div>
    </div>

    <!-- Tab 3: $attrs 演示 -->
    <div v-if="activeTab === 'attrs'" class="tab-content">
      <h3>$attrs 追踪非 prop 属性</h3>
      <Example text="非 prop 属性会自动收集到 $attrs">
        <div class="attrs-demo">
          <div class="parent">
            <h4>父组件传递非 prop 属性</h4>
            <pre><code>&lt;ChildComponent
  class="custom-class"
  data-id="123"
  @custom-event="handle"
  style="color: red"
/&gt;</code></pre>
          </div>
          <div class="child">
            <h4>子组件 $attrs 内容</h4>
            <pre><code>{{ JSON.stringify(attrsDemo, null, 2) }}</code></pre>
          </div>
        </div>
      </Example>

      <div class="code-block">
        <h4>禁用属性继承</h4>
        <pre><code>export default {
  inheritAttrs: false,
  created() {
    // $attrs 仍可访问，但不作为 HTML 属性渲染
    console.log(this.$attrs);
  }
}</code></pre>
      </div>
    </div>

    <!-- Tab 4: 断点调试 -->
    <div v-if="activeTab === 'breakpoint'" class="tab-content">
      <h3>断点调试追踪 Props</h3>
      <Example text="通过断点和调用栈追踪 props 来源">
        <div class="breakpoint-demo">
          <div class="scenario">
            <h4>场景：多层组件嵌套</h4>
            <pre><code>App.vue → Parent.vue → Child.vue → GrandChild.vue
                      :userId      :userId      :userId</code></pre>
          </div>
          <div class="stack-trace">
            <h4>调用栈分析</h4>
            <pre><code>Call Stack:
▶ GrandChild.vue:8          <── 当前断点位置
▶ Child.vue:5               <── 传递 props
▶ Parent.vue:3              <── 传递 props
▶ App.vue:1                 <── 源头</code></pre>
          </div>
          <button @click="showTrace = !showTrace" class="demo-btn">
            {{ showTrace ? '隐藏' : '显示' }} Props 传递路径
          </button>
          <div v-if="showTrace" class="trace-path">
            <div class="trace-step" v-for="(step, i) in traceSteps" :key="i">
              <span class="step-num">{{ i + 1 }}</span>
              <span class="step-file">{{ step.file }}</span>
              <span class="step-prop">{{ step.prop }}</span>
            </div>
          </div>
        </div>
      </Example>
    </div>

    <!-- Tab 5: 决策树 -->
    <div v-if="activeTab === 'decision'" class="tab-content">
      <h3>选择合适的追踪方案</h3>
      <Example text="根据场景选择最佳方法">
        <div class="decision-tree">
          <div class="question">
            <p><strong>问题：需要追踪 props 从哪个父组件传来？</strong></p>
          </div>
          <div class="options">
            <div class="option" @click="selectedOption = 'devtools'" :class="{ selected: selectedOption === 'devtools' }">
              <span class="option-label">日常调试 →</span>
              <span class="option-answer">Vue DevTools</span>
            </div>
            <div class="option" @click="selectedOption = 'provide'" :class="{ selected: selectedOption === 'provide' }">
              <span class="option-label">跨层级传值 →</span>
              <span class="option-answer">provide/inject</span>
            </div>
            <div class="option" @click="selectedOption = 'attrs'" :class="{ selected: selectedOption === 'attrs' }">
              <span class="option-label">非 prop 属性 →</span>
              <span class="option-answer">$attrs</span>
            </div>
            <div class="option" @click="selectedOption = 'breakpoint'" :class="{ selected: selectedOption === 'breakpoint' }">
              <span class="option-label">深入分析 →</span>
              <span class="option-answer">断点 + 调用栈</span>
            </div>
          </div>
          <div v-if="selectedOption" class="option-detail">
            <h4>{{ optionDetails[selectedOption].title }}</h4>
            <p>{{ optionDetails[selectedOption].desc }}</p>
          </div>
        </div>
      </Example>
    </div>
  </div>
</template>

<script>
import { ref, provide, inject, reactive } from 'vue';
import Example from '../../components/Example.vue';

export default {
  name: 'DebugTracingProps',
  components: { Example },
  setup() {
    // Tab 1
    const selected = ref(null);

    // Tab 2: provide/inject
    const theme = ref('light');
    provide('app-theme', theme);

    // Tab 3: $attrs
    const attrsDemo = reactive({
      class: 'custom-class',
      'data-id': '123',
      onCustomEvent: '[Function: handle]',
      style: 'color: red'
    });

    // Tab 4: Breakpoint
    const showTrace = ref(false);
    const traceSteps = [
      { file: 'App.vue:1', prop: ':userId="42"' },
      { file: 'Parent.vue:3', prop: ':userId="userId"' },
      { file: 'Child.vue:5', prop: ':userId="userId"' },
      { file: 'GrandChild.vue:8', prop: 'props.userId = 42' }
    ];

    // Tab 5: Decision tree
    const selectedOption = ref(null);
    const optionDetails = {
      devtools: {
        title: 'Vue DevTools（推荐）',
        desc: '最直观的调试工具，可以可视化查看组件树、props来源、provide/inject关系。适合日常开发调试。'
      },
      provide: {
        title: 'provide/inject',
        desc: '适合跨3+层级的组件通信。使用具名key或Symbol可以更清晰地追踪来源。避免prop逐级穿透。'
      },
      attrs: {
        title: '$attrs',
        desc: '非prop属性（如class、data-*、事件监听器）会收集到$attrs。在子组件中可以查看这些属性的来源。'
      },
      breakpoint: {
        title: '断点 + 调用栈',
        desc: '深入分析时，在props接收处打断点，查看Chrome DevTools的Call Stack，从调用栈追溯源头组件。'
      }
    };

    const tabs = [
      { id: 'devtools', label: 'DevTools' },
      { id: 'provide', label: 'provide/inject' },
      { id: 'attrs', label: '$attrs' },
      { id: 'breakpoint', label: '断点调试' },
      { id: 'decision', label: '决策树' }
    ];
    const activeTab = ref('devtools');

    return {
      selected,
      theme,
      attrsDemo,
      showTrace,
      traceSteps,
      selectedOption,
      optionDetails,
      tabs,
      activeTab
    };
  }
};
</script>

<style scoped>
.tracing-demo {
  font-family: system-ui, sans-serif;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tabs button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.tab-content {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

h4 {
  margin: 12px 0;
  color: #34495e;
}

.component-tree {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.tree-node {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.tree-node:hover {
  background: #f0f9f4;
}

.tree-node.selected {
  background: #42b883;
  color: white;
}

.tree-node.level-1 {
  margin-left: 24px;
  border-left: 2px solid #42b883;
}

.tree-node.level-2 {
  margin-left: 24px;
  border-left: 2px solid #3c8c62;
}

.node-label {
  font-family: monospace;
  font-size: 13px;
}

.props-preview {
  font-size: 11px;
  color: #666;
  margin-left: 8px;
}

.tree-node.selected .props-preview {
  color: #e0e0e0;
}

.info-box {
  margin-top: 12px;
  padding: 12px;
  background: #fffbea;
  border-radius: 4px;
  border: 1px solid #ffe58f;
}

.info-box ul {
  margin: 8px 0;
  padding-left: 20px;
}

.info-box code {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}

.tip {
  font-size: 13px;
  color: #666;
  margin-top: 8px;
}

.reset-btn {
  margin-top: 12px;
  padding: 6px 12px;
  background: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.code-block {
  margin-top: 16px;
  padding: 16px;
  background: #1e1e1e;
  border-radius: 8px;
  color: #d4d4d4;
}

.code-block pre {
  margin: 0;
  white-space: pre-wrap;
}

.code-block code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

/* provide/inject demo */
.provide-demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level {
  padding: 16px;
  border-radius: 8px;
  border: 2px solid;
}

.level.ancestor {
  background: #e8f5e9;
  border-color: #4caf50;
}

.level.middle {
  background: #fff3e0;
  border-color: #ff9800;
}

.level.grandchild {
  background: #e3f2fd;
  border-color: #2196f3;
}

.connector {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 4px;
}

.theme-preview {
  margin-top: 12px;
  padding: 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.theme-preview.light {
  background: #ffffff;
  color: #333;
  border: 1px solid #ddd;
}

.theme-preview.dark {
  background: #333;
  color: #fff;
}

select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

/* attrs demo */
.attrs-demo {
  display: grid;
  gap: 16px;
}

.parent, .child {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.parent pre, .child pre {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

/* breakpoint demo */
.breakpoint-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scenario pre, .stack-trace pre {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.demo-btn {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: fit-content;
}

.trace-path {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.trace-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f6f8fa;
  border-radius: 4px;
}

.step-num {
  width: 24px;
  height: 24px;
  background: #42b883;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.step-file {
  font-family: monospace;
  color: #0969da;
}

.step-prop {
  font-family: monospace;
  color: #666;
  font-size: 13px;
}

/* decision tree */
.decision-tree {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question {
  padding: 16px;
  background: #fffbea;
  border-radius: 8px;
  border: 1px solid #ffe58f;
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: white;
  border: 2px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover {
  border-color: #42b883;
}

.option.selected {
  border-color: #42b883;
  background: #f0f9f4;
}

.option-label {
  font-size: 13px;
  color: #666;
}

.option-answer {
  font-weight: bold;
  color: #2c3e50;
}

.option-detail {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.option-detail h4 {
  margin: 0 0 8px 0;
  color: #42b883;
}

.option-detail p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style>
