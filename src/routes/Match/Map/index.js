import React from 'react'
import { map, clamp } from 'lodash'
import { Stage, Layer } from 'react-konva'
import { Safezone, Bluezone, Redzone } from './ZoneCircle.js'
import PlayerDot from './PlayerDot.js'
import PlayerTooltip from './PlayerTooltip.js'
import BackgroundLayer from './BackgroundLayer.js'

const SCALE_STEP = 0.4
const MIN_SCALE = 1
const MAX_SCALE = 5

class Map extends React.Component {
    state = { mapScale: 1, offsetX: 0, offsetY: 0 }

    handleDragEnd = e => {
        this.setState({
            offsetX: e.target.x(),
            offsetY: e.target.y(),
        })
    }

    dragBoundFunc = pos => {
        const x = clamp(pos.x, -(this.state.mapScale - 1) * this.props.mapSize, 0)
        const y = clamp(pos.y, -(this.state.mapScale - 1) * this.props.mapSize, 0)

        this.setState({
            offsetX: x,
            offsetY: y,
        })

        return { x, y }
    }

    handleMousewheel = e => {
        this.setState(prevState => {
            const scaleDelta = e.evt.deltaY > 0 ? -SCALE_STEP : SCALE_STEP
            const newScale = clamp(prevState.mapScale + scaleDelta, MIN_SCALE, MAX_SCALE)

            const mousePointX = e.evt.layerX / prevState.mapScale - prevState.offsetX / prevState.mapScale
            const mousePointY = e.evt.layerY / prevState.mapScale - prevState.offsetY / prevState.mapScale

            const offsetX = -(mousePointX - e.evt.layerX / newScale) * newScale
            const offsetY = -(mousePointY - e.evt.layerY / newScale) * newScale

            return {
                mapScale: newScale,
                offsetX: clamp(offsetX, -(newScale - 1) * this.props.mapSize, 0),
                offsetY: clamp(offsetY, -(newScale - 1) * this.props.mapSize, 0),
            }
        })
    }

    render() {
        const { match, telemetry, mapSize, marks } = this.props
        const { mapScale, offsetX, offsetY } = this.state
        const scale = { x: mapScale, y: mapScale }

        return (
            <Stage
                width={mapSize}
                height={mapSize}
                scale={scale}
                x={offsetX}
                y={offsetY}
                dragBoundFunc={this.dragBoundFunc}
                onDragEnd={this.handleDragEnd}
                onWheel={this.handleMousewheel}
                draggable="true"
            >
                <BackgroundLayer mapName={match.mapName} mapSize={mapSize} />
                <Layer>
                    {<Safezone mapSize={mapSize} mapScale={mapScale} circle={telemetry.get('safezone')} />}
                    {<Bluezone mapSize={mapSize} mapScale={mapScale} circle={telemetry.get('bluezone')} />}
                    {<Redzone mapSize={mapSize} mapScale={mapScale} circle={telemetry.get('redzone')} />}
                    {map(telemetry.get('players'), player =>
                        <PlayerDot
                            player={player}
                            mapSize={mapSize}
                            mapScale={mapScale}
                            key={`dot-${player.get('name')}`}
                            marks={marks}
                        />,
                    )}
                    {map(telemetry.get('players'), player =>
                        <PlayerTooltip
                            player={player}
                            mapSize={mapSize}
                            mapScale={mapScale}
                            key={`tooltip-${player.get('name')}`}
                            show={marks.isTracked(player.get('name')) || marks.isHovered(player.get('name'))}
                        />,
                    )}
                </Layer>
            </Stage>
        )
    }
}

export default Map
