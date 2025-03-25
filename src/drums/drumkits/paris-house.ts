import * as Tone from "tone";
import { Drumkit } from "./Drumkit";

export const kick = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_kick.wav",
  },
}).toDestination();

export const clap = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_clap.wav",
  },
}).toDestination();

export const hat = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_hat.wav",
  },
}).toDestination();

export const openHat = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_ohat.wav",
  },
}).toDestination();

export const snare = new Tone.Sampler({
  // This snare is very quiet
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_snare.wav",
  },
}).chain(
  new Tone.Filter(15000, "lowpass"),
  new Tone.Filter(0, "highpass"),
  new Tone.Compressor({
    threshold: 0,
    ratio: 1,
    attack: 0.5,
    release: 1,
  }),
  Tone.getDestination()
);

export const parisHouseDrumkit: Drumkit = {
  name: "house", // should be called
  instruments: {
    kick,
    clap,
    hat,
    openHat,
    snare,
  },
};
