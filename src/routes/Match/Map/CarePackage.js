import React from 'react'
import { Group, Line, Rect } from 'react-konva'
import { toScale } from '../../../lib/canvas-math.js'

const RECT_SIZE = 11

const CarePackage = ({ mapSize, mapScale, carePackage }) => {
    if (!carePackage) return null

    return (
        <Group
            x={toScale(mapSize, carePackage.x)}
            y={toScale(mapSize, carePackage.y)}
            scale={{ x: 1 / mapScale, y: 1 / mapScale }}
        >
            <Rect
                x={-RECT_SIZE / 2}
                y={-RECT_SIZE / 2}
                fill="#A02522"
                width={RECT_SIZE}
                height={RECT_SIZE}
            />
            <Rect
                x={-RECT_SIZE / 2}
                y={-RECT_SIZE / 2}
                fill="#207CAE"
                width={RECT_SIZE}
                height={RECT_SIZE / 3}
            />
            <Line
                points={[
                    -RECT_SIZE / 5, -RECT_SIZE / 2,
                    -RECT_SIZE / 5, RECT_SIZE / 2,
                ]}
                stroke="#222"
                strokeWidth={0.5}
            />
            <Line
                points={[
                    RECT_SIZE / 5, -RECT_SIZE / 2,
                    RECT_SIZE / 5, RECT_SIZE / 2,
                ]}
                stroke="#222"
                strokeWidth={0.5}
            />
        </Group>
    )
}

export default CarePackage
