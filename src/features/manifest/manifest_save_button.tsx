import { useManifest } from './use_manifest';
import { Button, Indicator } from '@mantine/core';

export const ManifestSaveButton = () => {
  const { manifestController, manifestVersionState } = useManifest();

  const { hasChanges } = manifestVersionState;

  return (
    <Indicator
      inline
      disabled={!hasChanges}
      processing={hasChanges}
      color="red"
      size={12}
      withBorder
    >
      <Button
        onClick={() => manifestController.saveManifest()}
        disabled={!hasChanges}
      >
        save manifest
      </Button>
    </Indicator>
  );
};
