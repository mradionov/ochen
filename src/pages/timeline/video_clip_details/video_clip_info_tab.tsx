import { useManifest } from '../../../features/manifest/use_manifest';
import type { VideoTimelineClip } from '../../../features/video_timeline/video_timeline_selectors';
import { Button, Group, Table } from '@mantine/core';

export const VideoClipInfoTab = ({
  timelineClip,
}: {
  timelineClip: VideoTimelineClip;
}) => {
  const { manifestStore } = useManifest();

  const onMoveLeft = () => {
    manifestStore.videoTrackStore.moveLeft(timelineClip.videoId);
  };

  const onMoveRight = () => {
    manifestStore.videoTrackStore.moveRight(timelineClip.videoId);
  };

  return (
    <Table variant="vertical">
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={2}>
            <Group>
              <Button disabled={timelineClip.isFirst} onClick={onMoveLeft}>
                Move &lt;
              </Button>
              <Button disabled={timelineClip.isLast} onClick={onMoveRight}>
                Move &gt;
              </Button>
            </Group>
          </Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>id</Table.Th>
          <Table.Td>{timelineClip.videoId}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>index</Table.Th>
          <Table.Td>{timelineClip.index}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>last</Table.Th>
          <Table.Td>{timelineClip.isLast ? 'Yes' : 'No'}</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};
