<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { fetchManifest } from '@/manifest.ts';
import ColorPicker from './color_picker.vue';
import PreviewItem from './preview_item.vue';
import { Timeline } from '@/timeline.ts';
import { toMinutesString } from '@/time_utils.ts';
import { RenderLoopKey, VideoResolverKey } from '@/keys.ts';

const videoResolver = inject(VideoResolverKey)!;
const renderLoop = inject(RenderLoopKey)!;

const tintRef = ref<string>('');
const totalDurationRef = ref<number>(0);
const itemsRef = ref([]);

onMounted(async () => {
  const setId = '03_jrugz';
  const manifest = await fetchManifest(setId);
  console.log({ manifest });

  await videoResolver.loadMetadata(manifest.videos);
  const timeline = new Timeline(manifest, videoResolver);

  const items = manifest.scenes.map((scene) => ({
    videoId: scene.videoId,
    sceneInTimeline: timeline.getSceneInTimeline(scene.videoId),
    scene,
  }));

  itemsRef.value = items;
  tintRef.value = manifest.effects?.tint;
  totalDurationRef.value = timeline.getTotalDuration();

  renderLoop.start();
});

function onTintChange(tint) {
  tintRef.value = tint;
}
</script>

<template>
  <Suspense>
    <template #default>
      <div>
        <div>total duration: {{ toMinutesString(totalDurationRef) }}</div>
        <ColorPicker :value="tintRef" @change="onTintChange" />
        <hr />
        <PreviewItem
          v-for="item in itemsRef"
          :key="item.videoId"
          :videoId="item.videoId"
          :scene="item.scene"
          :sceneInTimeline="item.sceneInTimeline"
        />
      </div>
    </template>
    <template #fallback> Loading...</template>
  </Suspense>
</template>
