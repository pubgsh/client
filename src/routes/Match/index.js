import React from 'react'
import { xor, union, difference } from 'lodash'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Map from './Map/index.js'
import Roster from './Roster/index.js'
import TimeTracker from './Time/TimeTracker.js'
import MatchInstant from './Time/MatchInstant.js'
import TimeSlider from './TimeSlider.js'
import AutoplayControls from './AutoplayControls.js'
import MatchInfo from './MatchInfo.js'
import HelpModal from './HelpModal.js'
import Telemetry from '../../models/Telemetry.js'
import TelemetryWorker from '../../models/Telemetry.worker.js'

// -----------------------------------------------------------------------------
// Styled Components -----------------------------------------------------------
// -----------------------------------------------------------------------------

const MatchContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 170px;
    border: 0px solid #eee;
    overflow: visible;
    margin: 0 auto;
`

const MapContainer = styled.div`
    grid-column: 1;
    position: relative;
    cursor: ${props => props.isDotHovered ? 'pointer' : 'normal'}
`

const RosterContainer = styled.div`
    grid-column: 2;
    position: relative;
    overflow-y: scroll;
    overflow-x: hidden;
    height: ${props => props.mapSize + 48}px;
    margin: 0 5px;
    padding-right: 5px;
`

const MatchHeader = styled.div`
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    margin-bottom: 10px;
    width: ${props => props.mapSize - 6}px;
`

const RosterHeader = styled.div`
    text-align: center;
    font-family: 'Palanquin', sans-serif;
    font-size: 1.1rem;
