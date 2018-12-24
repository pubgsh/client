import React from 'react'
import MapButton from '../../components/MapButton.js'
import { downloadJSON, LOCAL_REPLAY_VERSION } from '../../lib/match-export.js'

const DownloadIcon = MapButton.extend`
    top: 63px;
    right: 40px;

    @media (-moz-touch-enabled: 1), (pointer:coarse) {
        display: none;
    }
`

class DownloadButton extends React.PureComponent {
    downloadMatch = () => {
        const { match, rawTelemetry, playerName } = this.props

        downloadJSON({
            version: LOCAL_REPLAY_VERSION,
            match,
            rawTelemetry,
            playerName,
        })
    }

    render() {
        return (
            <DownloadIcon onClick={this.downloadMatch}>
                <i className="fi-download" />
            </DownloadIcon>
        )
    }
}

export default DownloadButton
