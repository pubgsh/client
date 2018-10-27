import React from 'react'
import { map, clamp, sortBy } from 'lodash'
import { Stage, Layer } from 'react-konva'
import styled from 'styled-components'
import { Safezone, Bluezone, Redzone } from './ZoneCircle.js'
import PlayerDot from './PlayerDot.js'
import BackgroundLayer from './BackgroundLayer.js'
import CarePackage from './CarePackage.js'
import Tracer from './Tracer.js'
import AliveCount from './AliveCount.js'
import MapButton from '../../../components/MapButton.js'
import { toScale } from '../../../lib/canvas-math.js'


const SCALE_STEP = 1.2
const MIN_SCALE = 1
const MAX_SCALE = 50
const CLAMP_MAP = true // TODO: This should be a configurable option

const StageWrapper = styled.div`
    position: relative;

    &:after {
        content: "";
        display: block;
        padding-bottom: 100%;
    }
`

const StyledStage = styled(Stage)`
    div.konvajs-content {
        overflow: hidden;
        border-radius: 4px;
        position: absolute !important;
    }
`

const ZoomControls = styled.div`
    position: absolute;
    right: 0px;
    bottom: 0px;
`

const ZoomInButton = MapButton.extend`
    bottom: 40px;
    right: 15px;
`

const ZoomOutButton = MapButton.extend`
    bottom: 15px;
    right: 15px;
`

class Map extends React.Component {
    state = { mapScale: 1, offsetX: 0, offsetY: 0, isTracking: false }

    static getDerivedStateFromProps(props) {
        if (props.options.tools.enabled) {
            const { offsetX, offsetY, mapScale } = props.options.tools.map
            return {
                offsetX,
                offsetY,
                mapScale,
            }
        }
        return {}
    }

