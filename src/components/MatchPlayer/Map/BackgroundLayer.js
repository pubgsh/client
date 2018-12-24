import React from 'react'
import { Layer, Image } from 'react-konva'

const getMapAsset = mapName => require(`../../../assets/${mapName}.jpg`) // eslint-disable-line

class BackgroundLayer extends React.Component {
    state = { image: null }

    componentDidMount() {
        const image = new window.Image()
        image.src = getMapAsset(this.props.mapName)
        image.onload = () => {
            this.setState({ image })
        }
    }

    render() {
        return (
            <Layer>
                <Image image={this.state.image} height={this.props.mapSize} width={this.props.mapSize} />
            </Layer>
        )
    }
}

export default BackgroundLayer
