import React, { Component } from 'react'

import { GET_FILTER_OPTIONS } from '../actions/actions'
import { RESET_FILTER_OPTIONS } from '../actions/actions'

export default function(state = [], action) {
    switch (action.type) {
        case GET_FILTER_OPTIONS:
          return action.meta.options.concat(action.payload.data)

        case RESET_FILTER_OPTIONS:
          return []
    }
    return state
}


