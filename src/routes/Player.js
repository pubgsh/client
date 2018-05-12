import React from 'react'
import { graphql } from 'react-apollo'
import { Link } from 'react-router-dom'
import gql from 'graphql-tag'

const Player = ({ data: { loading, error, player } }) => {
    if (loading) return 'Loading...'
    if (error) return `Error ${error}`
    if (!player) return 'Player not found'

    return <div>
        Matches
        <ul>
            {player.matches.map(m => (
                <li key={m.id}><Link to={`/match/${m.id}`}>{m.id}</Link></li>
            ))}
        </ul>
    </div>
}

export default graphql(gql`
        query($shardId: String!, $playerName: String!) {
            player(shardId: $shardId, name: $playerName) {
                id
                name
                matches {
                    id
                }
            }
        }
    `, {
    options: ({ match }) => ({
        fetchPolicy: 'network-only',
        variables: {
            shardId: match.params.shardId,
            playerName: match.params.playerName,
        },
    }),
})(Player)
