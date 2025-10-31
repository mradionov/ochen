<script lang='ts'>
  import { ManifestWriter } from '$lib/manifest/manifest_writer';
  import { Manifest } from '$lib/manifest/manifest';

  const manifestWriter = new ManifestWriter();

  export let manifest: Manifest;

  function handleSave() {
    void manifestWriter.writeWithFilePicker(manifest);
  }
</script>

<button on:click={handleSave}>save manifest</button>
