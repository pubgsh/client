/* From pubgsh/client#15:

The reason for this is if you look at the in-game data for the map image, it's loaded as 8128x8128 pixels
but exports as 8192x8192

8128/8192 = 0.9921875

"InImageSizeX": 8128.0,
"InImageSizeY": 8128.0,
"ImageSizeX": 8192.0,
"ImageSizeY": 8192.0,
"Bounds": [
  812775.0,
  812775.0
],

And in the telemetry case, it's 8160 / 8192 = 0.99609375
*/
export const toScale = (pubgMapSize, mapSize, n) =>
    n / pubgMapSize * mapSize * (pubgMapSize === 816000 ? 0.99609375 : 1)
