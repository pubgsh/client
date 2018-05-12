import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Container } from 'semantic-ui-react'
import Home from './Home'
import Player from './Player'
import TopMenu from '../components/TopMenu.js'

export default () => (
    <BrowserRouter>
        <Container>
            <Route path="/" component={TopMenu} />
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/:playerName/:shardId" component={Player} />
            </Switch>
        </Container>
    </BrowserRouter>
)
