import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import * as Options from '../Options.js'

const getRosterColor = ({ colors }, marks, player) => {
    const dead = player.status === 'dead'
    const knocked = player.status !== 'dead' && player.health === 0

    if (knocked) {
        return colors.roster.knocked
    } else if (marks.focusedPlayer() === player.name) {
        return dead ? colors.roster.deadTeammate : colors.roster.focused
    } else if (player.teammates.includes(marks.focusedPlayer())) {
        return dead ? colors.roster.deadTeammate : colors.roster.teammate
    }

    return dead ? colors.roster.dead : colors.roster.enemy
}

const TeamGroup = styled.ul`
    list-style-type: none;
    border: 1px solid #bbb;
    border-radius: 4px;
    font-size: 1.1rem;
    font-family: 'Palanquin', sans-serif;
    letter-spacing: 0.02rem;
    margin: 3px 0;
    padding: 4px;
    background: #F7F7F7;
`

const PlayerItem = styled.li`
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    display: block;

    i {
        margin-left: 5px;
        font-size: 1.1rem;
        line-height: 0.5rem;
    }
`

const PlayerLink = ({ match, marks, player }) => {
    if (!marks.isPlayerHovered(player.name)) return null
    return (
        <Link to={`/${player.name}/${match.shardId}`}>
            <i className="fi-link" />
        </Link>
    )
}

const Roster = ({ match, telemetry, marks, rosters }) => (
    <Options.Context.Consumer>
        {({ options }) => rosters.map(r => {
            return (
                <TeamGroup key={`roster-${r[0]}`}>
                    {r.map(playerName => {
                        const p = telemetry.players[playerName]
                        return (
                            <PlayerItem
                                key={p.name}
                                onClick={() => marks.toggleTrackedPlayer(p.name)}
                                onMouseEnter={() => marks.setHoveredPlayer(p.name)}
                                onMouseLeave={() => marks.setHoveredPlayer(null)}
                                style={{
                                    color: getRosterColor(options, marks, p),
                                    textDecoration: marks.isPlayerTracked(p.name) ? 'underline' : '',
                                }}
                            >
                                {p.name} ({p.kills})
                                <PlayerLink match={match} marks={marks} player={p} />
                            </PlayerItem>
                        )
                    })}
                </TeamGroup>
            )
        })}
    </Options.Context.Consumer>
)

export default Roster
