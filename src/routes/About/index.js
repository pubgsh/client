import React from 'react'
import styled from 'styled-components'
import DocumentTitle from 'react-document-title'

const Header = styled.h3`
    margin-top: 4rem;
    text-align: center;
`

const SectionHeader = styled.h4`
    text-align: center;
`

const Wrapper = styled.div`
    margin: 0 auto;
    max-width: 700px;
`

export default () =>
    <div>
        <DocumentTitle title="About | pubg.sh" />
        <Header>
            About
        </Header>

        <Wrapper>
            <section>
                <p>
                    Hi - I’m <a href="https://azzolini.io">Andre Azzolini</a>, and I built pubg.sh as an open
                    source app using GraphQL, React, and canvas. Iterating on this app has been a lot of
                    fun, and I am actively adding more features.

                    A current <a href="https://github.com/orgs/pubgsh/projects/1">roadmap is available</a>,
                    and I’m happy to consider suggestions, pull requests, and bug reports on GitHub. The
                    two repositories can be found here:
                </p>

                <ul style={{ listStyleType: 'none' }}>
                    <li><a href="https://github.com/pubgsh/api">pubgsh/api</a></li>
                    <li><a href="https://github.com/pubgsh/client">pubgsh/client</a></li>
                </ul>
            </section>

            <section>
                <SectionHeader>Donations</SectionHeader>

                <p>
                    If you enjoy using the site and want to contribute financially, thank you! You can support
                    me on <a href="https://www.patreon.com/apazzolini">Patreon</a>. pubg.sh will always be
                    free to use - donations help pay for server costs and keep me motivated to work on it. As
                    a token of my appreciation, you’ll get a faster refresh time for your username.
                </p>
            </section>

            <section>
                <SectionHeader>Changelog</SectionHeader>

                <h5>2018-12-24</h5>
                <ul>
                    <li>Add match download and upload (Credit @alvaro-cuesta)</li>
                </ul>

                <h5>2018-12-19</h5>
                <ul>
                    <li>Add Vikendi</li>
                    <li>Add Skorpion, G36C</li>
                    <li>Filter out Range_Main entries</li>
                </ul>

                <h5>2018-09-15</h5>
                <ul>
                    <li>Add loadouts (hover on player on roster) (Credit @patrickgordon)</li>
                </ul>

                <h5>2018-08-27</h5>
                <ul>
                    <li>Add rewind button (Credit @patrickgordon)</li>
                </ul>

                <h5>2018-08-08</h5>
                <ul>
                    <li>Fix jumpy location interpolation bug</li>
                </ul>

                <h5>2018-08-05</h5>
                <ul>
                    <li>Add timeline markers for kills and death</li>
                    <li>Add cumulative damage dealt to roster</li>
                </ul>

                <h5>2018-08-04</h5>
                <ul>
                    <li>Support custom games of any team size</li>
                </ul>

                <h5>2018-07-25</h5>
                <ul>
                    <li>Basic mobile support</li>
                    <li>Tweak attachment names</li>
                    <li>Minor fixes</li>
                </ul>

                <h5>2018-07-12</h5>
                <ul>
                    <li>Major rewrite for performance</li>
                    <li>Tracers render as bullets instead of lines</li>
                    <li>Care packages render flight status, items on hover</li>
                </ul>

                <h5>2018-06-27</h5>
                <ul>
                    <li>Handle player renaming feature</li>
                    <li>Improve performance</li>
                </ul>

                <h5>2018-06-22</h5>
                <ul>
                    <li>Add Sanhok map support</li>
                </ul>

                <h5>2018-06-16</h5>
                <ul>
                    <li>Add help screen (press ? on map)</li>
                </ul>

                <h5>2018-06-13</h5>
                <ul>
                    <li>Add play/pause and time/speed controls with space and arrow keys</li>
                </ul>

                <h5>2018-06-12</h5>
                <ul>
                    <li>Render alive players count (Credit @mikkokeskinen)</li>
                    <li>Render care packages (Credit @mikkokeskinen)</li>
                    <li>Render bullet tracers (Credit @mikkokeskinen)</li>
                    <li>Add custom game support</li>
                    <li>Add direct link to player page from roster</li>
                </ul>

                <h5>2018-06-07</h5>
                <ul>
                    <li>Show player health on dots</li>
                    <li>Track player health (Credit @sevirinov)</li>
                    <li>Track knocked-down state (Credit @sevirinov)</li>
                    <li>New player tooltips</li>
                    <li>Add XBOX support</li>
                    <li>Track players by clicking on them, shift+click to track full squad</li>
                    <li>Several small UI and UX improvements</li>
                </ul>

                <h5>2018-05-29</h5>
                <ul>
                    <li>Finer grain control of autoplay speed</li>
                    <li>Rank and kills on match list page</li>
                    <li>Sub-second interpolation</li>
                    <li>Use requestAnimationFrame instead of setInterval</li>
                </ul>

                <h5>2018-05-28</h5>
                <ul>
                    <li>Queue users and update via Websockets when PUBG is rate limited</li>
                    <li>Adjustable autoplay speed</li>
                    <li>UI/UX improvements</li>
                </ul>

                <h5>2018-05-23</h5>
                <ul>
                    <li>Added map zooming and panning (scroll wheel)</li>
                    <li>Interpolate positions in between known telemetry points</li>
                    <li>Show player last fetched time</li>
                </ul>

                <h5>2018-05-22</h5>
                <ul>
                    <li>Version 1.0.0 made publicly available.</li>
                </ul>
            </section>
        </Wrapper>
    </div>
