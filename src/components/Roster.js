import React from 'react'
import { map, reverse } from 'lodash'
import styled from 'styled-components'

const RosterEntry = styled.li`
    color: ${props => {
        const colorNoAlpha = props.color.substring(0, 7)
        return colorNoAlpha === '#FFFFFF' ? '#000' : colorNoAlpha
    }};
    font-weight: ${props => props.isHovered || props.isTracked ? 800 : 400};
    &:hover {
        cursor: pointer;
    }
`

export default ({ match, telemetry, marks }) => {
    return (
        <ul>
            {reverse(map(telemetry.get('players'), player =>
                <RosterEntry
                    key={player.get('name')}
                    color={player.get('color')}
                    isHovered={marks.isHovered(player.get('name'))}
                    isTracked={marks.isTracked(player.get('name'))}
                    onMouseOver={() => marks.setHoveredPlayer(player.get('name'))}
                    onMouseOut={() => marks.setHoveredPlayer('')}
                    onClick={() => marks.toggleTrackedPlayer(player.get('name'))}
                >
                    {player.get('name')}
                    {marks.isTracked(player.get('name')) && <div>
                        Kills: {player.get('kills')}
                    </div>}
                </RosterEntry>
            ))}
        </ul>
    )
}
