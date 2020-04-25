<template>
  <div>
    <!-- 基本示例 -->
    <CompositionBasic />

    <Watch />
    <WatchRef />
    <WatchMulti />

    <Hooks></Hooks>
    <WatchEffect />
    <WatchEffectBind />
    <WatchEffectDebug />
    <WatchEffectRunTime />
    <WatchEffectFlush />
    <WatchEffectStopInSetup />
    <WatchEffectReturnStop />
    <WatchEffectOnInvalidate />

    <Setup />
    <SetupRuntime />
    <SetupReturnRender />
    <SetupInputProps name="tom" />
    <SetupInputContext jack="hi" name="tom" />

    <!-- 数据提供 -->
    <Ref />
    <Reactive />
    <Computed />
    <ComputedState />
    <ComputedAccessor />
    <ProductInject />
    <IsRef />
    <ToRefs />
    <Readonly />
  </div>
</template>

<script>
import { ref } from 'vue';
import CompositionBasic from '../composition/Basic.vue';

import Watch from '../composition/Watch.vue';
import WatchRef from '../composition/WatchRef.vue';
import WatchMulti from '../composition/WatchMulti.vue';

import Hooks from '../composition/Hooks.vue';
import WatchEffect from '../composition/WatchEffect.vue';
import WatchEffectBind from '../composition/WatchEffectBind.vue';
import WatchEffectDebug from '../composition/WatchEffectDebug.vue';
import WatchEffectFlush from '../composition/WatchEffectFlush.vue';
import WatchEffectRunTime from '../composition/WatchEffectRunTime.vue';
import WatchEffectStopInSetup from '../composition/WatchEffectStopInSetup.vue';
import WatchEffectReturnStop from '../composition/WatchEffectReturnStop.vue';
import WatchEffectOnInvalidate from '../composition/WatchEffectOnInvalidate.vue';

import Ref from '../composition/Ref.vue';
import Reactive from '../composition/Reactive.vue';
import Computed from '../composition/Computed.vue';
import ComputedState from '../composition/ComputedState.vue';
import ComputedAccessor from '../composition/ComputedAccessor.vue';
import ProductInject from '../composition/ProductInject.vue';

import ToRefs from '../composition/ToRefs.vue';
import IsRef from '../composition/IsRef.vue';
import Readonly from '../composition/Readonly.vue';

import Setup from '../composition/Setup.vue';
import SetupRuntime from '../composition/SetupRuntime.vue';
import SetupReturnRender from '../composition/SetupReturnRender.vue';
import SetupInputProps from '../composition/SetupInputProps.vue';
import SetupInputContext from '../composition/SetupInputContext.vue';

// 特性
// import Fragment from '../feature/Fragment.vue';

export default {
  components: {
    // 特性
    Fragment,

    CompositionBasic,

    Watch,
    WatchRef,
    WatchMulti,

    Hooks,
    WatchEffect,
    WatchEffectBind,
    WatchEffectDebug,
    WatchEffectRunTime,
    WatchEffectFlush,
    WatchEffectStopInSetup,
    WatchEffectReturnStop,
    WatchEffectOnInvalidate,

    Setup,
    SetupRuntime,
    SetupReturnRender,
    SetupInputProps,
    SetupInputContext,

    Ref,
    Reactive,
    Computed,
    ComputedState,
    ComputedAccessor,
    ProductInject,
    Readonly,
    IsRef,
    ToRefs
  }
};
</script>

<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
