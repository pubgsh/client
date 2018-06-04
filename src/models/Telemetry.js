import moment from 'moment'
import { get, clamp } from 'lodash'
import { Map } from 'immutable'
import Participants, { setPlayerStatus, setHealth } from './Participants.js'

function interpolate(lowerVal, upperVal, span, idx) {
    const yDelta = upperVal - lowerVal
    const yStep = yDelta / span
    return lowerVal + (yStep * idx)
}

const INTERVALS_PER_SECOND = 6

export default function Telemetry(matchData, telemetry, focusedPlayerName) {
    const epoch = moment.utc(matchData.playedAt).valueOf()

    console.time('Telemetry-eventParsing')

    let state = Map({
        players: Participants(matchData, focusedPlayerName),
        safezone: Map({ x: 0, y: 0, radius: 0 }),
        bluezone: Map({ x: 0, y: 0, radius: 0 }),
        redzone: Map({ x: 0, y: 0, radius: 0 }),
    })

    const cache = new Array((matchData.durationSeconds + 10) * INTERVALS_PER_SECOND)
    let currentInterval = 0

    telemetry.forEach((d, i) => {
        if (new Date(d._D).getTime() - epoch > currentInterval * 1000 / INTERVALS_PER_SECOND) {
            const playersArray = state.get('players').reverse().valueSeq().toArray()
                .filter(p => p.get('name'))

            while (new Date(d._D).getTime() - epoch > currentInterval * 1000 / INTERVALS_PER_SECOND) {
                const finalizedState = state.set('players', playersArray)
                cache[currentInterval] = finalizedState
                currentInterval++
            }
        }

        if (get(d, 'character.name')) {
            const { name, location, health } = d.character

            state = state.withMutations(s => {
                s.setIn(['players', name, 'location'], { ...location, atInterval: currentInterval })
                // setting health
                const playerPath = ['players', name]
                const player = setHealth(s.getIn(playerPath), health)
                s.setIn(playerPath, player)
            })
        }

        if (d._T === 'LogPlayerKill') {
            state = state.withMutations(s => {
                const victimPath = ['players', d.victim.name]
                const victim = setPlayerStatus(s.getIn(victimPath), 'dead')
                s.setIn(victimPath, victim)

                if (d.killer.name) {
                    const killerPath = ['players', d.killer.name]
                    const killer = s.getIn(killerPath)
                    s.setIn(killerPath, killer.set('kills', killer.get('kills') + 1))
                }
            })
        }

        if (d._T === 'LogPlayerTakeDamage') {
            state = state.withMutations(s => {
                const playerPath = ['players', d.victim.name]
                const player = setHealth(s.getIn(playerPath), d.victim.health - d.damage)
                s.setIn(playerPath, player)
            })
        }
        if (d._T === 'LogGameStatePeriodic') {
            const gs = d.gameState

            state = state.withMutations(s => {
                s.set('bluezone', Map({
                    ...gs.safetyZonePosition,
                    radius: gs.safetyZoneRadius,
                    atInterval: currentInterval,
                }))
                s.set('safezone', Map({ ...gs.poisonGasWarningPosition, radius: gs.poisonGasWarningRadius }))
                s.set('redzone', Map({ ...gs.redZonePosition, radius: gs.redZoneRadius }))
            })
        }
    })

    // Sometimes we don't load telemetry until the match duration, ensure that we don't get a cache
    // miss later on.
    for (currentInterval; currentInterval < cache.length; currentInterval++) {
        cache[currentInterval] = cache[currentInterval - 1]
    }

    console.timeEnd('Telemetry-eventParsing')

    function stateAt(msSinceEpoch) {
        const intervalsSinceEpoch = Math.floor(msSinceEpoch / 1000 * INTERVALS_PER_SECOND)
        return cache[clamp(intervalsSinceEpoch, INTERVALS_PER_SECOND, cache.length - 1)]
    }

    function finalState() {
        return cache[cache.length - 1]
    }

    console.time('Telemetry-interpolation')

    const realBluezoneLocs = {
        realDPIntervals: [],
        realDPs: {},
    }

    const playerNames = cache[cache.length - 1].get('players').map(p => p.get('name'))
    const realPlayerLocs = playerNames.reduce((acc, playerName) => {
        acc[playerName] = {
            realDPIntervals: [],
            realDPs: {},
        }
        return acc
    }, {})

    for (let i = 1; i < cache.length; i++) {
        const zone = cache[i].get('bluezone')
        if (zone.get('atInterval') === i) {
            realBluezoneLocs.realDPIntervals.push(i)
            realBluezoneLocs.realDPs[i] = zone
        }

        cache[i].get('players').forEach(player => {
            if (player.get('location').atInterval === i) {
                realPlayerLocs[player.get('name')].realDPIntervals.push(i)
                realPlayerLocs[player.get('name')].realDPs[i] = player.get('location')
            }
        })
    }

    for (let i = 2; i < cache.length; i++) {
        let interpolatedBluezone = cache[i].get('bluezone')

        if (interpolatedBluezone.get('atInterval') !== i) {
            const lowerIdx = realBluezoneLocs.realDPIntervals.find((s, si, arr) => s < i && arr[si + 1] > i)
            const upperIdx = realBluezoneLocs.realDPIntervals.find((s, si, arr) => s > i && arr[si - 1] < i)

            if (lowerIdx && upperIdx) {
                const lowerLoc = realBluezoneLocs.realDPs[lowerIdx].toJS()
                const upperLoc = realBluezoneLocs.realDPs[upperIdx].toJS()
                const span = upperIdx - lowerIdx
                const interpolatedX = interpolate(lowerLoc.x, upperLoc.x, span, i - lowerIdx)
                const interpolatedY = interpolate(lowerLoc.y, upperLoc.y, span, i - lowerIdx)
                const interpolatedR = interpolate(lowerLoc.radius, upperLoc.radius, span, i - lowerIdx)

                interpolatedBluezone = interpolatedBluezone.withMutations(z => {
                    z.set('x', interpolatedX)
                    z.set('y', interpolatedY)
                    z.set('radius', interpolatedR)
                })
            }
        }

        const interpolatedPlayers = cache[i].get('players').map(player => {
            const name = player.get('name')

            if (player.get('location').atInterval !== i) {
                const realLocs = realPlayerLocs[name]

                const lowerIdx = realLocs.realDPIntervals.find((s, si, arr) => s < i && arr[si + 1] > i)
                const upperIdx = realLocs.realDPIntervals.find((s, si, arr) => s > i && arr[si - 1] < i)

                if (!lowerIdx || !upperIdx) {
                    return player
                }

                const lowerLoc = realLocs.realDPs[lowerIdx]
                const upperLoc = realLocs.realDPs[upperIdx]
                const interpolatedX = interpolate(lowerLoc.x, upperLoc.x, upperIdx - lowerIdx, i - lowerIdx)
                const interpolatedY = interpolate(lowerLoc.y, upperLoc.y, upperIdx - lowerIdx, i - lowerIdx)

                return player.set('location', { x: interpolatedX, y: interpolatedY })
            }

            return player
        })

        cache[i] = cache[i].withMutations(s => {
            s.set('bluezone', interpolatedBluezone)
            s.set('players', interpolatedPlayers)
        })
    }

    console.timeEnd('Telemetry-interpolation')
    console.log(`Telemetry-${cache.length} cached intervals`)

    return {
        stateAt,
        finalState,
    }
}
