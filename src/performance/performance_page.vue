<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { fetchManifest } from '@/manifest.ts';
import { RenderLoopKey } from '@/keys.ts';
import { SceneManager } from '@/scene_manager.ts';

const renderLoop = inject(RenderLoopKey)!;

const contentRef = ref<HTMLDivElement>();

onMounted(async () => {
  const setId = '03_jrugz';
  const manifest = await fetchManifest(setId);
  console.log(manifest);

  const sceneManager = new SceneManager(manifest, contentRef.value);
  sceneManager.resetPlayers();

  renderLoop.tick.addListener(({ deltaTime }) => {
    sceneManager.update({ deltaTime });
  });
  renderLoop.start();
});

function handleFullscreen() {
  contentRef.value?.requestFullscreen();
}
</script>

<template>
  <button @click="handleFullscreen">fullscreen</button>
  <hr />
  <div class="content" ref="contentRef"></div>
</template>

<style scoped>
.content {
  position: relative;
  /*padding-left: 400px;*/
}

.content :deep(> canvas) {
  position: absolute;
  top: 0;
  bottom: 0;
}

.content :deep(> canvas:first-child) {
  z-index: 3;
}

.content :deep(> canvas:last-child) {
  z-index: 2;
}

/*.transition-out-cut {*/
/*  display: none;*/
/*}*/

/*.transition-out-fade {*/
/*  animation-name: animation-fade;*/
/*  animation-fill-mode: forwards;*/
/*  animation-timing-function: ease-out;*/
/*}*/

/*@keyframes animation-fade {*/
/*  from {*/
/*    opacity: 1;*/
/*  }*/
/*  to {*/
/*    opacity: 0;*/
/*  }*/
</style>
