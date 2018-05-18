import React from 'react'
import { get } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import { Input } from 'semantic-ui-react'
import Map from '../components/Map/index.js'

const MatchContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 250px;
    border: 0px solid black;
    overflow: hidden;
`

const MapContainer = styled.div`
    grid-column: 1;
    position: relative;
    padding-bottom: 100%;
`

class Match extends React.Component {
    state = { telemetry: null, secondsSinceEpoch: 600, autoPlay: false }

    static getDerivedStateFromProps(nextProps, prevState) {
        const matchId = get(nextProps, 'data.match.id')
        if (prevState.matchId === matchId) return null

        return { matchId, telemetry: null }
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log('did update', get(prevProps, 'data.match.id'), get(this.props, 'data.match.id'))
        if (get(prevProps, 'data.match.id') !== get(this.props, 'data.match.id')) {
            this.loadTelemetry()
        }
    }

    componentDidMount() {
        if (get(this.props, 'data.match.id')) {
            this.loadTelemetry()
        }

        if (this.state.autoPlay) {
            this.startAutoplay()
        }
    }

    componentWillUnmount() {
        // console.log('unmounting', get(this.props, 'data.match.id'))
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value })
        // console.log(this.props.history)
    }

    loadTelemetry = async () => {
        // console.log('Fetching telemetry')
        const res = await fetch(this.props.data.match.telemetryUrl)
        const telemetry = await res.json()
        console.log('setting telemetry', telemetry)
        this.setState({ telemetry })
    }

    startAutoplay = () => {
        this.autoplayInterval = setInterval(() => {
            this.setState(prevState => ({ secondsSinceEpoch: prevState.secondsSinceEpoch + 1 }))
        }, 10)
    }

    render() {
        const { match: routerMatch, data: { loading, error, match } } = this.props
        const { telemetry, secondsSinceEpoch } = this.state

        if (loading) return 'Loading...'
        if (error) return `Error ${error}`
        if (!match) return 'Match not found'

        return <div>
            Match {match.id} {secondsSinceEpoch}

            <p />

            <Input
                name="secondsSinceEpoch"
                onChange={this.onChange}
                value={secondsSinceEpoch}
                type="range"
                min="1"
                max={match.durationSeconds + 10}
                step="1"
                fluid
            />

            <MatchContainer>
                <MapContainer>
                    <Map
                        match={match}
                        telemetry={telemetry}
                        secondsSinceEpoch={secondsSinceEpoch}
                        focusPlayer={routerMatch.params.playerName}
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
