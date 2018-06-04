import React from 'react'
import { clamp } from 'lodash'

class TimeTracker extends React.Component {
    state = {
        autoplaySpeed: 10,
        msSinceEpoch: 1000,
        autoplay: true,
    }

    setMsSinceEpoch = msSinceEpoch => { this.setState({ msSinceEpoch }) }
    setAutoplaySpeed = val => { this.setState({ autoplaySpeed: clamp(val, 1, 50) }) }

    componentDidMount() {
        this.mounted = true
        setTimeout(this.startAutoplay, 300)
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rafId)
        this.mounted = false
    }

    loop = time => {
        if (!this.state.autoplay || !this.mounted) return

        const elapsedTime = time - this.rafLastTime
        if (elapsedTime > 16) {
            this.rafLastTime = time

            this.setState(prevState => {
                const prev = prevState.msSinceEpoch

                if (Math.floor(prev / 1000) > this.props.durationSeconds) {
                    return { msSinceEpoch: 1000 }
                }

                return { msSinceEpoch: prevState.msSinceEpoch + (prevState.autoplaySpeed * elapsedTime) }
            })
        }

        this.rafId = requestAnimationFrame(this.loop)
    }

    startAutoplay = () => {
        this.rafLastTime = performance.now()
        this.setState({ autoplay: true })
        this.rafId = requestAnimationFrame(this.loop)
    }

    stopAutoplay = () => {
        cancelAnimationFrame(this.rafId)
        this.setState({ autoplay: false })
    }

    toggleAutoplay = () => {
        if (this.state.autoplay) {
            this.stopAutoplay()
        } else {
            this.startAutoplay()
        }
    }

    render() {
        const renderProps = {
            msSinceEpoch: this.state.msSinceEpoch,
            timeControls: {
                autoplay: this.state.autoplay,
                autoplaySpeed: this.state.autoplaySpeed,
                startAutoplay: this.startAutoplay,
                stopAutoplay: this.stopAutoplay,
                toggleAutoplay: this.toggleAutoplay,
                setAutoplaySpeed: this.setAutoplaySpeed,
                setMsSinceEpoch: this.setMsSinceEpoch,
            },
        }

        return this.props.render(renderProps)
    }
}

export default TimeTracker
