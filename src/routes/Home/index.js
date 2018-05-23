import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { isEmpty } from 'lodash'
import { Form, Button, Input, Dropdown } from 'semantic-ui-react'
import { SHARDS } from '../../models/Shards.js'

const StyledDropdown = styled(Dropdown)`
    &&& {
        margin: 0 1em;

        .visible.menu {
            top: 20px;
        }
    }
`

const StyledForm = styled(Form)`
    margin-top: 50px;
    zoom: 1.3;
`

const StyledInput = styled(Input)`
    &&& input {
        width: 17em;
        padding: 0.2em 1em;
        line-height: 2.3em;
    }
`

const CenteredContainer = styled.div`
    text-align: center;
    margin: 0 auto;
    padding-top: 50px;
    padding-bottom: 75px;
`

const RecentPlayersHeader = styled.h5`
    margin-top: 50px;
`

const RecentPlayersUl = styled.ul`
    list-style-type: none;
    padding-left: 0;
`

const Footer = styled.div`
    position: fixed;
    left: 0;
    width: 100%;
    bottom: 0;
    background: white;
    padding-bottom: 10px;
`

const RecentPlayers = () => {
    const recentPlayers = JSON.parse(localStorage.getItem('recentPlayers') || '[]')

    if (isEmpty(recentPlayers)) return null

    return [
        <RecentPlayersHeader key="recent-players-header">Recent Searches</RecentPlayersHeader>,
        <RecentPlayersUl key="recent-players-ul">
            {recentPlayers.map(p =>
                <li key={`link-${p.playerName}-${p.shardId}`}>
                    <Link to={`/${p.url}`}>
                        {p.playerName} ({p.shardId})
                    </Link>
                </li>
            )}
        </RecentPlayersUl>,
    ]
}

class Home extends React.Component {
    state = { searchText: '', shardId: localStorage.getItem('shardId') || SHARDS[0].value }

    handleDropdownChange = (e, { name, value }) => {
        this.setState({ [name]: value })
        if (name === 'shardId') localStorage.setItem('shardId', value)
    }

    handleInputChange = e => { this.setState({ [e.target.name]: e.target.value }) }

    search = () => {
        if (this.state.searchText && this.state.shardId) {
            this.props.history.push(`/${this.state.searchText}/${this.state.shardId}`)
        }
    }

    componentDidMount() {
        document.getElementById('HomeSearchInput').focus()
    }

    render() {
        const { shardId, searchText } = this.state

        return <CenteredContainer>
            <h1>pubg.sh</h1>

            <StyledForm onSubmit={this.search}>
                <StyledInput
                    id="HomeSearchInput"
                    name="searchText"
                    value={searchText}
                    placeholder="Player Name (Case Sensitive)"
                    onChange={this.handleInputChange}
                />

                <StyledDropdown
                    item
                    name="shardId"
                    text={shardId}
                    options={SHARDS}
                    onChange={this.handleDropdownChange}
                />

                <Button type="submit">Search</Button>
            </StyledForm>

            <RecentPlayers />

            <Footer>
                <Link to="/about">About</Link>
                <p>Site not affiliated with Player Unknown’s Battlegrounds or Bluehole.</p>
            </Footer>
        </CenteredContainer>
    }
}

export default Home
