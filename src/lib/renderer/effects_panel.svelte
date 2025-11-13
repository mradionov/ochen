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

  let enableTint = $state(!!effects.tint);
  let shouldLoopTint = $state(true);
  let tintLoopDelay = $state(1);
  let tintLoopStep = $state(1);
  const tintLoopDelayTimer = new Timer(tintLoopDelay);

  let enableEdge = $state(!!effects.edge);

  let enableGrain = $state(!!effects.grain);

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

  function handleOreder(event) {
    effects.order = event.target?.value.split(',');
  }

  function handleEnableTint(event) {
    enableTint = event.target?.checked;
    effects.tint = enableTint ? '#ff0000' : undefined;
  }

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

  function handleEnableEdge(event) {
    enableEdge = event.target?.checked;
    effects.edge = enableEdge ? {} : undefined;
  }

  function handleEdgeThreshold(event) {
    effects.edge = effects.edge ?? {};
    effects.edge.threshold = Number(event.currentTarget.value);
  }

  function handleEdgeTransparency(event) {
    effects.edge = effects.edge ?? {};
    effects.edge.transparency = Number(event.currentTarget.value);
  }

  function handleEnableGrain(event) {
    enableGrain = event.target?.checked;
    effects.grain = enableGrain ? { intensity: 0 } : undefined;
  }

  function handleGrainIntensity(event) {
    effects.grain = effects.grain ?? {};
    effects.grain.intensity = Number(event.currentTarget.value);
  }
</script>

<div>
  <hr />
  <h3>order</h3>
  <input type="text" value={effects.order?.join(',')} onchange={handleOreder} />
  <hr />
  <h3>tint</h3>
  <input
    type="checkbox"
    checked={enableTint}
    onchange={handleEnableTint}
  />enable
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
  <h3>edge</h3>
  <input
    type="checkbox"
    checked={enableEdge}
    onchange={handleEnableEdge}
  />enable

  <input
    type="range"
    min="1"
    max="255"
    step="1"
    value={effects.edge?.threshold}
    onchange={handleEdgeThreshold}
  />
  threshold ({effects.edge?.threshold})

  <input
    type="range"
    min="1"
    max="255"
    step="1"
    value={effects.edge?.transparency}
    onchange={handleEdgeTransparency}
  />
  transparency ({effects.edge?.transparency})
  <hr />
  <h3>grain</h3>
  <input
    type="checkbox"
    checked={enableGrain}
    onchange={handleEnableGrain}
  />enable

  <input
    type="range"
    min="1"
    max="1000"
    step="1"
    value={effects.grain?.intensity}
    onchange={handleGrainIntensity}
  />
  intensity ({effects.grain?.intensity})
</div>
