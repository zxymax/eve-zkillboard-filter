import axios from 'axios'

import { SYSTEM_FILTER_CREATE } from '../actions/actions'
import { SYSTEM_FILTER_UPDATE } from '../actions/actions'
import { SYSTEM_FILTER_DELETE } from '../actions/actions'

import { getJumpRangeUrl } from '../functions/system_functions'

export default function(state = [], action) {

    switch (action.type) {
        case SYSTEM_FILTER_CREATE:
            return action.meta.filter

        case SYSTEM_FILTER_DELETE:
            return action.meta.filter

         case SYSTEM_FILTER_UPDATE:
            return action.meta.filter
    }
    return state
}



