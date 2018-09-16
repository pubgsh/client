import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from 'react-apollo'
import './main.css'

import Routes from './routes.js'

const client = new ApolloClient({
    link: new HttpLink({ uri: `${process.env.REACT_APP_API}/graphql` }),
    cache: new InMemoryCache(),
})

const ApolloApp = (
    <ApolloProvider client={client}>
        <Routes />
    </ApolloProvider>
)

ReactDOM.render(ApolloApp, document.getElementById('root'))
