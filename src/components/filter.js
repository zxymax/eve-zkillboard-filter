import React, { Component } from 'react'

export default class Filter extends Component {

    constructor(props) {
        super(props)
        this.state = {
          status: this.props.status
        }
        this.deleteFilter = this.deleteFilter.bind(this)
        this.updateFilter = this.updateFilter.bind(this)
        this.updateStatus = this.updateStatus.bind(this)
    }

    updateStatus() {
      const { type, name, id, updateFilter } = this.props
      if(type == 'region') return
      switch(this.state.status) {
        case 'both':
          updateFilter(name, type, 'attacker', id)
          this.setState({ status: 'attacker' }); break
        case 'attacker':
          updateFilter(name, type, 'victim', id)
          this.setState({ status: 'victim' }); break
        case 'victim':
          updateFilter(name, type, 'both', id)
          this.setState({ status: 'both' }); break
      }
    }

    updateFilter() {
        const { type, name, id, updateFilter } = this.props
        updateFilter(name, type, status, id)
    }

    deleteFilter() {
        const { type, name, removeFilter } = this.props
       removeFilter(name, type)
    }

    render() {
        const { name, key } = this.props
        const filterClass = "tag-" + this.state.status + " label tag label-info"
        return (
          <div className={ filterClass } key={ key }>
              <div className="filter-label" onClick={ this.updateStatus } >{ name }</div>
              <div className="filter-button" onClick={ this.deleteFilter }>
                <span className="glyphicon glyphicon-remove"></span>
              </div>
          </div>
        )
    }
}


