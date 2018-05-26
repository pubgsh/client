import React from 'react'
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

        return (
            <div>
                <p>
                    Oh no! We’re currently rate limited by PUBG. (Limit will increase soon)
                    <br />
                    As long as you keep this tab open, you’re in queue to be fetched.&nbsp;
                    Estimated fetch time is under {fetchTime} minute(s).
                </p>
            </div>
        )
    }
}

export default RateLimited
