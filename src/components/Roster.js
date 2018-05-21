import React from 'react'
import { map, groupBy, reverse } from 'lodash'
import styled from 'styled-components'

const Roster = styled.ul`
    list-style-type: none;
    padding-left: 10px;
`

const RosterEntry = styled.li`
    line-height: 1.2em;
    font-size: .9em;
    color: ${props => {
        const colorNoAlpha = props.color.substring(0, 7)
        return colorNoAlpha === '#FFFFFF' ? '#000' : colorNoAlpha
    }};
    font-weight: ${props => props.isHovered || props.isTracked ? 800 : 400};
    cursor: pointer;
`

const getRosterEntry = (marks, player) =>
    <RosterEntry
        key={player.get('name')}
        color={player.get('color')}
        isHovered={marks.isHovered(player.get('name'))}
        isTracked={marks.isTracked(player.get('name'))}
        onMouseEnter={() => marks.setHoveredPlayer(player.get('name'))}
        onMouseLeave={() => marks.setHoveredPlayer('')}
        onClick={() => marks.toggleTrackedPlayer(player.get('name'))}
    >
        {player.get('name')} ({player.get('kills')} kills)
    </RosterEntry>

export default ({ match, telemetry, marks }) => {
    const { tracked, alive, dead } = groupBy(telemetry.get('players'), p => {
        if (marks.isTracked(p.get('name'))) return 'tracked'
        if (p.get('status') === 'dead') return 'dead'
        return 'alive'
    })

    return [
        <Roster key="roster-tracked">
            {reverse(map(tracked, player => getRosterEntry(marks, player)))}
        </Roster>,
        <Roster key="roster-alive">
            {map(alive, player => getRosterEntry(marks, player))}
        </Roster>,
        <Roster key="roster-dead">
            {map(dead, player => getRosterEntry(marks, player))}
        </Roster>,
    ]
}
