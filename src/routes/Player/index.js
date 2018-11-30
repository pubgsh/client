import React from 'react'
import moment from 'moment'
import { isEmpty, groupBy } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import DocumentTitle from 'react-document-title'
import MatchesList from './MatchesList.js'
import RateLimited from './RateLimited.js'
import * as Settings from '../../components/Settings.js'

export const MatchesContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(${props => props.hasCustom ? 4 : 3}, 1fr);
    margin-top: 2rem;

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

    ul {
        text-align: left;
    }
`

const PlayerName = styled.h3`
    text-align: center;
    margin-bottom: 0px;
    cursor: pointer;
`

const SaveFavorite = styled.div`
    text-align: center;
    font-size: 1.7rem;
    color: #ccc;
    cursor: pointer;

    &.active {
        color: #4cbb89;
    }
`

const Message = styled.p`
    width: 100%;
    text-align: center;
`

const BigLi = styled.li`
    font-size: 2rem;
    font-weight: bold;
`

class Player extends React.Component {
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
                            <br />
                            Player not found. Check that:
                        </p>
                        <ul>
                            <BigLi>
                                PUBG changed shard names on 2018/11/30 -
                                If you have this page bookmarked, search again
                            </BigLi>
                            <li><strong>Capitalization matches exactly</strong></li>
                            <li>You selected the correct region</li>
                            <li>The user has played a game in the last week</li>
                            <li>If you’ve recently changed your name, please retry after playing a match</li>
                        </ul>
                    </PlayerHeader>
                </MatchesContainer>
            )
        }

        const matchTypes = groupBy(player.matches, m => {
            if (m.gameMode.includes('normal')) return 'c'
            if (m.gameMode.includes('solo')) return 1
            if (m.gameMode.includes('duo')) return 2
            if (m.gameMode.includes('squad')) return 4
            return 'unknown'
        })

        const hasCustom = !isEmpty(matchTypes['c'])
        const fetchedMinAgo = moment.utc().diff(moment.utc(player.lastFetchedAt), 'minutes')
        const friendlyAgo = moment.duration(fetchedMinAgo, 'minutes').humanize()
        const playerName = player.name
        const { shardId } = this.props.match.params

        return (
            <Settings.Context.Consumer>
                {({ favoritePlayers, toggleFavoritePlayer, isFavoritePlayer }) => (
                    <MatchesContainer hasCustom={hasCustom}>
                        <PlayerHeader>
                            <DocumentTitle title={`${player.name} | pubg.sh`} />
                            <PlayerName onClick={() => window.location.reload()}>
                                {player.name}
                            </PlayerName>
                            <SaveFavorite
                                onClick={() => toggleFavoritePlayer(playerName, shardId)}
                                className={isFavoritePlayer(playerName, shardId) ? 'active' : ''}
                            >
                                <i className="fi-star" />
                            </SaveFavorite>
                            {player.rateLimitReset &&
                                <RateLimited player={player} onUnRateLimited={this.props.data.refetch} />
                            }
                            {player.lastFetchedAt &&
                                <p>(Matches last updated {friendlyAgo} ago)</p>
                            }
                        </PlayerHeader>
                        <MatchesList col="1" header="Solo" baseUrl={match.url} matches={matchTypes['1']} />
                        <MatchesList col="2" header="Duos" baseUrl={match.url} matches={matchTypes['2']} />
                        <MatchesList col="3" header="Squad" baseUrl={match.url} matches={matchTypes['4']} />
                        {hasCustom &&
                            <MatchesList
                                col="4"
                                header="Custom"
                                baseUrl={match.url}
                                matches={matchTypes['c']}
                            />
                        }
                    </MatchesContainer>
                )}
            </Settings.Context.Consumer>
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
