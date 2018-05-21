import React from 'react'
import { Group, Text } from 'react-konva'

const PlayerTooltip = ({ player, mapSize, show }) => {
    if (!show) return null

    const toScale = n => n / 816000 * mapSize

    return (
        <Group>
            <Text
                fill={player.get('color').substring(0, 7)}
                x={toScale(player.getIn(['location', 'x'])) + 10}
                y={toScale(player.getIn(['location', 'y'])) - 10}
                text={player.get('name')}
                fontSize="10.5"
            />
        </Group>
    )
}

export default PlayerTooltip

