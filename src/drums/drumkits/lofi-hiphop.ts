import * as Tone from "tone";
import { Drumkit } from "./Drumkit";

export const kick = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/itslucid-lofi/kick.wav",
  },
}).chain(new Tone.Panner(0), Tone.getDestination());

export const hat = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/itslucid-lofi/hat.wav",
  },
}).chain(new Tone.Gain(0.7), new Tone.Panner(0), Tone.getDestination());

export const snare = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/itslucid-lofi/snare.wav",
  },
}).chain(new Tone.Panner(0), Tone.getDestination());

export const lofiHipHopDrumkit: Drumkit = {
  name: "hiphop", // Should be called "lofi-hiphop"
  instruments: {
    kick,
    hat,
    snare,
  },
};
