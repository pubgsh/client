import React from 'react'
import styled from 'styled-components'
import { get } from 'lodash'
import { Link } from 'react-router-dom'
import { Form, Button, Input, Dropdown, Menu } from 'semantic-ui-react'
import { SHARDS } from '../models/Shards.js'

const StyledMenu = styled(Menu)`
    &&& { background: #FFF; margin-left: 0; margin-right: 0;}
`

const StyledRightMenu = styled(Menu.Menu)`
    &&& > .item { margin-right: 0; padding-right: 0; }
    &&& button { margin-right: 0; }
`

const StyledInput = styled(Input)`
    &&& input {
        width: 220px;
        padding: 0 1em;
        line-height: 2em;
    }
`

const StyledForm = styled(Form)`
    &&& { display: inherit; }
`

const LogoMenuItem = styled(Menu.Item)`
    &&&.item {
        padding-left: 0;
        margin-left: 0;

        ul {
            list-style-type: none;
            padding-left: 0;

            li {
                display: inline-block;
            }

            li:not(:last-child):after {
                content: '>';
                margin: 0 15px;
            }
        }
    }
`

const Breadcrumbs = ({ playerName, shardId, matchId }) => {
    const nameCrumb = playerName &&
        <li>
            <Link to={`/${playerName}/${shardId}`}>
                {playerName} ({shardId})
            </Link>
        </li>

    const matchCrumb = matchId &&
        <li>
            <Link to={`/${playerName}/${shardId}/${matchId}`}>
                {matchId}
            </Link>
        </li>

    return (
        <ul>
            <li><Link to="/">pubg.sh</Link></li>
            {nameCrumb}
            {matchCrumb}
        </ul>
    )
}

class TopMenu extends React.Component {
    state = {}

    static getDerivedStateFromProps(props) {
        return {
            searchText: get(props, 'match.params.playerName', ''),
            shardId: get(props, 'match.params.shardId', (localStorage.getItem('shardId') || SHARDS[0].value)),
        }
    }

    handleDropdownChange = (e, { name, value }) => {
        this.setState({ [name]: value })
        if (name === 'shardId') localStorage.setItem('shardId', value)
    }

    handleInputChange = e => { this.setState({ [e.target.name]: e.target.value }) }

    search = () => { this.props.history.push(`/${this.state.searchText}/${this.state.shardId}`) }

    render() {
        const { shardId, searchText } = this.state

        return (
            <StyledMenu secondary id="TopMenu">
                <LogoMenuItem>
                    <Breadcrumbs {...this.props.match.params} />
                </LogoMenuItem>

                <StyledRightMenu position="right">
                    <Menu.Item>
                        <StyledForm onSubmit={this.search}>
                            <StyledInput
                                name="searchText"
                                value={searchText}
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
                </StyledRightMenu>
            </StyledMenu>
        )
    }
}

export default TopMenu
