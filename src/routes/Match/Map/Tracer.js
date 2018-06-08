import React from 'react'
import { Line } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'

const Tracer = ({ mapSize, mapScale, tracer }) => {
    if (!tracer) {
        return null
    }

    return (
        <Line
            points={[
                toScale(mapSize, tracer.from.x), toScale(mapSize, tracer.from.y),
                toScale(mapSize, tracer.to.x), toScale(mapSize, tracer.to.y),
            ]}
            stroke="#fff"
            dash={[0.5, 0.1]}
            strokeWidth={1 / Math.max(1, mapScale / 1.4)}
        />
    )
}

export default Tracer
