import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

class DrumsEngine {
  private synths: any[] = [];

  run() {
    console.debug("Starting...");

    // Code from tonejs midi example https://github.com/Tonejs/Midi/blob/master/examples/load.html
    Midi.fromUrl("public/mario.mid").then((midi) => {
      const now = Tone.now();
      midi.tracks.forEach((track) => {
        const synth = new Tone.PolySynth(Tone.Synth, {
          envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
        }).toDestination();

        this.synths.push(synth);

        track.notes.forEach((note) => {
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            note.time + now,
            note.velocity
          );
        });
      });
    });
  }

  stop() {
    while (this.synths.length) {
      const synth = this.synths.shift();
      synth.dispose();
    }

    console.debug("Stopped");
  }
}

const drums = new DrumsEngine();

export default drums;
