<script lang="ts">
  import { RenderLoopKey } from '$lib/di';
  import { Precondition } from '$lib/precondition';
  import type { RenderLoop } from '$lib/render_loop';
  import { getContext, onMount } from 'svelte';
  import type { AudioCaptureData } from './audio_capture';
  import { audioAnalyserBandsConfig } from './audio_analyser';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);

  export let audioCaptureData: AudioCaptureData | undefined;

  let canvasElementContainer: HTMLDivElement;

  const colors = [
    '#FF4D6D', // warm pink-red
    '#FF9F1C', // amber
    '#F7E733', // soft yellow
    '#4ADE80', // mint green
    '#22D3EE', // cyan
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#C084FC', // violet
  ];

  const config = audioAnalyserBandsConfig;

  onMount(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = Precondition.checkExists(canvas.getContext('2d'));

    renderLoop.tick.addListener(() => {
      if (!audioCaptureData) return;

      const { data, sampleRate } = audioCaptureData;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      //   const barWidth = (canvas.width / data.length) * 10;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        const y = (v / 255) * canvas.height;

        Object.keys(config).forEach((key, index) => {
          const bandLow = (config[key][0] / sampleRate) * data.length;
          const bandHigh = (config[key][1] / sampleRate) * data.length;

          if (i > bandLow && i < bandHigh) {
            ctx.fillStyle = colors[index];
          }
        });

        ctx.fillRect(x, canvas.height - y, 1, y);
        x += 1;
      }
    });

    canvasElementContainer.appendChild(canvas);
  });
</script>

<div>
  <div bind:this={canvasElementContainer}></div>
  <div></div>
</div>
