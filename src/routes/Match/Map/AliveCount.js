import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
    position: absolute;
    top: 15px;
    right: 15px;
    `

const commonStyles = styled.div`
    font-family: 'Teko';
    font-weight: 300;
    font-size: 27px;
    opacity: 0.8;
    padding: 0.2em;
    padding-bottom: 0.04em
    line-height: 1;
    text-transform: uppercase;
    float: left;
    user-select: none;
    pointer-events: none;
    text-align: right;
`

const AliveCountNumber = commonStyles.extend`
    color: #fff;
    background-color: #777;
    width: 0.7em;
    `

const AliveText = commonStyles.extend`
    color: #ccc;
    background-color: #333;
    `

const AliveCount = ({ players }) => {
    if (!players) {
        return null
    }

    const aliveCount = players.filter(player => {
        return player.get('status') === 'alive'
    }).length

    return (
        <Wrapper>
            <AliveCountNumber>{aliveCount}</AliveCountNumber>
            <AliveText>alive</AliveText>
        </Wrapper>
    )
}

export default AliveCount
