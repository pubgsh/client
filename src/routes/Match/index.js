import React from 'react'
import { get } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Map from './Map/index.js'
import Roster from './Roster/index.js'
import TimeSlider from './TimeSlider.js'
import Telemetry from '../../models/Telemetry.js'

const MatchContainer = styled.div`
    ${props => props.containerSize ? `width: ${props.containerSize}px` : ''}
    display: grid;
    grid-template-columns: 1fr 250px;
    border: 0px solid black;
    overflow: hidden;
`

const MapContainer = styled.div`
    grid-column: 1;
    position: relative;
    cursor: ${props => props.hoveredPlayer ? 'pointer' : 'normal'}
`

const RosterContainer = styled.div`
    grid-column: 2;
    position: relative;
    overflow-y: scroll;
    height: ${props => props.mapSize + 40}px;
`

class Match extends React.Component {
    state = {
        matchId: null,
        focusedPlayer: null,
        telemetry: null,
        telemetryLoading: false,
        secondsSinceEpoch: 1,
        autoplay: true,
        mapSize: 0,
        hoveredPlayer: null,
        trackedPlayers: {},
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            matchId: nextProps.match.params.matchId,
            focusedPlayer: nextProps.match.params.playerName,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.state.telemetry && !this.state.telemetryLoading) {
            console.log(`New match id (${this.state.matchId})`)
            this.loadTelemetry()
        }

        this.updateMapSize(prevState)
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateMapSize.bind(this))
    }

    updateMapSize = (stateToUse = this.state) => {
        try {
            const availableWidth = document.getElementById('TopMenu').clientWidth - 250
            const availableHeight = window.innerHeight -
                document.getElementById('TopMenu').clientHeight -
                document.getElementById('TimeSlider').clientHeight -
                30

            const mapSize = Math.min(availableHeight, availableWidth)

            if (mapSize !== stateToUse.mapSize) {
                this.setState({ mapSize, containerSize: mapSize + 250 })
            }
        } catch (e) {
            // Do nothing - next state update will hopefully have the element
        }
    }

    componentWillUnmount() {
        this.stopAutoplay()
        window.removeEventListener('resize', this.updateMapSize.bind(this))
    }

    onTimeSliderChange = e => {
        this.setState({ secondsSinceEpoch: Number(e.target.value) })
    }

    loadTelemetry = async () => {
        console.log('Loading telemetry...')
        this.setState({ telemetry: null, telemetryLoading: true })

        const res = await fetch(this.props.data.match.telemetryUrl)
        const telemetryData = await res.json()
        const telemetry = Telemetry(this.props.data.match, telemetryData, this.state.focusedPlayer)

        const defaultTracked = telemetry.stateAt(1).get('players')
            .filter(p => p.get('focusType') === 'player' || p.get('focusType') === 'teammate')
            .map(p => p.get('name'))

        this.setState(prevState => ({
            telemetry,
            telemetryLoading: false,
            trackedPlayers: {
                ...prevState.trackedPlayers,
                ...defaultTracked.reduce((acc, name) => ({ ...acc, [name]: true }), {}),
            },
        }))

        if (this.state.autoplay) {
            setTimeout(this.startAutoplay, 500)
        }
    }

    startAutoplay = () => {
        this.autoplayInterval = setInterval(() => {
            this.setState(prevState => {
                const prev = prevState.secondsSinceEpoch

                if (prev > get(this.props, 'data.match.durationSeconds')) {
                    return { secondsSinceEpoch: 1 }
                }

                return { secondsSinceEpoch: prevState.secondsSinceEpoch + 1 }
            })
        }, 16)

        this.setState({ autoplay: true })
    }

    stopAutoplay = () => {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval)
        }

        this.setState({ autoplay: false })
    }

    toggleAutoplay = () => {
        if (this.state.autoplay) {
            this.stopAutoplay()
        } else {
            this.startAutoplay()
        }
    }

    setHoveredPlayer = playerName => {
        this.setState({ hoveredPlayer: playerName })
    }

    toggleTrackedPlayer = playerName => {
        this.setState(prevState => ({
            hoveredPlayer: prevState.trackedPlayers[playerName] ? '' : playerName,
            trackedPlayers: {
                ...prevState.trackedPlayers,
                [playerName]: !prevState.trackedPlayers[playerName],
            },
        }))
    }

    render() {
        const { data: { loading, error, match } } = this.props
        const { telemetry, secondsSinceEpoch, mapSize, autoplay } = this.state

        if (loading) return 'Loading...'
        if (error) return `Error ${error}`
        if (!match) return 'Match not found'
        if (!telemetry) return 'Loading telemetry...'

        const currentTelemetry = telemetry.stateAt(secondsSinceEpoch)

        const marks = {
            focusedPlayer: this.state.focusedPlayer,
            hoveredPlayer: this.state.hoveredPlayer,
            trackedPlayers: this.state.trackedPlayers,
            setHoveredPlayer: this.setHoveredPlayer,
            toggleTrackedPlayer: this.toggleTrackedPlayer,
            isHovered: playerName => this.state.hoveredPlayer === playerName,
            isTracked: playerName => !!this.state.trackedPlayers[playerName],
            isFocused: playerName => this.state.focusedPlayer === playerName,
        }

        return (
            <MatchContainer id="MatchContainer" containerSize={this.state.containerSize}>
                <MapContainer id="MapContainer" hoveredPlayer={marks.hoveredPlayer}>
                    <TimeSlider
                        value={secondsSinceEpoch}
                        autoplay={autoplay}
                        stopAutoplay={this.stopAutoplay}
                        toggleAutoplay={this.toggleAutoplay}
                        onChange={this.onTimeSliderChange}
                        durationSeconds={match.durationSeconds}
                    />
                    <Map match={match} telemetry={currentTelemetry} mapSize={mapSize} marks={marks} />
                </MapContainer>
                <RosterContainer mapSize={mapSize}>
                    <Roster match={match} telemetry={currentTelemetry} marks={marks} />
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
