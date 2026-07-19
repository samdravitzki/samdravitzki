import p5 from "p5";
import * as Tone from "tone";
import Bounds from "@samdravitzki/dufus-engine/src/core/Bounds/Bounds";
import World from "@samdravitzki/dufus-engine/src/core/World/World";
import { ResourcePool } from "@samdravitzki/dufus-engine/src/core/Engine/ResourcePool";
import { Part } from "@samdravitzki/dufus-engine/src/core/Part/Part";

const volumeSliderPart: Part<{
  setup: void;
}> = ({ registerSystem, triggerBuilder }) => {
  function setupVolumeSlider(_world: World, resources: ResourcePool) {
    const p = resources.get<p5>("p5");
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    const menuArea = p.createDiv();
    menuArea.position(canvasBounds.bottom.left.x, canvasBounds.bottom.left.y);
    menuArea.style("width", "100%");
    menuArea.style("display", "flex");
    menuArea.style("flex-direction", "row-reverse");

    const sliderContainer = p.createDiv();
    sliderContainer.parent(menuArea);

    const icon = p.createSpan("🔊");
    icon.parent(sliderContainer);

    const DEFAULT_VOLUME = -10;

    const volumeSlider = p.createSlider(-46, 4, DEFAULT_VOLUME);
    volumeSlider.parent(sliderContainer);

    Tone.getDestination().volume.value = DEFAULT_VOLUME;

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
