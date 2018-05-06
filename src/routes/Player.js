import React from 'react'
import { graphql } from 'react-apollo'
import { Link } from 'react-router-dom'
import gql from 'graphql-tag'

const Player = ({ data: { player } }) => {
    if (!player) return 'Loading...'

    return <div>
        Matches
        <ul>
            {player.matches.map(m => (
                <li key={m.id}><Link to={`/match/${m.id}`}>{m.id}</Link></li>
            ))}
        </ul>
    </div>
}


const playerQuery = gql`
    query($playerName: String!) {
        player(name: $playerName) {
            id
            name
            matches {
                id
            }
        }
    }
`

const WrappedPlayer = graphql(playerQuery, {
    variables: props => ({
        playerName: props.playerName,
    }),
    options: {
        fetchPolicy: 'network-only',
    },
})(Player)

export default ({ match }) =>
    <WrappedPlayer playerName={match.params.playerName} />

