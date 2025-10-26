<script lang='ts'>
  import { getContext, onMount } from 'svelte';
  import { ProjectsController } from '$lib/projects/projects_controller';
  import type { Project } from '$lib/projects/projects_controller';
  import { ProjectsControllerKey } from '$lib/di';

  const projectsController = getContext<ProjectsController>(ProjectsControllerKey);
  let projects: Project[] | undefined;

  onMount(async () => {
    projects = await projectsController.fetchProjects();
  });

  function handleChooseDirectory() {
    projectsController.chooseDir();
  }

  async function handleActivateProject(project: Project) {
    await projectsController.activate(project);
    projects = await projectsController.fetchProjects();
  }
</script>

<div>
  <button on:click={handleChooseDirectory}>Choose projects directory</button>

  <table>
    {#each projects as project}
      <tr>
        <td class='title' class:active={project.isActive}>
          { project.name }
        </td>
        <td>
          <button on:click={() => handleActivateProject(project)}>activate</button>
        </td>
      </tr>
    {/each}
  </table>
</div>

<style>
  .title {
    text-align: left;
  }

  .active {
    font-weight: bold;
  }
</style>
