<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { fetchManifest } from '$lib/manifest';
	import type { Scene } from '$lib/manifest';
	import { VideoResolverKey } from '$lib/di';
	import { Timeline } from '$lib/timeline';
	import type { SceneInTimeline } from '$lib/timeline';
	import { VideoResolver } from '$lib/video_resolver';
	import { toMinutesString } from '$lib/time_utils';
	import PreviewItem from './preview_item.svelte';

	type Item = {
		videoId: string;
		sceneInTimeline: SceneInTimeline;
		scene: Scene;
	};

	const videoResolver = getContext<VideoResolver>(VideoResolverKey);

	let tint;
	let totalDuration = 0;
	let items: Item[] = [];

	onMount(async () => {
		const setId = '03_jrugz';
		const manifest = await fetchManifest(setId);
		console.log({ manifest });

		await videoResolver.loadMetadata(manifest.videos);
		const timeline = new Timeline(manifest, videoResolver);

		items = manifest.scenes.map((scene) => ({
			videoId: scene.videoId,
			sceneInTimeline: timeline.getSceneInTimeline(scene.videoId),
			scene
		}));

		totalDuration = timeline.getTotalDuration();
		tint = manifest.effects?.tint;
		// TODO: on tint change
	});
</script>

<div>
	<div>total duration: {toMinutesString(totalDuration)}</div>
	<input type="color" bind:value={tint} />

	<hr />

	{#each items as item (item.videoId)}
		<PreviewItem videoId={item.videoId} scene={item.scene} sceneInTimeline={item.sceneInTimeline} />
	{/each}
</div>
