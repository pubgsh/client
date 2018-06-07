import { Map } from 'immutable'

export default function Participants(matchData, focusedPlayerName) {
    // -- Player ---------------------------------------------------------------

    function Player(name, rosterId, teammates) {
        const player = {
            name,
            rosterId,
            health: 100,
            kills: 0,
            location: { x: 0, y: 0, z: 0 },
            status: 'alive',
            teammates,
        }

        return Map(player)
    }

    // -- Initialize participants map ------------------------------------------

    return Map().withMutations(map => {
        matchData.players.forEach(p => {
            const teammates = matchData.players
                .filter(op => op.rosterId === p.rosterId && op.name !== p.name)
                .map(t => t.name)

            map.set(p.name, Player(p.name, p.rosterId, teammates))
        })
    })
}
