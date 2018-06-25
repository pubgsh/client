// TODO: Investigate why this magic number has to be here. Without it, player positions are slightly off,
// and they're off by a larger amount towards the bottom right corner. 0.996 solves this reasonably well,
// but it feels super dirty.
export const toScale = (pubgMapSize, mapSize, n) =>
    n / pubgMapSize * mapSize * (pubgMapSize === 816000 ? 0.996 : 1)

