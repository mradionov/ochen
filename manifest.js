export async function fetchManifest() {
  const res = await fetch('/sets/01_who_are_you/manifest.json');
  const manifest = await res.json();

  const videoMap = parseVideoMap(manifest);
  const {tint, transitionOut} = manifest;

  const scenes = manifest.scenes.map((sceneMetadata) => {
    const {videoId, offsetX, offsetY} = sceneMetadata;
    return {
      videoPath: videoMap.get(videoId),
      offsetX,
      offsetY,
    };
  });

  const videos = Object.keys(manifest.videos).map((id) => {
    return {id, path: videoMap.get(id)};
  });

  return {
    scenes,
    tint,
    transitionOut,
    videos,
  };
}

function parseVideoMap(manifest) {
  const {videos} = manifest;

  const videoMap = new Map();
  const basePath = `/sets/01_who_are_you/videos/`

  Object.keys(videos).forEach((name) => {
    const fileName = videos[name];
    const filePath = `${basePath}/${fileName}`;
    videoMap.set(name, filePath);
  });

  return videoMap;
}

