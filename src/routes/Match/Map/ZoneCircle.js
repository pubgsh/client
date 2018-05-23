import React from 'react'
import { Circle } from 'react-konva'

const ZoneCircle = ({ mapSize, circle, color, background }) => {
    const toScale = n => n / 816000 * mapSize

    return (
        <Circle
            x={toScale(circle.get('x'))}
            y={toScale(circle.get('y'))}
            fill={background}
            stroke={color}
            width={toScale(circle.get('radius') * 2)}
            height={toScale(circle.get('radius') * 2)}
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
