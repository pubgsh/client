import moment from 'moment'
import { get, remove, minBy, cloneDeep } from 'lodash'

const TRACER_LIFETIME_DECISECONDS = 35

const blankIntervalState = () => ({
    players: {},
    bluezone: null,
    redzone: null,
    safezone: null,
    tracers: [],
    carePackages: [],
})

export default function parseTelemetry(matchData, telemetry, focusedPlayerName) {
    console.time('Telemetry-eventParsing')

    const epoch = moment.utc(matchData.playedAt).valueOf()

    const state = Array((matchData.durationSeconds + 1) * 10)
    const globalState = { kills: [], death: null }
    let curState = blankIntervalState()

    // Step One: Iterate through all telemetry data and store known points

    let matchStarted = false
    let curStateInterval = 0
    telemetry.forEach((d, i) => {
        const msSinceEpoch = new Date(d._D).getTime() - epoch
        const currentInterval = Math.floor(msSinceEpoch / 100)

        if (!matchStarted && d._T === 'LogMatchStart') {
            matchStarted = true
            console.log(d)
        }

        if (!matchStarted) return

        if (msSinceEpoch > (curStateInterval + 1) * 100) {
            // We've crossed over an interval boundary. Save off current interval state and clear it. Note
            // that we don't necessarily get a datapoint at each interval boundary, so we want to make sure
            // we're storing the state at the right interval and adjust accordingly.
            state[curStateInterval] = curState
            curState = blankIntervalState()
            curStateInterval = currentInterval
        }

        if (get(d, 'character.name')) {
            const { name, location, health } = d.character

            const player = curState.players[name] || (curState.players[name] = {})
            player.location = { x: location.x, y: location.y }
            player.health = health
        }

        if (d._T === 'LogPlayerKill') {
            const victim = curState.players[d.victim.name] || (curState.players[d.victim.name] = {})
            victim.status = 'dead'

            if (d.killer.name) {
                const killer = curState.players[d.killer.name] || (curState.players[d.killer.name] = {})
                killer.kills = (killer.kills || 0) + 1
            }

            if (d.victim.name === focusedPlayerName) {
                globalState.death = {
                    msSinceEpoch,
                    killedBy: d.killer.name,
                }
            }

            if (d.killer.name === focusedPlayerName) {
                globalState.kills.push({
                    msSinceEpoch,
                    victimName: d.victim.name,
                })
            }
        }

        if (d._T === 'LogPlayerTakeDamage') {
            const victimName = d.victim.name
            const victim = curState.players[victimName] || (curState.players[victimName] = {})
            victim.health = d.victim.health - d.damage
            victim.location = { x: d.victim.location.x, y: d.victim.location.y }

            if (d.damageTypeCategory === 'Damage_Gun') {
                // We need to add the tracer to the state TRACER_LIFETIME_DECISECONDS earlier than our current
                // state because PUBG gives us when the bullet landed. We want to make the tracer end at this
                // interval, but the bullet firing should be back in time.
                const tracerStart = currentInterval - TRACER_LIFETIME_DECISECONDS;
                (state[tracerStart] || (state[tracerStart] = blankIntervalState())).tracers.push({
                    key: i,
                    attackerName: d.attacker.name,
                    victimName: d.victim.name,
                    startInterval: currentInterval - TRACER_LIFETIME_DECISECONDS,
                    endInterval: currentInterval,
                })
            }
        }

        if (d._T === 'LogGameStatePeriodic') {
            const gs = d.gameState

            curState.bluezone = {
                ...gs.safetyZonePosition,
                radius: gs.safetyZoneRadius,
            }

            curState.safezone = {
                ...gs.poisonGasWarningPosition,
                radius: gs.poisonGasWarningRadius,
            }

            curState.redzone = {
                ...gs.redZonePosition,
                radius: gs.redZoneRadius,
            }
        }

        if (d._T === 'LogCarePackageSpawn') {
            curState.carePackages.push({
                key: i,
                location: d.itemPackage.location,
                items: d.itemPackage.items,
                state: 'spawned',
            })
        }

        if (d._T === 'LogCarePackageLand') {
            curState.carePackages.push({
                location: d.itemPackage.location,
                items: d.itemPackage.items,
                state: 'landed',
            })
        }

        if (d._T === 'LogMatchEnd') {
            state.matchEnd = d
        }
    })

    console.timeEnd('Telemetry-eventParsing')
    console.time('Telemetry-fixup')

    // Step Two: We don't get telemetry at every single interval, so we want to make sure we've generated
    // a blank holder for each interval

    for (let i = 0; i < state.length; i++) {
        if (!state[i]) {
            state[i] = blankIntervalState()
        }
    }

    console.timeEnd('Telemetry-fixup')
    console.time('Telemetry-enumerate')

    // Step Three: Enumerate known datapoints

    const playerDps = {} // dp = datapoint
    const bluezoneDps = []

    for (let i = 0; i < state.length; i++) {
        const s = state[i]

        Object.keys(s.players).forEach(playerName => {
            (playerDps[playerName] || (playerDps[playerName] = [])).push(i)
        })

        if (s.bluezone) {
            bluezoneDps.push(i)
        }
    }

    console.timeEnd('Telemetry-enumerate')
    console.time('Telemetry-pointer')

    // Step Four (a): Store pointer to known left/right datapoints for players

    const teammates = matchData.players.reduce((acc, p) => {
        const teammateNames = matchData.players
            .filter(op => op.rosterId === p.rosterId && op.name !== p.name)
            .map(t => t.name)

        acc[p.name] = teammateNames
        return acc
    }, {})

    Object.keys(playerDps).forEach(playerName => {
        const dps = playerDps[playerName]
        let dpIdx = 0

        let pointer = {
            left: undefined,
            right: dps[dpIdx++],
        }

        for (let i = 0; i < state.length; i++) {
            if (i === pointer.right) {
                // We're on a real datapoint

                // Merge previous player state with current...
                const curPlayerState = state[i].players[playerName]
                const previousPlayerState = pointer.left ? state[pointer.left].players[playerName] : {}
                state[i].players[playerName] = {
                    ...previousPlayerState,
                    ...curPlayerState,
                    teammates: teammates[playerName] || [],
                    name: playerName,
                    kills: (previousPlayerState.kills || 0) + (curPlayerState.kills || 0),
                }

                // ... and also update pointer for the next range of interpolation
                pointer = {
                    left: pointer.right,
                    right: dps[dpIdx++],
                }
            } else {
                // Pointers in between datapoints are identical to each other
                state[i].players[playerName] = pointer
            }
        }
    })

    // Step Four (b): Store pointer to known left/right datapoints for bluezone

    let dpIdx = 0
    let pointer = {
        right: bluezoneDps[dpIdx++],
    }

    for (let i = 0; i < state.length; i++) {
        if (i === pointer.right) {
            pointer = {
                left: pointer.right,
                right: bluezoneDps[dpIdx++],
            }
        } else {
            state[i].bluezone = pointer
        }
    }

    // Step Four (c): Copy safe and red zone points

    let latestRedzone = null
    let latestSafezone = null

    for (let i = 0; i < state.length; i++) {
        if (state[i].redzone) latestRedzone = state[i].redzone
        if (state[i].safezone) latestSafezone = state[i].safezone

        state[i].redzone = latestRedzone
        state[i].safezone = latestSafezone
    }

    // Step Four (d): Expand tracers across their lifetime

    const activeTracers = []

    for (let i = 0; i < state.length; i++) {
        remove(activeTracers, tracer => i >= tracer.endInterval)

        const newTracers = [...state[i].tracers]
        state[i].tracers.push(...activeTracers)
        activeTracers.push(...newTracers)
    }

    // Step Four (e): Expand carepackages

    const distance = ({ location: { x: x1, y: y1 } }, { location: { x: x2, y: y2 } }) =>
        Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2))

    let activePackages = []

    for (let i = 0; i < state.length; i++) {
        const s = state[i]

        s.carePackages.forEach(cp => { // eslint-disable-line no-loop-func
            if (cp.state === 'spawned') {
                activePackages = [...activePackages, cp]
            }

            if (cp.state === 'landed') {
                const cpDistances = activePackages
                    .filter(p => p.state === 'spawned')
                    .map(p => ({ key: p.key, distance: distance(cp, p) }))

                const matchingCp = minBy(cpDistances, 'distance')
                activePackages = cloneDeep(activePackages)
                activePackages.find(p => p.key === matchingCp.key).state = 'landed'
            }
        })

        s.carePackages = activePackages
    }

    console.timeEnd('Telemetry-pointer')

    return { state, globalState }
}
