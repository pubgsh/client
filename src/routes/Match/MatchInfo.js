import React from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { ordinalSuffix } from 'ordinal-js'

const StyledMatchInfo = styled.p`
    font-size: 1.3rem;
    line-height: 1.8rem;
    margin-bottom: 0;
    margin-right: 20px;
`

class MatchInfo extends React.PureComponent {
    render() {
        const { match, marks } = this.props

        const playedAt = moment(match.playedAt).format('MMM Do h:mm a')
        const { stats } = match.players.find(p => p.name === marks.focusedPlayer())

        return (
            <StyledMatchInfo>
                {playedAt}<br />
                <strong>{stats.winPlace}</strong>{ordinalSuffix(stats.winPlace)} place,&nbsp;
                <strong>{stats.kills}</strong> kills
            </StyledMatchInfo>
        )
    }
}


export default MatchInfo
