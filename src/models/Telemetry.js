import { forEach, groupBy, minBy, sortBy } from 'lodash'

function linearInterpolation(lowerVal, upperVal, span, idx) {
    const yDelta = upperVal - lowerVal
    const yStep = yDelta / span
    return lowerVal + (yStep * idx)
}

export default function Telemetry(state) {
    const getLocation = (interval, playerName, playerLocation) => {
        // There's no data point to the right, so we just end up with the point to the left
        if (typeof playerLocation.right === 'undefined') {
            return state[playerLocation.left].playerLocations[playerName]
        }

        const left = state[playerLocation.left].playerLocations[playerName]
        const right = state[playerLocation.right].playerLocations[playerName]
        const span = playerLocation.right - playerLocation.left

        return {
            x: linearInterpolation(left.x, right.x, span, interval - playerLocation.left),
            y: linearInterpolation(left.y, right.y, span, interval - playerLocation.left),
        }
    }

    const stateAt = msSinceEpoch => {
        const interval = Math.floor(msSinceEpoch / 100)
        const s = state[interval]

        // Overwrite player pointer records with interpolated values. This will generate the correct value
        // for this interval and replace the pointer record with it so that a re-request of this interval
        // will not require any computation.
        forEach(s.players, (player, playerName) => {
            if (!Object.hasOwnProperty.call(player, 'location')) {
                if (Object.hasOwnProperty.call(s.playerLocations[playerName], 'left')) {
                    const curLocation = s.playerLocations[playerName]
                    s.playerLocations[playerName] = getLocation(interval, playerName, curLocation)
                }

                s.players[playerName] = {
                    ...s.players[playerName],
                    location: s.playerLocations[playerName],
                }
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
