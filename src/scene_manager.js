import {Player} from "./player.js";
import {createRenderer} from "./renderer.js";

export class SceneManager {
  currentIndex = 0;
  currentPlayer = undefined;
  nextPlayer = undefined;

  constructor(manifest, $content) {
    this.manifest = manifest;
    this.$content = $content;
  }

  update({deltaTime}) {
    this.currentPlayer?.update({deltaTime});
    // this.nextPlayer?.update({deltaTime});
  }

  createPlayerForScene(scene, sceneIndex) {
    const isLast = this.isLastScene(sceneIndex);

    const renderer = createRenderer({
      // width: 1080,
      // height: 1080,
      width: 800,
      height: 800,
      effects: this.manifest.effects,
      offsetX: scene.offsetX,
      offsetY: scene.offsetY,
    })

    return new Player(scene.videoPath, renderer, {
      transitionOut: !isLast ? this.manifest.transitionOut : undefined,
      loop: isLast,
      rate: scene.rate,
      onTransitionOutStart: () => {
        void this.nextPlayer?.play();
      },
      onEnded: () => {
        this.incrementScene();
      },
    });
  };

  resetPlayers() {
    let oldPlayer = this.currentPlayer;

    if (this.nextPlayer) {
      this.currentPlayer = this.nextPlayer;
    } else {
      const currentScene = this.getCurrentScene();
      if (currentScene) {
        this.currentPlayer = this.createPlayerForScene(this.getCurrentScene(), this.getCurrentSceneIndex())
        this.$content.appendChild(this.currentPlayer.renderer.$canvas);
      } else {
        this.currentPlayer = undefined;
      }
    }

    const nextScene = this.getNextScene();
    if (nextScene) {
      this.nextPlayer = this.createPlayerForScene(nextScene, this.getNextSceneIndex());
      this.$content.appendChild(this.nextPlayer.renderer.$canvas);
      void this.nextPlayer.showPoster();
    } else {
      this.nextPlayer = undefined;
    }

    if (oldPlayer && !this.isLastScene(this.getCurrentSceneIndex())) {
      oldPlayer.destroy();
      this.$content.removeChild(oldPlayer.renderer.$canvas);
    }

    void this.currentPlayer?.play();
  }

  incrementScene() {
    this.currentIndex += 1;
    this.resetPlayers();
  };

  getCurrentSceneIndex() {
    return this.currentIndex;
  }

  getNextSceneIndex() {
    return this.currentIndex + 1;
  }

  getCurrentScene() {
    return this.manifest.scenes[this.getCurrentSceneIndex()];
  }

  getNextScene() {
    return this.manifest.scenes[this.getNextSceneIndex()];
  }

  isLastScene(index) {
    return index >= this.manifest.scenes.length - 1
  }
}
