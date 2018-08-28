import React from 'react'
import { xor, union, difference, merge, cloneDeep, set } from 'lodash'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import DocumentTitle from 'react-document-title'
import * as Options from './Options.js'
import Map from './Map/index.js'
import Roster from './Roster/index.js'
import TimeTracker from './Time/TimeTracker.js'
import TimeSlider from './Time/TimeSlider.js'
import AutoplayControls from './Time/AutoplayControls.js'
import MatchInfo from './MatchInfo.js'
import HelpModal from './HelpModal.js'
import Telemetry from '../../models/Telemetry.js'
import TelemetryWorker from '../../models/Telemetry.worker.js'

// -----------------------------------------------------------------------------
// Styled Components -----------------------------------------------------------
// -----------------------------------------------------------------------------

const MatchContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 180px;
    grid-column-gap: 10px;
    border: 0px solid #eee;
    overflow: visible;
    margin: 0 auto;
    max-width: calc(100vh + 10px);
    opacity: ${props => props.telemetryLoaded ? 1 : 0};

    @media (max-width: 700px) {
        grid-template-columns: 1fr 0px;
        grid-column-gap: 0;
        grid-row-gap: 15px;
    }
`

const MapContainer = styled.div`
    grid-column: 1;
    position: relative;
    cursor: ${props => props.isDotHovered ? 'pointer' : 'normal'};
    display: grid;
`

const RosterContainer = styled.div`
    grid-column: 2;
    position: relative;
    overflow-y: scroll;
    overflow-x: hidden;
    height: ${props => props.mapSize + 48}px;
    padding-right: 10px;

    @media (max-width: 700px) {
        grid-column: 1;
        grid-row: 2;
    }
`

const MatchHeader = styled.div`
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    margin-bottom: 10px;

    @media (max-width: 700px) {
        grid-template-columns: 0px 1fr max-content;
        grid-row: 2;
        margin-top: 10px;
        margin-bottom: 0;
    }
`

const RosterHeader = styled.div`
    text-align: center;
    font-size: 1.1rem;
    font-weight: 400;
`

const Message = styled.p`
    text-align: center;
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
        this.loadOptions()
    }

    loadOptions = () => {
        const localOptions = JSON.parse(localStorage.getItem(Options.STORAGE_KEY) || '{}')
        const options = merge(Options.DEFAULT_OPTIONS, localOptions)

        const setOption = (key, val) => {
            this.setState(prevState => {
                const newOptions = cloneDeep(prevState.options)
                set(newOptions, key, val)
                localStorage.setItem(Options.STORAGE_KEY, JSON.stringify(newOptions))
                return { options: newOptions }
            })
        }

        this.setState({ options, setOption })
    }

    updateMapSize = () => {
        const stageWrapper = document.getElementById('StageWrapper')

        if (stageWrapper) {
            this.setState(ps => {
                if (ps.mapSize !== stageWrapper.clientWidth) {
                    return { mapSize: stageWrapper.clientWidth }
                }

                return null
            })
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

        telemetryWorker.addEventListener('message', ({ data: { state, globalState } }) => {
            const telemetry = Telemetry(state)

            this.setState(prevState => ({
                telemetry,
                telemetryLoading: false,
                focusedPlayer,
                rosters: telemetry.finalRoster(focusedPlayer),
                globalState,
            }))
        })

        telemetryWorker.postMessage({ match: this.props.data.match, focusedPlayer })
    }

    // -------------------------------------------------------------------------
    // Render ------------------------------------------------------------------
    // -------------------------------------------------------------------------

    render() {
        const { data: { loading, error, match } } = this.props
        const { telemetry, mapSize, rosters, options, setOption, globalState } = this.state

        if (loading) return <Message>Loading...</Message>
        if (error) return <Message>An error occurred :(</Message>
        if (!match) return <Message>Match not found</Message>

        return (
            <Options.Context.Provider value={{ options, setOption }}>
                <TimeTracker
                    options={options}
                    durationSeconds={match.durationSeconds + 5}
                    telemetry={telemetry}
                    render={({ msSinceEpoch, timeControls, currentTelemetry }) => [
                        !currentTelemetry && <Message key="message">Loading telemetry...</Message>,
                        <MatchContainer key="match" id="MatchContainer" telemetryLoaded={!!currentTelemetry}>
                            <DocumentTitle title="Replay | pubg.sh" />
                            <MapContainer id="MapContainer" isDotHovered={!!this.marks.hoveredPlayer()}>
                                <MatchHeader>
                                    <MatchInfo match={match} marks={this.marks} />
                                    <TimeSlider
                                        value={msSinceEpoch}
                                        stopAutoplay={timeControls.stopAutoplay}
                                        onChange={timeControls.setMsSinceEpoch}
                                        durationSeconds={match.durationSeconds + 5}
                                        globalState={globalState}
                                        options={options}
                                    />
                                    <AutoplayControls
                                        autoplay={timeControls.autoplay}
                                        autoplaySpeed={timeControls.autoplaySpeed}
                                        toggleAutoplay={timeControls.toggleAutoplay}
                                        changeSpeed={timeControls.setAutoplaySpeed}
                                        isFinished={(match.durationSeconds + 5) === (msSinceEpoch / 1000)}
                                        rewindToStart={timeControls.rewindToStart}
                                    />
                                </MatchHeader>
                                <Map
                                    match={match}
                                    telemetry={currentTelemetry}
                                    mapSize={mapSize}
                                    marks={this.marks}
                                    msSinceEpoch={msSinceEpoch}
                                    options={options}
                                />
                                <HelpModal mapSize={mapSize} />
                            </MapContainer>
                            <RosterContainer mapSize={mapSize}>
                                <RosterHeader>Name / Kills / Damage</RosterHeader>
                                <Roster
                                    match={match}
                                    telemetry={currentTelemetry}
                                    rosters={rosters}
                                    marks={this.marks}
                                />
                            </RosterContainer>
                        </MatchContainer>,
                    ]}
                />
            </Options.Context.Provider>
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
