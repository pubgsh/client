import React from 'react'
import styled from 'styled-components'
import { get } from 'lodash'
import { Link } from 'react-router-dom'
import { SHARDS } from '../models/Shards.js'
import Dropdown from './Dropdown.js'

const FullWidthBlock = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 6.5rem;
    border-bottom: 1px solid #ebebeb;
    z-index: 2;
`

const TopMenuContainer = styled.div`
    height: 100%;
    line-height: 6.5rem;
    display: grid;
    grid-template-columns: 100px 1fr 100px;
    max-width: 1200px;
    position: relative;
    margin: 0 auto;
    width: 99%;
`

const HeaderLink = styled(Link)`
    text-transform: uppercase;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .2rem;
    text-decoration: none;
    color: #222;
`

const HomeLink = HeaderLink
const AboutLink = styled(HeaderLink)`
    position: absolute;
    right: 0;
`

const SearchGroup = styled.div`
    margin: 0 auto;

    form {
        margin: 0;
    }
`

const NameInput = styled.input`
    width: 22.3rem;

    &::placeholder {
        color: #BBB;
    }
`
const SearchButton = styled.input`
    && {
        line-height: 39px;
        margin-left: 10px;
    }
`

class TopMenu extends React.Component {
    state = {}

    static getDerivedStateFromProps(props) {
        return {
            searchText: get(props, 'match.params.playerName', ''),
            shardId: get(props, 'match.params.shardId', (localStorage.getItem('shardId') || SHARDS[0])),
        }
    }

    handleDropdownChange = ({ value }) => {
        this.setState({ shardId: value })
        localStorage.setItem('shardId', value)
    }

    handleInputChange = e => { this.setState({ searchText: e.target.value }) }

    search = e => {
        if (e) e.preventDefault()
        this.props.history.push(`/${this.state.searchText}/${this.state.shardId}`)
    }

    render() {
        const { shardId, searchText } = this.state

        return (
            <FullWidthBlock>
                <TopMenuContainer>
                    <HomeLink to="/">pubg.sh</HomeLink>
                    <SearchGroup>
                        {!this.props.hidePlayerSearch && <form onSubmit={this.search}>
                            <Dropdown value={shardId} options={SHARDS} onChange={this.handleDropdownChange} />
                            <NameInput
                                type="text"
                                name="searchText"
                                onChange={this.handleInputChange}
                                placeholder="Player Name (Case Sensitive)"
                                value={searchText}
                            />
                            <SearchButton className="button" type="submit" value="Search" />
                        </form>}
                    </SearchGroup>
                    <AboutLink to="/about">About</AboutLink>
                </TopMenuContainer>
            </FullWidthBlock>
        )
    }
}

export default TopMenu