    componentDidMount() {
        window.addEventListener('keydown', this.onKeydown)
    }


    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeydown)
    }

    onKeydown = e => {
        if (e.target.tagName.toLowerCase() === 'input') return

        if (e.keyCode === 70) { // "F" key
            e.preventDefault()

            this.setState(({ isTracking }) => ({
                isTracking: !isTracking,
            }))

            console.log('TOGGLED centering')
        }
    }

    componentDidUpdate(prevProps) {
        const { match: { mapName }, msSinceEpoch, telemetry, marks, mapSize } = this.props
        const { isTracking } = this.state

        if (telemetry) {
            const pubgMapSize = mapName === 'Savage_Main' ? 408000 : 816000
            const { x, y } = telemetry.playerLocations[marks.focusedPlayer()]
            const scaledX = toScale(pubgMapSize, mapSize, x)
            const scaledY = toScale(pubgMapSize, mapSize, y)

            if (prevProps.msSinceEpoch < msSinceEpoch && isTracking) {
            this.setState({ // eslint-disable-line
                    offsetX: scaledX,
                    offsetY: scaledY,
                })

                console.log('centering')
            }
        }
    }

    handleDragEnd = e => {
        this.setState({
            offsetX: e.target.x(),
            offsetY: e.target.y(),
            isTracking: false,
        })
    }

    dragBoundFunc = pos => {
        let { x, y } = pos
        if (CLAMP_MAP) {
            x = clamp(x, -(this.state.mapScale - 1) * this.props.mapSize, 0)
            y = clamp(y, -(this.state.mapScale - 1) * this.props.mapSize, 0)
        }

        this.setState({
            offsetX: x,
            offsetY: y,
        })

        return { x, y }
    }

    handleMousewheel = e => {
        e.evt.preventDefault()
        const scaleDelta = e.evt.deltaY > 0 ? 1 / SCALE_STEP : SCALE_STEP
        this.handleZoom(scaleDelta, e.evt.layerX, e.evt.layerY)
    }

    handleZoom = (scaleDelta, layerX, layerY) => {
        if (!layerX) layerX = this.props.mapSize / 2 // eslint-disable-line
        if (!layerY) layerY = this.props.mapSize / 2 // eslint-disable-line
        this.setState(prevState => {
            const newScale = clamp(prevState.mapScale * scaleDelta, MIN_SCALE, MAX_SCALE)

            const mousePointX = layerX / prevState.mapScale - prevState.offsetX / prevState.mapScale
            const mousePointY = layerY / prevState.mapScale - prevState.offsetY / prevState.mapScale

            let offsetX = -(mousePointX - layerX / newScale) * newScale
            let offsetY = -(mousePointY - layerY / newScale) * newScale

            if (CLAMP_MAP) {
                offsetX = clamp(offsetX, -(newScale - 1) * this.props.mapSize, 0)
                offsetY = clamp(offsetY, -(newScale - 1) * this.props.mapSize, 0)
            }

            return {
                mapScale: newScale,
                offsetX,
                offsetY,
            }
        })
    }

    render() {
        const { match: { mapName }, telemetry, mapSize, marks, msSinceEpoch, options } = this.props
        const { mapScale, offsetX, offsetY } = this.state
        const scale = { x: mapScale, y: mapScale }

        const pubgMapSize = mapName === 'Savage_Main' ? 408000 : 816000

        // The order players are added to the canvas determines their relative z-index. We want to render
        // focused players on top, then tracked, etc, so we need to sort the players. We want dead players
        // below everything else, so we have to do this sort on every render. We use ~ and @ as they wrap
        // the ASCII range and we want a stable sort, so we use the player's name as the default value.
        const sortedPlayers = telemetry && sortBy(telemetry.players, player => {
            const { name } = player

            if (marks.isPlayerFocused(name)) return '~z'
            if (marks.isPlayerTracked(name)) return `~y${name}`
            if (telemetry.players[marks.focusedPlayer()].teammates.includes(name)) return `~x${name}`
            if (player.status === 'dead') return `@y${name}`
            if (player.health === 0) return `@z${name}`
            return name
        })

        return (
            <StageWrapper id="StageWrapper">
                <StyledStage
                    width={mapSize}
                    height={mapSize}
                    scale={scale}
                    x={offsetX}
                    y={offsetY}
                    dragBoundFunc={this.dragBoundFunc}
                    onDragEnd={this.handleDragEnd}
                    onWheel={this.handleMousewheel}
                    draggable="true"
                    hitGraphEnabled={false}
                >
                    <BackgroundLayer mapName={mapName} mapSize={mapSize} />
                    {telemetry && <Layer>
                        {telemetry.safezone && <Safezone
                            mapSize={mapSize}
                            pubgMapSize={pubgMapSize}
                            mapScale={mapScale}
                            circle={telemetry.safezone}
                        />}
                        {telemetry.bluezone && <Bluezone
                            mapSize={mapSize}
                            pubgMapSize={pubgMapSize}
                            mapScale={mapScale}
                            circle={telemetry.bluezone}
                        />}
                        {telemetry.redzone && <Redzone
                            mapSize={mapSize}
                            pubgMapSize={pubgMapSize}
                            mapScale={mapScale}
                            circle={telemetry.redzone}
                        />}
                        {telemetry.carePackages.map(carePackage =>
                            <CarePackage
                                key={carePackage.key}
                                mapSize={mapSize}
                                pubgMapSize={pubgMapSize}
                                mapScale={mapScale}
                                carePackage={carePackage}
                            />
                        )}
                        {map(sortedPlayers, player =>
                            <PlayerDot
                                options={options}
                                player={player}
                                mapSize={mapSize}
                                pubgMapSize={pubgMapSize}
                                mapScale={mapScale}
                                key={`dot-${player.name}`}
                                marks={marks}
                                showName={marks.isPlayerTracked(player.name)}
                            />
                        )}
                        {telemetry.tracers.map(tracer =>
                            <Tracer
                                key={tracer.key}
                                mapSize={mapSize}
                                pubgMapSize={pubgMapSize}
                                mapScale={mapScale}
                                players={telemetry.players}
                                tracer={tracer}
                                msSinceEpoch={msSinceEpoch}
                            />
                        )}
                    </Layer>}
                </StyledStage>
                {telemetry && <AliveCount players={telemetry.players} />}
                <ZoomControls>
                    <ZoomInButton onClick={() => this.handleZoom(1.3)}>+</ZoomInButton>
                    <ZoomOutButton onClick={() => this.handleZoom(1 / 1.3)}>-</ZoomOutButton>
                </ZoomControls>
            </StageWrapper>
        )
    }
}

export default Map
