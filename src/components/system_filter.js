import React, { Component } from 'react'

export default class SystemFilter extends Component {

    constructor(props) {
        super(props)
        this.state = {
          system: props.systemName,
          systemId: props.systemId,
          jumps: '',
          ly: ''
        }

        this.updateJumps = this.updateJumps.bind(this)
        this.updateLY = this.updateLY.bind(this)
        this.deleteFilter = this.deleteFilter.bind(this)
    }


    updateJumps(event) {
        const jumps = event.target.value
        if(jumps == '' || (jumps.match(/^\d+$/) && jumps < 1000)) { // sanatize input
            this.setState({jumps: jumps}, function () {
                this.props.editSystemFilter(this.state.system, this.state.systemId, 'jumps', jumps)
            })
        }
    }

    updateLY(event) {
        const ly = event.target.value
        if(ly == '' || (ly.match(/^\d+$/ ) && ly < 1000)) { // sanatize input
            this.setState({ly: event.target.value}, function () {
                this.props.editSystemFilter(this.state.system, this.state.systemId, 'ly', ly)
            })
        }
    }

    deleteFilter() {
        this.props.removeSystemFilter(this.props.systemName, this)
    }

    render() {
        return (
           <tr className="system-filter-row"><td>
            <div className="system-container">
            <div className="system-label-container">{ this.props.systemName }</div>
            <div className="system-inputs-container">
              <span className="system-filter-input">
                  <input
                    type="text"
                    className="form-control, system-filter"
                    placeholder="Jumps"
                    aria-describedby="basic-addon1"
                    value={ this.state.jumps }
                    onChange={ this.updateJumps }
                  />
              </span>
              <span className="system-filter-input">
                  <input
                    type="text"
                    className="form-control, system-filter"
                    placeholder="LY"
                    aria-describedby="basic-addon1"
                    value={ this.state.ly }
                    onChange={ this.updateLY }
                  />
              </span>
            </div>
            <div className="system-filter-button" onClick={ this.deleteFilter }>
              <span className="glyphicon glyphicon-remove"></span>
            </div>
          </div>
          </td></tr>


        )
    }
}



