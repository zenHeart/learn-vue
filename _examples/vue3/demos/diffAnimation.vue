<script setup>
  import { ref, reactive, nextTick } from "vue";

  const oldChildren = ref(["A", "B", "C", "D"]);
  const newChildren = ref(["C", "A", "E", "B"]);

  const oldIndexList = ref([]);
  const oldNodes = reactive([]);
  const logs = ref([]);
  const playing = ref(false);
  const speed = ref(1000);
  const cursor = ref(0);
  const lastIndex = ref(-1);
  const history = ref([]);
  const positions = ref({}); // 存储节点位置信息
  const activeOldIndex = ref(-1); // 当前活跃的oldChildren索引
  const activeIndexListIndex = ref(-1); // 当前活跃的oldIndexList索引
  const currentStep = ref(-1); // 添加当前选中的步骤索引
  const animationStep = ref(-1); // 添加当前动画步骤
  const animationNodes = reactive([]); // 用于动画显示的节点数组

  const restoreStep = async (stepIndex) => {
    if (playing.value) return;
    if (stepIndex < 0 || stepIndex >= history.value.length) return;
    
    // 设置当前选中的步骤
    currentStep.value = stepIndex;
    animationStep.value = stepIndex;
    
    // 恢复到该步骤的状态
    const snapshot = history.value[stepIndex];
    
    // 更新状态变量
    lastIndex.value = snapshot.lastIndex;
    cursor.value = snapshot.cursor;
    activeOldIndex.value = snapshot.activeOldIndex || -1;
    activeIndexListIndex.value = snapshot.activeIndexListIndex || -1;
    
    // 重新创建动画节点数组
    animationNodes.splice(0, animationNodes.length, ...JSON.parse(JSON.stringify(snapshot.nodes)));
    
    // 更新节点位置信息
    await recordPositions();
  };

  const init = () => {
    oldIndexList.value = newChildren.value.map((key) =>
      key === "-" ? -1 : oldChildren.value.indexOf(key)
    );
    
    // 清空节点数组
    oldNodes.splice(0);
    animationNodes.splice(0);
    
    // 初始化节点
    oldChildren.value.forEach((key) => {
      const node = { key, id: Math.random(), status: "normal" };
      oldNodes.push(node);
      animationNodes.push({...node});
    });
    
    logs.value = [];
    cursor.value = 0;
    lastIndex.value = -1;
    positions.value = {}; // 重置位置信息
    currentStep.value = -1; // 重置当前步骤索引
    animationStep.value = -1; // 重置动画步骤
    history.value = []; // 清空历史记录
    playing.value = false; // 确保播放状态为false
  };

  // 记录节点位置
  const recordPositions = async () => {
    await nextTick();
    const nodeElements = document.querySelectorAll(".animation .node");
    
    // 清空之前的位置信息
    positions.value = {};
    
    nodeElements.forEach((el) => {
      const key = el.textContent.trim();
      positions.value[key] = {
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      };
    });
  };

  const play = async () => {
    if (playing.value) return;
    playing.value = true;
    
    // 重置状态
    history.value = [];
    logs.value = [];
    animationNodes.splice(0);
    
    // 复制初始节点到动画节点数组
    oldChildren.value.forEach((key) => {
      animationNodes.push({ 
        key, 
        id: Math.random(), 
        status: "normal",
        stepIndex: -1
      });
    });
    
    cursor.value = 0;
    lastIndex.value = -1;

    // 记录初始位置
    await recordPositions();

    // 保存初始状态 - 显示为 A,B,C,D
    history.value.push({
      nodes: JSON.parse(JSON.stringify(animationNodes)),
      lastIndex: lastIndex.value,
      cursor: cursor.value,
      logs: [],
      activeOldIndex: -1,
      activeIndexListIndex: -1,
    });

    // 处理每个新数组元素
    for (; cursor.value < newChildren.value.length; cursor.value++) {
      const newKey = newChildren.value[cursor.value];
      const curIdx = oldIndexList.value[cursor.value];

      // 高亮当前处理的索引
      activeIndexListIndex.value = cursor.value;
      activeOldIndex.value = curIdx;

      let stepLog = "";
      
      // 1. 处理 C - 保持在原位置不动
      if (cursor.value === 0) { // C
        stepLog = `✅ 节点 ${newKey} 位置稳定，无需移动（原位置${curIdx}，新位置${cursor.value}）`;
        
        // 找到稳定节点
        const stableNode = animationNodes.find((n) => n.key === newKey);
        if (stableNode) {
          stableNode.status = "stable";
          stableNode.stepIndex = cursor.value;
        }
        
        // 更新 lastIndex
        lastIndex.value = Math.max(lastIndex.value, curIdx);
      }
      // 2. 处理 A - 移动到 C 后面
      else if (cursor.value === 1) { // A
        stepLog = `🚚 移动节点 ${newKey}：从原数组位置${curIdx} → 新数组位置${cursor.value}` +
          `（因为原位置 ${curIdx} < 当前最大位置 ${lastIndex.value}）`;
        
        // 找到要移动的节点
        const idx = animationNodes.findIndex((n) => n.key === newKey);
        
        if (idx !== -1) {
          // 从原位置移除节点
          const [movedNode] = animationNodes.splice(idx, 1);
          
          // 更新节点状态
          movedNode.status = "moved";
          movedNode.animation = "move-real";
          movedNode.fromPosition = idx;
          movedNode.toPosition = cursor.value;
          movedNode.stepIndex = cursor.value;
          
          // 插入到新位置 - C后面
          animationNodes.splice(cursor.value, 0, movedNode);
        }
        
        // 更新 lastIndex
        lastIndex.value = Math.max(lastIndex.value, curIdx);
      }
      // 3. 处理 E - 新建节点插入到 A 后面
      else if (cursor.value === 2) { // E
        stepLog = `✨ 新建节点 ${newKey} 到位置${cursor.value}（当前处理新数组索引${cursor.value}）`;
        
        // 插入新节点
        animationNodes.splice(cursor.value, 0, {
          key: newKey,
          id: Math.random(),
          status: "new",
          animation: "new-in",
          stepIndex: cursor.value
        });
        
        // 不需要更新 lastIndex，因为是新节点
      }
      // 4. 处理 B - 移动到 E 后面
      else if (cursor.value === 3) { // B
        stepLog = `🚚 移动节点 ${newKey}：从原数组位置${curIdx} → 新数组位置${cursor.value}` +
          `（因为原位置 ${curIdx} < 当前最大位置 ${lastIndex.value}）`;
        
        // 找到要移动的节点
        const idx = animationNodes.findIndex((n) => n.key === newKey);
        
        if (idx !== -1) {
          // 从原位置移除节点
          const [movedNode] = animationNodes.splice(idx, 1);
          
          // 更新节点状态
          movedNode.status = "moved";
          movedNode.animation = "move-real";
          movedNode.fromPosition = idx;
          movedNode.toPosition = cursor.value;
          movedNode.stepIndex = cursor.value;
          
          // 插入到新位置 - E后面
          animationNodes.splice(cursor.value, 0, movedNode);
        }
        
        // 更新 lastIndex
        lastIndex.value = Math.max(lastIndex.value, curIdx);
      }

      // 添加日志
      logs.value.push(stepLog);
      
      // 记录节点位置
      await recordPositions();
      
      // 保存每一步的状态
      history.value.push({
        nodes: JSON.parse(JSON.stringify(animationNodes)),
        lastIndex: lastIndex.value,
        cursor: cursor.value,
        logs: [...logs.value],
        activeOldIndex: activeOldIndex.value,
        activeIndexListIndex: activeIndexListIndex.value,
      });
      
      // 更新当前步骤
      currentStep.value = history.value.length - 1;
      animationStep.value = currentStep.value;
      
      await wait(speed.value);
    }

    // 5. 处理要删除的节点 D
    for (const key of oldChildren.value) {
      if (!newChildren.value.includes(key) && key !== "-") {
        const stepLog = `🗑️ 移除节点 ${key}，因为它不在新列表中`;
        logs.value.push(stepLog);
        
        // 找到要删除的节点
        const idx = animationNodes.findIndex((n) => n.key === key);
        if (idx !== -1) {
          // 标记为删除状态
          animationNodes[idx].status = "removing";
          animationNodes[idx].animation = "fade-out";
        }
        
        // 保存删除节点的状态
        history.value.push({
          nodes: JSON.parse(JSON.stringify(animationNodes)),
          lastIndex: lastIndex.value,
          cursor: cursor.value,
          logs: [...logs.value],
          activeOldIndex: -1,
          activeIndexListIndex: -1,
        });
        
        // 更新当前步骤
        currentStep.value = history.value.length - 1;
        animationStep.value = currentStep.value;
        
        await wait(speed.value);
        
        // 实际删除节点
        if (idx !== -1) {
          animationNodes.splice(idx, 1);
        }
        
        // 保存最终状态 - C,A,E,B
        history.value.push({
          nodes: JSON.parse(JSON.stringify(animationNodes)),
          lastIndex: lastIndex.value,
          cursor: cursor.value,
          logs: [...logs.value],
          activeOldIndex: -1,
          activeIndexListIndex: -1,
        });
        
        currentStep.value = history.value.length - 1;
        animationStep.value = currentStep.value;
      }
    }

    // 重置高亮
    activeOldIndex.value = -1;
    activeIndexListIndex.value = -1;
    
    playing.value = false;
  };

  const highlightCursor = (index) => {
    animationNodes.forEach((node) => {
      if (
        node.status !== "moved" &&
        node.status !== "new" &&
        node.status !== "removing" &&
        node.status !== "stable"
      ) {
        node.status = "normal";
      }
    });
    const key = newChildren.value[index];
    const found = animationNodes.find((node) => node.key === key);
    if (found && found.status === "normal") found.status = "active";
  };

  const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

  init();
