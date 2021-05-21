<script>
export default {
  functional: true,
  render(h, ctx) {
    console.log('--', ctx)
    return (
      <div>
          <button {...{on: ctx.listeners}}>
            pass reference
          </button>
          <button onClick={ (e) => ctx.listeners.click(e) }>
            pass arrow function
          </button>
      </div>
    )
  }
}
</script>