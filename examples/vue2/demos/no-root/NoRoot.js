export default  {
  functional: true,
  name: 'NoRoot1',
  props: {
    info: Object
  },
  render(h,ctx) {
    let {props} = ctx;
    return props.info.extend ? [
      h('h3',JSON.stringify(props.info.basic)),
      h('h3',JSON.stringify(props.info.extendInfo)),
    ]: h('h3',JSON.stringify(props.info.basic));
  }
}
