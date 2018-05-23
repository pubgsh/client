import React from 'react'
import { map } from 'lodash'
import { Stage, Layer } from 'react-konva'
import { Safezone, Bluezone, Redzone } from './ZoneCircle.js'
import PlayerDot from './PlayerDot.js'
import PlayerTooltip from './PlayerTooltip.js'
import BackgroundLayer from './BackgroundLayer.js'

const Map = ({ match, telemetry, mapSize, marks }) => {
    return (
        <Stage width={mapSize} height={mapSize}>
            <BackgroundLayer mapName={match.mapName} mapSize={mapSize} />
            <Layer>
                {<Safezone mapSize={mapSize} circle={telemetry.get('safezone')} />}
                {<Bluezone mapSize={mapSize} circle={telemetry.get('bluezone')} />}
                {<Redzone mapSize={mapSize} circle={telemetry.get('redzone')} />}
                {map(telemetry.get('players'), player =>
                    <PlayerDot
                        player={player}
                        mapSize={mapSize}
                        key={`dot-${player.get('name')}`}
                        isHovered={marks.isHovered(player.get('name'))}
                        isTracked={marks.isTracked(player.get('name'))}
                        setHoveredPlayer={marks.setHoveredPlayer}
                        toggleTrackedPlayer={marks.toggleTrackedPlayer}
                    />,
                )}
                {map(telemetry.get('players'), player =>
                    <PlayerTooltip
                        player={player}
                        mapSize={mapSize}
                        key={`tooltip-${player.get('name')}`}
                        show={marks.isTracked(player.get('name')) || marks.isHovered(player.get('name'))}
                    />,
                )}
            </Layer>
        </Stage>
    )
}

export default Map
