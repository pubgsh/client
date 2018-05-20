import React from 'react'
import { Circle } from 'react-konva'

const PlayerDot = ({ player, mapSize, name }) => {
    const toScale = n => n / 816000 * mapSize

    return (
        <Circle
            x={toScale(player.getIn(['location', 'x']))}
            y={toScale(player.getIn(['location', 'y']))}
            fill={player.get('color')}
            stroke="black"
            width="10"
            height="10"
            strokeWidth="1"
        />
    )
}

export default PlayerDot
