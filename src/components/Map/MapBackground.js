import styled from 'styled-components'

const getMapAsset = mapName => require(`../../assets/${mapName}.jpg`) // eslint-disable-line

const MapBackground = styled.div`
    width: 100%;
    background-image: url(${props => getMapAsset(props.mapName)});
    height: 100%;
    position: absolute;
    background-size: cover;
    overflow: hidden;
`

export default MapBackground
