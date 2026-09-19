// 起始缺陷：输入、角色、版本与重复操作均未检查。用测试逐项修复。
export function createOrderBook() {
  const orders = [];
  return {
    list: () => orders,
    submit(customer, amount) { const order = { id: orders.length + 1, customer, amount, status: 'pending', version: 1 }; orders.push(order); return order; },
    approve(id) { const order = orders.find(x => x.id === id); order.status = 'approved'; return order; }
  };
}
