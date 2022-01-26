import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getFilterOptions } from '../actions/actions'
import { resetFilterOptions } from '../actions/actions'
import { createSystemFilterAndEvaluate } from '../actions/actions'
import { createFilterAndEvaluate } from '../actions/actions'

class SearchFilter extends Component {

    constructor(props) {
        super(props)
        this.state = {
          input: '',
          listVisible: false,
          selectedItem: ''
        }

        this.select = this.select.bind(this)
        this.show = this.show.bind(this)
        this.hide = this.hide.bind(this)
        this.update = this.update.bind(this)
        this.renderListItems = this.renderListItems.bind(this)
    }

    select(item) {
        const { createSystemFilterAndEvaluate, createFilterAndEvaluate, resetFilterOptions } = this.props
        if(item.type === 'system') {
            const name = item.name.substring(0, item.name.indexOf('('))
            createSystemFilterAndEvaluate(name, item.id, 0 ,0, this.props)
        }
        else if(item.type === 'region' ||
            item.type == 'ship' ||
            item.type == 'group' ||
            item.type == 'alliance' ||
            item.type == 'corporation' ||
            item.type == 'character') {
            createFilterAndEvaluate(item.type, item.id, item.name, this.props)
        }
        resetFilterOptions()
        this.setState({ input: '' })
    }

    update(input) {
        this.setState({ input: input})
        if(input.trim() === '') this.setState({ listVisible: false })
        else {
            this.setState({ listVisible: true })
            this.props.getFilterOptions(input.trim())
        }
        document.addEventListener("click", this.hide)
    }

    show() {
        console.log('showing')
        this.setState({ listVisible: true })
        document.addEventListener("click", this.hide)
    }

    hide() {
        this.setState({ listVisible: false})
        document.removeEventListener("click", this.hide)
    }

    renderListItems() {
        return this.props.filterOptions.map((option, index) => {
            const imgUrl = `https://image.eveonline.com/${option.image}`
            if(option.name && option.name.length > 33) option.name = `${option.name.substring(0, 30)}...`
            return(
                <div className="filter-list-item" key={ index } onClick={ this.select.bind(null, option) }>
                    <img src={ imgUrl } height="40" width="40"/>
                    <div >
                        <span className="item-name">{ option.name }</span>
                        <span className="item-type">{ option.type }</span>
                    </div>
                </div>
            )
        })
    }

    render() {
        return (
             <div>
                <input
                    placeholder="Search for a filter here..."
                    type="text"
                    className="dropdown-input"
                    onClick={ this.show }
                    onChange={(e)=>{ this.update(e.target.value) }}
                    value={ this.state.input }
                />
                <div className={"filter-list" + (this.state.listVisible ? "-clicked": "")}>
                    <div className="render-list">
                        { this.renderListItems() }
                    </div>
                </div>
            </div>
        )
    }

}

function mapStateToProps({ killmail_list, filterOptions, system_filter, jump_filter, filters, options }) {
    return { killmail_list, filterOptions, system_filter, jump_filter, filters, options }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ getFilterOptions, resetFilterOptions, createSystemFilterAndEvaluate, createFilterAndEvaluate }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchFilter)



