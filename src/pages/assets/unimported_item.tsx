import type { VideoFileAsset } from '../../features/assets/assets_controller';
import { useVideoResolver } from '../../features/video_resolver/use_video_resolver';
import { isImage } from '../../lib/image_utils';
import { toMinutesString } from '../../lib/time_utils';
import { PreviewBaseItem } from './preview_base_item';
import { Button, Group } from '@mantine/core';
import React from 'react';

export const UnimportedItem = ({
  videoFileAsset,
  onImport,
  onDelete,
}: {
  videoFileAsset: VideoFileAsset;
  onImport: () => void;
  onDelete: () => void;
}) => {
  const { videoResolver, videoResolverSnap } = useVideoResolver();

  const duration = videoResolverSnap.getDuration(videoFileAsset.name);

  React.useEffect(() => {
    if (!isImage(videoFileAsset.name)) {
      videoResolver.loadMetadataOne({
        videoId: videoFileAsset.name,
        videoPath: videoFileAsset.path,
      });
    }
  }, [videoFileAsset, videoResolver]);

  const controls = (
    <>
      <Button onClick={onImport} size="compact-xs">
        Import
      </Button>
      <Button onClick={onDelete} size="compact-xs" color="red">
        Delete
      </Button>
    </>
  );

  return (
    <PreviewBaseItem
      videoPath={videoFileAsset.path}
      headerLeft={videoFileAsset.name}
      headerRight={toMinutesString(duration)}
      controls={controls}
    />
  );
};
