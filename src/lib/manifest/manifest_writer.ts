import type { Manifest } from '$lib/manifest/manifest.svelte';

export class ManifestWriter {
  async writeWithFilePicker(manifest: Manifest) {
    const manifestRaw = manifest.toRaw();
    const manifestJson = JSON.stringify(manifestRaw, null, 2);

    const fileName = `manifest.json`;

    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(manifestJson);
    await writable.close();
  }
}
