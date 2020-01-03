import moment from 'moment'
import { get, remove, minBy, cloneDeep } from 'lodash'

const TRACER_LIFETIME_DECISECONDS = 35

const blankIntervalState = () => ({
    players: {},
    playerLocations: {},
    bluezone: null,
    redzone: null,
    safezone: null,
    tracers: [],
    carePackages: [],
})

export default function parseTelemetry(matchData, telemetry, focusedPlayerName) {
    const epoch = moment.utc(matchData.playedAt).valueOf()

    const state = Array((matchData.durationSeconds + 5) * 10)
    const globalState = { kills: [], death: null }
    const latestPlayerStates = {}
    let startingLocationInitialized = false
    let curState = blankIntervalState()

    const setNewPlayerLocation = (playerName, location) => {
        if (!startingLocationInitialized) {
            matchData.players.forEach(p => {
                state[0].playerLocations[p.name] = location
            })
            startingLocationInitialized = true
        }

        curState.playerLocations[playerName] = location
    }

    const setNewPlayerState = (playerName, newVals) => {
        if (!curState.players[playerName] && !latestPlayerStates[playerName]) {
            // This captures a scenario where PUBG's matches API doesn't return
            // someone who participated in this match. It will cause incorrect
            // data, but at least it will render.
            curState.players[playerName] = {
                name: playerName,
                teammates: [],
                health: 100,
                kills: 0,
                damageDealt: 0,
                items: [],
            }
        }

        if (!curState.players[playerName]) {
            // TODO: Needs cloneDeep once state holds nested values
            curState.players[playerName] = { ...latestPlayerStates[playerName] }
        }

        // TODO: Needs deep property setting support once state holds nested values
        Object.assign(curState.players[playerName], newVals)
        latestPlayerStates[playerName] = curState.players[playerName]
    }

    const incrementPlayerStateVal = (playerName, path, delta) => {
        setNewPlayerState(playerName, { [path]: latestPlayerStates[playerName][path] + delta })
    }

    const getKilledBy = data => {
        const { damageTypeCategory, victim, killer } = data
        const isBlueZone = damageTypeCategory === 'Damage_BlueZone' ||
            (killer && victim && victim.name === killer.name && victim.isInBlueZone)
        const isRedZone = damageTypeCategory === 'Damage_Explosion_RedZone'
        let killedBy = killer && killer.name

        if (isBlueZone) {
            killedBy = 'Playzone'
        } else if (isRedZone) {
            killedBy = 'Redzone'
        }

        return killedBy
    }

    { // --- Step Zero: Initialize state
        const teammates = matchData.players.reduce((acc, p) => {
            const teammateNames = matchData.players
                .filter(op => op.rosterId === p.rosterId && op.name !== p.name)
                .map(t => t.name)

            acc[p.name] = teammateNames
            return acc
        }, {})

        matchData.players.forEach(p => {
            curState.players[p.name] = {
                name: p.name,
                teammates: teammates[p.name],
                health: 100,
                kills: 0,
                damageDealt: 0,
                items: [],
            }

            latestPlayerStates[p.name] = curState.players[p.name]
        })

        state[0] = curState
    }

    { // --- Step One: Iterate through all telemetry data and store known points
        console.time('Telemetry-eventParsing')

        let matchStarted = false
        let curStateInterval = 0
        telemetry.forEach((d, i) => {
            const msSinceEpoch = new Date(d._D).getTime() - epoch
            const currentInterval = Math.floor(msSinceEpoch / 100)

            if (!matchStarted && d._T === 'LogMatchStart') {
                matchStarted = true
            }

            if (!matchStarted) return

            if (msSinceEpoch > (curStateInterval + 1) * 100) {
                // We've crossed over an interval boundary. Save off current interval state and clear it.
                // Note that we don't necessarily get a datapoint at each interval boundary, so we want to
                // make sure we're storing the state at the right interval and adjust accordingly.
                state[curStateInterval] = curState
                curState = blankIntervalState()
                curStateInterval = currentInterval
            }

            if (get(d, 'character.name')) {
                const { name, location, health } = d.character

                setNewPlayerState(name, { health })
                setNewPlayerLocation(name, { x: location.x, y: location.y })
            }

            if (d._T === 'LogItemEquip') {
                const characterName = d.character.name
                const currentItems = curState.players[characterName].items

                setNewPlayerState(characterName, { items: [...currentItems, d.item] })
            }

            if (d._T === 'LogItemUnequip') {
                const characterName = d.character.name
                const currentItems = curState.players[characterName].items

                setNewPlayerState(characterName, {
                    items: currentItems.filter(item => item.itemId !== d.item.itemId),
                })
            }

            if (d._T === 'LogItemAttach') {
                const characterName = d.character.name
                const currentItems = curState.players[characterName].items

                const updatedItems = currentItems.reduce((prev, item) => {
                    if (item.itemId === d.parentItem.itemId) {
                        return [
                            ...prev,
                            {
                                ...item,
                                attachedItems: [...item.attachedItems, d.childItem.itemId],
                            },
                        ]
                    }

                    return [
                        ...prev,
                        item,
                    ]
                }, [])

                setNewPlayerState(characterName, { items: updatedItems })
            }

            if (d._T === 'LogItemDetach') {
                const characterName = d.character.name
                const currentItems = curState.players[characterName].items

                const updatedItems = currentItems.reduce((prev, item) => {
                    if (item.itemId === d.parentItem.itemId) {
                        return [
                            ...prev,
                            {
                                ...item,
                                attachedItems: item.attachedItems.filter(ai => ai !== d.childItem.itemId),
                            },
                        ]
                    }

                    return [
                        ...prev,
                        item,
                    ]
                }, [])

                setNewPlayerState(characterName, { items: updatedItems })
            }

            if (d._T === 'LogPlayerKill') {
                setNewPlayerState(d.victim.name, { status: 'dead' })

                if (d && d.killer && d.killer.name && d.killer.name !== d.victim.name) {
                    incrementPlayerStateVal(d.killer.name, 'kills', 1)
                }

                if (d && d.victim.name === focusedPlayerName) {
                    const killedBy = getKilledBy(d)

                    globalState.death = {
                        msSinceEpoch,
                        killedBy,
                    }
                }

                if (d && d.killer && d.killer.name === focusedPlayerName) {
                    globalState.kills.push({
                        msSinceEpoch,
                        victimName: d.victim.name,
                    })
                }
            }

            if (d._T === 'LogPlayerTakeDamage') {
                incrementPlayerStateVal(d.victim.name, 'health', -d.damage)
                setNewPlayerLocation(d.victim.name, { x: d.victim.location.x, y: d.victim.location.y })

                if (d.damageTypeCategory === 'Damage_Gun') {
                    // We need to add the tracer to the state TRACER_LIFETIME_DECISECONDS earlier than our
                    // current state because PUBG gives us when the bullet landed. We want to make the tracer
                    // end at this interval, but the bullet firing should be back in time.
                    const tracerStart = currentInterval - TRACER_LIFETIME_DECISECONDS;
                    (state[tracerStart] || (state[tracerStart] = blankIntervalState())).tracers.push({
                        key: i,
                        attackerName: d.attacker.name,
                        victimName: d.victim.name,
                        startInterval: currentInterval - TRACER_LIFETIME_DECISECONDS,
                        endInterval: currentInterval,
                    })
                }

                if (d.attacker && d.attacker.name && d.attacker.name !== d.victim.name) {
                    incrementPlayerStateVal(d.attacker.name, 'damageDealt', d.damage)
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
                // d.itemPackage.itemPackageId possibilities:
                //  'Carapackage_RedBox_C': normal,
                //  'Carapackage_FlareGun_C': flaregun,
                //  'Uaz_Armored_C': UAZ but landing event only.
                if (d.itemPackage.itemPackageId !== 'Uaz_Armored_C') {
                    curState.carePackages.push({
                        location: d.itemPackage.location,
                        items: d.itemPackage.items,
                        state: 'landed',
                    })
                }
            }

            if (d._T === 'LogMatchEnd') {
                state.matchEnd = d
            }
        })

        console.timeEnd('Telemetry-eventParsing')
    }

    { // --- Step Two: Ensure there are no gaps in the state array
        for (let i = 0; i < state.length; i++) {
            if (!state[i]) {
                state[i] = blankIntervalState()
            }
        }
    }

    const playerLocations = {}
    const bluezoneDps = []

    { // --- Step Three: Enumerate known datapoints
        for (let i = 0; i < state.length; i++) {
            const s = state[i]

            Object.keys(s.playerLocations).forEach(playerName => {
                (playerLocations[playerName] || (playerLocations[playerName] = [])).push(i)
            })

            if (s.bluezone) {
                bluezoneDps.push(i)
            }
        }
    }

    { // Step Four (a): Store pointer to known left/right datapoints for player locations
        console.time('Telemetry-locationPointers')

        Object.keys(playerLocations).forEach(playerName => {
            const dps = playerLocations[playerName]
            let dpIdx = 0

            let pointer = {
                left: undefined,
                right: dps[dpIdx++],
            }

            for (let i = 0; i < state.length; i++) {
                if (i === pointer.right) {
                    // We're on a real datapoint: update pointer for the next range of interpolation
                    pointer = {
                        left: pointer.right,
                        right: dps[dpIdx++],
                    }
                } else {
                    // Pointers in between datapoints are identical to each other
                    state[i].playerLocations[playerName] = pointer
                }
            }
        })

        console.timeEnd('Telemetry-locationPointers')
    }

    { // Step Four (b): Store pointer to known left/right datapoints for bluezone
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
    }

    { // Step Four (c): Copy safe/red zone points and players
        console.time('Telemetry-playerAndZoneCopy')

        for (let i = 1; i < state.length; i++) {
            if (!state[i].redzone) state[i].redzone = state[i - 1].redzone
            if (!state[i].safezone) state[i].safezone = state[i - 1].safezone

            matchData.players.forEach(p => {
                if (!state[i].players[p.name]) {
                    state[i].players[p.name] = state[i - 1].players[p.name]
                }
            })
        }

        console.timeEnd('Telemetry-playerAndZoneCopy')
    }

    { // Step Four (d): Expand tracers across their lifetime
        const activeTracers = []

        for (let i = 0; i < state.length; i++) {
            remove(activeTracers, tracer => i >= tracer.endInterval)

            const newTracers = [...state[i].tracers]
            state[i].tracers.push(...activeTracers)
            activeTracers.push(...newTracers)
        }
    }

    { // Step Four (e): Expand carepackages
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
                    if (matchingCp) {
                        activePackages = cloneDeep(activePackages)
                        activePackages.find(p => p.key === matchingCp.key).state = 'landed'
                    }
                }
            })

            s.carePackages = activePackages
        }
    }

    return { state, globalState }
}
