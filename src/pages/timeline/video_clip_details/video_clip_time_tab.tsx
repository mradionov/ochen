import { useManifest } from '../../../features/manifest/use_manifest';
import type { VideoTimelineClip } from '../../../features/video_timeline/video_timeline_selectors';
import { toMinutesString } from '../../../lib/time_utils';
import { NumberInput, Table } from '@mantine/core';

export const VideoClipTimeTab = ({
  timelineClip,
  playheadTime,
}: {
  timelineClip: VideoTimelineClip;
  playheadTime: number;
}) => {
  const { manifestStore } = useManifest();

  const onRateChange = (value: string | number) => {
    if (typeof value === 'string') {
      return;
    }
    manifestStore.videoTrackStore
      .getClipStore(timelineClip.videoId)
      .setRate(value);
  };

  const onCustomDurationChange = (value: string | number) => {
    if (typeof value === 'string') {
      return;
    }
    manifestStore.videoTrackStore
      .getClipStore(timelineClip.videoId)
      .setCustomDuration(value);
  };

  return (
    <Table variant="vertical">
      <Table.Tbody>
        <Table.Tr>
          <Table.Th>start</Table.Th>
          <Table.Td>{toMinutesString(timelineClip.start)}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>end</Table.Th>
          <Table.Td>{toMinutesString(timelineClip.end)}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>custom duration</Table.Th>
          <Table.Td>
            <NumberInput
              value={timelineClip.customDuration}
              onChange={onCustomDurationChange}
            />
          </Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>duration</Table.Th>
          <Table.Td>{toMinutesString(timelineClip.duration)}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>rated duration</Table.Th>
          <Table.Td>{toMinutesString(timelineClip.ratedDuration)}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>rate</Table.Th>
          <Table.Td>
            <NumberInput
              min={0.1}
              step={0.1}
              max={10}
              value={timelineClip.rate}
              onChange={onRateChange}
            />
          </Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>file duration</Table.Th>
          <Table.Td>{toMinutesString(timelineClip.fileDuration)}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>trimmed duration</Table.Th>
          <Table.Td>{toMinutesString(timelineClip.trimmedDuration)}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td colSpan={2}></Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>time left</Table.Th>
          <Table.Td>
            {playheadTime > timelineClip.end ||
            playheadTime < timelineClip.start
              ? '-'
              : toMinutesString(timelineClip.end - playheadTime, true)}
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};
