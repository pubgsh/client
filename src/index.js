import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from 'react-apollo'
import 'semantic-ui-css/semantic.min.css'
import './index.css'

import Routes from './routes'

const client = new ApolloClient({
    link: new HttpLink({ uri: 'http://localhost:3005/graphql' }),
    cache: new InMemoryCache(),
})

const ApolloApp = (
    <ApolloProvider client={client}>
        <Routes />
    </ApolloProvider>
)

ReactDOM.render(ApolloApp, document.getElementById('root'))
