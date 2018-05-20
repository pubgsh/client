import React from 'react'
import { map } from 'lodash'
import { Stage, Layer } from 'react-konva'
import { Safezone, Bluezone, Redzone } from './ZoneCircle.js'
import PlayerDot from './PlayerDot.js'
import BackgroundLayer from './BackgroundLayer.js'

const Map = ({ match, telemetry, secondsSinceEpoch, focusedPlayer, mapSize }) => {
    if (!telemetry) return 'Loading telemetry...'

    const t = telemetry.stateAt(secondsSinceEpoch)

    return (
        <Stage width={mapSize} height={mapSize}>
            <BackgroundLayer mapName={match.mapName} mapSize={mapSize} />
            <Layer>
                {map(t.get('players'), player =>
                    <PlayerDot
                        player={player}
                        mapSize={mapSize}
                        key={player.get('name')}
                        name={player.get('name')}
                    />
                )}
                {<Safezone mapSize={mapSize} circle={t.get('safezone')} />}
                {<Bluezone mapSize={mapSize} circle={t.get('bluezone')} />}
                {<Redzone mapSize={mapSize} circle={t.get('redzone')} />}
            </Layer>
        </Stage>
    )
}

export default Map
