<template>
  <div class="diff-visualizer">
    <h1>简单 LastIndex Diff 动画演示</h1>

    <div class="controls">
      <button @click="startDiff" :disabled="processing">开始 Diff</button>
      <button @click="reset" :disabled="processing">重置</button>
      <label>
        动画速度 (ms):
        <input
          type="number"
          v-model.number="stepDelay"
          min="100"
          max="5000"
          step="100"
          :disabled="processing"
        />
      </label>
    </div>

    <div class="legend">
      <h2>图例 (Legend)</h2>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-color-box" style="border-color: #fd7e14"></span>
          <span>正在检查的新列表项</span>
        </div>
        <div class="legend-item">
          <span
            class="legend-color-box"
            style="border-color: #17a2b8; background-color: #e3f2fd"
          ></span>
          <span>当前处理的节点 (动画中)</span>
        </div>
        <div class="legend-item">
          <span
            class="legend-color-box"
            style="background-color: #fff3cd; border-color: #ffeeba"
          ></span>
          <span>节点判定为需移动</span>
        </div>
        <div class="legend-item">
          <span
            class="legend-color-box"
            style="background-color: #d1e7dd; border-color: #badbcc"
          ></span>
          <span>新节点 / 插入操作</span>
        </div>
        <div class="legend-item">
          <span
            class="legend-color-box"
            style="background-color: #f8d7da; border-color: #f5c6cb"
          ></span>
          <span>节点判定为需删除</span>
        </div>
        <div class="legend-item">
          <span class="legend-color-box placeholder"></span>
          <span>无 Key 节点 ('-')</span>
        </div>
      </div>
    </div>

    <div class="diff-layout-container">
      <div class="left-panel">
        <div class="list-wrapper">
          <h2>旧列表 (Old Children)</h2>
          <div class="list static-list">
            <div
              v-for="(item, index) in oldChildren"
              :key="`old-${item.id}`"
              class="list-item old-item"
              :class="{ placeholder: item.value === '-' }"
            >
              {{ item.value }}
              <span class="index-label">(idx: {{ index }})</span>
            </div>
            <div v-if="!oldChildren.length" class="empty-list">空列表</div>
          </div>
        </div>

        <div class="list-wrapper">
          <h2>新列表 (New Children)</h2>
          <div class="list static-list">
            <div
              v-for="(item, index) in newChildren"
              :key="`new-${item.id}`"
              class="list-item new-item"
              :class="{
                placeholder: item.value === '-',
                'highlight-new-processing':
                  index === currentNewIndex && processing,
              }"
            >
              {{ item.value }}
              <span class="index-label">(idx: {{ index }})</span>
            </div>
            <div v-if="!newChildren.length" class="empty-list">空列表</div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="list-wrapper current-state">
          <h2>当前状态 (动画过程)</h2>
          <p class="status-indicators">
            <span v-if="processing"
              >处理新列表位置:
              <strong>{{
                currentNewIndex === -1 ? "N/A" : currentNewIndex
              }}</strong></span
            >
            <span v-if="processing && currentOldIndex !== null">
              -> 在旧列表位置:
              <strong>{{
                currentOldIndex === -1 ? "未找到 (新节点)" : currentOldIndex
              }}</strong></span
            >
            <span v-if="processing">
              | 上次最大旧索引 (lastIndex):
              <strong>{{
                lastIndexValue === -1 ? "N/A" : lastIndexValue
              }}</strong></span
            >
          </p>
          <transition-group
            name="list-anim"
            tag="div"
            class="list animated-list"
          >
            <div
              v-for="(item, index) in currentChildren"
              :key="item.id"
              class="list-item current-item"
              :class="{
                placeholder: item.value === '-',
                'highlight-move': item.needsMove,
                'highlight-new': item.isNew,
                'highlight-delete': item.toBeDeleted,
                'highlight-current-check':
                  item.id === currentItemId && processing && !item.toBeDeleted,
              }"
            >
              {{ item.value }}
              <span class="index-label">(id: {{ item.id.split("_")[1] }})</span>
            </div>
          </transition-group>
          <div v-if="!currentChildren.length && !processing" class="empty-list">
            （Diff 后为空）
          </div>
        </div>

        <div class="explanation">
          <h2>执行步骤说明</h2>
          <div class="logs">
            <p
              v-for="(log, index) in logMessages"
              :key="index"
              v-html="log"
            ></p>
            <p v-if="processing" class="processing-indicator">处理中...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, nextTick } from "vue";

  let nextId = 0;
  const createItem = (value, originalIndex, prefix = "item") => ({
    id: `${prefix}_${nextId++}`,
    value,
    originalIndex, // Store original index
    needsMove: false,
    isNew: false,
    toBeDeleted: false,
  });

  // --- State ---
  const initialOld = ref(["A", "-", "B", "C", "-", "D"]);
  const initialNew = ref(["-", "C", "A", "-", "E", "B"]);

  const oldChildren = ref([]);
  const newChildren = ref([]);
  const currentChildren = ref([]); // The list being animated
  const logMessages = ref([]);
  const processing = ref(false);
  const stepDelay = ref(1200); // Animation step delay in ms

  // State indicators for visualization
  const currentNewIndex = ref(-1); // `i` in the loop over newChildren
  const lastIndexValue = ref(-1); // `lastIndex` from the diff algorithm
  const currentOldIndex = ref(null); // `curIdx` (original old index) for the item at `currentNewIndex`
  const currentItemId = ref(null); // ID of the item being highlighted/processed in currentChildren

  // --- Helper Functions ---
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const resetState = () => {
    nextId = 0; // Reset unique ID counter
    oldChildren.value = initialOld.value.map((val, idx) =>
      createItem(val, idx, "old")
    );
    newChildren.value = initialNew.value.map((val, idx) =>
      createItem(val, idx, "new")
    );
    // Start animation with a fresh copy of oldChildren items
    currentChildren.value = oldChildren.value.map((item) => ({ ...item }));
    logMessages.value = [
      "点击 '开始 Diff' 按钮观察变化。",
      "右侧面板将展示动画过程和文字说明。",
    ];
    processing.value = false;
    currentNewIndex.value = -1;
    lastIndexValue.value = -1;
    currentOldIndex.value = null;
    currentItemId.value = null;
    // Explicitly clear any lingering visual state flags on the initial items
    currentChildren.value.forEach((item) => {
      item.needsMove = false;
      item.isNew = false;
      item.toBeDeleted = false;
    });
  };

  const addLog = (message) => {
    logMessages.value.push(message);
    // Auto-scroll log view
    nextTick(() => {
      const logContainer = document.querySelector(".logs");
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    });
  };

  // --- Diff Logic Implementation (Adapted for Visualization) ---
  const startDiff = async () => {
    if (processing.value) return;
    resetState(); // Reset to initial state cleanly
    await nextTick(); // Ensure DOM is updated after reset before starting
    processing.value = true;
    logMessages.value = []; // Clear initial/previous logs
    addLog("🚀 Diff 开始！");
    addLog(`旧列表: [${initialOld.value.join(", ")}]`);
    addLog(`新列表: [${initialNew.value.join(", ")}]`);
    await sleep(stepDelay.value);

    // 1. Build oldIndexMap (Key -> original index in oldChildren)
    //    Only maps first occurrence of a keyed item. '-' items are ignored.
    const oldIndexMap = new Map();
    oldChildren.value.forEach((item, index) => {
      if (item.value !== "-" && !oldIndexMap.has(item.value)) {
        oldIndexMap.set(item.value, index);
      }
    });
    addLog(
      `构建旧列表索引映射 (值 -> 首次出现位置): ${JSON.stringify(
        Array.from(oldIndexMap.entries())
      )}`
    );
    await sleep(stepDelay.value / 2);

    // --- Main Processing Loop (Iterate through New Children) ---
    lastIndexValue.value = -1; // Reset lastIndex for this diff run
    const processedIds = new Set(); // Track original IDs of old items that are used in the new list

    for (let i = 0; i < newChildren.value.length; i++) {
      currentNewIndex.value = i; // Highlight target position `i` in new list visualization
      const newItem = newChildren.value[i]; // The item required at this position `i`

      addLog(`---`);
      addLog(
        `[步骤 ${i + 1}/${
          newChildren.value.length
        }] 检查新列表位置 ${i} 的目标元素: '${newItem.value}'`
      );
      await sleep(stepDelay.value);

      let oldIndex = -1; // Corresponds to 'curIdx' - item's index in the original old list
      let oldItem = null; // The corresponding original old item object

      // Find original index using the map (if item has key and existed)
      if (newItem.value !== "-") {
        if (oldIndexMap.has(newItem.value)) {
          oldIndex = oldIndexMap.get(newItem.value);
          oldItem = oldChildren.value[oldIndex]; // Get the original item object
        }
      }
      currentOldIndex.value = oldIndex; // Update visual indicator for 'curIdx'

      // --- Action based on whether the item existed before ---

      if (oldIndex === -1) {
        // Case 1: NEW NODE or UNKEYED NODE ('-')
        // Cannot compare with lastIndex. Treat as insertion.
        addLog(
          `元素 '${newItem.value}' 在旧列表中无对应 Key 或本身是 '-'。判定为 <strong>新节点</strong>。`
        );
        // Create a distinct item for the animated list
        const itemToAdd = {
          ...newItem,
          id: `current_${newItem.id}`,
          isNew: true,
        };
        currentItemId.value = itemToAdd.id; // Highlight the item being added

        await sleep(stepDelay.value);
        addLog(`➡️ 准备插入 '${itemToAdd.value}' 到当前列表的目标位置 ${i}...`);
        currentChildren.value.splice(i, 0, itemToAdd); // Insert into animated list at position `i`
        await nextTick(); // Wait for DOM update
        addLog(
          `✅ <strong>插入完成</strong>。 当前列表: [${currentChildren.value
            .map((c) => c.value)
            .join(", ")}]`
        );
        // **No update to lastIndex for new/unkeyed nodes.**
      } else {
        // Case 2: NODE FOUND IN OLD LIST (at original oldIndex)
        addLog(`元素 '${newItem.value}' 在旧列表的位置 ${oldIndex} 找到。`);
        if (!oldItem) {
          addLog(
            `🚨 错误: 找到了旧索引 ${oldIndex} 但无法获取旧项目对象！ 跳过此项。`
          );
          continue; // Skip if mapping failed unexpectedly
        }

        processedIds.add(oldItem.id); // Mark this original old item's ID as processed/kept

        // Find this item within the *current* animated list using its *original* ID.
        const currentItemIndex = currentChildren.value.findIndex(
          (c) => c.id === oldItem.id
        );
        if (currentItemIndex === -1) {
          addLog(
            `🚨 错误: 在当前动画列表中找不到本应存在的旧节点 '${oldItem.value}' (id: ${oldItem.id})！ 可能已被错误处理。跳过此项。`
          );
          // If this happens, the state is likely inconsistent.
          continue;
        }
        const currentItem = currentChildren.value[currentItemIndex];
        currentItemId.value = currentItem.id; // Highlight this item in the current list

        await sleep(stepDelay.value / 2); // Pause before move check

        // *** Core Diff Move Check (Based on lastIndex) ***
        if (oldIndex < lastIndexValue.value) {
          // MOVE REQUIRED: Item's original position breaks the increasing subsequence.
          addLog(
            `旧位置 ${oldIndex} < 上次最大旧索引 ${lastIndexValue.value}。判定为<strong>需要移动</strong>。`
          );
          currentItem.needsMove = true; // Mark for visual highlight
          await sleep(stepDelay.value);

          addLog(
            `➡️ 准备将 '${currentItem.value}' (来自旧位置 ${oldIndex}) 移动到当前列表的目标位置 ${i}...`
          );
          // Perform move in the animated list: remove, then insert at target `i`.
          const [movedItem] = currentChildren.value.splice(currentItemIndex, 1);
          await nextTick(); // Let Vue react to removal
          currentChildren.value.splice(i, 0, movedItem);
          await nextTick(); // Let Vue react to insertion
          addLog(
            `✅ <strong>移动完成</strong>。当前列表: [${currentChildren.value
              .map((c) => c.value)
              .join(", ")}]`
          );
          movedItem.needsMove = false; // Reset visual flag after animation likely completes
        } else {
          // NO MOVE REQUIRED: Item's original position maintains or extends the subsequence.
          addLog(
            `旧位置 ${oldIndex} >= 上次最大旧索引 ${lastIndexValue.value}。判定为<strong>无需移动</strong> (相对位置正确)。`
          );
          await sleep(stepDelay.value);
          addLog(
            `👍 节点 '${currentItem.value}' 保持在当前位置 (符合 lastIndex 规则)。`
          );
          // The item is already part of currentChildren. Its position relative to nodes
          // before `i` is considered correct according to the algorithm at this point.
        }

        // *** Update lastIndex ***
        // Update using the current item's *original* index from the old list.
        // This establishes the benchmark for the *next* item's move check.
        const previousLastIndex = lastIndexValue.value;
        lastIndexValue.value = Math.max(lastIndexValue.value, oldIndex);
        if (lastIndexValue.value !== previousLastIndex) {
          addLog(
            `更新 LastIndex = max(${previousLastIndex}, ${oldIndex}) = <strong>${lastIndexValue.value}</strong> (用于下次比较)`
          );
        } else {
          addLog(
            `LastIndex 保持为 ${lastIndexValue.value} (因为 ${oldIndex} <= ${lastIndexValue.value})`
          );
        }
      }

      // --- Cleanup for next iteration ---
      await sleep(stepDelay.value * 0.75);
      // Reset visual flags for the item that was just placed/confirmed at index `i`
      const itemJustHandled = currentChildren.value[i];
      if (itemJustHandled) {
        itemJustHandled.isNew = false; // Clear 'new' flag if it was set
        itemJustHandled.needsMove = false; // Clear 'move' flag
      }
      // Also ensure the highlighted item (if different) has flags cleared
      const highlightedItem = currentChildren.value.find(
        (item) => item.id === currentItemId.value
      );
      if (highlightedItem && highlightedItem !== itemJustHandled) {
        highlightedItem.isNew = false;
        highlightedItem.needsMove = false;
      }
      currentItemId.value = null; // Clear highlight before next loop check
    } // End of for loop processing newChildren

    currentNewIndex.value = -1; // Reset indicators
    currentOldIndex.value = null;

    // --- Deletion Phase ---
    // Remove items from currentChildren that originated from old list but weren't processed (kept/moved).
    addLog(`---`);
    addLog(`检查需要删除的旧节点 (原始节点中未被新列表使用的)...`);
    await sleep(stepDelay.value);

    const itemsToDeleteIndices = [];
    const finalNewIds = new Set(newChildren.value.map((item) => item.id)); // For the optional sanity check

    // Iterate backwards through the current list state after insertions/moves
    for (let i = currentChildren.value.length - 1; i >= 0; i--) {
      const currentItem = currentChildren.value[i];

      // Check if item originated from the old list AND its original ID wasn't in the processed set.
      const isFromOldList = currentItem.id.startsWith("old_");
      const wasProcessed = processedIds.has(currentItem.id);

      if (isFromOldList && !wasProcessed) {
        addLog(
          `发现旧节点 '${currentItem.value}' (原始ID: ${currentItem.id}) 未被新列表使用。判定为<strong>需要删除</strong>。`
        );
        currentItem.toBeDeleted = true; // Mark for styling
        currentItemId.value = currentItem.id; // Highlight
        itemsToDeleteIndices.push(i); // Store index for actual removal
        await sleep(stepDelay.value); // Pause to show red highlight
        addLog(`➡️ 准备删除 '${currentItem.value}'...`);
        await sleep(stepDelay.value / 2);
      }
      // Optional sanity check for inserted items not in the final target list
      // else if (!isFromOldList) { ... } // (Can be added if needed)
    }
    currentItemId.value = null; // Clear highlight after checks

    // Perform actual deletions if any were marked
    if (itemsToDeleteIndices.length > 0) {
      addLog(`执行删除操作...`);
      // Sort indices descending to splice correctly from the end
      itemsToDeleteIndices.sort((a, b) => b - a);
      itemsToDeleteIndices.forEach((index) => {
        if (index >= 0 && index < currentChildren.value.length) {
          // Bounds check
          currentChildren.value.splice(index, 1);
        } else {
          addLog(
            `🚨 错误: 尝试删除的索引 ${index} 超出范围 [0, ${
              currentChildren.value.length - 1
            }]。`
          );
        }
      });
      await nextTick(); // Wait for DOM update after deletions
      addLog(`✅ <strong>删除完成</strong>。`);
    } else {
      addLog(`没有需要删除的节点。`);
    }
    // Final state log
    addLog(
      `最终列表: [${currentChildren.value.map((c) => c.value).join(", ")}]`
    );

    await sleep(stepDelay.value / 2);
    addLog(`---`);
    addLog("🎉 Diff 完成！");
    processing.value = false;
  };

  // Reset function called by button and at start
  const reset = () => {
    resetState();
  };

  // --- Initial Setup ---
  // Initialize the state when the component mounts
  resetState();
