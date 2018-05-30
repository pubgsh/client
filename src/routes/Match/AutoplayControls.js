import React from 'react'
import styled from 'styled-components'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import 'rc-slider/assets/index.css'

const SliderWithTooltip = createSliderWithTooltip(Slider)

const StyledSlider = styled(SliderWithTooltip)`
    padding-top: 5px;
    margin-top: 12px;
    grid-column: 2;
    min-width: 80px;
`

const MediaButton = styled.button`
    padding: 0;
    font-size: 2rem;
    border: 0;
    margin-bottom: 0;
    width: 25px;
    grid-column: 1;

    &:disabled {
        color: #bbb;
    }
`

const ControlsWrapper = styled.div`
    display: grid;
`

const AutoplayControls = ({ autoplay, toggleAutoplay, changeSpeed, autoplaySpeed }) => {
    return (
        <ControlsWrapper>
            <MediaButton className="button" type="submit" onClick={toggleAutoplay}>
                <i className={`fi-${autoplay ? 'pause' : 'play'}`} />
            </MediaButton>
            <StyledSlider
                min={1}
                max={40}
                value={autoplaySpeed}
                onChange={changeSpeed}
                tipFormatter={v => `${v}x`}
                tipProps={{
                    visible: true,
                    placement: 'top',
                    align: { offset: [0, 8] },
                    overlayStyle: { zIndex: 1 },
                }}
            />
        </ControlsWrapper>
    )
}

export default AutoplayControls
