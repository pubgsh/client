import React from 'react'
import styled from 'styled-components'

const MediaButton = styled.button`
    padding: 0;
    font-size: 2rem;
    border: 0;
    margin-bottom: 0;
    width: 25px;

    &:disabled {
        color: #bbb;
    }
`

const AutoplayControls = ({ autoplay, toggleAutoplay, changeSpeed, autoplaySpeed }) => {
    return (
        <div>
            <MediaButton
                className="button"
                type="submit"
                style={{ marginRight: 10, marginLeft: 10 }}
                onClick={() => changeSpeed(-1)}
                disabled={autoplaySpeed <= 1}
            >
                <i className="fi-rewind" />
            </MediaButton>
            <MediaButton className="button" type="submit" onClick={toggleAutoplay}>
                <i className={`fi-${autoplay ? 'pause' : 'play'}`} />
            </MediaButton>
            <MediaButton
                className="button"
                style={{ marginLeft: 10 }}
                type="submit"
                onClick={() => changeSpeed(1)}
                disabled={autoplaySpeed >= 5}
            >
                <i className="fi-fast-forward" />
            </MediaButton>
        </div>
    )
}

export default AutoplayControls
