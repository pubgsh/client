export const palette = {
    focused: '#34B67ED0',
    teammate: '#8FD431D0',
    enemy: '#FFFFFFC0',
    focusedRoster: '#34B67E',
    teammateRoster: '#8FD431',
    enemyRoster: '#000000',
    dead: '#D2252580',
    deadTeammate: '#FF5ABAA0',
    knocked: '#FDFE0BB0',
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
    if (marks.focusedPlayer() === player.name) {
        return palette.focused
    } else if (player.teammates.includes(marks.focusedPlayer())) {
        return palette.teammate
    }

    return palette.enemy
}

export const getRosterColor = (marks, player) => {
    const dead = player.status === 'dead'
    const knocked = player.status !== 'dead' && player.health === 0

    if (knocked) {
        return rosterPalette.knocked
    } else if (marks.focusedPlayer() === player.name) {
        return dead ? rosterPalette.deadTeammate : rosterPalette.focused
    } else if (player.teammates.includes(marks.focusedPlayer())) {
        return dead ? rosterPalette.deadTeammate : rosterPalette.teammate
    }

    return dead ? rosterPalette.dead : rosterPalette.enemy
}

export const getStatusColor = (marks, player) => {
    if (player.status === 'dead') {
        const isTeammate = player.teammates.includes(marks.focusedPlayer())
        const isFocused = marks.focusedPlayer() === player.name

        if (isTeammate || isFocused) {
            return palette.deadTeammate
        }

        return palette.dead
    }

    if (player.status !== 'dead' && player.health === 0) {
        return palette.knocked
    }

    return palette.base
}
