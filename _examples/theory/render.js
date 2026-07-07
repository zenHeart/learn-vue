import renderer from './render/index.js'


const oldVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1', key: 1 },
    { type: 'strong', children: '2',  key: 2 },
    { type: 'div', children: '3',  key: 3 },
    { type: 'div', children: '4'},
    
  ]
}

// 新 vnode
const newVNode = {
  type: 'div',
  children: [
    { type: 'div', children: '5',  key: 3},
    { type: 'p', children: '6',  key: 1 },
    { type: 'strong', children: '7',  key: 2 },
    { type: 'p', props: {
      style: {
        color: 'red'
      }
    }, children: '8' },
    
  ]
}

renderer.render(oldVNode, document.getElementById('app'));
setTimeout(() => {
  renderer.render(newVNode, document.getElementById('app'));
}, 1000);
