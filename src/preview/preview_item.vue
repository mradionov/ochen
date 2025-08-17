<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { toMinutesString } from '../time_utils.ts';
import type { SceneInTimeline } from '@/timeline.ts';
import { PlayerFactoryKey, RenderLoopKey } from '@/keys.ts';
import type { Scene } from '@/manifest.ts';

const renderLoop = inject(RenderLoopKey)!;
const playerFactory = inject(PlayerFactoryKey)!;

const props = defineProps<{
  videoId: string;
  scene: Scene;
  sceneInTimeline: SceneInTimeline;
}>();

const player = await playerFactory.createForPreview(props.scene);

const canvasContainerRef = ref<HTMLDivElement>();

onMounted(async () => {
  canvasContainerRef.value?.appendChild(player.renderer.$canvas);

  renderLoop.tick.addListener(({ deltaTime }) => {
    player.update({ deltaTime });
  });
});

function onContainerClick() {
  player.togglePlay();
}
</script>

<template>
  <div class="container" @click="onContainerClick">
    <div ref="canvasContainerRef" />
    <div class="header">
      <div class="title">{{ videoId }}</div>
      <div class="duration">
        {{ toMinutesString(sceneInTimeline.duration) }} ({{
          sceneInTimeline.rate
        }}x)
      </div>
    </div>
    <div class="footer">
      <div class="start">{{ toMinutesString(sceneInTimeline.start) }}</div>
      <div class="end">{{ toMinutesString(sceneInTimeline.end) }}</div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 200px;
  height: 200px;
  background: #a1a1a1;
  display: inline-block;
  margin: 5px;
  position: relative;
}

.header,
.footer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  padding: 4px;
  display: flex;
  justify-content: space-between;
  font: 10px sans-serif;
  color: #eee;
}

.footer {
  bottom: 0;
  top: auto;
}
</style>
