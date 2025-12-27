import { toMinutesString } from '../../lib/time_utils';
import type { SourceVideoFile } from '../../features/projects/projects_controller';
import { PreviewBaseItem } from './preview_base_item';
import { useVideoResolver } from '../../features/video_resolver/use_video_resolver';
import React from 'react';
import { isImage } from '../../lib/image_utils';
import { Button } from '@mantine/core';

export const UnimportedItem = ({
  sourceVideoFile,
  onImport,
}: {
  sourceVideoFile: SourceVideoFile;
  onImport: () => void;
}) => {
  const { videoResolver } = useVideoResolver();

  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    if (!isImage(sourceVideoFile.name)) {
      videoResolver
        .loadMetadataOne({
          videoId: sourceVideoFile.name,
          videoPath: sourceVideoFile.path,
        })
        .then((metadata) => {
          setDuration(metadata.duration);
        });
    }
  }, [sourceVideoFile, videoResolver]);

  const controls = (
    <Button onClick={onImport} size="compact-xs">
      Import
    </Button>
  );

  return (
    <PreviewBaseItem
      videoPath={sourceVideoFile.path}
      headerLeft={sourceVideoFile.name}
      headerRight={toMinutesString(duration)}
      controls={controls}
    />
  );
};
