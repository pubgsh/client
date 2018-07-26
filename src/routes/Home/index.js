import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { isEmpty } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { SHARDS } from '../../models/Shards.js'
import Dropdown from '../../components/Dropdown.js'

const CenteredContainer = styled.div`
    text-align: center;
    margin: 4rem auto 0;
`

const RecentPlayersHeader = styled.h5`
    margin-top: 50px;
    font-size: 1.5rem;
`

const RecentPlayersUl = styled.ul`
    list-style-type: none;
    padding-left: 0;

    li {
        margin-bottom: 0;
        font-size: 1.2rem;
    }
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

const NameInput = styled.input`
    width: 34rem;
`

const SearchButton = styled.input`
    && {
        line-height: 39px;
        margin-left: 10px;
    }

    @media (max-width: 700px) {
        && {
            margin-left: 0;
        }
    }
`

const StyledDropdown = styled(Dropdown)`
    top: 30px;
    right: -1px;
`

const Header = styled.h3`
    text-align: center;
    margin-bottom: 5rem;
`

const StyledForm = styled.form`
    margin-bottom: 0;
`

const RandomMatchLink = styled(Link)`
    font-size: 1.1rem;
`

class Home extends React.Component {
    state = { searchText: '', shardId: localStorage.getItem('shardId') || SHARDS[0] }

    handleDropdownChange = ({ value }) => {
        this.setState({ shardId: value })
        localStorage.setItem('shardId', value)
    }

    handleInputChange = e => { this.setState({ searchText: e.target.value }) }

    search = e => {
        if (e) e.preventDefault()
        if (this.state.searchText && this.state.shardId) {
            this.props.history.push(`/${this.state.searchText}/${this.state.shardId}`)
        }
    }

    componentDidMount() {
        document.getElementById('HomeSearchInput').focus()
    }

    render() {
        const { shardId, searchText } = this.state
        const { data: { sampleMatch: sm } } = this.props

        return (
            <CenteredContainer>
                <Header>pubg.sh</Header>

                <StyledForm onSubmit={this.search}>
                    <StyledDropdown value={shardId} options={SHARDS} onChange={this.handleDropdownChange} />
                    <NameInput
                        id="HomeSearchInput"
                        type="text"
                        name="searchText"
                        onChange={this.handleInputChange}
                        placeholder="Player Name (Case Sensitive)"
                        value={searchText}
                    />
                    <SearchButton className="button-primary" type="submit" value="Search" />
                </StyledForm>

                {sm &&
                    <RandomMatchLink to={`/${sm.playerName}/${sm.shardId}/${sm.id}`}>
                        (Or just view a random match)
                    </RandomMatchLink>
                }

                <RecentPlayers />
            </CenteredContainer>
        )
    }
}

export default graphql(gql`
    query($shardId: String!) {
        sampleMatch(shardId: $shardId) {
            id
            playerName
            shardId
        }
    }`, {
    options: () => ({
        variables: {
            shardId: localStorage.getItem('shardId') || SHARDS[0],
        },
    }),
})(Home)
