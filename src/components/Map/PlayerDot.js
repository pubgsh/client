import React from 'react'
import styled from 'styled-components'

const StyledDot = styled.div.attrs({
    style: props => ({
        left: `${props.x / 8160}%`,
        top: `${props.y / 8160}%`,
    }),
})`
    z-index: ${props => props.isFocused ? 2 : 1};
    background: ${props => props.color};
    border: 1px solid black;
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 10px;
    transform: translate(-50%, -50%);
`

const getDotColor = (isFocused, status) => {
    if (isFocused) {
        return status === 'dead' ? '#895aff' : '#18e786'
    }

    return status === 'dead' ? '#FF0000' : '#FFF'
}

const PlayerDot = ({ focusPlayer, name, location: { x, y }, status }) => {
    const isFocused = focusPlayer === name

    return (
        <StyledDot x={x} y={y} color={getDotColor(isFocused, status)} isFocused={isFocused} />
    )
}


export default PlayerDot
