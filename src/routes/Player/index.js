import React from 'react'
import moment from 'moment'
import { get, uniqBy, isEmpty, groupBy } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import MatchesList from './MatchesList.js'
import RateLimited from './RateLimited.js'

export const MatchesContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(${props => props.hasCustom ? 4 : 3}, 1fr);
    margin-top: 4rem;

    @media (max-width: 700px) {
        grid-template-columns: 1fr;
    }
`

const PlayerHeader = styled.div`
    grid-row: 1;
    grid-column-start: 1;
    grid-column-end: 99;
    margin: 0 auto 1rem;
    text-align: center;
`

const PlayerName = styled.h3`
    text-align: center;
`

const Message = styled.p`
    width: 100%;
    text-align: center;
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

        if (loading) return <Message>Fetching matches from PUBG...</Message>
        if (error) return <Message>An error occurred :(</Message>
        if (!player || (isEmpty(player.matches) && !player.rateLimitReset)) {
            return (
                <MatchesContainer>
                    <PlayerHeader>
                        <PlayerName>
                            {this.props.match.params.playerName} - {this.props.match.params.shardId}
                        </PlayerName>
                        <p>
                            Player not found. Check that:
                        </p>
                        <p>
                            You selected the correct region<br />
                            The user has played a game in the last week<br />
                            The name was typed exactly as in-game - capitalization matters<br />
                            If you have recently changed your name, please retry after playing a match
                        </p>
                    </PlayerHeader>
                </MatchesContainer>
            )
        }

        const groupedMatches = groupBy(player.matches, m => {
            if (m.gameMode === 'normal') return 'c'
            if (m.gameMode.includes('solo')) return 1
            if (m.gameMode.includes('duo')) return 2
            if (m.gameMode.includes('squad')) return 4
            return 'unknown'
        })

        const hasCustom = !isEmpty(groupedMatches['c'])

        const fetchedMinAgo = moment.utc().diff(moment.utc(player.lastFetchedAt), 'minutes')
        const friendlyAgo = moment.duration(fetchedMinAgo, 'minutes').humanize()

        return (
            <MatchesContainer hasCustom={hasCustom}>
                <PlayerHeader>
                    <PlayerName>{player.name}</PlayerName>
                    {player.rateLimitReset &&
                        <RateLimited player={player} onUnRateLimited={this.props.data.refetch} />
                    }
                    {player.lastFetchedAt &&
                        <p>(Matches last updated {friendlyAgo} ago)</p>
                    }
                </PlayerHeader>
                <MatchesList col="1" header="Solo" baseUrl={match.url} matches={groupedMatches['1']} />
                <MatchesList col="2" header="Duos" baseUrl={match.url} matches={groupedMatches['2']} />
                <MatchesList col="3" header="Squad" baseUrl={match.url} matches={groupedMatches['4']} />
                {hasCustom &&
                    <MatchesList col="4" header="Custom" baseUrl={match.url} matches={groupedMatches['c']} />
                }
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
                stats {
                    winPlace
                    kills
                }
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
