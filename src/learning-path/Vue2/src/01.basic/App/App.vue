<template>
  <div id="app">
    <button @click="addItem">Add Item</button>
    <button @click="removeItem">Remove Item</button>
    <transition-group name="list" tag="ul">
      <li v-for="item in items" :key="item.id" class="list-item">
        {{ item.text }}
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      items: [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
        { id: 3, text: 'Item 3' },
      ],
      nextItemId: 4,
    };
  },
  methods: {
    addItem() {
      const newItem = { id: this.nextItemId++, text: `Item ${this.nextItemId -1}` };
      this.items.push(newItem);
    },
    removeItem() {
      if (this.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.items.length);
        this.items.splice(randomIndex, 1);
      }
    },
  },
};
</script>

<style scoped>
.list-item {
  display: inline-block;
  margin-right: 10px;
  border: 1px solid #ccc;
  padding: 5px 10px;
}

.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}

.list-enter, .list-leave-to /* .list-leave-active in <2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

.list-move {
  transition: transform 0.5s ease;
}
</style>
