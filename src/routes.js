import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import ReactGA from 'react-ga'
import Home from './routes/Home'
import About from './routes/About'
import Player from './routes/Player'
import Match from './routes/Match'
import LocalMatch from './routes/LocalMatch'
import TopMenu from './components/TopMenu.js'
import * as Settings from './components/Settings.js'

if (process.env.REACT_APP_GA) {
    ReactGA.initialize(process.env.REACT_APP_GA)
}

const PaddingWrapper = styled.div`
    display: block;
    max-width: 1240px;
    margin: 0 auto;
`

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 7.5rem 1fr;
    grid-row-gap: 10px;
    margin: 0 20px;
`

const MainContainer = styled.div`
    grid-row: 2;
`

const RouteWithTopMenu = ({ hidePlayerSearch, component: Component, ...rest }) =>
    <Route
        {...rest}
        render={props => [
            <TopMenu key="topMenu" {...props} hidePlayerSearch={hidePlayerSearch} />,
            <MainContainer className="container" key="mainContainer" id="MainContainer">
                <Component key="Component" {...props} />
            </MainContainer>,
        ]}
    />

// From: https://github.com/react-ga/react-ga/issues/122#issuecomment-320436578
class Analytics extends React.Component {
    constructor(props) {
        super(props)

        // Initial page load - only fired once
        this.sendPageChange(props.location.pathname, props.location.search)
    }

    componentWillReceiveProps(nextProps) {
        // When props change, check if the URL has changed or not
        if (this.props.location.pathname !== nextProps.location.pathname
            || this.props.location.search !== nextProps.location.search) {
            this.sendPageChange(nextProps.location.pathname, nextProps.location.search)
        }
    }

    sendPageChange = (pathname, search = '') => {
        const page = pathname + search

        if (process.env.NODE_ENV === 'production') {
            ReactGA.set({ page })
            ReactGA.pageview(page)
        }
    }

    render() {
        return null
    }
}

// TODO: Collapse Options and Settings and move it out of here
class App extends React.Component { // eslint-disable-line
    /* eslint-disable react/no-unused-state */
    state = {
        favoritePlayers: [],
        toggleFavoritePlayer: (name, shardId) => {
            const { favoritePlayers: favs } = this.state

            const newFavs = favs.some(f => f.name === name && f.shardId === shardId)
                ? favs.filter(f => !(f.name === name && f.shardId === shardId))
                : [...favs, { name, shardId }]

            this.setState({ favoritePlayers: newFavs }, this.updateFavoritePlayers)
        },
        isFavoritePlayer: (name, shardId) => {
            const { favoritePlayers: favs } = this.state
            return favs.some(f => f.name === name && f.shardId === shardId)
        },
    }
    /* eslint-enable */

    updateFavoritePlayers = () => {
        localStorage.setItem('favoritePlayersV2', JSON.stringify(this.state.favoritePlayers))
    }

    refreshFavoritePlayers = () => {
        const favoritePlayers = JSON.parse(localStorage.getItem('favoritePlayersV2') || '[]')
        this.setState({ favoritePlayers })
    }

    componentDidMount() {
        this.refreshFavoritePlayers()
        window.addEventListener('storage', this.refreshFavoritePlayers)
    }

    render() {
        return (
            <Settings.Context.Provider value={this.state}>
                <BrowserRouter>
                    <PaddingWrapper>
                        <Wrapper>
                            <Route path="/" component={Analytics} />
                            <Switch>
                                <RouteWithTopMenu path="/" exact component={Home} />
                                <RouteWithTopMenu path="/about" exact component={About} />
                                <RouteWithTopMenu path="/local-replay" exact component={LocalMatch} />
                                <RouteWithTopMenu path="/:playerName/:shardId/:matchId" component={Match} />
                                <RouteWithTopMenu path="/:playerName/:shardId" component={Player} />
                            </Switch>
                        </Wrapper>
                    </PaddingWrapper>
                </BrowserRouter>
            </Settings.Context.Provider>
        )
    }
}

export default App
