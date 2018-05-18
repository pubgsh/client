import React from 'react'
import { map } from 'lodash'
import Telemetry from '../../models/Telemetry.js'
import { Safezone, Bluezone, Redzone } from './ZoneCircle.js'
import PlayerDot from './PlayerDot.js'
import MapBackground from './MapBackground.js'

const Map = ({ match, telemetry, secondsSinceEpoch, focusPlayer }) => {
    if (!telemetry) return 'Loading telemetry'

    const t = Telemetry(match, telemetry)
    const { players, safezone, bluezone, redzone } = t.stateAt(secondsSinceEpoch)

    return (
        <MapBackground mapName={match.mapName}>
            {map(players, (player, name) =>
                <PlayerDot key={name} name={name} {...player} focusPlayer={focusPlayer} />
            )}
            {safezone.position && <Safezone {...safezone} />}
            {bluezone.position && <Bluezone {...bluezone} />}
            {redzone.position && <Redzone {...redzone} />}
        </MapBackground>
    )
}

export default Map
