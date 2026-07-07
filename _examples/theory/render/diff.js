// ... existing code ...

/**
 * Vue3 quik diff 算法（完整实现版）
 * 实现原理：预处理相同前缀/后缀 + 最长递增子序列优化
 * 历史为 [['p', 1], ['strong', 2], ['div', 3], ['div', 4]] oldChildren
 * 新为 [['div', 3], ['p', 1], ['strong', 2], ['p', 8]] newChildren
 * 1. 先处理首尾相同 key 的元素执行 patch，
 * 2. 去除首尾的相同元素后新的剩余数组，记录下标，小标对应的是新数组中相同key的元素在旧数组中对应的索引位置
 * 如果不存在则全部记录为 -1，生成 source 数组
 * 3. 遍历剩余的老数组，如果遇到 key 在 source 中存在的则更新，否则删除，这一步后只剩余需要移动的旧数组
 * 4. 找出 source 的最长子序列，的子数组 seq
 * 5. 从 seq 和 source 的尾部开始向上扫描，找到第一个不相等的元素，说明这个元素需要移动，未找到则需要添加
 * 
 * @param {Array} oldChildren - 旧子节点数组
 * @param {Array} newChildren - 新子节点数组
 * @param {HTMLElement} container - 父容器
 * @param {Object} options - 包含 patch/move 等方法的工具包
 */
export function latestUnfinish(oldChildren, newChildren, container, options) {
  // 1. 预处理，采用首尾部游标 startIndex 比对开头
  let startIndex = 0;
  while (startIndex < oldChildren.length && startIndex < newChildren.length) {
    const oldChild = oldChildren[startIndex];
    const newChild = newChildren[startIndex];
    if (oldChild.key === newChild.key) {
      options.patch(oldChild, newChild, container);
      startIndex++;
    } else {
      break;
    }
  }
  // 2. 预处理，采用尾部游标 endIndex 比对结尾
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;
  while (oldEndIndex >= startIndex && newEndIndex >= startIndex) {
    const oldChild = oldChildren[oldEndIndex];
    const newChild = newChildren[newEndIndex];
    if (oldChild.key === newChild.key) {
      options.patch(oldChild, newChild, container);
      oldEndIndex--;
      newEndIndex--;
    } else {
      break;
    }
  }
  // 3. 处理剩余节点, 处理新的首尾后的剩余数组
  const source = newChildren.slice(startIndex, newEndIndex + 1);
  // 4. 生成一个新数组 key 为键，值为对应索引的映射表
  const keyToIndexMap = new Map();
  source.forEach((child, index) => {
    keyToIndexMap.set(child.key, index);
  });
  // 5. 过滤剩余的旧数组，更新 source 表存储对应在旧数组对应的 index ，同时剔除不存在的元素
  for(let i = startIndex; i <= oldEndIndex; i++) {
    const oldChild = oldChildren[i];
    if (keyToIndexMap.has(oldChild.key)) {
      // 在旧数组上更新
      options.patch(oldChild, source[keyToIndexMap.get(oldChild.key)], container);
      // 6. 处理移动，找到旧数组中对应的元素
      source[keyToIndexMap.get(oldChild.key)] = oldChild;
    } else {
      // 7. 处理删除，旧数组中不存在的元素
      options.unmount(oldChild);
    }
  }
  // 基于 source 求出最长递增子序列对应的数组索引
  const seq = getSeq(source);
  // 8. 基于最长递增子序列和source 处理新元素的添加和移位
 // 倒序遍历 seq 和 source 数组，如果相等则跳过， 如果 source 值为 -1 说明需要添加，如果不相等则需要移动
  let j = seq.length - 1;
  let i = source.length - 1;
  while (i >= 0 && j >= 0) {
    if (source[i] === source[seq[j]]) {
      i--;
      j--;
    } else if (source[i] === -1) {
      // 9. 处理添加，说明是新元素
      options.patch(null, source[i], container);
      i--;
    } else {
      // 10. 处理移动，说明是旧元素
      const oldChild = source[i];
      const newChild = source[seq[j]];
      options.patch(oldChild, newChild, container);
      // 11. 处理移动，找到锚点
      const anchor = i > 0 ? source[i - 1].el.nextSibling : container.firstChild;
      options.insert(oldChild.el, container, anchor);
      i--;
      j--;
    }
  }






  // 补充 source 最长子序列函数
  // 输出最长递增子序列对应的数组索引,比如 [1,2,4,3] 输出 [0,1,3]
  function getSeq(arr) {

    const dp = [];
    const prev = new Array(arr.length).fill(-1);
    for (let i = 0; i < arr.length; i++) {
      let left = 0, right = dp.length;
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[dp[mid]] < arr[i]) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      if (left === dp.length) {
        dp.push(i);
      } else {
        dp[left] = i;
      }
      prev[i] = left > 0 ? dp[left - 1] : -1;
    }

    const result = [];
    let k = dp[dp.length - 1];
    while (k !== -1) {
      result.push(k);
      k = prev[k];
    }
    return result.reverse();
  }

}

