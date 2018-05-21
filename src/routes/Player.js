import React from 'react'
import moment from 'moment'
import { graphql } from 'react-apollo'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import gql from 'graphql-tag'

const MatchesContainer = styled.div`
    display: grid;
    grid-template-columns: 0.5fr 0.5fr;
`

const MatchesColumn = styled.div`
    grid-column: 1;

    & table th {
        text-align: left;
    }

    & table td {
        padding-right: 50px;
    }
`

const UnknownMatchesColumn = styled.div`
    grid-column: 2;
`

const friendlyMapName = name => {
    if (name === 'Erangel_Main') return 'Erangel'
    if (name === 'Desert_Main') return 'Miramar'
    return name
}

const Player = ({ match, data: { loading, error, player } }) => {
    if (loading) return 'Loading...'
    if (error) return `Error ${error}`
    if (!player) return 'Player not found'

    return (
        <MatchesContainer>
            <MatchesColumn>
                <h5>Matches</h5>

                <table>
                    <thead>
                        <tr>
                            <th>Played at</th>
                            <th>Game Mode</th>
                            <th>Map Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {player.matches.filter(m => m.playedAt).map(m => (
                            <tr key={m.id}>
                                <td>
                                    <Link to={`${match.url}/${m.id}`}>
                                        {moment(m.playedAt).format('YYYY-MM-DD h:mm:ss a')}
                                    </Link>
                                </td>
                                <td>
                                    {m.gameMode}
                                </td>
                                <td>
                                    {friendlyMapName(m.mapName)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </MatchesColumn>

            <UnknownMatchesColumn>
                <h5>Unfetched (More recent on top - click to load details)</h5>

                <ul>
                    {player.matches.filter(m => !m.playedAt).map(m => (
                        <li key={m.id}><Link to={`${match.url}/${m.id}`}>{m.id}</Link></li>
                    ))}
                </ul>
            </UnknownMatchesColumn>
        </MatchesContainer>
    )
}

export default graphql(gql`
    query($shardId: String!, $playerName: String!) {
        player(shardId: $shardId, name: $playerName) {
            id
            name
            matches {
                id
                playedAt
                gameMode
                mapName
                durationSeconds
            }
        }
    }`, {
    options: ({ match }) => ({
        fetchPolicy: 'network-only',
        variables: {
            shardId: match.params.shardId,
            playerName: match.params.playerName,
        },
    }),
})(Player)
