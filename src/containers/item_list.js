import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Infinite from 'react-infinite'

import Item from '../components/item'

import { inLyRange } from '../functions/system_functions'
import { systemExists } from '../functions/system_functions'

// Returns generic table that holds a list of items. Items are customized at the item object level
class ItemList extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        localStorage.setItem('updateTime', new Date)
        const { killmail_list, name, options } = this.props
        if(killmail_list.length >= parseInt(options.maxKillmails)) {
            deleteLast()
        }

        const items = killmail_list.filter((item) => {
           if(item.active) return true
        })
        .map((item, index) => {
            return <Item key={ index } item={ item } />
        })

        return (
            <div>
                <Infinite className={ name } containerHeight={ window.innerHeight - 55 } elementHeight={ 50 }>
                   { items }
                </Infinite>
            </div>
        )
    }
}

function mapStateToProps({ killmail_list, options }) {
    return ({ killmail_list, options })
}

export default connect(mapStateToProps)(ItemList)

/**
 *  Delete the killmail object corresponding to the lowest KillID (i.e. oldest) in indexddb
 */
function deleteLast() {
    var request = window.indexedDB.open("killmails", 1)
    let db
    request.onsuccess = function(event) {
        db = request.result
        var trans = db.transaction('killmails', 'readwrite')
        var store = trans.objectStore('killmails')

        var pdestroy = store.openCursor()
        pdestroy.onsuccess = function (event) {
            var cursor = pdestroy.result;
            if (cursor) {
                store.delete(cursor.primaryKey);
            }
        }
    }
}