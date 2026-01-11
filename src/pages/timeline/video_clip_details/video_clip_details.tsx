import { Button, Group, NumberInput, Table } from '@mantine/core';
import type { VideoTimelineClip } from '../../../features/video_timeline/video_timeline_selectors';
import { toMinutesString } from '../../../lib/time_utils';
import { useManifest } from '../../../features/manifest/use_manifest';
import { OffsetPicker } from '../../../ui/offset_picker/offset_picker';

const Tr = Table.Tr;
const Th = Table.Th;
const Td = Table.Td;

export const VideoClipDetails: React.FC<{
  timelineClip: VideoTimelineClip;
  playheadTime: number;
}> = ({ timelineClip, playheadTime }) => {
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

  const onMoveLeft = () => {
    manifestStore.videoTrackStore.moveLeft(timelineClip.videoId);
  };

  const onMoveRight = () => {
    manifestStore.videoTrackStore.moveRight(timelineClip.videoId);
  };

  return (
    <Table variant="vertical">
      <Table.Tbody>
        <Tr>
          <Th>id</Th>
          <Td>{timelineClip.videoId}</Td>
        </Tr>
        <Tr>
          <Th>index</Th>
          <Td>{timelineClip.index}</Td>
        </Tr>
        <Tr>
          <Th>last</Th>
          <Td>{timelineClip.isLast ? 'Yes' : 'No'}</Td>
        </Tr>
        <Tr>
          <Td colSpan={2}></Td>
        </Tr>
        <Tr>
          <Th>start</Th>
          <Td>{toMinutesString(timelineClip.start)}</Td>
        </Tr>
        <Tr>
          <Th>end</Th>
          <Td>{toMinutesString(timelineClip.end)}</Td>
        </Tr>
        <Tr>
          <Th>custom duration</Th>
          <Td>
            <NumberInput
              value={timelineClip.customDuration}
              onChange={onCustomDurationChange}
            />
          </Td>
        </Tr>
        <Tr>
          <Th>duration</Th>
          <Td>{toMinutesString(timelineClip.duration)}</Td>
        </Tr>
        <Tr>
          <Th>rated duration</Th>
          <Td>{toMinutesString(timelineClip.ratedDuration)}</Td>
        </Tr>
        <Tr>
          <Th>rate</Th>
          <Td>
            <NumberInput
              min={0.1}
              step={0.1}
              max={10}
              value={timelineClip.rate}
              onChange={onRateChange}
            />
          </Td>
        </Tr>
        <Tr>
          <Th>file duration</Th>
          <Td>{toMinutesString(timelineClip.fileDuration)}</Td>
        </Tr>
        <Tr>
          <Th>trimmed duration</Th>
          <Td>{toMinutesString(timelineClip.trimmedDuration)}</Td>
        </Tr>
        <Tr>
          <Td colSpan={2}></Td>
        </Tr>
        <Tr>
          <Th>time left</Th>
          <Td>
            {playheadTime > timelineClip.end ||
            playheadTime < timelineClip.start
              ? '-'
              : toMinutesString(timelineClip.end - playheadTime, true)}
          </Td>
        </Tr>
        <Tr>
          <Td colSpan={2}></Td>
        </Tr>
        <Tr>
          <Th>offsetX</Th>
          <Td>
            <OffsetPicker
              value={timelineClip.clip.offsetX}
              onChange={onOffsetXChange}
              extraOptions={['left', 'center', 'right']}
            />
          </Td>
        </Tr>
        <Tr>
          <Th>offsetY</Th>
          <Td>
            <OffsetPicker
              value={timelineClip.clip.offsetY}
              onChange={onOffsetYChange}
              extraOptions={['top', 'center', 'bottom']}
            />
          </Td>
        </Tr>
        <Tr>
          <Td colSpan={2}>
            <Group>
              <Button disabled={timelineClip.isFirst} onClick={onMoveLeft}>
                Move &lt;
              </Button>
              <Button disabled={timelineClip.isLast} onClick={onMoveRight}>
                Move &gt;
              </Button>
            </Group>
          </Td>
        </Tr>
      </Table.Tbody>
    </Table>
  );
};
