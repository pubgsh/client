import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Container } from 'semantic-ui-react'
import ReactGA from 'react-ga'
import Home from './routes/Home'
import About from './routes/About'
import Player from './routes/Player'
import Match from './routes/Match'
import TopMenu from './components/TopMenu.js'

ReactGA.initialize(process.env.REACT_APP_GA)

const RouteWithTopMenu = ({ component: Component, ...rest }) =>
    <Route
        {...rest}
        render={props => [
            <TopMenu key="topMenu" {...props} />,
            <Component key="Component" {...props} />,
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
        <Container>
            <Route path="/" component={Analytics} />
            <Switch>
                <Route path="/" exact component={Home} />
                <RouteWithTopMenu path="/about" exact component={About} />
                <RouteWithTopMenu path="/:playerName/:shardId/:matchId" component={Match} />
                <RouteWithTopMenu path="/:playerName/:shardId" component={Player} />
            </Switch>
        </Container>
    </BrowserRouter>
)
