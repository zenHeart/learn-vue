
// 创建元素
export function createElement(tag) {
  return document.createElement(tag);
}
export function createTextNode(text) {
  return document.createTextNode(text);
}

export function replaceText(oldValue, newValue, el) {
  const childNodes = el.childNodes;
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue === oldValue) {
      node.nodeValue = newValue;
    }
  }
}


export function appendChild(parent, el) {
  parent.appendChild(el);
}

export function setElementText(el, text) {
  el.textContent = text;
}

export function insert(el, parent, anchor) {
  parent.insertBefore(el, anchor);
}

function formatClass(val) {
  if (typeof val === 'string') {
    return val;
  } else if (Array.isArray(val)) {
    return val.map(el => formatClass(el)).join(' ');
  } else if (typeof val === 'object') {
    return Object.keys(val).filter(key => val[key]).join(' ');
  } else {
    return '';
  }
}

export function patchProps(el, key, prevValue, nextValue) {
  if (key === 'disabled') {
    if (nextValue === '') {
      el[key] = true;
    } else {
      el[key] = nextValue;
    }
  } else if (key === 'class') {
    el.className = formatClass(nextValue);
  } else if (key === 'style') {
    for (const styleKey in nextValue) {
      el.style[styleKey] = nextValue[styleKey];
    }
  } else if (key.startsWith('on')) {
    let invokers = el._vei || (el._vei = {});
    let invoker = invokers[key];
    const event = key.slice(2).toLowerCase();
    // 此处是性能优化，优化 vue 事件绑定和销毁逻辑
    if (nextValue) {
      if (!invoker) {
        invoker = el._vei[key] = e => {
          console.log(e.timeStamp, invoker.attached);
          // 修复事件触发在事件绑定之前导致事件执行的问题
          // TODO: 此处 timestamp 比 attached 还要小，需要进一步确认
          if(e.timeStamp <= invoker.attached) {
            return;
          }
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach(fn => fn(e));
          } else {
            invoker.value(e);
          }
        }
        invoker.value = nextValue;
        invoker.attached = performance.now();
        el.addEventListener(event, invoker);
      } else {
        invoker.value = nextValue;
      }
    } else if (invoker) {
      el.removeEventListener(event, invoker);
      // 注意销毁逻辑
      delete el._vei[key];
      if (Object.keys(invokers).length === 0) {
        delete el._vei;
      }
    }
  } else {
    el.setAttribute(key, nextValue);
  }
}

export function removeChild(parent, el) {
  parent.removeChild(el);
}