import React from 'react'
import { Circle } from 'react-konva'

const PlayerDot = ({ mapSize, name, location: { x, y }, status, color = 'white', strokeColor = 'black' }) => {
    const toScale = n => n / 816000 * mapSize

    return (
        <Circle
            x={toScale(x)}
            y={toScale(y)}
            fill={color}
            stroke={strokeColor}
            width="10"
            height="10"
            strokeWidth="1"
        />
    )
}

export default PlayerDot
