import * as Tone from "tone";

type DrumkitInstrument = "kick" | "clap" | "hat" | "openHat" | "snare";

export type Drumkit = {
  name: string;
  instruments: Partial<Record<DrumkitInstrument, Tone.Sampler>>;
};
