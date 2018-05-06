import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from 'react-apollo'
import 'semantic-ui-css/semantic.min.css'

import Routes from './routes'

const httpLink = createHttpLink({ uri: 'http://localhost:3005/graphql' })
const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
})

const ApolloApp = (
    <ApolloProvider client={client}>
        <Routes />
    </ApolloProvider>
)

ReactDOM.render(ApolloApp, document.getElementById('root'))
