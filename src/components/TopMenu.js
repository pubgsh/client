import React from 'react'
import styled from 'styled-components'
import { withRouter, Link } from 'react-router-dom'
import * as Settings from './Settings.js'
import FileUploadButton from './FileUploadButton'

const TopMenuContainer = styled.div`
    grid-row: 1;
    align-self: center;
    justify-self: center;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 180px;
    grid-column-gap: 15px;
`

const HomeLink = styled(Link)`
    font-size: 2.2rem;
    font-weight: 400;
    color: #714868;
    position: relative;
    align-self: center;

    &:hover {
        color: #714868;
    }

    span {
        font-size: 1.9rem;
    }

    &:before {
        content: '';
        background: linear-gradient(177deg,#714868 0%,#6CD5A6 100%);
        position: absolute;
        height: 1px;
        left: 1px;
        right: 1px;
        bottom: -3px;
    }
`

const PlayerLinks = styled.div`
    align-self: center;
    justify-self: center;
    display: inline-block;
    margin-left: 20px;

    @media (max-width: 700px) {
        position: absolute;
        top: 28px;
        overflow: scroll;
        max-width: 160px;
    }
`

const PlayerLink = styled(Link)`
    font-size: 1.4rem;
    font-weight: 300;
    color: #333;
    margin-right: 1rem;

    &:hover {
        color: #714868;
    }
`

const RightLinks = styled.div`
    align-self: center;
    justify-self: end;

    a {
        text-transform: uppercase;
        font-size: 1.0rem;
        font-weight: 400;
        color: #222;
        grid-column: 2;
        margin-left: 15px;

        &:hover {
            color: #714868;
        }
    }
`

const createPlayerLinks = favoritePlayers => {
    return favoritePlayers.map(f => {
        const isMultiShard = favoritePlayers.some(f2 => f2.name === f.name && f2.shardId !== f.shardId)
        const link = `/${f.name}/${f.shardId}`
        const name = isMultiShard ? `${f.name} (${f.shardId})` : f.name

        return <PlayerLink to={link} key={link}>{name}</PlayerLink>
    })
}

class TopMenu extends React.Component {
    state = {}

    handleFile = e => {
        this.props.history.push('/local-replay', { file: e.target.files[0] })
        e.target.value = null // reset so we can select the same file again
    }

    render() {
        return (
            <Settings.Context.Consumer>
                {({ favoritePlayers }) => (
                    <TopMenuContainer>
                        <div>
                            <HomeLink to="/">pubg.<span>sh</span></HomeLink>
                            <PlayerLinks>{createPlayerLinks(favoritePlayers)}</PlayerLinks>
                        </div>
                        <RightLinks>
                            <FileUploadButton onFile={this.handleFile}>Load Saved Replay</FileUploadButton>
                            <Link to="/about">About</Link>
                        </RightLinks>
                    </TopMenuContainer>
                )}
            </Settings.Context.Consumer>
        )
    }
}

export default withRouter(TopMenu)
