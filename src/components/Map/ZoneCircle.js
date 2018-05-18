import React from 'react'
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
    background: ${props => props.background};
    position: absolute;
    border-radius: 3000px
    transform: translate(-50%, -50%);
`

export const Safezone = props =>
    <ZoneCircle {...props} color="white" />

export const Bluezone = props =>
    <ZoneCircle {...props} color="blue" />

export const Redzone = props =>
    <ZoneCircle {...props} color="#FF000044" background="#FF000044" />
