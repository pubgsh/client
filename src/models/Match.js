import { get, pick, forEach } from 'lodash'

export default function Match(response) {
    const { id, data, telemetryData } = response

    const match = {
        id,
        epoch: new Date(data.attributes.createdAt).getTime(),
        ...pick(data.attributes, ['gameMode', 'mapName', 'createdAt', 'duration']),

        stateAt(msSinceEpoch) {
            const players = {}

            forEach(telemetryData, d => {
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
