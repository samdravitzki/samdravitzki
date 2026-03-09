import p5 from "p5";
import * as Tone from "tone";
import Bounds from "../../ecs/core/Bounds/Bounds";
import World from "../../ecs/core/World/World";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import { Part } from "../../ecs/core/Part/Part";

const volumeSliderPart: Part<{
  setup: unknown;
}> = ({ registerSystem, triggerBuilder }) => {
  function setupVolumeSlider(_world: World, resources: ResourcePool) {
    const p = resources.get<p5>("p5");
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    const menuArea = p.createDiv();
    menuArea.position(canvasBounds.bottom.left.x, canvasBounds.bottom.left.y);
    menuArea.style("display", "flex");

    const icon = p.createSpan("🔊");
    icon.parent(menuArea);

    const volumeSlider = p.createSlider(-46, 4);
    volumeSlider.parent(menuArea);

    (volumeSlider as any).input(() => {
      Tone.getDestination().volume.value = Number(volumeSlider.value());
    });
  }

  registerSystem(
    "setup-volume-slider",
    triggerBuilder.on("setup"),
    setupVolumeSlider,
  );
};

export default volumeSliderPart;
