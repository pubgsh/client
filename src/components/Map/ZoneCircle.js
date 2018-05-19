import React from 'react'
import { Circle } from 'react-konva'

const ZoneCircle = ({ mapSize, position: { x, y }, radius, color, background }) => {
    const toScale = n => n / 816000 * mapSize

    return (
        <Circle
            x={toScale(x)}
            y={toScale(y)}
            fill={background}
            stroke={color}
            width={toScale(radius) * 2}
            height={toScale(radius) * 2}
            strokeWidth="1"
        />
    )
}

export const Safezone = props =>
    <ZoneCircle {...props} color="white" />

export const Bluezone = props =>
    <ZoneCircle {...props} color="blue" />

export const Redzone = props =>
    <ZoneCircle {...props} color="#FF000044" background="#FF000044" />
