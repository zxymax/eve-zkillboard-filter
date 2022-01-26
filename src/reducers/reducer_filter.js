import React, { Component } from 'react'

import { FILTER_CREATE } from '../actions/actions'
import { FILTER_UPDATE } from '../actions/actions'
import { FILTER_DELETE } from '../actions/actions'

export default function(state = { alliances:[], corporations:[], characters:[], ships:[], groups:[], regions:[]}, action) {
    switch (action.type) {
      case FILTER_CREATE:
        console.log(action.payload)
        switch (action.payload.type) {
          case 'alliance':
            return {
              alliances: state.alliances.concat(action.payload),
              corporations: state.corporations,
              characters: state.characters,
              ships: state.ships,
              groups: state.groups,
              regions: state.regions
            }

          case 'corporation':
            return {
              alliances: state.alliances,
              corporations: state.corporations.concat(action.payload),
              characters: state.characters,
              ships: state.ships,
              groups: state.groups,
              regions: state.regions
            }

          case 'character':
            return {
              alliances: state.alliances,
              corporations: state.corporations,
              characters: state.characters.concat(action.payload),
              ships: state.ships,
              groups: state.groups,
              regions: state.regions
            }

          case 'ship':
            return {
              alliances: state.alliances,
              corporations: state.corporations,
              characters: state.characters,
              ships: state.ships.concat(action.payload),
              groups: state.groups,
              regions: state.regions
            }

          case 'group':
            return {
              alliances: state.alliances,
              corporations: state.corporations,
              characters: state.characters,
              ships: state.ships,
              groups: state.groups.concat(action.payload),
              regions: state.regions
            }

          case 'region':
            return {
              alliances: state.alliances,
              corporations: state.corporations,
              characters: state.characters,
              ships: state.ships,
              groups: state.groups,
              regions: state.regions.concat(action.payload)
            }
        }

      case FILTER_UPDATE:
        const updateName = action.payload.name
        const status = action.payload.status
        const filterID = action.payload.filterID
        switch (action.payload.type) {
          case 'alliance':
            return {
              alliances: updateFilter(state.alliances, updateName, status, filterID),
              corporations: state.corporations,
              characters: state.characters,
              ships: state.ships,
              groups: state.groups,
              regions: state.regions
            }

          case 'corporation':
            return {
              alliances: state.alliances,
              corporations: updateFilter(state.corporations, updateName, status, filterID),
              characters: state.characters,
              ships: state.ships,
              groups: state.groups,
              regions: state.regions
            }

          case 'character':
            return {
              alliances: state.alliances,
              corporations: state.corporations,
              characters: updateFilter(state.characters, updateName, status, filterID),
              ships: state.ships,
              groups: state.groups,
              regions: state.regions
            }

          case 'ship':
            return {
              alliances: state.alliances,
              corporations: state.corporations,
              characters: state.characters,
              ships: updateFilter(state.ships, updateName, status, filterID),
              groups: state.groups,
              regions: state.regions
            }

          case 'group':
            return {
              alliances: state.alliances,
              corporations: state.corporations,
              characters: state.characters,
              ships: state.ships,
              groups: updateFilter(state.groups, updateName, status, filterID),
              regions: state.regions
            }

          case 'region':
            return {
              alliances: state.alliances,
              corporations: state.corporations,
              characters: state.characters,
              ships: state.ships,
              groups: state.groups,
              regions: updateFilter(state.regions, updateName, status, filterID)
            }

        }

        case FILTER_DELETE:
          const deleteName = action.payload.name
          switch(action.payload.type) {
              case 'alliance':
                return {
                  alliances: removeItem(state.alliances, deleteName),
                  corporations: state.corporations,
                  characters: state.characters,
                  ships: state.ships,
                  groups: state.groups,
                  regions: state.regions
                }

              case 'corporation':
                return {
                  alliances: state.alliances,
                  corporations:  removeItem(state.alliances, deleteName),
                  characters: state.characters,
                  ships: state.ships,
                  groups: state.groups,
                  regions: state.regions
                }

              case 'character':
                return {
                  alliances: state.alliances,
                  corporations: state.corporations,
                  characters: removeItem(state.characters, deleteName),
                  ships: state.ships,
                  groups: state.groups,
                  regions: state.regions
                }

              case 'ship':
                return {
                  alliances: state.alliances,
                  corporations: state.corporations,
                  characters: state.characters,
                  ships: removeItem(state.ships, deleteName),
                  groups: state.groups,
                  regions: state.regions
                }

              case 'group':
                return {
                  alliances: state.alliances,
                  corporations: state.corporations,
                  characters: state.characters,
                  ships: state.ships,
                  groups: removeItem(state.groups, deleteName),
                  regions: state.regions
                }

              case 'region':
                return {
                  alliances: state.alliances,
                  corporations: state.corporations,
                  characters: state.characters,
                  ships: state.ships,
                  groups: state.groups,
                  regions: removeItem(state.regions, deleteName)
                }
          }
    }
    return state
}


function removeItem(array, search) {
    const indexes = array.map((object, index) => {
                if(object.name === search) return index; else return 0
              })
    const index = Math.max.apply(Math, indexes)
    return array.slice(0, index).concat(array.slice(index + 1))
}


function updateFilter(array, target, status, filterID) {
  const index = findTargetIndex(array, target)
  array[index].status = status
  array[index].filterID = filterID
  return array
}

function findTargetIndex(array, target) {
  for(let i in array) {
    if(array[i].name === target) return i
  }
  return -1
}