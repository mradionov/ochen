export async function fetchManifest(setId) {
  const res = await fetch(`/sets/${setId}/manifest.json`);
  const manifest = await res.json();

  const videoMap = parseVideoMap(setId, manifest);
  const {effects, transitionOut} = manifest;

  const scenes = manifest.scenes.map((sceneMetadata) => {
    const {videoId, offsetX, offsetY, rate} = sceneMetadata;
    return {
      videoId,
      videoPath: videoMap.get(videoId),
      offsetX,
      offsetY,
      rate,
    };
  });

  const videos = Object.keys(manifest.videos).map((id) => {
    return {id, path: videoMap.get(id)};
  });

  return {
    scenes,
    effects,
    transitionOut,
    videos,
  };
}

function parseVideoMap(setId, manifest) {
  const {videos} = manifest;

  const videoMap = new Map();
  const basePath = `/sets/${setId}/videos/`

  Object.keys(videos).forEach((name) => {
    const fileName = videos[name];
    const filePath = `${basePath}/${fileName}`;
    videoMap.set(name, filePath);
  });

  return videoMap;
}

