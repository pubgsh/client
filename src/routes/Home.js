import React from 'react'
import { Button, Input, Container, Header } from 'semantic-ui-react'

export default class Home extends React.Component {
    state = {
        playerName: '',
    }

    onSubmit = async () => {
        this.props.history.push(`/player/${this.state.playerName}`)
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    render() {
        const { playerName } = this.state

        return (
            <Container text>
                <Header as="h2">Find Player</Header>
                <Input
                    name="playerName"
                    onChange={this.onChange}
                    value={playerName}
                    placeholder="Player Name"
                    fluid
                />
                <Button onClick={this.onSubmit}>Submit</Button>
            </Container>
        )
    }
}
