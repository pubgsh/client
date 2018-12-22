import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import DocumentTitle from 'react-document-title'
import MatchPlayer from '../../components/MatchPlayer'
import Telemetry from '../../models/Telemetry.js'
import LocalTelemetryWorker from '../../models/LocalTelemetry.worker.js'

// -----------------------------------------------------------------------------
// Styled Components -----------------------------------------------------------
// -----------------------------------------------------------------------------

const Message = styled.p`
    text-align: center;
`

class LocalMatch extends React.Component {
    state = {
        loading: true,
        error: false,
        rawTelemetry: null,
        telemetry: null,
        telemetryLoaded: false,
        telemetryError: false,
        rosters: null,
        globalState: null,
    }

    // -------------------------------------------------------------------------
    // Telemetry, Lifecycle ----------------------------------------------------
    // -------------------------------------------------------------------------

    componentDidMount() {
        // Read replay JSON from file stored in history state

        const reader = new FileReader()

        reader.onload = read => {
            try {
                const data = JSON.parse(read.target.result)

                if (!data.playerName || !data.match || !data.rawTelemetry) {
                    throw new Error('Loaded invalid replay JSON')
                }

                this.loadTelemetry(data)
            } catch (error) {
                console.error(error)
                this.setState({ loading: false, error: true })
            }
        }

        reader.onerror = error => {
            console.error('Error reading replay file', error)
            this.setState({ loading: false, error: true })
        }

        reader.readAsText(this.props.location.state.file)
    }

    loadTelemetry = async json => {
        const { playerName, match, rawTelemetry } = json

        this.setState({
            match,
            playerName,
            rawTelemetry,
            loading: false,
            telemetry: null,
            telemetryLoaded: false,
            telemetryError: false,
        })

        const telemetryWorker = new LocalTelemetryWorker()

        telemetryWorker.addEventListener('message', ({ data }) => {
            const { success, error, state, globalState } = data

            if (!success) {
                console.error(`Error loading telemetry: ${error}`)

                this.setState(prevState => ({
                    telemetryError: true,
                }))

                return
            }

            const telemetry = Telemetry(state)

            this.setState(prevState => ({
                telemetry,
                telemetryLoaded: true,
                rosters: telemetry.finalRoster(playerName),
                globalState,
            }))
        })

        telemetryWorker.postMessage({
            match,
            focusedPlayer: playerName,
            rawTelemetry,
        })
    }

    // -------------------------------------------------------------------------
    // Render ------------------------------------------------------------------
    // -------------------------------------------------------------------------

    render() {
        const {
            // JSON file
            loading,
            error,
            playerName,
            match,
            rawTelemetry,

            // Telemetry
            telemetryLoaded,
            telemetryError,
            telemetry,
            rosters,
            globalState,
        } = this.state

        let content

        if (loading) {
            content = <Message>Loading...</Message>
        } else if (error || telemetryError) {
            content = <Message>An error occurred :(</Message>
        } else if (!telemetryLoaded) {
            content = <Message>Loading telemetry...</Message>
        } else {
            content = <MatchPlayer
                match={match}
                rawTelemetry={rawTelemetry}
                telemetry={telemetry}
                rosters={rosters}
                globalState={globalState}
                playerName={playerName}
            />
        }

        return (
            <React.Fragment>
                <DocumentTitle title="Local Replay | pubg.sh" />
                {content}
            </React.Fragment>
        )
    }
}

export default withRouter(LocalMatch)
