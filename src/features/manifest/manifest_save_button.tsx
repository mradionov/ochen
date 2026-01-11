import { Button } from '@mantine/core';
import { useManifest } from './use_manifest';

export const ManifestSaveButton = () => {
  const { manifestStore, manifestWriter } = useManifest();

  const onClick = () => {
    void manifestWriter.writeWithFilePicker(manifestStore);
  };

  return <Button onClick={onClick}>save manifest</Button>;
};