/**
 * 双端 diff, 核心伪代码如下
 * 抽象为数组假设输入为,每一项标识为 [type, key]
 * 历史为 [['p', 1], ['strong', 2], ['div', 3], ['div', 4]] oldChildren
 * 新为 [['div', 3], ['p', 1], ['strong', 2], ['p', 8]] newChildren
 * 只要没超过范围就循环比对，注意边界情况处理
 * 相比 v3 减少了移动次数
 * @param {*} oldChildren 
 * @param {*} newChildren 
 * @param {*} container 
 * @param {*} options 
 */
export function v5(oldChildren, newChildren, container, options) {
  let oldStartIdx = 0, oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0, newEndIdx = newChildren.length - 1;
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    const oldStartChild = oldChildren[oldStartIdx];
    const oldEndChild = oldChildren[oldEndIdx];
    const newStartChild = newChildren[newStartIdx];
    const newEndChild = newChildren[newEndIdx];

    // 1. 头头比对
    if (oldStartChild.key === newStartChild.key) {
      options.patch(oldStartChild, newStartChild, container);
      oldStartIdx++;
      newStartIdx++;
    }
    // 2. 尾尾比对
    else if (oldEndChild.key === newEndChild.key) {
      options.patch(oldEndChild, newEndChild, container);
      oldEndIdx--;
      newEndIdx--;
    }
    // 3. 头尾比对
    else if (oldStartChild.key === newEndChild.key) {
      options.patch(oldStartChild, newEndChild, container);
      options.insert(oldStartChild.el, container, oldEndChild.el.nextSibling);
      oldStartIdx++;
      newEndIdx--;
    }
    // 4. 尾头比对
    else if (oldEndChild.key === newStartChild.key) {
      options.patch(oldEndChild, newStartChild, container);
      options.insert(oldEndChild.el, container, oldStartChild.el);
      oldEndIdx--;
      newStartIdx++;
    } else {
       //1,4 比对失败，在 oldChildren 中查找 newStartChild
      const idxInOld = oldChildren.findIndex(c => c.key === newStartChild.key);
      if (idxInOld === -1) {
        // 5. 新节点不存在于旧节点中，直接插入
        options.patch(null, newStartChild, container);
      } else {
        // 6. 新节点存在于旧节点中，复用旧节点
        const oldChild = oldChildren[idxInOld];
        options.patch(oldChild, newStartChild, container);
        // 7. 移动到新位置
        options.insert(oldChild.el, container, oldStartChild.el);
      }
      newStartIdx++;
    }
  }

  // 8. 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 9. 新节点剩余，直接插入
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      options.patch(null, newChildren[i], container);
    }
  } else if (newStartIdx > newEndIdx) {
    // 10. 旧节点剩余，删除
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      options.unmount(oldChildren[i]);
    }
  }
}


/**
 * 算法效率 O(Max(n + m)) 
 * 如何实现 dom 的尽可能复用，为了实现 dom 复用涉及如下问题
 * 1. 如何判断是否可以复用， 基于 key
 * 2. 如何复用， 复用的节点需要 patch
 * 3. 复用后如何处理如下场景
 * 
 * @param {*} oldChildren 
 * @param {*} newChildren 
 * @param {*} container 
 * @param {*} options 
 */
