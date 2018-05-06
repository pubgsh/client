import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const Match = ({ data: { match } }) => {
    if (!match) return 'Loading...'

    const telemetryData = JSON.parse(match.telemetryData)
    console.log(telemetryData)

    return <div>
        Match
    </div>
}


const matchQuery = gql`
    query($matchId: String!) {
        match(id: $matchId) {
            id
            data
            telemetryData
        }
    }
`

const WrappedMatch = graphql(matchQuery, {
    variables: props => ({
        matchId: props.matchId,
    }),
    options: {
        fetchPolicy: 'network-only',
    },
})(Match)

export default ({ match }) =>
    <WrappedMatch matchId={match.params.matchId} />

