import React from 'react';
import type { VideoId } from '../../features/manifest/manifest_schema';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import type { VideoTimelineClip } from '../../features/video_timeline/video_timeline_selectors';

type EditorState = {
  selectedVideoTimelineClip: VideoTimelineClip | undefined;
  selectVideoTimelineClip: (id: VideoId) => void;
};

const EditorStateContext = React.createContext<EditorState | null>(null);

export const EditorStateProvider = ({ children }: React.PropsWithChildren) => {
  const { videoTimeline } = useVideoTimeline();
  const [selectedVideoTimelineClipId, selectVideoTimelineClip] =
    React.useState<VideoId | null>(null);

  const selectedVideoTimelineClip =
    selectedVideoTimelineClipId != null
      ? videoTimeline.getTimelineClip(selectedVideoTimelineClipId)
      : undefined;

  const value: EditorState = {
    selectedVideoTimelineClip,
    selectVideoTimelineClip,
  };

  return (
    <EditorStateContext.Provider value={value}>
      {children}
    </EditorStateContext.Provider>
  );
};

export const useEditorState = (): EditorState => {
  const context = React.useContext(EditorStateContext);
  if (context == null) {
    throw new Error(
      'useEditorState must be used within an EditorStateProvider',
    );
  }
  return context;
};
