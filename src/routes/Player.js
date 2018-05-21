import React from 'react'
import moment from 'moment'
import { get, isEmpty } from 'lodash'
import { graphql } from 'react-apollo'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import gql from 'graphql-tag'

const MatchesContainer = styled.div`
    display: grid;
    grid-template-columns: 0.3fr 0.3fr 0.3fr;
`

const MatchesColumn = styled.div`
    grid-column: ${props => props.position};

    & table {
        margin-left: -3px;
    }

    & table th {
        text-align: left;
        font-weight: 500;
    }

    & table td {
        padding-right: 50px;
    }
`

const friendlyMapName = name => {
    if (name === 'Erangel_Main') return 'Erangel'
    if (name === 'Desert_Main') return 'Miramar'
    return name
}

const matchTable = (baseUrl, matches) => {
    if (isEmpty(matches)) {
        return <span>No matches found</span>
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Played at</th>
                    <th>Map Name</th>
                </tr>
            </thead>
            <tbody>
                {matches.map(m => (
                    <tr key={m.id}>
                        <td>
                            <Link to={`${baseUrl}/${m.id}`}>
                                {moment(m.playedAt).format('MMM DD h:mm:ss a')}
                            </Link>
                        </td>
                        <td>
                            {friendlyMapName(m.mapName)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

const Player = ({ match, data: { loading, error, player } }) => {
    if (loading) return 'Loading matches...'
    if (get(error, 'message', '').includes('429')) return 'Rate limited. Please try again later.'
    if (error) return `Error ${error}`
    if (!player) return 'Player not found'

    return (
        <MatchesContainer>
            <MatchesColumn position="1">
                <h5>Solo</h5>
                {matchTable(match.url, player.matches.filter(m => m.gameMode.includes('solo')))}
            </MatchesColumn>

            <MatchesColumn position="2">
                <h5>Duos</h5>
                {matchTable(match.url, player.matches.filter(m => m.gameMode.includes('duo')))}
            </MatchesColumn>

            <MatchesColumn position="3">
                <h5>Squad</h5>
                {matchTable(match.url, player.matches.filter(m => m.gameMode.includes('squad')))}
            </MatchesColumn>
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
