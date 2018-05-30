import React from 'react'
import { get, clamp, reduce, groupBy, sortBy } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Map from './Map/index.js'
import Roster from './Roster/index.js'
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
    cursor: ${props => props.hoveredRosterId ? 'pointer' : 'normal'}
`

const RosterContainer = styled.div`
    grid-column: 2;
    position: relative;
    overflow-y: scroll;
    overflow-x: hidden;
    height: ${props => props.mapSize + 38}px;
    margin: 0 auto;
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
        autoplaySpeed: 10,
        matchId: null,
        telemetry: null,
        telemetryLoading: false,
        msSinceEpoch: 1000,
        autoplay: true,
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
        this.mounted = true
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
        cancelAnimationFrame(this.rafId)
        this.mounted = false
        window.removeEventListener('resize', this.updateMapSize.bind(this))
    }

    loadTelemetry = async () => {
        console.log('Loading telemetry...')
        this.setState({ telemetry: null, telemetryLoading: true })

        const res = await fetch(this.props.data.match.telemetryUrl)
        const telemetryData = await res.json()
        const telemetry = Telemetry(this.props.data.match, telemetryData, this.state.focusedPlayer)

        const roster = reduce(
            groupBy(telemetry.stateAt(1).get('players'), p => p.get('rosterId')),
            (acc, ps, id) => {
                acc[id] = sortBy(ps, p => p.get('name'))
                return acc
            },
            {}
        )

        this.setState(prevState => ({
            telemetry,
            telemetryLoading: false,
            trackedRosters: Object.keys(roster).reduce((acc, rosterId) => {
                acc[rosterId] = roster[rosterId].some(p => p.get('name') === prevState.focusedPlayer)
                return acc
            }, {}),
        }))

        if (this.state.autoplay) {
            setTimeout(this.startAutoplay, 1000)
        }
    }

    // -------------------------------------------------------------------------
    // Time Slider / Autoplay --------------------------------------------------
    // -------------------------------------------------------------------------

    onTimeSliderChange = msSinceEpoch => { this.setState({ msSinceEpoch }) }

    loop = time => {
        if (!this.state.autoplay || !this.mounted) return

        const elapsedTime = time - this.rafLastTime
        if (elapsedTime > 16) {
            this.rafLastTime = time

            this.setState(prevState => {
                const prev = prevState.msSinceEpoch

                if (Math.floor(prev / 1000) > get(this.props, 'data.match.durationSeconds')) {
                    return { msSinceEpoch: 1000 }
                }

                return { msSinceEpoch: prevState.msSinceEpoch + (prevState.autoplaySpeed * elapsedTime) }
            })
        }

        this.rafId = requestAnimationFrame(this.loop)
    }

    startAutoplay = () => {
        this.rafLastTime = performance.now()
        this.setState({ autoplay: true })
        this.rafId = requestAnimationFrame(this.loop)
    }

    stopAutoplay = () => {
        cancelAnimationFrame(this.rafId)
        this.setState({ autoplay: false })
    }

    toggleAutoplay = () => {
        if (this.state.autoplay) {
            this.stopAutoplay()
        } else {
            this.startAutoplay()
        }
    }

    changeAutoplaySpeed = val => {
        this.setState({ autoplaySpeed: clamp(val, 1, 50) })
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
        const { focusedPlayer, telemetry, msSinceEpoch, mapSize, autoplay, autoplaySpeed } = this.state

        if (loading) return 'Loading...'
        if (error) return <p>An error occurred :(</p>
        if (!match) return 'Match not found'
        if (!telemetry) return 'Loading telemetry...'

        const currentTelemetry = telemetry.stateAt(msSinceEpoch)

        const roster = reduce(
            groupBy(currentTelemetry.get('players'), p => p.get('rosterId')),
            (acc, ps, id) => {
                acc[id] = sortBy(ps, p => p.get('name'))
                return acc
            },
            {}
        )

        const getRosterId = playerName => telemetry.finalState().get('players')
            .find(p => p.get('name') === focusedPlayer)
            .get('rosterId')

        const marks = {
            focusedPlayer: this.state.focusedPlayer,
            hoveredRosterId: this.state.hoveredRosterId,
            trackedRosterIds: this.state.trackedRosterIds,
            setHoveredRosterId: this.setHoveredRosterId,
            toggleTrackedRoster: this.toggleTrackedRoster,
            isPlayerTracked: playerName => this.state.trackedRosters[getRosterId(playerName)],
            isPlayerFocused: playerName => this.state.focusedPlayer === playerName,
            isRosterHovered: rosterId => this.state.hoveredRosterId === rosterId,
            isRosterTracked: rosterId => this.state.trackedRosters[rosterId],
            isRosterFocused: rosterId => this.state.trackedRosters[getRosterId(focusedPlayer)],
        }

        return (
            <MatchContainer id="MatchContainer">
                <MapContainer id="MapContainer" hoveredRosterId={marks.hoveredRosterId}>
                    <MatchHeader mapSize={mapSize}>
                        <MatchInfo match={match} marks={marks} />
                        <TimeSlider
                            value={msSinceEpoch}
                            stopAutoplay={this.stopAutoplay}
                            onChange={this.onTimeSliderChange}
                            durationSeconds={match.durationSeconds}
                        />
                        <AutoplayControls
                            autoplay={autoplay}
                            autoplaySpeed={autoplaySpeed}
                            toggleAutoplay={this.toggleAutoplay}
                            changeSpeed={this.changeAutoplaySpeed}
                        />
                    </MatchHeader>
                    <Map match={match} telemetry={currentTelemetry} mapSize={mapSize} marks={marks} />
                </MapContainer>
                <RosterContainer mapSize={mapSize}>
                    <RosterHeader>Name (Kills)</RosterHeader>
                    <Roster match={match} roster={roster} telemetry={currentTelemetry} marks={marks} />
                </RosterContainer>
            </MatchContainer>
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
