import { Group, Loader, Stack, Title } from '@mantine/core';
import { useManifest } from '../../features/manifest/use_manifest';
import { useProjects } from '../../features/projects/use_projects';
import { UnimportedItem } from './unimported_item';
import type { SourceVideoFile } from '../../features/projects/projects_controller';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import { toMinutesString } from '../../lib/time_utils';
import { ClipItem } from './clip_item';
import type { VideoTimelineClip } from '../../features/video_timeline/video_timeline';
import { VideoTrackStore } from '../../features/manifest/stores/video_track_store';

export const PreviewPage = () => {
  const { sourceVideoFiles } = useProjects();
  const { manifestState, manifestStore } = useManifest();
  const { videoTimeline } = useVideoTimeline();

  if (manifestStore == null) {
    return <Loader />;
  }

  const importedNames = VideoTrackStore.selectVideoFilenames(
    manifestState.videoTrack,
  );
  const unimportedVideoFiles = sourceVideoFiles.filter(
    (file) => !importedNames.includes(file.name),
  );

  const timelineClips = videoTimeline.getTimelineClips(manifestState);
  const totalDuration = videoTimeline.getTotalDuration(manifestState);

  const onMoveLeft = (timelineClip: VideoTimelineClip) => {
    manifestStore.videoTrackStore.moveLeft(timelineClip.videoId);
  };

  const onMoveRight = (timelineClip: VideoTimelineClip) => {
    manifestStore.videoTrackStore.moveRight(timelineClip.videoId);
  };

  const onRemove = (timelineClip: VideoTimelineClip) => {
    manifestStore.videoTrackStore.removeClipAndVideo(timelineClip.videoId);
  };

  const onImport = (sourceVideoFile: SourceVideoFile) => {
    manifestStore.videoTrackStore.addClipAndVideo(
      sourceVideoFile.name,
      sourceVideoFile.path,
    );
  };

  return (
    <Stack>
      <div>total duration: {toMinutesString(totalDuration)}</div>

      <hr />

      {timelineClips.length > 0 && (
        <Stack>
          <Title>Clips</Title>
          <Group>
            {timelineClips.map((timelineClip) => (
              <ClipItem
                key={timelineClip.videoId}
                timelineClip={timelineClip}
                onMoveLeft={() => onMoveLeft(timelineClip)}
                onMoveRight={() => onMoveRight(timelineClip)}
                onRemove={() => onRemove(timelineClip)}
              />
            ))}
          </Group>
        </Stack>
      )}

      {unimportedVideoFiles.length > 0 && (
        <Stack>
          <Title>Unimported</Title>
          <Group>
            {unimportedVideoFiles.map((sourceVideoFile) => (
              <UnimportedItem
                key={sourceVideoFile.path}
                sourceVideoFile={sourceVideoFile}
                onImport={() => onImport(sourceVideoFile)}
              />
            ))}
          </Group>
        </Stack>
      )}
    </Stack>
  );
};
