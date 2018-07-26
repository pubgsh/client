import React from 'react'
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom'
import styled from 'styled-components'
import ReactGA from 'react-ga'
import Home from './routes/Home'
import About from './routes/About'
import Player from './routes/Player'
import Match from './routes/Match'
import TopMenu from './components/TopMenu.js'

if (process.env.REACT_APP_GA) {
    ReactGA.initialize(process.env.REACT_APP_GA)
}

const Wrapper = styled.div`
`

const MainContainer = styled.div`
    z-index: 1;
    margin-top: 7rem;
    background: white;
    padding: 20px 0 0 0;
`

const Background = styled.div`
    position: absolute;
    display: block;
    top: ${props => typeof props.top === 'undefined' ? 6.5 : props.top}rem;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(309deg, #cb3688 0%, #76bcde 100%);
`

const AboutLink = styled(Link)`
    position: absolute;
    bottom: 15px;
    font-size: 1.2rem;
    text-align: center;
    width: 100%;
`

const RouteWithTopMenu = ({ hidePlayerSearch, component: Component, ...rest }) =>
    <Route
        {...rest}
        render={props => [
            <TopMenu key="topMenu" {...props} hidePlayerSearch={hidePlayerSearch} />,
            <MainContainer className="container" key="mainContainer" id="MainContainer">
                <Component key="Component" {...props} />
            </MainContainer>,
            <Background key="background" />,
        ]}
    />

const RouteWithTopBar = ({ component: Component, ...rest }) =>
    <Route
        {...rest}
        render={props => [
            <MainContainer className="container" key="mainContainer" id="MainContainer">
                <Component key="Component" {...props} />
            </MainContainer>,
            <Background top="0" key="background" />,
            <AboutLink key="about" to="/about">About</AboutLink>,
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

export default () => (
    <BrowserRouter>
        <Wrapper>
            <Route path="/" component={Analytics} />
            <Switch>
                <RouteWithTopBar path="/" exact component={Home} />
                <RouteWithTopMenu path="/about" exact component={About} />
                <RouteWithTopMenu path="/:playerName/:shardId/:matchId" component={Match} />
                <RouteWithTopMenu path="/:playerName/:shardId" component={Player} />
            </Switch>
        </Wrapper>
    </BrowserRouter>
)
