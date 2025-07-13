# pubg.sh-client

The client component of [https://pubg.sh](https://pubg.sh). See also [pubgsh/api](https://github.com/pubgsh/api).

## Overview

This app provides the front end, including telemetry event parsing and rendering a 2D replay on canvas with React.

## Running

### Requirements

- bun
- Node v18+

### Configuration

1. Create `.env.local` [dotenv](https://github.com/motdotla/dotenv) file in the root of the project and provide the following values:

- `REACT_APP_API` (Where you have the companion API app)

    > Note: You can use `REACT_APP_API=https://api.pubg.sh` if you only want to run the client

2. Install the dependencies by running `bun install`.

### Running

Simply run `bun start` and create-react-app will launch the client app for you.

## License

MIT
