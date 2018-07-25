import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { getRosterColor } from '../../../lib/player-color.js'

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

class Roster extends React.Component {
    render() {
        const { match, telemetry, marks, rosters } = this.props

        return rosters.map(r => {
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
                                    color: getRosterColor(marks, p),
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
        })
    }
}

export default Roster
