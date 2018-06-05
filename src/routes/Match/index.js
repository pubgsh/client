import React from 'react'
import { reduce, groupBy, sortBy } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Map from './Map/index.js'
import Roster from './Roster/index.js'
import TimeTracker from './Time/TimeTracker.js'
import MatchInstant from './Time/MatchInstant.js'
import TimeSlider from './TimeSlider.js'
import AutoplayControls from './AutoplayControls.js'
import MatchInfo from './MatchInfo.js'
import Telemetry from '../../models/Telemetry.js'

// -----------------------------------------------------------------------------
// Styled Components -----------------------------------------------------------
// -----------------------------------------------------------------------------

const MatchContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 170px;
    border: 0px solid #eee;
    overflow: hidden;
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
    margin: 0 auto;
    padding-right: 5px;
`

const MatchHeader = styled.div`
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    margin-bottom: 10px;
    width: ${props => props.mapSize}px;
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
        hoveredRosterId: null,
        trackedRosters: {},
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

        this.updateMapSize(prevState)
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateMapSize.bind(this))
        this.updateMapSize()
    }

    updateMapSize = (stateToUse = this.state) => {
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

        if (stateToUse.mapSize !== mapSize) {
            this.setState({ mapSize })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateMapSize.bind(this))
    }

    loadTelemetry = async () => {
        console.log('Loading telemetry...')
        this.setState({ telemetry: null, telemetryLoading: true })

        const res = await fetch(this.props.data.match.telemetryUrl)
        const telemetryData = await res.json()
        const telemetry = Telemetry(this.props.data.match, telemetryData, this.state.focusedPlayer)

        const players = telemetry.stateAt(1).get('players')
        const playerRoster = players.reduce((acc, p) => {
            acc[p.get('name')] = p.get('rosterId')
            return acc
        }, {})
        const playersOnRoster = reduce(groupBy(players, p => p.get('rosterId')), (acc, ps, id) => {
            acc[id] = sortBy(ps, p => p.get('name'))
            return acc
        }, {})


        this.setState(prevState => ({
            playerRoster,
            playersOnRoster,
            telemetry,
            telemetryLoading: false,
            trackedRosters: { [playerRoster[this.state.focusedPlayer]]: true },
        }))
    }

    // -------------------------------------------------------------------------
    // Marks -------------------------------------------------------------------
    // -------------------------------------------------------------------------

    setHoveredRosterId = rosterId => {
        this.setState({ hoveredRosterId: rosterId })
    }

    toggleTrackedRoster = rosterId => {
        this.setState(prevState => ({
            trackedRosters: {
                ...prevState.trackedRosters,
                [rosterId]: !prevState.trackedRosters[rosterId],
            },
        }))
    }

    // -------------------------------------------------------------------------
    // Render ------------------------------------------------------------------
    // -------------------------------------------------------------------------

    render() {
        const { data: { loading, error, match } } = this.props
        const { focusedPlayer, telemetry, mapSize } = this.state

        if (loading) return 'Loading...'
        if (error) return <p>An error occurred :(</p>
        if (!match) return 'Match not found'
        if (!telemetry) return 'Loading telemetry...'

        const marks = {
            focusedPlayer: this.state.focusedPlayer,
            hoveredRosterId: this.state.hoveredRosterId,
            trackedRosterIds: this.state.trackedRosterIds,
            setHoveredRosterId: this.setHoveredRosterId,
            toggleTrackedRoster: this.toggleTrackedRoster,
            isPlayerTracked: playerName => this.state.trackedRosters[this.state.playerRoster[playerName]],
            isRosterTracked: rosterId => this.state.trackedRosters[rosterId],
            isPlayerFocused: playerName => this.state.focusedPlayer === playerName,
            isRosterFocused: rosterId => this.state.trackedRosters[this.state.playerRoster[focusedPlayer]],
            isRosterHovered: rosterId => this.state.hoveredRosterId === rosterId,
        }

        return (
            <TimeTracker
                durationSeconds={match.durationSeconds}
                render={({ msSinceEpoch, timeControls }) =>
                    <MatchInstant
                        telemetry={telemetry}
                        msSinceEpoch={msSinceEpoch}
                        render={({ currentTelemetry }) =>
                            <MatchContainer id="MatchContainer">
                                <MapContainer id="MapContainer" isDotHovered={!!marks.hoveredRosterId}>
                                    <MatchHeader mapSize={mapSize}>
                                        <MatchInfo match={match} marks={marks} />
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
                                        marks={marks}
                                    />
                                </MapContainer>
                                <RosterContainer mapSize={mapSize}>
                                    <RosterHeader>Name (Kills)</RosterHeader>
                                    <Roster match={match} telemetry={currentTelemetry} marks={marks} />
                                </RosterContainer>
                            </MatchContainer>
                        }
                    />
                }
            />
        )
    }
}

export default graphql(gql`
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
    options: ({ match }) => ({
        fetchPolicy: 'network-only',
        variables: {
            matchId: match.params.matchId,
        },
    }),
})(Match)
