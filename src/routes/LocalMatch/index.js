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
    missingFileError: false,
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

    componentDidUpdate(prevProps, prevState) {
        // React Router does not remount if route component is the same, which happens
        // if uploading from /local-replay itself, or when navigating history between
        // local replays.
        if (prevProps.location !== this.props.location) {
            // We need to to reset the component to its initial state. I think this is
            // a legitimate use of `setState` in `componentDidUpdate`:
            //
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState(INITIAL_STATE, this.loadLocalReplay)
        }
    }

    componentWillUnmount() {
        this.cancelTelemetry()
    }

    // -------------------------------------------------------------------------
    // Match, Telemetry --------------------------------------------------------
    // -------------------------------------------------------------------------

    loadLocalReplay = () => {
        if (!this.props.location.state ||
            !this.props.location.state.file ||
            !(this.props.location.state.file instanceof File)
        ) {
            console.error('No file in history state')
            this.setState({ loading: false, missingFileError: true })
            return
        }

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
        this.cancelTelemetry()

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

        this.telemetryWorker = new LocalTelemetryWorker()

        this.telemetryWorker.addEventListener('message', ({ data }) => {
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

        this.telemetryWorker.postMessage({
            match,
            focusedPlayer: playerName,
            rawTelemetry,
        })
    }

    cancelTelemetry = () => {
        if (this.telemetryWorker) {
            this.telemetryWorker.terminate()
            this.telemetryWorker = null
        }
    }

    // -------------------------------------------------------------------------
    // Render ------------------------------------------------------------------
    // -------------------------------------------------------------------------

    render() {
        const {
            // JSON file
            loading,
            missingFileError,
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
        } else if (missingFileError) {
            content = (
                <Message>
                    Local replay files must be loaded using the button located at the top-right.
                </Message>
            )
        } else if (fileError) {
            content = <Message>Error loading replay file :(</Message>
        } else if (parseError) {
            content = (
                <Message>
                    Invalid replay file. Only replays downloaded from pubg.sh are supported.
                </Message>
            )
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
