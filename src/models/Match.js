import { get, forEach } from 'lodash'

export default function Match(matchData, telemetry) {
    matchData.players.forEach(player => {
        player.stats = JSON.parse(player.stats)
    })

    const match = {
        ...matchData,
        epoch: new Date(matchData.playedAt).getTime(),

        stateAt(msSinceEpoch) {
            const players = {}

            forEach(telemetry, d => {
                if (new Date(d._D).getTime() - match.epoch > msSinceEpoch) {
                    // This event happened after the time we care about. Since events are sorted, no more
                    // events in telemetryData are relevant. Returning false here breaks iteration.
                    return false
                }

                if (get(d, 'character.name')) {
                    const { name, location } = d.character
                    players[name] = {
                        lastUpdatedAt: new Date(d._D).getTime() - match.epoch,
                        location,
                    }
                }
            })

            return players
        },
    }

    return match
}
