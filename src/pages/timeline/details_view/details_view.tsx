import { Paper } from '@mantine/core';
import { useEditorState } from '../editor_state_provider';
import { VideoClipDetails } from '../video_clip_details/video_clip_details';

import classes from './details_view.module.css';
import { AudioClipDetails } from '../audio_clip_details/audio_clip_details';

export const DetailsView = ({ playheadTime }: { playheadTime: number }) => {
  const { selectedVideoTimelineClip, selectedAudioTimelineClip } =
    useEditorState();

  let content: React.ReactNode = null;

  if (selectedVideoTimelineClip != null) {
    content = (
      <VideoClipDetails
        playheadTime={playheadTime}
        timelineClip={selectedVideoTimelineClip}
      />
    );
  }

  if (selectedAudioTimelineClip != null) {
    content = (
      <AudioClipDetails
        playheadTime={playheadTime}
        timelineClip={selectedAudioTimelineClip}
      />
    );
  }

  if (content == null) {
    return null;
  }

  return (
    <Paper shadow="xs" className={classes.root}>
      {content}
    </Paper>
  );
};
