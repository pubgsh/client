import React from 'react'
import styled from 'styled-components'
import Tooltip from '../../../components/Tooltip'
import Loadout from './Loadout.js'
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
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: 400;
    margin: 5px 0;
    padding: 4px;
    background: #FAFAFA;
`

const PlayerItem = styled.li`
    margin: 0;
    overflow: hidden;
    cursor: pointer;
    display: grid;
    grid-template-columns: 1fr 15px 25px;
    grid-column-gap: 5px;

    i {
        margin-left: 5px;
        font-size: 1.1rem;
        line-height: 0.5rem;
    }
`

const PlayerName = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const PlayerDatapoint = styled.div`
    text-align: right;
`

const Roster = ({ match, telemetry, marks, rosters }) => {
    return (
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
                                    <Tooltip
                                        arrow
                                        placement="left"
                                        duration={0}
                                        theme="pubgsh"
                                        html={<Loadout items={p.items} />}
                                    >
                                        <PlayerName>{p.name}</PlayerName>
                                    </Tooltip>
                                    <PlayerDatapoint>{p.kills}</PlayerDatapoint>
                                    <PlayerDatapoint>{Math.round(p.damageDealt)}</PlayerDatapoint>
                                </PlayerItem>
                            )
                        })}
                    </TeamGroup>
                )
            })}
        </Options.Context.Consumer>
    )
}

export default Roster
