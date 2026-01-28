import { icon } from '../../../ui/icon';
import { AudioClipDetails } from '../audio_clip_details/audio_clip_details';
import { useEditorState } from '../editor_state_provider';
import { VideoClipDetails } from '../video_clip_details/video_clip_details';
import classes from './details_view.module.css';
import { ActionIcon, Group, Paper, Title } from '@mantine/core';

export const DetailsView = ({ playheadTime }: { playheadTime: number }) => {
  const {
    selectedVideoTimelineClip,
    selectedAudioTimelineClip,
    unselectVideoTimelineClip,
    unselectAudioTimelineClip,
  } = useEditorState();

  let content: React.ReactNode = null;
  let onClose: () => void = () => {};

  if (selectedVideoTimelineClip != null) {
    content = (
      <VideoClipDetails
        playheadTime={playheadTime}
        timelineClip={selectedVideoTimelineClip}
      />
    );
    onClose = () => unselectVideoTimelineClip();
  }

  if (selectedAudioTimelineClip != null) {
    content = (
      <AudioClipDetails
        playheadTime={playheadTime}
        timelineClip={selectedAudioTimelineClip}
      />
    );
    onClose = () => unselectAudioTimelineClip();
  }

  if (content == null) {
    return null;
  }

  return (
    <Paper shadow="xs" className={classes.root}>
      <Group justify="space-between" p="xs">
        <Title order={6}>Details</Title>
        <ActionIcon variant="subtle" onClick={onClose}>
          <icon.X />
        </ActionIcon>
      </Group>
      {content}
    </Paper>
  );
};
