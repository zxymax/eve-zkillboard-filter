import axios from 'axios'

const URL_LISTEN = 'http://redisq.zkillboard.com/listen.php'
const AUTOCOMPLETE = 'https://zkillboard.com/autocomplete/'

export const INITIALIZE_KILLMAILS = 'INITIALIZE_KILLMAILS'
export const INITIALIZE_ZKILL_KILLMAILS = 'INITIALIZE_ZKILL_KILLMAILS'
export const GET_KILLMAIL = 'GET_KILLMAIL'
export const FILTER_KILLMAILS = 'FILTER_KILLMAILS'
export const GET_FILTER_OPTIONS = 'GET_FILTER_OPTIONS'
export const RESET_FILTER_OPTIONS = 'RESET_FILTER_OPTIONS'
export const SET_OPTIONS = 'SET_OPTIONS'
export const SYSTEM_FILTER_CREATE = 'SYSTEM_FILTER_CREATE'
export const SYSTEM_FILTER_DELETE = 'SYSTEM_FILTER_DELETE'
export const SYSTEM_FILTER_UPDATE = 'SYSTEM_FILTER_UPDATE'
export const FILTER_CREATE = 'FILTER_CREATE'
export const FILTER_UPDATE = 'FILTER_UPDATE'
export const FILTER_DELETE = 'FILTER_DELETE'

import { getJumpRangeUrl } from '../functions/system_functions'

export function getFilterOptions(input) {
    const request = axios.get(AUTOCOMPLETE + input + '/')
    return {
        type: GET_FILTER_OPTIONS,
        payload: request,
        meta: {
            options: findOptions(input)
        }
    }
}

export function resetFilterOptions() {
    return {
        type: RESET_FILTER_OPTIONS,
        payload: []
    }
}

export function getKillmails(props) {
    const request = axios.get(URL_LISTEN)
    return {
        type: GET_KILLMAIL,
        payload: request,
        meta: {
            props: props
        }
    }
}

export function filterKillmails(props) {
    return {
        type: FILTER_KILLMAILS,
        payload: {
            killmails: props.killmail_list,
            props: props
        }
    }
}


/**
 * If the local storage contains 500 or more killmails, initialize the list with those. If it does not,
 * chain Zkill api queries to obtain an initial dataset
 * @param killmails - array of killmail objects from local storage
 * @returns {Function}
 */
export function setInitialKillmails(killmails, props) {

    return (dispatch) => {
        //if(killmails && killmails.length > 500) {
            dispatch({
                type: INITIALIZE_KILLMAILS,
                payload: killmails,
                meta: {
                    props: props
                }
            })
        //}
        //else {
        //    let killStore = []
        //    axios.get('https://zkillboard.com/api/kills/limit/200/orderDirection/desc').then((response) => {
        //        killStore = response.data
        //
        //        axios.get(getZkillQuery(response.data)).then((response2) => {
        //            killStore = killStore.concat(response2.data)
        //
        //            axios.get(getZkillQuery(response2.data)).then((response3) => {
        //                killStore = killStore.concat(response3.data)
        //
        //                axios.get(getZkillQuery(response3.data)).then((response4) => {
        //                    killStore.concat(response4.data)
        //
        //                    axios.get(getZkillQuery(response4.data)).then((response5) => {
        //                        dispatch({
        //                            type: INITIALIZE_ZKILL_KILLMAILS,
        //                            payload: killStore.concat(response5.data)
        //                        })
        //                    })
        //                })
        //            })
        //        })
        //    })
        //}

    }

}

export function setOptions(options) {
    return {
        type: SET_OPTIONS,
        payload: options
    }
}

export function createSystemFilterAndEvaluate(system, systemId, jumps, ly, props) {

    const filter = {
        system: system,
        systemId: systemId,
        filterID: `${systemId}-${jumps}-${ly}`,
        jumps: jumps,
        ly: ly
    }
    const updatedState = props.system_filter.concat(filter)

    return (dispatch, getState) => {

        axios.get(getJumpRangeUrl(updatedState)).then((response) => {
            Promise.resolve(dispatch({
                type: SYSTEM_FILTER_CREATE,
                payload: response,
                meta: {
                    filter: updatedState,
                    props: props

                }
            })).then(dispatch(filterKillmails(getState())))
        })
    }
}



