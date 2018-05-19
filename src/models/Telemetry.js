import { get, cloneDeep } from 'lodash'

const getColor = (focusType, status) => {
    if (focusType === 'player') {
        return status === 'dead' ? '#895aff' : '#18e786'
    }

    if (focusType === 'teammate') {
        return status === 'dead' ? 'pink' : 'blue'
    }

    return status === 'dead' ? '#FF0000' : '#FFF'
}


export default function Telemetry(matchData, telemetry, focusedPlayer) {
    const epoch = new Date(matchData.playedAt).getTime()
    const focusedRosterId = matchData.players.find(p => p.name === focusedPlayer).rosterId

    function Player(name, rosterId) {
        this.name = name
        this.rosterId = rosterId

        this.focusType = (() => {
            if (name === focusedPlayer) return 'player'
            if (rosterId === focusedRosterId) return 'teammate'
            return 'none'
        })()

        this.setStatus('alive')
    }

    Player.prototype.setStatus = function setStatus(status) {
        this.status = status
        this.color = getColor(this.focusType, this.status)
    }

    // console.log(matchData)

    const initialResult = {
        lastIndex: 0,
        state: {
            players: {},
            safezone: {},
            bluezone: {},
            redzone: {},
        },
    }

    matchData.players.forEach(p => {
        initialResult.state.players[p.name] = new Player(p.name, p.rosterId)
    })

    console.log(initialResult)

    const cache = new Array(telemetry.length)
    cache[0] = initialResult

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
                const player = result.state.players[name]

                if (player) {
                    player.lastUpdatedAt = new Date(d._D).getTime() - epoch
                    player.location = location
                }
            }

            if (d._T === 'LogPlayerKill') {
                result.state.players[d.victim.name].setStatus('dead')
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
