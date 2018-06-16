export const palette = {
    focused: '#34B67ED0',
    teammate: '#8FD431D0',
    enemy: '#FFFFFFC0',
    focusedRoster: '#34B67E',
    teammateRoster: '#8FD431',
    enemyRoster: '#000000',
    dead: '#D2252580',
    deadTeammate: '#FF5ABAA0',
    knocked: '#B6610FB0',
    base: '#14141480',
}

const rosterPalette = {
    focused: '#34B67E',
    teammate: '#8FD431',
    enemy: '#000000',
    dead: '#D22525',
    deadTeammate: '#FF5ABA',
    knocked: '#FF7D00',
}

export const getPlayerColor = (marks, player) => {
    if (marks.focusedPlayer() === player.get('name')) {
        return palette.focused
    } else if (player.get('teammates').includes(marks.focusedPlayer())) {
        return palette.teammate
    }

    return palette.enemy
}

export const getRosterColor = (marks, player) => {
    const dead = player.get('status') === 'dead'
    const knocked = player.get('status') !== 'dead' && player.get('health') === 0

    if (knocked) {
        return rosterPalette.knocked
    } else if (marks.focusedPlayer() === player.get('name')) {
        return dead ? rosterPalette.deadTeammate : rosterPalette.focused
    } else if (player.get('teammates').includes(marks.focusedPlayer())) {
        return dead ? rosterPalette.deadTeammate : rosterPalette.teammate
    }

    return dead ? rosterPalette.dead : rosterPalette.enemy
}

export const getStatusColor = (marks, player) => {
    if (player.get('status') === 'dead') {
        const isTeammate = player.get('teammates').includes(marks.focusedPlayer())
        const isFocused = marks.focusedPlayer() === player.get('name')

        if (isTeammate || isFocused) {
            return palette.deadTeammate
        }

        return palette.dead
    }

    if (player.get('status') !== 'dead' && player.get('health') === 0) {
        return palette.knocked
    }

    return palette.base
}