export function v4(oldChildren, newChildren, container, options) {
  // 1. 记录新节点 key
  const newKeys = newChildren.map(child => child.key);

  // 2. 复用旧节点并 patch，同时记录复用的旧节点 index
  const oldIndexList = [];
  newChildren.forEach((newChild, newIdx) => {
    const oldIdx = oldChildren.findIndex(c => c.key === newChild.key);
    if (oldIdx !== -1) {
      options.patch(oldChildren[oldIdx], newChild, container);
      oldIndexList.push(oldIdx);
    } else {
      options.patch(null, newChild, container);
      oldIndexList.push(-1); // 新节点用 -1 标记
    }
  });

  // 3. 卸载旧节点中未被复用的
  oldChildren.forEach(oldChild => {
    if (!newKeys.includes(oldChild.key)) {
      options.unmount(oldChild);
    }
  });

  // 4. 判断并处理移动
  // 简单策略：只要 oldIndexList 不是递增的，就移动
  let lastIndex = -1;
  for (let i = 0; i < newChildren.length; i++) {
    const curIdx = oldIndexList[i];
    // curIdx === -1 说明这是一个新增节点，在前面的步骤2中已经被创建和插入到正确位置
    // 所以这里不需要移动，直接跳过
    if (curIdx === -1) continue;

    // 如果当前节点在旧数组中的索引小于 lastIndex
    // 说明当前节点需要向右移动到正确的位置
    if (curIdx < lastIndex) {
      const el = newChildren[i].el;
      // 找到锚点：
      // 1. 如果是第一个节点(i === 0)，则移动到容器的第一个位置
      // 2. 否则移动到前一个节点的下一个位置
      // 由于前面的节点已经被正确放置，所以这个位置就是当前节点应该在的位置
      const anchor = i > 0 ? newChildren[i - 1].el.nextSibling : container.firstChild;
      options.insert(el, container, anchor);
    }

    // 更新 lastIndex，保存当前已处理节点中最大的索引值
    // 用于判断后续节点是否需要移动
    lastIndex = Math.max(lastIndex, curIdx);
  }
}


/**
 * 算法效率 O(Max(n + m)) 
 * 如何实现 dom 的尽可能复用，但是没法保证最小移动，需要重新移动所有节点
 * 
 * @param {*} oldChildren 
 * @param {*} newChildren 
 * @param {*} container 
 * @param {*} options 
 */
export function v3(oldChildren, newChildren, container, options) {
  // 1. 记录新节点 key
  const newKeys = newChildren.map(child => child.key);

  // 2. 复用旧节点并 patch
  newChildren.forEach(newChild => {
    const oldChild = oldChildren.find(c => c.key === newChild.key);
    if (oldChild) {
      options.patch(oldChild, newChild, container);
    } else {
      options.patch(null, newChild, container);
    }
  });

  // 3. 卸载旧节点中未被复用的
  oldChildren.forEach(oldChild => {
    if (!newKeys.includes(oldChild.key)) {
      options.unmount(oldChild);
    }
  });

  // 4. 重新插入所有新节点，保证顺序
  newChildren.forEach(newChild => {
    const el = newChild.el; // 假设 patch 后 newChild.el 指向真实 DOM
    container.appendChild(el);
  });
}


/**
 * 算法效率 O(Max(n + m)) 
 * 1. 先遍历最短的数组 patch，各元素
 * 2. 然后处理剩余数组
 * 3. 如果新数组比旧数组长，则插入新节点
 * 4. 如果新数组比旧数组短，则删除旧节点
 * 
 * @param {*} oldChildren 
 * @param {*} newChildren 
 * @param {*} container 
 * @param {*} options 
 */
export function v2(oldChildren, newChildren, container, options) {
  const oldLength = oldChildren.length;
  const newLength = newChildren.length;
  const length = Math.min(oldLength, newLength);
  // 1. 遍历最短的数组，patch 各元素
  for (let i = 0; i < length; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    options.patch(oldChild, newChild, container);
  }
  // 2. 处理剩余数组
  if (oldLength > newLength) {
    // 3. 如果旧数组比新数组长，则删除旧节点
    for (let i = length; i < oldLength; i++) {
      const oldChild = oldChildren[i];
      options.unmount(oldChild);
    }
  } else if (oldLength < newLength) {
    // 4. 如果新数组比旧数组长，则插入新节点
    for (let i = length; i < newLength; i++) {
      const newChild = newChildren[i];
      options.patch(null, newChild, container);
    }
  }
}

/**
 * 
 * 算法效率 O(n + m) 需要删除 n 个旧节点，插入 m 个新节点
 * @param {*} oldChildren 
 * @param {*} newChildren 
 * @param {*} container 
 * @param {*} options 
 */
export function v1(oldChildren, newChildren, container, options) {
  // 1. 删除旧节点
  oldChildren.forEach(child => {
    options.unmount(child);
  });

  // 2. 插入新节点
  newChildren.forEach(child => {
    options.patch(null, child, container);
  });
}