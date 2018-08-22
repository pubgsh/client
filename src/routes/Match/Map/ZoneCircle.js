import React from 'react'
import { Circle } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'

const ZoneCircle = ({ pubgMapSize, mapSize, mapScale, circle, color, background }) => {
    return (
        <Circle
            x={toScale(pubgMapSize, mapSize, circle.x)}
            y={toScale(pubgMapSize, mapSize, circle.y)}
            fill={background}
            stroke={color}
            width={toScale(pubgMapSize, mapSize, circle.radius * 2)}
            height={toScale(pubgMapSize, mapSize, circle.radius * 2)}
            strokeWidth={1 / mapScale}
        />
    )
}

export const Safezone = props =>
    <ZoneCircle {...props} color="white" />

export const Bluezone = props =>
    <ZoneCircle {...props} color="blue" />

export const Redzone = props =>
    <ZoneCircle {...props} color="#FF000044" background="#FF000044" />
