import { useManifest } from './use_manifest';
import { Button, Indicator } from '@mantine/core';

export const ManifestSaveButton = () => {
  const { saveManifest, hasManifestChanged } = useManifest();

  return (
    <Indicator
      inline
      disabled={!hasManifestChanged}
      processing={hasManifestChanged}
      color="red"
      size={12}
      withBorder
    >
      <Button onClick={saveManifest} disabled={!hasManifestChanged}>
        save manifest
      </Button>
    </Indicator>
  );
};
