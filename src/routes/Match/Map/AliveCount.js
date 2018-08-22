import React from 'react'
import { filter } from 'lodash'
import styled from 'styled-components'

const Wrapper = styled.div`
    position: absolute;
    top: 15px;
    left: 15px;
    grid-template-columns: 32px;
    text-align: center;
    display: grid;
    font-family: 'Teko';
    font-weight: 300;
    font-size: 2.5rem;
    line-height: 2.5rem;
    padding: 0.2rem;
    opacity: 0.8;
    text-transform: uppercase;
    user-select: none;
    pointer-events: none;
`

const AliveCountNumber = styled.div`
    grid-column: 1;
    color: #FFFFFF;
    background-color: #777777;
    padding: 0.5rem 0.5rem 0;
`

const AliveText = styled.div`
    grid-column: 2;
    color: #CCCCCC;
    background-color: #333333;
    padding: 0.5rem 0.5rem 0;
`

const AliveCount = ({ players }) => {
    if (!players) {
        return null
    }

    const aliveCount = Object.keys(players).length - filter(players, p => p.status === 'dead').length

    return (
        <Wrapper>
            <AliveCountNumber>{aliveCount}</AliveCountNumber>
            <AliveText>alive</AliveText>
        </Wrapper>
    )
}

export default AliveCount
