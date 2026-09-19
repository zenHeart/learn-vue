<script setup>
import { ref, computed } from 'vue'

const mode = ref('layered')

const layered = [
  { name: 'views', items: ['HomeView.vue', 'UserView.vue'], imports: ['components', 'stores'] },
  { name: 'components', items: ['Button.vue', 'Card.vue'], imports: ['composables', 'utils'] },
  { name: 'stores', items: ['useUserStore.ts'], imports: ['utils', 'types'] },
  { name: 'composables', items: ['useFetch.ts', 'useDebounce.ts'], imports: ['utils'] },
  { name: 'utils', items: ['format.ts', 'date.ts'], imports: [] },
  { name: 'types', items: ['user.ts', 'api.ts'], imports: [] },
]

const fsd = [
  { name: 'app', items: ['main.ts', 'router.ts', 'providers/'], imports: [] },
  { name: 'processes', items: ['onboarding/'], imports: ['app'] },
  { name: 'pages', items: ['home/', 'user/'], imports: ['app', 'widgets', 'features'] },
  { name: 'widgets', items: ['user-card/', 'feed/'], imports: ['features', 'entities', 'shared'] },
  { name: 'features', items: ['auth/', 'like/'], imports: ['entities', 'shared'] },
  { name: 'entities', items: ['user/', 'product/'], imports: ['shared'] },
  { name: 'shared', items: ['ui/', 'lib/', 'config/'], imports: [] },
]

const structure = computed(() => mode.value === 'layered' ? layered : fsd)
</script>

<template>
  <div class="demo">
    <p class="badge">分层架构对比</p>

    <div class="switch">
      <button :class="{ active: mode === 'layered' }" @click="mode = 'layered'">传统分层</button>
      <button :class="{ active: mode === 'fsd' }" @click="mode = 'fsd'">FSD 切片</button>
    </div>

    <ul class="layers">
      <li v-for="(l, i) in structure" :key="l.name" :style="{ marginLeft: `${mode === 'fsd' ? (i * 8) : 0}px` }">
        <div class="layer-name">{{ l.name }}/</div>
        <div class="layer-items">
          <span v-for="it in l.items" :key="it" class="item">{{ it }}</span>
        </div>
        <div v-if="l.imports.length" class="layer-imports">
          imports: <code v-for="imp in l.imports" :key="imp">{{ imp }}</code>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 540px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eaf6f1; color: #2c8e63; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.switch { display: flex; gap: 6px; margin-bottom: 10px; }
.switch button { padding: 5px 12px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
.switch button.active { background: #42b883; color: #fff; border-color: #42b883; }
.layers { list-style: none; padding: 0; margin: 0; }
.layers li { padding: 8px; background: #f6f8fa; border-radius: 6px; margin-bottom: 6px; font-size: 0.78rem; }
.layer-name { font-weight: 700; color: #2c8e63; margin-bottom: 4px; }
.layer-items { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px; }
.item { background: #fff; padding: 1px 6px; border-radius: 4px; border: 1px solid #e0e0e0; font-family: ui-monospace, monospace; font-size: 0.74rem; }
.layer-imports { color: #888; font-size: 0.72rem; }
.layer-imports code { background: #fff; padding: 0 4px; border-radius: 3px; font-family: ui-monospace, monospace; margin-right: 4px; }
</style>
