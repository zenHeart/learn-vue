<template>
  <section class="layout">
    <div class="pane main">
      <h3>设置中心</h3>
      <nav class="tabs">
        <RouterLink to="/settings/profile">个人资料</RouterLink>
        <RouterLink to="/settings/security">安全</RouterLink>
        <RouterLink to="/settings/notifications">通知</RouterLink>
      </nav>
      <!-- 子路由出口：父组件必须保留一个 <router-view> 才能渲染 children -->
      <router-view />
    </div>
    <!-- 命名视图出口不在此处；App.vue 顶部那个带 name 的 router-view 才匹配 -->
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>