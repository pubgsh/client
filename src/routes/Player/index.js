import React from 'react'
import moment from 'moment'
import { get, uniqBy, isEmpty } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import MatchesList from './MatchesList.js'
import RateLimited from './RateLimited.js'

export const MatchesContainer = styled.div`
    display: grid;
    grid-template-columns: 0.3fr 0.3fr 0.3fr;
`

const PlayerHeader = styled.div`
    grid-row: 1;
    grid-column-start: 1;
    grid-column-end: 4;
    margin-bottom: 15px;

`

class Player extends React.Component {
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
        if (error) return <p>An error occurred :(</p>
        if (!player || (isEmpty(player.matches) && !player.rateLimitReset)) {
            return <p>
                Player not found. Did you select the correct shard?
                Has a game been played in the last week?
            </p>
        }

        const forGameMode = gameMode => player.matches.filter(m => m.gameMode.includes(gameMode))

        const fetchedMinAgo = moment.utc().diff(moment.utc(player.lastFetchedAt), 'minutes')
        const friendlyAgo = moment.duration(fetchedMinAgo, 'minutes').humanize()

        return (
            <MatchesContainer>
                <PlayerHeader>
                    {player.rateLimitReset &&
                        <RateLimited player={player} onUnRateLimited={this.props.data.refetch} />
                    }
                    {player.lastFetchedAt &&
                        <p>(Last updated {friendlyAgo} ago)</p>
                    }
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
            rateLimitReset
            rateLimitAhead
            rateLimitPlayerKey
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
