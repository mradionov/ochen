import { Paper } from '@mantine/core';
import { useEditorState } from '../editor_state_provider';
import { VideoClipDetails } from '../video_clip_details/video_clip_details';

import classes from './details_view.module.css';

export const DetailsView = () => {
  const { selectedVideoTimelineClip } = useEditorState();

  let content: React.ReactNode = null;

  if (selectedVideoTimelineClip != null) {
    content = <VideoClipDetails timelineClip={selectedVideoTimelineClip} />;
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
