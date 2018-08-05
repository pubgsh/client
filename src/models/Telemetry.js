import { forEach, groupBy, minBy, sortBy } from 'lodash'

function linearInterpolation(lowerVal, upperVal, span, idx) {
    const yDelta = upperVal - lowerVal
    const yStep = yDelta / span
    return lowerVal + (yStep * idx)
}

export default function Telemetry(state) {
    const interpolate = (interval, playerName, player) => {
        if (typeof player.left === 'undefined') {
            return { name: playerName, location: {}, teammates: [], kills: 0, damageDealt: 0 }
        }

        if (typeof player.right === 'undefined') {
            return state[player.left].players[playerName]
        }

        const left = state[player.left].players[playerName]
        const right = state[player.right].players[playerName]
        const span = player.right - player.left

        return {
            ...left,
            location: {
                x: linearInterpolation(left.location.x, right.location.x, span, interval - player.left),
                y: linearInterpolation(left.location.y, right.location.y, span, interval - player.left),
            },
        }
    }

    const stateAt = msSinceEpoch => {
        const interval = Math.floor(msSinceEpoch / 100)
        const s = state[interval]

        // TODO: Debug sporadic error
        if (!s || !s.players) {
            console.log('interval', interval, 'msSinceEpoch', msSinceEpoch)
            console.log('s', s)
            console.log('s.players', s.players)
        }

        // Overwrite player pointer records with interpolated values. This will generate the correct value
        // for this interval and replace the pointer record with it so that a re-request of this interval
        // will not require any computation.
        forEach(s.players, (player, playerName) => {
            if (Object.hasOwnProperty.call(player, 'left')) {
                s.players[playerName] = interpolate(interval, playerName, player)
            }
        })

        // Overwrite bluezone records with interpolated values
        if (Object.hasOwnProperty.call(s.bluezone, 'left')) {
            if (!s.bluezone.right) {
                s.bluezone = state[s.bluezone.left].bluezone
            } else {
                const left = state[s.bluezone.left].bluezone
                const right = state[s.bluezone.right].bluezone
                const span = s.bluezone.right - s.bluezone.left

                s.bluezone = {
                    x: linearInterpolation(left.x, right.x, span, interval - s.bluezone.left),
                    y: linearInterpolation(left.y, right.y, span, interval - s.bluezone.left),
                    radius: linearInterpolation(left.radius, right.radius, span, interval - s.bluezone.left),
                }
            }
        }

        return s
    }

    const finalRoster = focusedPlayer => {
        const rosters = sortBy(groupBy(state.matchEnd.characters, 'teamId'), r => minBy(r, 'ranking').ranking)
        const focusedRosterIdx = rosters.findIndex(r => r.some(c => c.name === focusedPlayer))
        const [focusedRoster] = rosters.splice(focusedRosterIdx, 1)
        const sortedRosters = [focusedRoster, ...rosters]
        return sortedRosters.map(r => r.map(c => c.name).sort())
    }

    return {
        state,
        stateAt,
        finalRoster,
    }
}
