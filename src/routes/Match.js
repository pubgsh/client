import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { Input } from 'semantic-ui-react'
import Match from '../models/Match.js'
import miramar from '../miramar.jpg'

class MatchView extends React.Component {
    state = {
        msSinceEpoch: 1000,
        match: null,
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.data.match) {
            const parsed = {
                id: nextProps.data.match.id,
                data: JSON.parse(nextProps.data.match.data),
                telemetryData: JSON.parse(nextProps.data.match.telemetryData),
            }

            return { match: Match(parsed) }
        }

        return null
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    render() {
        if (!this.state.match) return 'Loading...'

        const players = this.state.match.stateAt(this.state.msSinceEpoch)

        let left = '50%'
        let top = '50%'

        if (players && players.robobagins && players.robobagins.location) {
            const { x, y } = players.robobagins.location
            left = `${x / 8160}%`
            top = `${y / 8160}%`
        }

        return <div>
            Match {this.state.match.id}
            <Input
                name="msSinceEpoch"
                onChange={this.onChange}
                value={this.state.msSinceEpoch}
                type="range"
                min="1000"
                max={this.state.match.duration * 1000}
                step="1000"
            />
            {this.state.msSinceEpoch}
            <p>
                {players &&
                    JSON.stringify(players.robobagins)
                }
            </p>
            <div style={{ backgroundImage: `url(${miramar})`, width: '898px', height: '701px', position: 'relative' }}>
                <div style={{ color: 'red', position: 'absolute', height: '20px', width: '20px',
                    fontWeight: 'bold',
                    left,
                    top,
                }}>X</div>
            </div>
        </div>
    }
}

const matchQuery = gql`
    query($matchId: String!) {
        match(id: $matchId) {
            id
            data
            telemetryData
        }
    }
`

const WrappedMatch = graphql(matchQuery, {
    variables: props => ({
        matchId: props.matchId,
    }),
    options: {
        fetchPolicy: 'network-only',
    },
})(MatchView)

export default ({ match }) =>
    <WrappedMatch matchId={match.params.matchId} />

