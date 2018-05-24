import React from 'react'
import { Circle } from 'react-konva'

const toScale = (mapSize, n) => n / 816000 * mapSize

const ZoneCircle = ({ mapSize, mapScale, circle, color, background }) => {
    return (
        <Circle
            x={toScale(mapSize, circle.get('x'))}
            y={toScale(mapSize, circle.get('y'))}
            fill={background}
            stroke={color}
            width={toScale(mapSize, circle.get('radius') * 2)}
            height={toScale(mapSize, circle.get('radius') * 2)}
            strokeWidth={1 / Math.max(1, mapScale / 1.4)}
        />
    )
}

export const Safezone = props =>
    <ZoneCircle {...props} color="white" />

export const Bluezone = props =>
    <ZoneCircle {...props} color="blue" />

export const Redzone = props =>
    <ZoneCircle {...props} color="#FF000044" background="#FF000044" />
