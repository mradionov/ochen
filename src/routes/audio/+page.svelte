<script lang="ts">
  import { AudioCapture } from '$lib/audio/audio_capture';
  import { RenderLoopKey } from '$lib/di';
  import type { RenderLoop } from '$lib/render_loop';
  import { getContext, onMount } from 'svelte';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  const audioCapture = new AudioCapture();

  let canvasElementContainer: HTMLDivElement;

  onMount(async () => {
    await audioCapture.connect();

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    renderLoop.tick.addListener(() => {
      const { data, bufferLength } = audioCapture.update();
      console.log(data);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 10;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = data[i];
        const y = (v / 255) * canvas.height;
        ctx.fillStyle = `hsl(${(i / bufferLength) * 360}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - y, barWidth, y);
        x += barWidth + 1;
      }
    });

    canvasElementContainer.appendChild(canvas);
  });

  function handleStart() {
    renderLoop.start();
    audioCapture.start();
  }

  function handleStop() {
    renderLoop.stop();
    audioCapture.stop();
  }
</script>

<button onclick={handleStart}>start</button>
<button onclick={handleStop}>stop</button>
<hr />
<div bind:this={canvasElementContainer}></div>
