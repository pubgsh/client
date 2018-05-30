// TODO: Investigate why this magic number has to be here. Without it, player positions are slightly off,
// and they're off by a larger amount towards the bottom right corner. 0.996 solves this reasonably well,
// but it feels super dirty.
export const toScale = (mapSize, n) =>
    n / 816000 * mapSize * 0.996

