import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Home from './Home'
import Player from './Player'
import Match from './Match'

export default () => (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/player/:playerName" exact component={Player} />
            <Route path="/match/:matchId" exact component={Match} />
        </Switch>
    </BrowserRouter>
)
