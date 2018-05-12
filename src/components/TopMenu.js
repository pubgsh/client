import React from 'react'
import styled from 'styled-components'
import { Form, Button, Input, Dropdown, Menu, Container } from 'semantic-ui-react'

const StyledMenu = styled(Menu)`&&& { background: #FFF; }`
const StyledInput = styled(Input)`&&&.input { width: 230px; }`
const StyledForm = styled(Form)`&&& { display: inherit; }`
const LogoMenuItem = styled(Menu.Item)`&&&.item { padding-left: 0 }`

const SHARDS = [
    { key: 'pc-na', text: 'pc-na', value: 'pc-na' },
    { key: 'pc-eu', text: 'pc-eu', value: 'pc-eu' },
]

class TopMenu extends React.Component {
    state = {
        searchText: '',
        shardId: 'pc-na',
    }

    static getDerivedStateFromProps(props, prevState) {
        if (props.location.pathname === '/') return prevState

        // Extract out the URL from the current browser location matching /:playerName/:shardId
        const [, playerName, shardId] = /\/(.*)\/(.*)/gm.exec(props.location.pathname)
        return { searchText: playerName, shardId }
    }

    handleDropdownChange = (e, { name, value }) => { this.setState({ [name]: value }) }
    handleInputChange = e => { this.setState({ [e.target.name]: e.target.value }) }
    search = () => { this.props.history.push(`/${this.state.searchText}/${this.state.shardId}`) }

    render() {
        const { shardId, searchText } = this.state
        return (
            <Container>
                <StyledMenu secondary>
                    <LogoMenuItem>pubg.sh</LogoMenuItem>

                    <Menu.Menu position="right">
                        <Menu.Item>
                            <StyledForm onSubmit={this.search}>
                                <StyledInput
                                    name="searchText"
                                    value={searchText}
                                    icon="search"
                                    placeholder="Player Name (Case Sensitive)"
                                    onChange={this.handleInputChange}
                                />

                                <Dropdown
                                    item
                                    name="shardId"
                                    text={shardId}
                                    options={SHARDS}
                                    onChange={this.handleDropdownChange}
                                />

                                <Button type="submit">Search</Button>
                            </StyledForm>
                        </Menu.Item>
                    </Menu.Menu>
                </StyledMenu>
            </Container>
        )
    }
}

export default TopMenu
