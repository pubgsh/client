import React from 'react'
import { map } from 'lodash'
import { Stage, Layer } from 'react-konva'
import { Safezone, Bluezone, Redzone } from './ZoneCircle.js'
import PlayerDot from './PlayerDot.js'
import BackgroundLayer from './BackgroundLayer.js'

const getDotColor = (isFocused, status) => {
    if (isFocused) {
        return status === 'dead' ? '#895aff' : '#18e786'
    }

    return status === 'dead' ? '#FF0000' : '#FFF'
}

const Map = ({ match, telemetry, secondsSinceEpoch, focusedPlayer, mapSize }) => {
    if (!telemetry) return 'Loading telemetry...'

    const { players, safezone, bluezone, redzone } = telemetry.stateAt(secondsSinceEpoch)

    return (
        <Stage width={mapSize} height={mapSize}>
            <BackgroundLayer mapName={match.mapName} mapSize={mapSize} />
            <Layer>
                {map(players, (player, name) => {
                    try {
                        return <PlayerDot
                            {...player}
                            mapSize={mapSize}
                            key={name}
                            name={name}
                        />
                    } catch (e) {
                        console.log('no position for', name)
                    }
                })}
                {safezone.position && <Safezone mapSize={mapSize} {...safezone} />}
                {bluezone.position && <Bluezone mapSize={mapSize} {...bluezone} />}
                {redzone.position && <Redzone mapSize={mapSize} {...redzone} />}
            </Layer>
        </Stage>
    )
}

export default Map
