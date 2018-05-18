import { get, forEach } from 'lodash'

export default function Telemetry(matchData, telemetry) {
    const epoch = new Date(matchData.playedAt).getTime()

    function stateAt(secondsSinceEpoch) {
        const msSinceEpoch = secondsSinceEpoch * 1000
        const players = {}
        const safezone = {}
        const bluezone = {}
        const redzone = {}

        forEach(telemetry, d => {
            if (new Date(d._D).getTime() - epoch > msSinceEpoch) {
                // This event happened after the time we care about. Since events are sorted, no more
                // events in telemetryData are relevant. Returning false here breaks iteration.
                return false
            }

            if (get(d, 'character.name')) {
                const { name, location } = d.character
                const player = (players[name] || (players[name] = {}))

                player.lastUpdatedAt = new Date(d._D).getTime() - epoch
                player.location = location
            }

            if (d._T === 'LogPlayerKill') {
                players[d.victim.name].status = 'dead'
            }

            if (d._T === 'LogGameStatePeriodic') {
                bluezone.position = d.gameState.safetyZonePosition
                bluezone.radius = d.gameState.safetyZoneRadius
                safezone.position = d.gameState.poisonGasWarningPosition
                safezone.radius = d.gameState.poisonGasWarningRadius
                redzone.position = d.gameState.redZonePosition
                redzone.radius = d.gameState.redZoneRadius
            }
        })

        return { players, safezone, bluezone, redzone }
    }

    return {
        stateAt,
    }
}
