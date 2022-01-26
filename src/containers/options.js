import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import SearchFilter from './search_filter'

import { setOptions } from '../actions/actions'
import { filterKillmails } from '../actions/actions'

class Options extends Component {

    constructor(props) {
        super(props)
        const { ignorePods, ignoreShuttles, ignoreRookieShips, showHighsec, showLowsec, showNullsec, matchAny, minIsk,
            maxIsk, minPlayers, maxPlayers, maxKillmails } = this.props.options
        this.state = {
            showOptions: false,
            ignorePods: ignorePods,
            ignoreShuttles: ignoreShuttles,
            ignoreRookieShips: ignoreRookieShips,
            showHighsec: showHighsec,
            showLowsec: showLowsec,
            showNullsec: showNullsec,
            matchAny: matchAny,
            minIsk: minIsk,
            maxIsk: maxIsk,
            minPlayers: minPlayers,
            maxPlayers: maxPlayers,
            maxKillmails: maxKillmails

        }

        this.toggleOptions = this.toggleOptions.bind(this)
        this.updateIgnorePods = this.updateIgnorePods.bind(this)
        this.updateIgnoreShuttles = this.updateIgnoreShuttles.bind(this)
        this.updateIgnoreRookieShips = this.updateIgnoreRookieShips.bind(this)
        this.updateShowHighsec = this.updateShowHighsec.bind(this)
        this.updateShowLowsec = this.updateShowLowsec.bind(this)
        this.updateShowNullsec = this.updateShowNullsec.bind(this)
        this.updateFilterMatch = this.updateFilterMatch.bind(this)
        this.updateMinIsk = this.updateMinIsk.bind(this)
        this.updateMaxIsk = this.updateMaxIsk.bind(this)
        this.updateMinPlayersInvolved = this.updateMinPlayersInvolved.bind(this)
        this.updateMaxPlayersInvolved = this.updateMaxPlayersInvolved.bind(this)
        this.updateMaxKillmails = this.updateMaxKillmails.bind(this)
    }

    toggleOptions() {
        if(this.state.showOptions) this.setState({ showOptions: false})
        else this.setState({ showOptions: true })
    }

    updateIgnorePods() {
        this.setState({ ignorePods: !this.state.ignorePods }, () => {
            this.props.setOptions(this.state)
            storeOptions(this.state)
        })
    }

    updateIgnoreShuttles() {
        this.setState({ ignoreShuttles: !this.state.ignoreShuttles }, () => {
            this.props.setOptions(this.state)
            storeOptions(this.state)
        })
    }

    updateIgnoreRookieShips() {
        this.setState({ ignoreRookieShips: !this.state.ignoreRookieShips }, () => {
            this.props.setOptions(this.state)
            storeOptions(this.state)
        })
    }

    updateShowHighsec() {
        this.setState({ showHighsec: !this.state.showHighsec }, () => {
            this.props.setOptions(this.state)
            storeOptions(this.state)
        })
    }

    updateShowLowsec() {
        this.setState({ showLowsec: !this.state.showLowsec }, () => {
            this.props.setOptions(this.state)
            storeOptions(this.state)
        })
    }

    updateShowNullsec() {
        this.setState({ showNullsec: !this.state.showNullsec }, () => {
            this.props.setOptions(this.state)
            storeOptions(this.state)
        })
    }

    updateFilterMatch() {
        this.setState({ matchAny: !this.state.matchAny }, () => {
            this.props.setOptions(this.state)
            storeOptions(this.state)
            this.props.filterKillmails(this.state)
        })
    }

    updateMinIsk(event) {
        let input = event.target.value.trim()
        if(input === '' || (input.match(/^\d+$/) && input < 10000000)) {
            this.setState({ minIsk: input }, () => {
                this.props.setOptions(this.state)
                storeOptions(this.state)
                this.props.filterKillmails(this.state)
            })
        }
    }

    updateMaxIsk(event) {
        let input = event.target.value.trim()
        if(input === '' || (input.match(/^\d+$/) && input < 10000000)) {
            this.setState({ maxIsk: input }, () => {
                this.props.setOptions(this.state)
                storeOptions(this.state)
                this.props.filterKillmails(this.state)
            })
        }
    }

    updateMinPlayersInvolved(event) {
        let input = event.target.value.trim()
        if(input === '' || (input.match(/^\d+$/) && input < 10000)) {
            this.setState({ minPlayers: input }, () => {
                this.props.setOptions(this.state)
                storeOptions(this.state)
                this.props.filterKillmails(this.state)
            })
        }
    }

