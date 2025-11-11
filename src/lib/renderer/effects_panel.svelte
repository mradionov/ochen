<script lang="ts">
  import type { ChangeEventHandler } from 'svelte/elements';
  import { EffectsMap } from './effects_map.svelte';
  import { getContext, onMount } from 'svelte';
  import type { RenderLoop } from '$lib/render_loop';
  import { RenderLoopKey } from '$lib/di';
  import { hexToHsl, hslToHex } from '$lib/color';
  import { Timer } from '$lib/timer';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);

  type WithTarget<E, T> = E & { target: T; currentTarget: T };

  let { effects = EffectsMap.createEmpty() }: { effects?: EffectsMap } =
    $props();

  let shouldLoopTint = $state(true);
  let tintLoopDelay = $state(1);
  let tintLoopStep = $state(1);
  const tintLoopDelayTimer = new Timer(tintLoopDelay);

  onMount(() => {
    renderLoop.tick.addListener(({ deltaTime }) => {
      if (shouldLoopTint && effects.tint) {
        tintLoopDelayTimer.update(deltaTime);
        if (tintLoopDelayTimer.isDone()) {
          const hsl = hexToHsl(effects.tint);
          const newHue = (hsl.h + tintLoopStep) % 360;
          const newHsl = { ...hsl, h: newHue };
          const newHex = hslToHex(newHsl);
          effects.tint = newHex;
          tintLoopDelayTimer.reset();
        }
      }
    });
  });

  function handleTintChange(event: WithTarget<Event, HTMLInputElement>) {
    const tintHex = event.currentTarget?.value;
    effects.tint = tintHex;
  }

  function handleShouldLoopTint(event: WithTarget<Event, HTMLInputElement>) {
    shouldLoopTint = event.target?.checked;
  }

  function handleTintLoopDelay(event: WithTarget<Event, HTMLInputElement>) {
    tintLoopDelay = Number(event.currentTarget.value);
    tintLoopDelayTimer.reset(tintLoopDelay);
  }

  function handleTintLoopStep(event: WithTarget<Event, HTMLInputElement>) {
    tintLoopStep = Number(event.currentTarget.value);
  }
</script>

<div>
  <hr />
  <h3>tint</h3>
  <input type="color" value={effects.tint} onchange={handleTintChange} />
  <label>
    <input
      type="checkbox"
      onchange={handleShouldLoopTint}
      bind:checked={shouldLoopTint}
    />
    loop
  </label>
  <input
    type="range"
    min={0.001}
    max={4}
    step={0.001}
    onchange={handleTintLoopDelay}
    value={tintLoopDelay}
  />
  loop delay ({tintLoopDelay})
  <input
    type="range"
    min={1}
    max={360}
    step={1}
    onchange={handleTintLoopStep}
    value={tintLoopStep}
  />
  loop step ({tintLoopStep})
  <hr />
</div>
