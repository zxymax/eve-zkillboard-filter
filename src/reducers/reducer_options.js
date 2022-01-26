import React, { Component } from 'react'

import { SET_OPTIONS } from '../actions/actions'
export default function(state = initializeOptions(), action) {
    switch (action.type) {
        case SET_OPTIONS:
          return action.payload
    }
    return state
}

/**
 * Check to see if the options object is in local storage. If it is, parse it and return it.
 * If the object is not in local storage, return an object with default values.
 *
 * @returns default options object
 */
function initializeOptions() {
    const options = localStorage.getItem('options')
    if(options) return JSON.parse(options)
    return {
        showOptions: false,
        ignorePods: true,
        ignoreShuttles: true,
        ignoreRookieShips: true,
        showHighsec: false,
        showLowsec: true,
        showNullsec: true,
        matchAny: true,
        minIsk: '',
        maxIsk: '',
        minPlayers: '',
        maxPlayers: '',
        maxKillmails: 5000
    }
}