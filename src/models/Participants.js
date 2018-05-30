import { OrderedMap, Map } from 'immutable'

const getColor = (focusType, status) => {
    if (focusType === 'player') {
        return status === 'dead' ? '#FF5ABAB0' : '#A4D419B0'
    }

    if (focusType === 'teammate') {
        return status === 'dead' ? '#D2252580' : '#18E786B0'
    }

    return status === 'dead' ? '#D2252580' : '#FFFFFFB0'
}

const getHealthColor = health => {
    // More breakpoints?
    if (health >= 70) {
        return '#00FF00B0'
    } else if (health >= 30) {
        return '#FD6A02B0'
    }
    return '#FF0000B0'
}
export function setPlayerStatus(player, status) {
    return player.withMutations(p => {
        p.set('status', status)
        p.set('color', getColor(p.get('focusType'), status))
    })
}
export function setHealth(player, health) {
    return player.withMutations(p => {
        p.set('health', health)
        p.set('healthColor', getHealthColor(health))
    })
}

export default function Participants(matchData, focusedPlayerName) {
    const focusedRosterId = matchData.players.find(p => p.name === focusedPlayerName).rosterId

    // -- Player ---------------------------------------------------------------

    function Player(name, rosterId) {
        const player = {
            name,
            rosterId,
            health: 100,
            healthColor: '#00FF00B0',
            kills: 0,
            location: { x: 0, y: 0, z: 0 },
        }

        player.focusType = (() => {
            if (name === focusedPlayerName) return 'player'
            if (rosterId === focusedRosterId) return 'teammate'
            return 'none'
        })()

        const immutablePlayer = Map(player)

        return setPlayerStatus(immutablePlayer, 'alive')
    }

    // -- Initialize participants map ------------------------------------------

    return OrderedMap().withMutations(map => {
        // We want the focused player to be the first entry in our OrdredMap...
        const focusedPlayer = matchData.players.find(p => p.name === focusedPlayerName)
        map.set(focusedPlayerName, Player(focusedPlayer.name, focusedPlayer.rosterId))

        // ...followed by their teammates...
        matchData.players
            .filter(p => p.name !== focusedPlayer.name)
            .filter(p => p.rosterId === focusedPlayer.rosterId)
            .forEach(p => {
                map.set(p.name, Player(p.name, p.rosterId))
            })

        // ...followed by everyone else
        matchData.players
            .filter(p => p.rosterId !== focusedPlayer.rosterId)
            .forEach(p => {
                map.set(p.name, Player(p.name, p.rosterId))
            })
    })
}
