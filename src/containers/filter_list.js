import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { updateSystemFilterAndEvaluate } from '../actions/actions'
import { deleteSystemFilterAndEvaluate } from '../actions/actions'
import { updateFilterAndEvaluate } from '../actions/actions'
import { deleteFilterAndEvaluate } from '../actions/actions'

import Item from '../components/item'
import Filter from '../components/filter'
import SystemFilter from './../components/system_filter'
import SearchFilter from './search_filter'

class FilterList extends Component {

    constructor(props) {
        super(props);
        this.editSystemFilter = this.editSystemFilter.bind(this)
        this.createFilterObjects = this.createFilterObjects.bind(this)
        this.removeSystemFilter = this.removeSystemFilter.bind(this)
        this.updateFilter = this.updateFilter.bind(this)
        this.removeFilter = this.removeFilter.bind(this)
    }

    editSystemFilter(system, systemId, key, value) {
        this.props.updateSystemFilterAndEvaluate(system, systemId, key, value, this.props)
    }

    removeSystemFilter(system) {
        this.props.deleteSystemFilterAndEvaluate(system, this.props)
    }

    removeFilter(filterName, filterType) {
        this.props.deleteFilterAndEvaluate(filterName, filterType, this.props)
    }

    updateFilter(filterName, filterType, filterStatus, filterId) {
        this.props.updateFilterAndEvaluate(filterName, filterType, filterStatus, filterId, this.props)
    }

    createFilterObjects(filter, type) {
        if(filter) {
            return filter.map((object, index) => {
                return (
                    <Filter
                        type={ type }
                        filterID={ object.filterID }
                        id={ object.id }
                        key= { index }
                        name={ object.name }
                        status={ object.status }
                        removeFilter={ this.removeFilter }
                        updateFilter={ this.updateFilter }
                    />
                )
            });
        }
        else return []
    }


    render() {
       let systemFilters = []
        if(this.props.system_filter) {
          systemFilters = this.props.system_filter.map((object, index) => {
               return (
                   <SystemFilter
                       key = { index }
                       systemName={ object.system }
                       systemId={ object.systemId }
                       filterID={ object.filterID }
                       jumps={ object.jumps }
                       ly={ object.ly }
                       editSystemFilter={ this.editSystemFilter }
                       removeSystemFilter={ this.removeSystemFilter }
                    />
               )
            })
        }

        const { alliances, corporations, characters, ships, groups, regions } = this.props.filters
        return (
          <div className="filter-containers">
              <table className={ this.props.name }>
                  <tbody>
                  { systemFilters }
                  </tbody>
              </table>
              <div className="alliance-filter">{ this.createFilterObjects(alliances, 'alliance') }</div>
              <div className="corporation-filter">{ this.createFilterObjects(corporations, 'corporation') }</div>
              <div className="character-filter">{ this.createFilterObjects(characters, 'character') }</div>
              <div className="ship-filter"> { this.createFilterObjects(ships, 'ship') } </div>
              <div className="group-filter"> { this.createFilterObjects(groups, 'group') } </div>
              <div className="region-filter"> { this.createFilterObjects(regions, 'region') } </div>
          </div>
        )
    }
}

function mapStateToProps({ killmail_list, system_filter, filters, options }) {
    return { killmail_list, system_filter, filters, options }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ updateSystemFilterAndEvaluate, deleteSystemFilterAndEvaluate, updateFilterAndEvaluate,
        deleteFilterAndEvaluate }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterList)