`

class Match extends React.Component {
    state = {
        matchId: null,
        telemetry: null,
        telemetryLoading: false,
        mapSize: 0,
        focusedPlayer: null,
        hoveredPlayer: null,
        trackedPlayers: [],
    }

    marks = {
        focusedPlayer: () => this.state.focusedPlayer,
        isPlayerFocused: playerName => this.state.focusedPlayer === playerName,

        hoveredPlayer: () => this.state.hoveredPlayer,
        isPlayerHovered: playerName => this.state.hoveredPlayer === playerName,
        setHoveredPlayer: playerName => this.setState({ hoveredPlayer: playerName }),

        trackedPlayers: () => this.state.trackedPlayers,
        isPlayerTracked: playerName => this.state.trackedPlayers.includes(playerName),
        toggleTrackedPlayer: (...playerNames) => {
            this.setState(({ trackedPlayers }) => {
                if (playerNames.length > 1 && difference(playerNames, trackedPlayers).length !== 0) {
                    return {
                        trackedPlayers: union(trackedPlayers, playerNames),
                    }
                }

                return {
                    trackedPlayers: xor(trackedPlayers, playerNames),
                }
            })
        },
    }

    // -------------------------------------------------------------------------
    // Map Sizing, Telemetry, Lifecycle ----------------------------------------
    // -------------------------------------------------------------------------

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            matchId: nextProps.match.params.matchId,
            focusedPlayer: nextProps.match.params.playerName,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.state.telemetry && !this.state.telemetryLoading && this.props.data.match) {
            console.log(`New match id (${this.state.matchId})`)
            this.loadTelemetry()
        }

        this.updateMapSize()
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateMapSize.bind(this))
        this.updateMapSize()
    }

    updateMapSize = () => {
        const mainContainer = document.getElementById('MainContainer')
        const containerHeight = window.innerHeight - mainContainer.offsetTop

        const availableHeight = containerHeight - 95
        const availableWidth = mainContainer.clientWidth - 170
        const mapSize = Math.min(availableWidth, availableHeight)

        mainContainer.style.height = `${containerHeight}px`

        const matchContainer = document.getElementById('MatchContainer')
        if (matchContainer) {
            matchContainer.style.width = `${mapSize + 170}px`
        }

        if (this.state.mapSize !== mapSize) {
            this.setState({ mapSize })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateMapSize.bind(this))
    }

    loadTelemetry = async () => {
        console.log('Loading telemetry...')

        let { focusedPlayer } = this.state
        if (!this.props.data.match.players.some(p => this.marks.isPlayerFocused(p.name))) {
            // The user is viewing a match they played under a previous name. We should be able to find
            // their previous id based on their account id.
            const { playerId } = this.props.playerId
            focusedPlayer = this.props.data.match.players.find(p => p.id === playerId).name
        }

        this.setState({ telemetry: null, telemetryLoading: true })

        const telemetryWorker = new TelemetryWorker()

        telemetryWorker.addEventListener('message', ({ data: state }) => {
            const telemetry = Telemetry(state)

            this.setState(prevState => ({
                telemetry,
                telemetryLoading: false,
                focusedPlayer,
                rosters: telemetry.finalRoster(focusedPlayer),
            }))
        })

        telemetryWorker.postMessage({ match: this.props.data.match, focusedPlayer })
    }

    // -------------------------------------------------------------------------
    // Render ------------------------------------------------------------------
    // -------------------------------------------------------------------------

    render() {
        const { data: { loading, error, match } } = this.props
        const { telemetry, mapSize, rosters } = this.state

        if (loading) return 'Loading...'
        if (error) return <p>An error occurred :(</p>
        if (!match) return 'Match not found'
        if (!telemetry) return 'Loading telemetry...'

        return (
            <TimeTracker
                durationSeconds={match.durationSeconds}
                render={({ msSinceEpoch, timeControls }) =>
                    <MatchInstant
                        telemetry={telemetry}
                        msSinceEpoch={msSinceEpoch}
                        render={({ currentTelemetry }) =>
                            <MatchContainer id="MatchContainer">
                                <MapContainer id="MapContainer" isDotHovered={!!this.marks.hoveredPlayer()}>
                                    <MatchHeader mapSize={mapSize}>
                                        <MatchInfo match={match} marks={this.marks} />
                                        <TimeSlider
                                            value={msSinceEpoch}
                                            stopAutoplay={timeControls.stopAutoplay}
                                            onChange={timeControls.setMsSinceEpoch}
                                            durationSeconds={match.durationSeconds}
                                        />
                                        <AutoplayControls
                                            autoplay={timeControls.autoplay}
                                            autoplaySpeed={timeControls.autoplaySpeed}
                                            toggleAutoplay={timeControls.toggleAutoplay}
                                            changeSpeed={timeControls.setAutoplaySpeed}
                                        />
                                    </MatchHeader>
                                    <Map
                                        match={match}
                                        telemetry={currentTelemetry}
                                        mapSize={mapSize}
                                        marks={this.marks}
                                        msSinceEpoch={msSinceEpoch}
                                    />
                                    <HelpModal mapSize={mapSize} />
                                </MapContainer>
                                <RosterContainer mapSize={mapSize}>
                                    <RosterHeader>Name (Kills)</RosterHeader>
                                    <Roster
                                        match={match}
                                        telemetry={currentTelemetry}
                                        rosters={rosters}
                                        marks={this.marks}
                                    />
                                </RosterContainer>
                            </MatchContainer>
                        }
                    />
                }
            />
        )
    }
}

const matchQuery = graphql(gql`
    query($matchId: String!) {
        match(id: $matchId) {
            id
            shardId
            gameMode
            playedAt
            mapName
            durationSeconds
            telemetryUrl
            players {
                id
                name
                rosterId
                stats {
                    kills
                    winPlace
                }
            }
        }
    }`, {
    name: 'data',
    options: ({ match }) => ({
        fetchPolicy: 'network-only',
        variables: {
            matchId: match.params.matchId,
        },
    }),
})

const playerIdQuery = graphql(gql`
    query($playerName: String!) {
        playerId(name: $playerName)
    }`, {
    name: 'playerId',
    options: ({ match }) => ({
        fetchPolicy: 'network-only',
        variables: {
            playerName: match.params.playerName,
        },
    }),
})

export default compose(matchQuery, playerIdQuery)(Match)
