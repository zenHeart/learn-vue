export default  {
  functional: true,
  props: {
    list: Array
  },
  render(h, ctx) {
      console.log('func ctx', ctx)
      // 采用函数
      const finishList = arr => arr.filter(el => el.finish)
      return h('p', JSON.stringify(finishList(ctx.props.list)))
  }
}