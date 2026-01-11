import { NumberInput, Table } from '@mantine/core';
import { toMinutesString } from '../../../lib/time_utils';
import { useManifest } from '../../../features/manifest/use_manifest';
import type { AudioTimelineClip } from '../../../features/audio_timeline/audio_timeline_selectors';

const Tr = Table.Tr;
const Th = Table.Th;
const Td = Table.Td;

export const AudioClipDetails: React.FC<{
  timelineClip: AudioTimelineClip;
  playheadTime: number;
}> = ({ timelineClip, playheadTime }) => {
  const { manifestStore } = useManifest();

  const onTrimEndChange = (value: string | number) => {
    if (typeof value === 'string') {
      return;
    }
    manifestStore.audioTrackStore
      .getClipStore(timelineClip.audioId)
      .setTrimEnd(value);
  };

  return (
    <Table variant="vertical">
      <Table.Tbody>
        <Tr>
          <Th>id</Th>
          <Td>{timelineClip.audioId}</Td>
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
          <Th>duration</Th>
          <Td>{toMinutesString(timelineClip.duration)}</Td>
        </Tr>
        <Tr>
          <Th>source duration</Th>
          <Td>{toMinutesString(timelineClip.sourceDuration)}</Td>
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
          <Th>trim end</Th>
          <Td>
            <NumberInput
              value={timelineClip.clip.trimEnd}
              onChange={onTrimEndChange}
            />
          </Td>
        </Tr>
      </Table.Tbody>
    </Table>
  );
};
