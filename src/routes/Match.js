import React from 'react'
import { get } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import { Input, Container, Button, Icon } from 'semantic-ui-react'
import Map from '../components/Map/index.js'
import Telemetry from '../models/Telemetry.js'

const MatchContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 250px;
    border: 0px solid black;
    overflow: hidden;
`

const MapContainer = styled.div`
    grid-column: 1;
    position: relative;
`

const StyledRangeInput = styled(Input)`
    &&& {
        display: flex;
        width: 100%;
        margin-right: 10px;
    }
`

const StyledPlayButton = styled(Button)`
    &&& {
        display: flex;
        margin-right: 1px;
    }
`

class Match extends React.Component {
    state = { telemetry: null, secondsSinceEpoch: 600, autoplay: false, mapSize: 0 }

    componentDidUpdate(prevProps, prevState) {
        if (get(prevProps, 'data.match.id') !== get(this.props, 'data.match.id')) {
            console.log(`New match id (${get(this.props, 'data.match.id')})`)
            this.loadTelemetry()
        }

        if (this.state.telemetry && !this.autoplayInterval && this.state.autoplay) {
            console.log('Telemetry loaded and autoplay = true. Autoplaying.')
            this.startAutoplay()
        }

        const mapSize = document.getElementById('MapContainer').clientWidth
        if (prevState.mapSize !== mapSize) {
            console.log(`New MapContainer size (${prevState.mapSize} --> ${mapSize})`)
            this.setMapSize(mapSize)
        }
    }

    componentWillUnmount() {
        this.stopAutoplay()
    }

    onInputChange = e => {
        this.setState({ [e.target.name]: Number(e.target.value) })
    }

    setMapSize(mapSize) {
        this.setState({ mapSize })
    }

    loadTelemetry = async () => {
        console.log('Loading telemetry...')
        const res = await fetch(this.props.data.match.telemetryUrl)
        const telemetryData = await res.json()
        const telemetry = Telemetry(this.props.data.match, telemetryData)
        this.setState({ telemetry })
    }

    startAutoplay = () => {
        this.autoplayInterval = setInterval(() => {
            this.setState(prevState => {
                const prev = prevState.secondsSinceEpoch

                if (prev > get(this.props, 'data.match.durationSeconds')) {
                    return { secondsSinceEpoch: 1 }
                }

                return { secondsSinceEpoch: prevState.secondsSinceEpoch + 3 }
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

    render() {
        const { match: routerMatch, data: { loading, error, match } } = this.props
        const { telemetry, secondsSinceEpoch, mapSize } = this.state

        if (loading) return 'Loading...'
        if (error) return `Error ${error}`
        if (!match) return 'Match not found'

        return <div>
            Match {match.id} {secondsSinceEpoch}

            <p />


            <MatchContainer>
                <MapContainer id="MapContainer">
                    <Container fluid style={{ display: 'flex', marginBottom: '5px' }}>
                        <StyledRangeInput
                            name="secondsSinceEpoch"
                            onClick={this.stopAutoplay}
                            onChange={this.onInputChange}
                            value={secondsSinceEpoch}
                            type="range"
                            min="1"
                            max={match.durationSeconds + 10}
                            step="1"
                        />
                        <StyledPlayButton
                            icon={this.state.autoplay ? 'pause' : 'play'}
                            onClick={this.toggleAutoplay}
                        />
                    </Container>

                    <Map
                        match={match}
                        telemetry={telemetry}
                        secondsSinceEpoch={secondsSinceEpoch}
                        focusedPlayer={routerMatch.params.playerName}
                        mapSize={mapSize}
                    />
                </MapContainer>
            </MatchContainer>
        </div>
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
