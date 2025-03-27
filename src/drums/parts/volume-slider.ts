import Engine from "../../ecs/core/Engine/Engine";
import * as Tone from "tone";

export default function volumeSliderPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  engine.system(
    "setup-volume-slider",
    { event: "start" },
    (_world, { p, canvasBounds }) => {
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
  );
}
