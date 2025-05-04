import p5 from "p5";
import Engine from "../../ecs/core/Engine/Engine";
import * as Tone from "tone";
import Bounds from "../../ecs/core/Bounds/Bounds";
import World from "../../ecs/core/World/World";
import { onStart } from "../../ecs/core/Engine/SystemTrigger";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";

export default function volumeSliderPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
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

  engine.system("setup-volume-slider", onStart(), setupVolumeSlider);
}
