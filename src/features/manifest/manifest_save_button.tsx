import { useManifest } from './use_manifest';
import { Button, Group, Indicator } from '@mantine/core';

export const ManifestSaveButton = () => {
  const { manifestController, manifestVersionState } = useManifest();

  const { hasChanges } = manifestVersionState;

  return (
    <Group>
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
          Save manifest
        </Button>
      </Indicator>
    </Group>
  );
};