</script>

<template>
  <div class="app">
    <div class="left">
      <div class="controls-container">
        <h3>控制面板</h3>
        <div class="controls">
          <button class="control-btn reset" @click="init">重置</button>
          <button class="control-btn play" @click="play">
            {{ playing ? "播放中..." : "开始播放" }}
          </button>
          <div class="speed-control">
            <span>速度:</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              v-model="speed"
            />
            <span class="speed-value">{{ speed }}ms</span>
          </div>
        </div>
      </div>

      <div>
        <h3>OldChildren</h3>
        <div class="list">
          <div
            v-for="(item, i) in oldChildren"
            :key="i"
            class="item"
            :class="{ 'active-old': i === activeOldIndex }"
          >
            {{ item }}
          </div>
        </div>
        <h3>NewChildren</h3>
        <div class="list">
          <div
            v-for="(item, i) in newChildren"
            :key="i"
            class="item"
            :class="{ active: i === cursor }"
          >
            {{ item }}
          </div>
        </div>
        <h3>OldIndexList</h3>
        <div class="list">
          <div
            v-for="(item, i) in oldIndexList"
            :key="i"
            class="item"
            :class="{ 'active-index': i === activeIndexListIndex }"
          >
            {{ item }}
          </div>
        </div>
        <div class="last-index">LastIndex: {{ lastIndex }}</div>
      </div>
    </div>

    <div class="right">
      <div class="info-panel">
        <!-- 添加操作图例说明 -->
        <div class="legend">
          <h3>操作图例</h3>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-node normal"></div>
              <span>原始节点</span>
            </div>
            <div class="legend-item">
              <div class="legend-node new"></div>
              <span>新增节点</span>
            </div>
            <div class="legend-item">
              <div class="legend-node moved"></div>
              <span>移动节点</span>
              <div class="mini-arrow">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
                  ></path>
                </svg>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-node stable"></div>
              <span>稳定节点</span>
            </div>
            <div class="legend-item">
              <div class="legend-node removing"></div>
              <span>删除节点</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 添加当前步骤说明 -->
      <div class="step-explanation" v-if="cursor < newChildren.length">
        <h3>当前步骤说明</h3>
        <p>
          正在处理新数组中索引
          <span class="highlight">{{ cursor }}</span> 位置的元素
          <span class="highlight">{{ newChildren[cursor] }}</span>
        </p>
        <p v-if="activeOldIndex !== -1">
          该元素在原数组中的位置是
          <span class="highlight">{{ activeOldIndex }}</span>
        </p>
        <p v-else>该元素在原数组中不存在，需要新建</p>
      </div>
      <div class="animation-container">
        <div class="animation">
          <div
            class="node"
            v-for="node in animationNodes"
            :key="node.id"
            :class="[
              node.status,
              node.animation,
              { 'fade-out': node.status === 'removing' },
            ]"
            :data-from="node.fromPosition"
            :data-to="node.toPosition"
          >
            {{ node.key }}
            <div
              class="step-indicator"
              v-if="node.stepIndex !== -1"
            >
              {{ node.stepIndex }}
            </div>
          </div>
        </div>
      </div>

      <div class="logs">
        <h3>日志</h3>
        <div
          class="log"
          v-for="(log, i) in logs"
          :key="i"
          @click="restoreStep(i + 1)"
          :class="{
            clickable: i < history.length - 1,
            active: i + 1 === currentStep,
          }"
        >
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
  .app {
    display: flex;
    padding: 20px;
    font-family: 'Arial', sans-serif;
  }

  .left, .right {
    flex: 1;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  // 控制面板样式
  .controls-container {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    border-left: 4px solid #4caf50;

    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #2e7d32;
    }
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .control-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;

    &.reset {
      background: #e3f2fd;
      color: #1565c0;

      &:hover {
        background: #bbdefb;
      }
    }

    &.play {
      background: #e8f5e9;
      color: #2e7d32;

      &:hover {
        background: #c8e6c9;
      }
    }
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 10px;

    input[type="range"] {
      width: 120px;
      accent-color: #4caf50;
    }

    .speed-value {
      font-weight: bold;
      color: #555;
      min-width: 60px;
    }
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0;
  }

  .item {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #f5f5f5;
    transition: all 0.3s ease;

    &.active {
      background: #ffd700;
      border-color: #ff9800;
      box-shadow: 0 0 8px rgba(255,215,0,0.5);
    }

    &.active-old {
      background: #ffecb3;
      border-color: #ffa000;
      box-shadow: 0 0 8px rgba(255,160,0,0.5);
    }

    &.active-index {
      background: #bbdefb;
      border-color: #2196f3;
      box-shadow: 0 0 8px rgba(33,150,243,0.5);
    }
  }

  // 信息面板布局
  .info-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .animation {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
    position: relative;
    margin-bottom: 20px;
  }

  .node {
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    border: 2px solid #999;
    border-radius: 8px;
    font-size: 24px;
    transition: transform 0.5s ease, opacity 0.5s ease, background-color 0.3s ease;
    position: relative;

    &.new {
      background: #b3e5fc;
      border-color: #4fc3f7;
      box-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
    }

    &.moved {
      background: #fff3e0;
      border-color: #ffb74d;
      box-shadow: 0 0 10px rgba(255, 183, 77, 0.5);
    }

    &.stable {
      background: #e8f5e9;
      border-color: #66bb6a;
      box-shadow: 0 0 10px rgba(102, 187, 106, 0.3);
    }

    &.placeholder {
      background: #f5f5f5;
      border-style: dotted;
    }

    &.removing {
      background: #ffebee;
      border-color: #ef5350;
      box-shadow: 0 0 10px rgba(239, 83, 80, 0.5);
    }

    &.active {
      border-color: #ffd700;
      box-shadow: 0 0 8px rgba(255,215,0,0.5);
    }

    // 新增元素的动画
    &.new-in {
      animation: fadeIn 0.8s ease-out;
    }

    // 移动元素的动画
    &.move-real {
      animation: moveRealNode 0.8s ease-out;
      z-index: 10;
    }

    // 删除元素的动画
    &.fade-out {
      animation: fadeOut 0.8s ease-out forwards;
    }

    // 步骤指示器
    .step-indicator {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 20px;
      height: 20px;
      background: #673ab7;
      color: white;
      border-radius: 50%;
      font-size: 12px;
      line-height: 20px;
      text-align: center;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    }
  }

  // 添加图例样式
  .legend {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    flex: 1;
    min-width: 200px;
    border-left: 4px solid #2196f3;

    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      color: #1565c0;
    }

    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      background: white;
      padding: 5px 10px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      min-width: 120px;

      .legend-node {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        margin-right: 10px;
        border: 2px solid #999;

        &.normal {
          background: white;
        }

        &.new {
          background: #b3e5fc;
          border-color: #4fc3f7;
        }

        &.moved {
          background: #fff3e0;
          border-color: #ffb74d;
        }

        &.stable {
          background: #e8f5e9;
          border-color: #66bb6a;
        }

        &.removing {
          background: #ffebee;
          border-color: #ef5350;
        }
      }

      .mini-arrow {
        width: 16px;
        height: 16px;
        margin-left: 5px;
        color: #ff9800;

        svg {
          fill: currentColor;
        }
      }
    }
  }

  // 步骤说明样式
  .step-explanation {
    background: #e3f2fd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    border-left: 4px solid #2196f3;
    flex: 1;
    min-width: 200px;

    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #1565c0;
      font-size: 16px;
    }

    p {
      margin: 5px 0;
      line-height: 1.5;
    }

    .highlight {
      background: #bbdefb;
      padding: 2px 5px;
      border-radius: 3px;
      font-weight: bold;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.5);
    }
  }

  @keyframes moveRealNode {
    0% {
      transform: translateX(-30px);
      opacity: 0.7;
      background-color: #fff3e0;
    }
    20% {
      transform: translateX(-15px) translateY(-10px);
      opacity: 0.8;
    }
    60% {
      transform: translateX(15px) translateY(5px);
      opacity: 0.9;
      background-color: #ffe0b2;
    }
    100% {
      transform: translateX(0) translateY(0);
      opacity: 1;
      background-color: #fff3e0;
    }
  }

  .logs {
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #ff9800;
  }

  .log {
    padding: 8px;
    margin: 4px 0;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);

    &.clickable:hover {
      background: #e9ecef;
      transform: translateX(2px);
    }

    &.active {
      background: #fff3e0;
      border-left: 3px solid #ff9800;
      font-weight: bold;
    }
  }

  .last-index {
    margin-top: 10px;
    font-weight: bold;
    background: #e8f5e9;
    padding: 8px 12px;
    border-radius: 4px;
    display: inline-block;
    border-left: 3px solid #4caf50;
  }
</style>
