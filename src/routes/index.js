import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Container } from 'semantic-ui-react'
import Home from './Home.js'
import Player from './Player.js'
import Match from './Match.js'
import TopMenu from '../components/TopMenu.js'

const RouteWithTopMenu = ({ component: Component, ...rest }) =>
    <Route
        {...rest}
        render={props => [
            <TopMenu key="topMenu" {...props} />,
            <Component key="Component" {...props} />,
        ]}
    />

export default () => (
    <BrowserRouter>
        <Container>
            <Switch>
                <RouteWithTopMenu path="/" exact component={Home} />
                <RouteWithTopMenu path="/:playerName/:shardId/:matchId" component={Match} />
                <RouteWithTopMenu path="/:playerName/:shardId" component={Player} />
            </Switch>
        </Container>
    </BrowserRouter>
)
