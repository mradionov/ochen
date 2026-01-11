import React from 'react';
import type { AudioId, VideoId } from '../../features/manifest/manifest_schema';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import type { VideoTimelineClip } from '../../features/video_timeline/video_timeline_selectors';
import { useAudioTimeline } from '../../features/audio_timeline/use_audio_timeline';
import type { AudioTimelineClip } from '../../features/audio_timeline/audio_timeline_selectors';

type EditorState = {
  selectedVideoTimelineClip: VideoTimelineClip | undefined;
  selectVideoTimelineClip: (id: VideoId) => void;

  selectedAudioTimelineClip: AudioTimelineClip | undefined;
  selectAudioTimelineClip: (id: AudioId) => void;
};

const EditorStateContext = React.createContext<EditorState | null>(null);

export const EditorStateProvider = ({ children }: React.PropsWithChildren) => {
  const { videoTimeline } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  const [selectedVideoTimelineClipId, setSelectedVideoTimelineClipId] =
    React.useState<VideoId | null>(null);
  const [selectedAudioTimelineClipId, setSelectedAudioTimelineClipId] =
    React.useState<AudioId | null>(null);

  const selectedVideoTimelineClip =
    selectedVideoTimelineClipId != null
      ? videoTimeline.getTimelineClip(selectedVideoTimelineClipId)
      : undefined;

  const selectedAudioTimelineClip =
    selectedAudioTimelineClipId != null
      ? audioTimeline.getTimelineClip(selectedAudioTimelineClipId)
      : undefined;

  const selectVideoTimelineClip = (id: VideoId) => {
    setSelectedVideoTimelineClipId(id);
    setSelectedAudioTimelineClipId(null);
  };

  const selectAudioTimelineClip = (id: AudioId) => {
    setSelectedAudioTimelineClipId(id);
    setSelectedVideoTimelineClipId(null);
  };

  const value: EditorState = {
    selectedVideoTimelineClip,
    selectVideoTimelineClip,

    selectedAudioTimelineClip,
    selectAudioTimelineClip,
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
