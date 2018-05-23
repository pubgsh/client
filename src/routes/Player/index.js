import React from 'react'
import { get, uniqBy } from 'lodash'
import { graphql } from 'react-apollo'
import { Link } from 'react-router-dom'
import gql from 'graphql-tag'
import styled from 'styled-components'
import MatchesList from './MatchesList.js'

export const MatchesContainer = styled.div`
    display: grid;
    grid-template-columns: 0.3fr 0.3fr 0.3fr;
`

const MatchesColumn = styled(MatchesList)`
    grid-column: ${props => props.col};
`

const RateLimited = ({ data: { loading, error, latestMatch } }) => {
    if (loading) return 'Finding latest match...'

    return (
        <div>
            Oh no! We’re currently rate limited by PUBG. This limit will be increased soon. In the meantime,
            you can either wait a little while and refresh this page or&nbsp;
            <Link to={`/${latestMatch.players[0].name}/${latestMatch.shardId}/${latestMatch.id}`}>
                view the latest available match
            </Link>.
        </div>
    )
}

const RateLimitedWithData = graphql(gql`
    query {
        latestMatch {
            id
            shardId
            players {
                name
            }
        }
    }
`)(RateLimited)

const Player = class extends React.Component {
    componentDidUpdate(prevProps, prevState) {
        const playerName = get(this.props, 'data.player.name')

        if (playerName) {
            const { shardId } = this.props.match.params
            const url = `${playerName}/${shardId}`

            const recentPlayers = JSON.parse(localStorage.getItem('recentPlayers') || '[]')
            recentPlayers.unshift({ playerName, shardId, url })
            localStorage.setItem('recentPlayers', JSON.stringify(uniqBy(recentPlayers, 'url').slice(0, 10)))
            localStorage.setItem('shardId', shardId)
        }
    }

    render() {
        const { match, data: { loading, error, player } } = this.props

        if (loading) return 'Loading matches...'
        if (get(error, 'message', '').includes('429')) return <RateLimitedWithData />
        if (error) return `Error ${error}`
        if (!player) return 'Player not found'

        const forGameMode = gameMode => player.matches.filter(m => m.gameMode.includes(gameMode))

        return (
            <MatchesContainer>
                <MatchesColumn col="1" header="Solo" baseUrl={match.url} matches={forGameMode('solo')} />
                <MatchesColumn col="2" header="Duos" baseUrl={match.url} matches={forGameMode('duo')} />
                <MatchesColumn col="3" header="Squad" baseUrl={match.url} matches={forGameMode('squad')} />
            </MatchesContainer>
        )
    }
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
