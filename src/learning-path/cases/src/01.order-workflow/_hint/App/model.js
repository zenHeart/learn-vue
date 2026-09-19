export function createOrderBook() {
  let orders = [], sequence = 0;
  return {
    list: () => orders.map(x => ({ ...x })),
    submit(customer, amount) {
      if (!customer.trim() || !Number.isFinite(amount) || amount <= 0) throw new Error('填写客户和正数金额');
      const order = { id: ++sequence, customer: customer.trim(), amount, status: 'pending', version: 1 };
      orders = [...orders, order]; return { ...order };
    },
    approve(id, role, expectedVersion) {
      if (role !== 'reviewer') throw new Error('需要审核角色');
      const order = orders.find(x => x.id === id);
      if (!order) throw new Error('订单不存在');
      if (order.version !== expectedVersion) throw new Error('版本冲突，请重新读取');
      if (order.status !== 'pending') throw new Error('仅待审核订单可通过');
      const next = { ...order, status: 'approved', version: order.version + 1 };
      orders = orders.map(x => x.id === id ? next : x); return { ...next };
    }
  };
}
