import React from 'react'
import moment from 'moment'
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

const PlayerHeader = styled.p`
    grid-row: 1;
`

const RateLimited = ({ data: { loading, error, latestMatch } }) => {
    if (loading) return 'Finding latest match...'

    return (
        <div>
            <p>Oh no! We’re currently rate limited by PUBG.</p>
            <p>
                This limit will be increased soon. In the meantime,
                you can either wait a minute and refresh this page or&nbsp;
                <Link to={`/${latestMatch.players[0].name}/${latestMatch.shardId}/${latestMatch.id}`}>
                    view the latest available match
                </Link>.
            </p>
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

        if (loading) return <p>Loading matches...</p>
        if (get(error, 'message', '').includes('429')) return <RateLimitedWithData />
        if (error) return <p>An error occurred :(</p>
        if (!player) {
            return <p>
                Player not found. Did you select the correct shard?
                Has a game been played in the last week?
            </p>
        }

        const forGameMode = gameMode => player.matches.filter(m => m.gameMode.includes(gameMode))
        const fetchedMinAgo = moment.utc().diff(moment.utc(player.lastFetchedAt), 'minutes')

        return (
            <MatchesContainer>
                <PlayerHeader>
                    (Last updated {moment.duration(fetchedMinAgo, 'minutes').humanize()} ago)
                </PlayerHeader>
                <MatchesList col="1" header="Solo" baseUrl={match.url} matches={forGameMode('solo')} />
                <MatchesList col="2" header="Duos" baseUrl={match.url} matches={forGameMode('duo')} />
                <MatchesList col="3" header="Squad" baseUrl={match.url} matches={forGameMode('squad')} />
            </MatchesContainer>
        )
    }
}

export default graphql(gql`
    query($shardId: String!, $playerName: String!) {
        player(shardId: $shardId, name: $playerName) {
            id
            name
            lastFetchedAt
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
