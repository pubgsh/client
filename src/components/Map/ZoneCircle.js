import styled from 'styled-components'

const ZoneCircle = styled.div.attrs({
    style: props => ({
        left: `${props.position.x / 8160}%`,
        top: `${props.position.y / 8160}%`,
        width: `${props.radius / 8160 * 2}%`,
        height: `${props.radius / 8160 * 2}%`,
    }),
})`
    z-index: 3;
    border: 1px solid ${props => props.color};
    position: absolute;
    border-radius: 3000px
    transform: translate(-50%, -50%);
`

export default ZoneCircle
