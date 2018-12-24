import React from 'react'
import { xor, union, difference, merge, cloneDeep, set } from 'lodash'
import styled from 'styled-components'
import * as Options from './Options.js'
import Map from './Map/index.js'
import Roster from './Roster/index.js'
import TimeTracker from './Time/TimeTracker.js'
import TimeSlider from './Time/TimeSlider.js'
import AutoplayControls from './Time/AutoplayControls.js'
import MatchInfo from './MatchInfo.js'
import HelpModal from './HelpModal.js'
import DownloadButton from './DownloadButton.js'

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

class MatchPlayer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            mapSize: 0,
            focusedPlayer: props.playerName,
            // See getDerivedStateFromProps
            prevPlayerName: props.playerName,
            hoveredPlayer: null,
            trackedPlayers: [],
            options: Options.DEFAULT_OPTIONS,
            setOption: null,
        }
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
    // Map Sizing, Lifecycle ---------------------------------------------------
    // -------------------------------------------------------------------------

    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
    // HACK-ish. Should probably turn this into a controlled component.
    // The functionality isn't needed right now, but I'd rather not break it.
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.prevPlayerName !== nextProps.playerName) {
            return {
                focusedPlayer: nextProps.playerName,
                prevPlayerName: nextProps.playerName,
            }
        }

        return null
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateMapSize.bind(this))
        this.updateMapSize()
        this.loadOptions()
    }

    componentDidUpdate(prevProps, prevState) {
        this.updateMapSize()
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

    // -------------------------------------------------------------------------
    // Render ------------------------------------------------------------------
    // -------------------------------------------------------------------------

    render() {
        const { match, rawTelemetry, telemetry, rosters, globalState } = this.props
        const { mapSize, options, setOption, prevPlayerName } = this.state

        return (
            <Options.Context.Provider value={{ options, setOption }}>
                <TimeTracker
                    options={options}
                    durationSeconds={match.durationSeconds + 5}
                    telemetry={telemetry}
                    render={({ msSinceEpoch, timeControls, currentTelemetry }) =>
                        <MatchContainer id="MatchContainer">
                            <MapContainer id="MapContainer" isDotHovered={!!this.marks.hoveredPlayer()}>
                                <MatchHeader>
                                    <MatchInfo
                                        match={match}
                                        marks={this.marks}
                                        rawTelemetry={rawTelemetry}
                                        playerName={prevPlayerName}
                                    />
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
                                <DownloadButton
                                    match={match}
                                    playerName={prevPlayerName}
                                    rawTelemetry={rawTelemetry}
                                />
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
                        </MatchContainer>
                    }
                />
            </Options.Context.Provider>
        )
    }
}

export default MatchPlayer
