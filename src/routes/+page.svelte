<script lang="ts">
  import ProjectsList from '$lib/projects/projects_list.svelte';
</script>

<a href="/preview">Preview</a>
<a href="/performance">Performance</a>
<a href="/timeline">Timeline</a>
<a href="/audio">Audio</a>
<a href="/live">Live</a>

<ProjectsList />

<style>
  a {
    display: inline-block;
    padding: 10px;
  }
</style>
