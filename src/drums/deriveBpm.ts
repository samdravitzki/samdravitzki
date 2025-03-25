/**
 * Given an array of beats work out the bpm they were played at
 * @param beats an array of epoch timestamps relating to when each beat was played
 */
export function deriveBpm(beats: number[]) {
  if (beats.length < 2) {
    return 0;
  }

  const timeDifferences = beats.slice(1).map((num, i) => num - beats[i]);

  const total = timeDifferences.reduce(
    (sum, difference) => sum + difference,
    0
  );
  const msPerBeat = total / timeDifferences.length;
  const bpm = 60000 / msPerBeat;

  return bpm;
}
