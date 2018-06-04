import React from 'react'
import { map, sortBy, reduce, groupBy } from 'lodash'
import styled from 'styled-components'

const TeamGroup = styled.ul`
    list-style-type: none;
    border: 1px solid ${props => props.color || '#bbb'};
    background: ${props => `${props.color}10` || ''};
    border-radius: 4px;
    font-size: 1.1rem;
    font-family: 'Palanquin', sans-serif;
    letter-spacing: 0.02rem;
    margin: 3px 10px;
    padding: 4px;

    li {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        display: block;
    }
`

const PlayerItem = styled.li`
    color: ${props => {
        const colorNoAlpha = props.color.substring(0, 7)
        return colorNoAlpha === '#FFFFFF' ? '#000' : colorNoAlpha
    }};
`

const Player = ({ player: p, rosterId, marks, match }) => {
    return (
        <PlayerItem
            key={p.get('name')}
            color={p.get('color')}
            onClick={() => marks.toggleTrackedRoster(rosterId)}
        >
            {p.get('name')} ({p.get('kills')})
        </PlayerItem>
    )
}

export default ({ match, telemetry, marks }) => {
    const roster = reduce(groupBy(telemetry.get('players'), p => p.get('rosterId')), (acc, players, id) => {
        acc[id] = sortBy(players, p => p.get('name'))
        return acc
    }, {})

    const sortedTeams = sortBy(Object.keys(roster), rosterId => {
        const players = roster[rosterId]
        if (players.find(p => marks.isPlayerFocused(p.get('name')))) return -10
        return -players.filter(p => p.get('status') !== 'dead').length
    })

    const teams = map(sortedTeams, rosterId => {
        const players = roster[rosterId]
        return (
            <TeamGroup
                key={rosterId}
                color={marks.isRosterTracked(rosterId) ? '#3AC2EE' : ''}
                onMouseEnter={() => marks.setHoveredRosterId(rosterId)}
                onMouseLeave={() => marks.setHoveredRosterId('')}
            >
                {players.map(p =>
                    <Player
                        key={p.get('name')}
                        player={p}
                        rosterId={rosterId}
                        marks={marks}
                        match={match}
                    />
                )}
            </TeamGroup>
        )
    })

    return teams
}
