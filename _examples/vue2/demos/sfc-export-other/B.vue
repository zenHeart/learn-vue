<script>
  export function showModal() {
    createModal()
  }
  export default {
    // name: 'B'
  }

  function createModal() {
    let div = document.createElement('div')
    div.classList.add('modal')
    document.body.appendChild(div)
  }
</script>

<style lang="stylus">
.modal 
  background: black;
  opacity: 0.1;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
</style>