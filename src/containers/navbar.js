import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import SearchFilter from './search_filter'
import Options from './options'

import { filterKillmails } from '../actions/actions'

class Navbar extends Component {

    constructor(props) {
        super(props)
        this.state = {
          showOptions: false
        }
        this.showGithub = this.showGithub.bind(this)
        this.showReddit = this.showReddit.bind(this)
        this.toggleOptions = this.toggleOptions.bind(this)
        this.filterKillmails = this.filterKillmails.bind(this)
    }

    showGithub() {
        const githubURL = 'https://github.com/kiresuah/zFilter'
        const redirectWindow = window.open(githubURL, '_blank')
        redirectWindow.location
    }

    showReddit() {
        const redditURL = 'https://www.reddit.com/r/eve'
        const redirectWindow = window.open(redditURL, '_blank')
        redirectWindow.location
    }

    toggleOptions() {
      if(this.state.showOptions) this.setState({ showOptions: false})
      else this.setState({ showOptions: true })
    }

    filterKillmails(newOptions) {
        const filters = {
            options: newOptions,
            filters: this.props.filters,
            system_filter: this.props.system_filter,
            jump_filter: this.props.jump_filter,
            killmail_list: this.props.killmail_list
        }
        this.props.filterKillmails(filters)
    }

    render() {
        const items = this.props.killmail_list.filter((item) => {
            if(item.active) return true
        }).length
        let dropdownClass = 'dropdown-menu-hide'
        if(this.state.showOptions) dropdownClass = 'dropdown-menu-visible'
        let mode = 'All'
        if(this.props.options.matchAny) mode = 'Any'

        return (
            <div className="navbar-container">
                <div className="left-container">
                  <div className="logo-container">
                      <img src="../../style/img/logo.png" height="45" width="50"/>
                      <img src="../../style/img/logo-label.png" height="35" />
                  </div>
                  <div className="kill-counter">Active Killmails: { items }</div>
                  <div className="mode-container">Mode: { mode }</div>
                  <div className="search-container"><SearchFilter /></div>
                  <Options filterKillmails={ this.filterKillmails } />
                </div>
                <div className="right-container">
                  <div className="github-logo" onClick={ this.showGithub }>
                      <img src="../../style/img/github-mark.png" height="40"/>
                  </div>
                  <div className="reddit-logo" onClick={ this.showReddit }>
                      <img src="../../style/img/reddit.png" height="40"/>
                  </div>
                </div>
            </div>

        )
    }
}

function mapStateToProps({ killmail_list, options, filters, system_filter, jump_filter }) {
    return ({ killmail_list, options, filters, system_filter, jump_filter })
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ filterKillmails }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar)

