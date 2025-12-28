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
  const { videoResolver, videoResolverSnap } = useVideoResolver();

  const duration = videoResolverSnap.getDuration(sourceVideoFile.name);

  React.useEffect(() => {
    if (!isImage(sourceVideoFile.name)) {
      videoResolver.loadMetadataOne({
        videoId: sourceVideoFile.name,
        videoPath: sourceVideoFile.path,
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
