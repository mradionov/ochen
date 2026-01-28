import { useManifest } from '../../../features/manifest/use_manifest';
import type { VideoTimelineClip } from '../../../features/video_timeline/video_timeline_selectors';

export const VideoClipCropTab = ({
  timelineClip,
}: {
  timelineClip: VideoTimelineClip;
}) => {
  const { manifestStore } = useManifest();

  const onOffsetXChange = (value: string | number | undefined) => {
    manifestStore.videoTrackStore
      .getClipStore(timelineClip.videoId)
      .setOffsetX(value);
  };

  const onOffsetYChange = (value: string | number | undefined) => {
    manifestStore.videoTrackStore
      .getClipStore(timelineClip.videoId)
      .setOffsetY(value);
  };

  return <div>Video Clip Crop Tab Content</div>;
};