    updateMaxPlayersInvolved(event) {
        let input = event.target.value.trim()
        if(input === '' || (input.match(/^\d+$/) && input < 10000)) {
            this.setState({ maxPlayers: input }, () => {
                this.props.setOptions(this.state)
                storeOptions(this.state)
                this.props.filterKillmails(this.state)
            })
        }
    }

    updateMaxKillmails(event) {
        let input = event.target.value
        if((input === '' || input.match(/^\d+$/) && input < 25000)) {
            this.setState({ maxKillmails: input }, () => {
                this.props.setOptions(this.state)
                storeOptions(this.state)
            })
        }
    }

    render() {
        let dropdownClass = 'dropdown-menu-hide'
        if(this.state.showOptions) dropdownClass = 'dropdown-menu-visible'
        return (
          <div className="option-container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="button-group">
                          <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" onClick={ this.toggleOptions }><span className="glyphicon glyphicon-cog"></span> <span className="caret"></span></button>
                              <div className={ dropdownClass }>
                              <div>
                                  <h2>Options</h2>
                                  <ul>
                                      <li><input type="checkbox" onChange={ this.updateIgnorePods } checked={ this.state.ignorePods } /><span>Ignore Pods</span></li>
                                      <li><input type="checkbox" onChange={ this.updateIgnoreShuttles }  checked={ this.state.ignoreShuttles }/><span>Ignore Shuttles</span></li>
                                      <li><input type="checkbox" onChange={ this.updateIgnoreRookieShips }  checked={ this.state.ignoreRookieShips }/><span>Ignore Rookie Ships</span></li>
                                      <li><input type="checkbox" onChange={ this.updateShowHighsec }  checked={ this.state.showHighsec }/><span>Highsec</span></li>
                                      <li><input type="checkbox" onChange={ this.updateShowLowsec }  checked={ this.state.showLowsec }/><span>Lowsec</span></li>
                                      <li><input type="checkbox" onChange={ this.updateShowNullsec }  checked={ this.state.showNullsec }/><span>Nullsec</span></li>
                                      <li className="dropdown-spacer"></li>
                                      <li>
                                          <span className="isk-label">Match Filters:</span>
                                          <div className="filter-match" ><input onChange={ this.updateFilterMatch }  type="radio" name="AnyAll" value="Any" checked={ this.state.matchAny } /><span>Any</span></div>
                                      </li>
                                      <li><div className="filter-match"><input onChange={ this.updateFilterMatch } type="radio" name="AnyAll" value="All" checked={ !this.state.matchAny } /><span>All</span></div></li>
                                      <li>
                                          <span className="isk-label">Maximum Killmails:</span>
                                          <div className="isk-input-container">
                                              <input value={ this.state.maxKillmails } onChange={ this.updateMaxKillmails } className="killmail-input" placeholder="Default is 5000" type="text" />
                                          </div>
                                      </li>
                                  </ul>
                              </div>
                              <div>
                                  <h2>Static Filters</h2>
                                  <ul>
                                      <li>
                                        <span className="isk-label">ISK Value (Millions):</span>
                                        <div className="isk-input-container">
                                          <input value={ this.state.minIsk } onChange={ this.updateMinIsk } className="isk-input" placeholder="Min.." type="text" />
                                          <span>to</span>
                                          <input value={ this.state.maxIsk } onChange={ this.updateMaxIsk } className="isk-input isk-input-right" placeholder="Max.." type="text"/>
                                        </div>
                                      </li>
                                      <li>
                                          <span className="isk-label">Players Involved:</span>
                                          <div className="isk-input-container">
                                              <input value={ this.state.minPlayers } onChange={ this.updateMinPlayersInvolved } className="isk-input" placeholder="Min.." type="text" />
                                              <span>to</span>
                                              <input value={ this.state.maxPlayers } onChange={ this.updateMaxPlayersInvolved } className="isk-input isk-input-right" placeholder="Max.." type="text"/>
                                          </div>
                                      </li>
                                  </ul>
                              </div>
                              </div>
                      </div>
                  </div>
              </div>
          </div>

        )
    }
}

function mapStateToProps({ options }) {
    return ({ options })
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({ setOptions }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Options)

function storeOptions(options) {
    localStorage.setItem('options', JSON.stringify(options))
}
