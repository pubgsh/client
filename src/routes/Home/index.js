import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import DocumentTitle from 'react-document-title'
import { SHARDS } from '../../models/Shards.js'
import Dropdown from '../../components/Dropdown.js'

import headerImg from '../../assets/home-header-img.png'

const CenteredContainer = styled.div`
    text-align: center;
`

const HeaderImage = styled.img`
    cursor: pointer;
    margin: 5px 0 15px;
    max-height: 300px;
`

const RandomMatchLink = styled(Link)`
    box-shadow: 0px 12px 53px -16px rgba(0,0,0,0.75);
    display: inline-block;
    width: 500px;
    margin: 35px 0 50px;
    border: 1px solid #efefef;
    border-radius: 4px;
    filter: grayscale(40%);
    transition: filter linear 0.15s;

    &:hover {
        filter: grayscale(0%);
    }

    span {
        display: block;
        font-size: 1.1rem;
        margin: 10px 0 0;
        color: #4cbb89;
        cursor: pointer;
    }

    @media (max-width: 700px) {
        width: 85vw;
        img {
            max-width: 90%;
        }
    }
`

const NameInput = styled.input`
    width: 34rem;
    border-bottom: 1px solid #4f36cb99;
        border-radius: 0;
    border-top: none;
    border-left: 0;
    border-right: 0;

    @media (max-width: 700px) {
        width: 15rem;
    }
`

const SearchButton = styled.input`
    && {
        line-height: 39px;
        margin-left: 10px;
    }
`

const StyledDropdown = styled(Dropdown)`
    top: 30px;
    right: -1px;
`

const StyledForm = styled.form`
    margin: 7rem 0 3rem;

    @media (max-width: 700px) {
        margin: 3rem 0 3rem;

        input[type="submit"] {
            padding: 0 7px;
        }
    }
`

class Home extends React.Component {
    state = { searchText: '', shardId: localStorage.getItem('shardIdV2') || SHARDS[0] }

    handleDropdownChange = ({ value }) => {
        this.setState({ shardId: value })
        localStorage.setItem('shardIdV2', value)
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
                <DocumentTitle title="pubg.sh: 2D Match Replays" />
                <StyledForm onSubmit={this.search}>
                    <StyledDropdown value={shardId} options={SHARDS} onChange={this.handleDropdownChange} />
                    <NameInput
                        id="HomeSearchInput"
                        type="text"
                        name="searchText"
                        onChange={this.handleInputChange}
                        placeholder="Player Name"
                        value={searchText}
                    />
                    <SearchButton className="button-primary" type="submit" value="Search" />
                </StyledForm>
                <RandomMatchLink to={sm ? `/${sm.playerName}/${sm.shardId}/${sm.id}` : ''}>
                    <span>(Or just view a random match)</span>
                    <HeaderImage src={headerImg} />
                </RandomMatchLink>

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
            shardId: localStorage.getItem('shardIdV2') || SHARDS[0],
        },
    }),
})(Home)
