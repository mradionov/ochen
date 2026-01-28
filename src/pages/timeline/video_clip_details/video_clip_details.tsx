import type { VideoTimelineClip } from '../../../features/video_timeline/video_timeline_selectors';
import { VideoClipCropTab } from './video_clip_crop_tab';
import { VideoClipInfoTab } from './video_clip_info_tab';
import { VideoClipTimeTab } from './video_clip_time_tab';
import { Tabs } from '@mantine/core';

export const VideoClipDetails = ({
  timelineClip,
  playheadTime,
}: {
  timelineClip: VideoTimelineClip;
  playheadTime: number;
}) => {
  return (
    <Tabs defaultValue="info" variant="outline">
      <Tabs.List>
        <Tabs.Tab value="info">Info</Tabs.Tab>
        <Tabs.Tab value="time">Time</Tabs.Tab>
        <Tabs.Tab value="crop">Crop</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="info">
        <VideoClipInfoTab timelineClip={timelineClip} />
      </Tabs.Panel>
      <Tabs.Panel value="time">
        <VideoClipTimeTab
          timelineClip={timelineClip}
          playheadTime={playheadTime}
        />
      </Tabs.Panel>
      <Tabs.Panel value="crop">
        <VideoClipCropTab timelineClip={timelineClip} />
      </Tabs.Panel>
    </Tabs>
  );
};