</script>

<style lang="stylus" scoped>
  .diff-visualizer
    font-family sans-serif
    padding 20px
    background-color #f8f9fa

  h1, h2
    text-align center
    color #343a40
    margin-top 0
    margin-bottom 15px

  .controls
    display flex
    justify-content center
    align-items center
    gap 15px
    margin-bottom 20px
    padding 15px
    background-color #e9ecef
    border-radius 6px

    button
      padding 10px 20px
      font-size 1em
      cursor pointer
      border none
      border-radius 4px
      background-color #007bff
      color white
      transition background-color 0.2s ease

      &:disabled
        background-color #adb5bd
        cursor not-allowed

      &:hover:not(:disabled)
        background-color #0056b3

    label
        display flex
        align-items center
        gap 5px
    input[type="number"]
        padding 5px
        width 70px
        border 1px solid #ced4da
        border-radius 4px

  // Legend Styles
  .legend
    margin-bottom 25px
    padding 15px
    background-color #e9ecef
    border-radius 6px
    border 1px solid #dee2e6

    h2
      margin-bottom 10px
      font-size 1.1em

    .legend-items
      display flex
      flex-wrap wrap
      gap 15px

    .legend-item
      display flex
      align-items center
      gap 5px
      font-size 0.9em

    .legend-color-box
      display inline-block
      width 18px
      height 18px
      border 1px solid #ced4da // Default border
      outline 2px solid transparent // Base outline state
      outline-offset 1px
      border-radius 3px
      vertical-align middle

      // Match specific styles used in list items
      &.placeholder
        background-color #f1f3f5
        color #adb5bd
        border-color #ced4da

  // Layout Container
  .diff-layout-container
    display flex
    gap 20px // Space between left and right panels

  .left-panel
    flex 0 0 35% // Fixed width for the left panel
    display flex
    flex-direction column
    gap 20px // Space between old and new list wrappers

  .right-panel
    flex 1 // Takes remaining space
    display flex
    flex-direction column
    gap 20px // Space between animation and explanation wrappers

  .list-wrapper
    min-width 0
    padding 15px
    border 1px solid #dee2e6
    border-radius 6px
    background-color #fff

    &.current-state
      background-color #eef // Slightly different background for animation area

  .status-indicators
    text-align center
    margin-bottom 10px
    font-size 0.9em
    color #495057
    min-height 20px // Prevent layout shift

    span
      margin 0 8px

    strong
      color #0056b3

  .list
    display flex
    flex-direction column
    align-items center
    min-height 50px
    padding 10px 0
    position relative

  .list-item
    border 1px solid #ced4da
    background-color #ffffff
    padding 8px 15px
    margin 5px 0
    border-radius 4px
    text-align center
    font-weight bold
    min-width 60px
    box-shadow 0 1px 3px rgba(0,0,0,0.05)
    transition all 0.5s ease-in-out // Apply to all properties for smooth changes
    position relative
    outline 2px solid transparent // Base outline state for transitions
    outline-offset 1px

    &.placeholder
      background-color #f1f3f5
      color #adb5bd
      font-style italic

    .index-label
      position absolute
      top -12px
      left 50%
      transform translateX(-50%)
      font-size 0.7em
      color #6c757d
      background-color rgba(248, 249, 250, 0.8)
      padding 1px 3px
      border-radius 3px
      white-space nowrap

    // --- Highlighting Classes ---
    // Note: Use outline for checks that don't change background
    &.highlight-new-processing // Item being checked in the "New List"
      outline-color #fd7e14 // Orange outline

    &.highlight-current-check // Item being actively processed in "Current State"
      outline-color #17a2b8 // Teal outline
      transform scale(1.05) // Slightly larger when checked
      background-color #e3f2fd // Light Blue/Teal background

    &.highlight-move // Item identified as needing a move
      background-color #fff3cd // Light yellow
      border-color #ffeeba

    &.highlight-new // Item identified as new and being inserted
      background-color #d1e7dd // Light green
      border-color #badbcc

    &.highlight-delete // Item identified for deletion
      background-color #f8d7da // Light red
      border-color #f5c6cb
      opacity 0.7 // Slightly faded


  // --- Vue Transition Group Animations ---
  .list-anim-move
    transition transform 0.5s ease // Smooth movement animation

  // Enter transitions
  .list-anim-enter-active
    transition all 0.5s ease
    // Optional delay can help visualize insertion timing
    // transition-delay 0.1s

  .list-anim-enter-from
    opacity 0
    transform translateY(20px) scale(0.8)

  // Leave transitions
  .list-anim-leave-active
    transition all 0.5s ease
    position absolute // Crucial for smooth leave animation in flex/grid contexts
    // Ensure width is maintained during leave to prevent collapse
    width calc(100% - 10px) // Adjust based on padding/margin if needed, or use fixed width
    min-width 60px

  .list-anim-leave-to
    opacity 0
    transform translateY(-20px) scale(0.8)


  .empty-list
    color #6c757d
    font-style italic
    padding 10px

  .explanation
    padding 20px
    background-color #e9ecef
    border-radius 6px
    flex-shrink 1 // Allow shrinking if space is tight
    min-height 100px // Ensure it has some height


    h2
      margin-bottom 15px
      color #495057

    .logs
      max-height 350px // Max height before scrollbar appears
      overflow-y auto // Enable vertical scrolling
      background-color #fff
      padding 15px
      border-radius 4px
      border 1px solid #dee2e6
      font-size 0.95em
      line-height 1.6

      p
        margin 5px 0
        color #212529
        border-bottom 1px dashed #eee
        padding-bottom 5px

        &:last-child
          border-bottom none

      strong // Highlight key terms in logs
          color #0056b3
          font-weight 600

      .processing-indicator
        font-style italic
        color #6c757d
</style>
