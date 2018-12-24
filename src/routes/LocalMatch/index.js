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

const INITIAL_STATE = {
    // JSON file
    loading: true,
    fileError: false,
    parseError: false,
    loadedVersion: null,
    versionError: false,
    rawTelemetry: null,

    // Telemetry
    telemetry: null,
    telemetryLoaded: false,
    telemetryError: false,
    rosters: null,
    globalState: null,
}

class LocalMatch extends React.Component {
    state = INITIAL_STATE

    // -------------------------------------------------------------------------
    // Lifecycle ---------------------------------------------------------------
    // -------------------------------------------------------------------------

    componentDidMount() {
        this.loadLocalReplay()
    }

    // -------------------------------------------------------------------------
    // Match, Telemetry --------------------------------------------------------
    // -------------------------------------------------------------------------

    loadLocalReplay = () => {
        // Read replay JSON from file stored in history state

        const reader = new FileReader()

        reader.onload = read => {
            let data

            try {
                data = JSON.parse(read.target.result)
            } catch (error) {
                console.error('Error parsing JSON', error)
                this.setState({ loading: false, parseError: true })
                return
            }

            if (!data.version) {
                console.error('Missing version in JSON')
                this.setState({ loading: false, parseError: true })
                return
            }

            switch (data.version) {
            // Replay version 1
            case 1: {
                if (!data.playerName || !data.match || !data.rawTelemetry) {
                    console.error('Missing field(s) in JSON')
                    this.setState({ loading: false, parseError: true })
                    return
                }

                this.loadTelemetry(data)
                return
            }

            // Unsupported version
            default: {
                console.error(`Unsupported replay version ${data.version}`)
                this.setState({ loading: false, loadedVersion: data.version, versionError: true })
            }
            }
        }

        reader.onerror = error => {
            console.error('Error reading replay file', error.target.error, error)
            this.setState({ loading: false, fileError: true })
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
            fileError,
            parseError,
            loadedVersion,
            versionError,
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
        } else if (fileError) {
            content = <Message>Error loading replay file :(</Message>
        } else if (parseError) {
            content = <Message>
                Invalid replay file. Only replays downloaded from pubg.sh are supported.
            </Message>
        } else if (versionError) {
            content = <Message>Unsupported replay version ${loadedVersion} :(</Message>
        } else if (telemetryError) {
            content = <Message>Error loading telemetry :(</Message>
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
