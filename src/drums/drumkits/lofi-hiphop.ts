import * as Tone from "tone";
import { Drumkit } from "./Drumkit";

export const kick = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/itslucid-lofi/kick.wav",
  },
}).toDestination();

export const hat = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/itslucid-lofi/hat.wav",
  },
}).toDestination();

export const snare = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/itslucid-lofi/snare.wav",
  },
}).toDestination();

export const lofiHipHopDrumkit: Drumkit = {
  name: "hiphop", // Should be called "lofi-hiphop"
  instruments: {
    kick,
    hat,
    snare,
  },
};
