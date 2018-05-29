import React from 'react'
import moment from 'moment'
import io from 'socket.io-client'

class RateLimited extends React.Component {
    componentDidMount() {
        if (!this.socket) {
            console.log('Opening socket')
            this.socket = io(`${process.env.REACT_APP_API}?playerKey=${this.props.player.rateLimitPlayerKey}`)
            this.socket.on('message', m => {
                if (m === 'LOADED') {
                    this.props.onUnRateLimited()
                }
            })
        }
    }

    componentWillUnmount() {
        if (this.socket) {
            console.log('Closing socket')
            this.socket.close()
            this.socket = null
        }
    }

    render() {
        const fetchTime = Math.ceil((this.props.player.rateLimitAhead + 1) / 10)
        const fetchEstimate = moment().add(fetchTime + 1, 'minute')

        return (
            <div>
                <p>
                    Oh no! We’re currently rate limited by PUBG. (Limit should increase soon)
                    <br />
                    Sit tight - as long as you keep this page open and connected to the
                    internet, you’re in queue to be fetched.
                    <br />
                    Estimated fetch time is {fetchEstimate.format('h:mm a')}.
                </p>
            </div>
        )
    }
}

export default RateLimited
