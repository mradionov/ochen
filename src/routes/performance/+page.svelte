<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { fetchManifest } from '$lib/manifest';
	import { SceneManager } from '$lib/scene_manager';
	import { RenderLoop } from '$lib/render_loop';
	import { RenderLoopKey } from '$lib/di';

	const renderLoop = getContext<RenderLoop>(RenderLoopKey);

	let contentElement: HTMLDivElement;

	onMount(async () => {
		const setId = '03_jrugz';
		const manifest = await fetchManifest(setId);
		console.log(manifest);

		const sceneManager = new SceneManager(manifest, contentElement);
		sceneManager.resetPlayers();

		renderLoop.tick.addListener(({ deltaTime }) => {
			sceneManager.update({ deltaTime });
		});
	});

	function handleFullscreen() {
		contentElement.requestFullscreen();
	}
</script>

<button on:click={handleFullscreen}>fullscreen</button>
<hr />
<div class="content" bind:this={contentElement}></div>

<style>
	.content {
		position: relative;
		/*padding-left: 400px;*/
	}

	/* TODO: avoid global */
	:global(.content > canvas) {
		position: absolute;
		top: 0;
		bottom: 0;
	}

	:global(.content > canvas:first-child) {
		z-index: 3;
	}

	:global(.content > canvas:last-child) {
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
