import axios from 'axios'

import { SYSTEM_FILTER_CREATE } from '../actions/actions'
import { SYSTEM_FILTER_UPDATE } from '../actions/actions'
import { SYSTEM_FILTER_DELETE } from '../actions/actions'


export default function(state = [], action) {

    switch (action.type) {
        case SYSTEM_FILTER_CREATE:
            console.timeEnd('test1')
            return action.payload.data.systems

        case SYSTEM_FILTER_DELETE:
            if(action.payload) {
              return action.payload.data.systems
            }
            return state

         case SYSTEM_FILTER_UPDATE:
            return action.payload.data.systems
    }
    return state
}



