import React from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { ordinalSuffix } from 'ordinal-js'
import { downloadJSON, generateMatchFilename } from '../../lib/match-export.js'

const StyledMatchInfo = styled.ul`
    font-size: 1.3rem;
    line-height: 1.8rem;
    margin-bottom: 0;
    margin-right: 20px;
    list-style-type: none;

    li {
        margin-bottom: 0;
    }

    @media (max-width: 700px) {
        grid-column: 1;
        display: inline-block;
        position: absolute;
        top: -20px;
        width: 100%;
        text-align: center;
        font-size: 1.1rem;

        li {
            display: inline-block;
            margin-right: 3px;
        }
    }
`

class MatchInfo extends React.PureComponent {
    downloadMatch = () => {
        const { match, rawTelemetry, playerName } = this.props

        downloadJSON(
            { playerName, match, rawTelemetry },
            generateMatchFilename(match, playerName),
        )
    }

    render() {
        const { match, marks } = this.props

        const playedAt = moment(match.playedAt).format('MMM Do h:mm a')
        const { stats } = match.players.find(p => p.name === marks.focusedPlayer())

        return (
            <StyledMatchInfo>
                <li>{playedAt}</li>
                <li>
                    <strong>{stats.winPlace}</strong>{ordinalSuffix(stats.winPlace)} place,&nbsp;
                    <strong>{stats.kills}</strong> kills
                </li>
                <li>
                    <button onClick={this.downloadMatch}>Download</button>
                </li>
            </StyledMatchInfo>
        )
    }
}


export default MatchInfo