export function updateSystemFilterAndEvaluate(system, systemId, key, value, props) {

    const system_filter = props.system_filter
    let updatedState = []
    for(let i = 0; i < system_filter.length; i++) {
        if(system_filter[i].system == system) {
            if(system_filter[i].jumps === '') system_filter[i].jumps = 0
            if(system_filter[i].ly === '') system_filter[i].ly = 0
            let filter = {
                system: system_filter[i].system,
                systemId: system_filter[i].systemId,
                jumps: system_filter[i].jumps,
                ly: system_filter[i].ly,
                filterID: system_filter[i].filterID
            }
            if(value === '') filter[key] = 0
            else filter[key] = value
            filter.filterID = `${filter.systemId}-${filter.jumps}-${filter.ly}`
            updatedState.push(filter)
        }
        else {
            updatedState.push(system_filter[i])
        }
    }

    return (dispatch, getState) => {
        axios.get(getJumpRangeUrl(updatedState)).then((response) => {
            Promise.resolve(dispatch({
                type: SYSTEM_FILTER_UPDATE,
                payload: response,
                meta: {
                    filter: updatedState,
                    props: props
                }
            })).then(dispatch(filterKillmails(getState())))
        })
    }
}

export function deleteSystemFilterAndEvaluate(system, props) {
    return (dispatch, getState) => {
        Promise.resolve(dispatch(deleteSystemFilter(system, props)))
            .then(dispatch(filterKillmails(getState())))
    }
}

export function deleteSystemFilter(system, props) {
    const currentState = props.system_filter
     for(let i = 0; i < currentState.length; i++) {
      if(currentState[i].system == system) {
        const updatedState = currentState.slice(0, i).concat(currentState.slice(i + 1))

        let request = false
        if(updatedState.length > 0) {
          request = axios.get(getJumpRangeUrl(updatedState))
        }
        return {
          type: SYSTEM_FILTER_DELETE,
          payload: request,
          meta: {
            filter: updatedState,
            props: props
          }
        }

      }
    }

}

export function createFilterAndEvaluate(type, id, name, props) {
    return (dispatch, getState) => {
        Promise.resolve(dispatch(createFilter(type, id, name, props)))
            .then(dispatch(filterKillmails(getState())))
    }
}

export function createFilter(type, id, name, props) {
    return {
        type: FILTER_CREATE,
        payload: { type: type, id: id, name: name, status: 'both', filterID: `${id}-both` },
        meta: {
            props: props
        }
    }
}

export function updateFilterAndEvaluate(name, type, status, id, props) {
    return (dispatch, getState) => {
        Promise.resolve(dispatch(updateFilter(name, type, status, id, props)))
            .then(dispatch(filterKillmails(getState())))
    }
}

export function updateFilter(name, type, status, id, props) {
    return {
        type: FILTER_UPDATE,
        payload: { name: name, type: type, status: status, filterID: `${id}-${status}` },
        meta: {
            props: props
        }
    }
}

export function deleteFilterAndEvaluate(name, type, props) {
    return (dispatch, getState) => {
        Promise.resolve(dispatch(deleteFilter(name, type, props)))
            .then(dispatch(filterKillmails(getState())))
    }
}

export function deleteFilter(name, type, props) {
    return {
        type: FILTER_DELETE,
        payload: { name: name, type: type },
        meta: {
            props: props
        }
    }
}



function findOptions(input) {
   let list = []
   const formattedName = input.toLowerCase().trim()
   if(formattedName.length > 2) {
     for(let group in groups){
       if (group.toLowerCase().indexOf(formattedName) !== -1) {
           list.push({ name: group, id: groups[group][0], ships: groups[group], type: 'group', image: 'Type/' + groups[group][0] + '_32.png'});
       }
     }
   }
   return list
}

function getZkillQuery(data) {
    let lowest
    for(let i in data) {
        if(lowest === undefined || data[i].killID < lowest) lowest = data[i].killID
    }
    return `https://zkillboard.com/api/kills/beforeKillID/${lowest}/orderDirection/desc`
}
