<script>
  let C1 = {
    props: {
      a: String,
      b: String,
      handle: Function
    },
    render(h) {
      return (
        <div>
          props: { JSON.stringify(this._props) }
          <button onClick={this.handle}>点击</button>
        </div>
      )
    }
  }

  export default {
    meta: {
      tags: ['jsx']
    },
    components: {
      C1
    },
    render() {
      const props = {
          a: 'a',
          b: 'b',
          c: 'c',
          handle() {
            alert(1)
          }
        }
      return (
        <div>
          <h3>vue jsx  支持属性扩展语法,非法的 props 会忽略</h3>
          <C1 {...{props}} ></C1>
        </div>)
    }
  }
</script>
