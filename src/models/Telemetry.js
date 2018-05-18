import { get, cloneDeep } from 'lodash'

export default function Telemetry(matchData, telemetry) {
    const epoch = new Date(matchData.playedAt).getTime()

    const cache = new Array(telemetry.length)
    cache[0] = {
        lastIndex: 0,
        state: {
            players: {},
            safezone: {},
            bluezone: {},
            redzone: {},
        },
    }

    function calculateState(previousResult, secondsSinceEpoch) {
        const msSinceEpoch = secondsSinceEpoch * 1000
        const result = cloneDeep(previousResult)

        // console.log('calculating', result)
        for (let i = result.lastIndex; i < telemetry.length; i++) {
            const d = telemetry[i]

            if (new Date(d._D).getTime() - epoch > msSinceEpoch) {
                return {
                    lastIndex: i,
                    state: result.state,
                }
            }

            if (get(d, 'character.name')) {
                const { name, location } = d.character
                const player = (result.state.players[name] || (result.state.players[name] = {}))
                player.lastUpdatedAt = new Date(d._D).getTime() - epoch
                player.location = location
            }

            if (d._T === 'LogPlayerKill') {
                result.state.players[d.victim.name].status = 'dead'
            }

            if (d._T === 'LogGameStatePeriodic') {
                result.state.bluezone.position = d.gameState.safetyZonePosition
                result.state.bluezone.radius = d.gameState.safetyZoneRadius
                result.state.safezone.position = d.gameState.poisonGasWarningPosition
                result.state.safezone.radius = d.gameState.poisonGasWarningRadius
                result.state.redzone.position = d.gameState.redZonePosition
                result.state.redzone.radius = d.gameState.redZoneRadius
            }
        }

        return {
            lastIndex: telemetry.length,
            state: result.state,
        }
    }

    function stateAt(secondsSinceEpoch) {
        if (!cache[secondsSinceEpoch]) {
            // console.log('no cache at ', secondsSinceEpoch)

            for (let i = secondsSinceEpoch; i >= 0; i--) {
                if (cache[i]) {
                    // console.log('found prev at', i, cache[i])
                    const result = calculateState(cache[i], secondsSinceEpoch)
                    cache[secondsSinceEpoch] = result
                    break
                }
            }
        }

        return cache[secondsSinceEpoch].state
    }

    return {
        stateAt,
    }
}
