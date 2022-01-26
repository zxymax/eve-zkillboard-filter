import _ from 'lodash'

import { GET_KILLMAIL } from '../actions/actions'
import { INITIALIZE_KILLMAILS } from '../actions/actions'
import { INITIALIZE_ZKILL_KILLMAILS } from '../actions/actions'
import { FILTER_KILLMAILS } from '../actions/actions'

import { inLyRange } from '../functions/system_functions'

export default function(state = [], action) {
    switch (action.type) {
        case GET_KILLMAIL:
            if(action.payload.data.package == null) return state // see if any new killmails have arrived

            const response = action.payload.data.package
            const shipID = response.killmail.victim.shipType.id
            const systemID = response.killmail.solarSystem.id

            if(isValid(shipID, systemID, action.meta.props.options)) {
                const killmail = transformRedisKillmail(response)
                addToDatabase(killmail) // add killmail with true status, need to develop middleware to remove side effect

                let passedFilter
                if(action.meta.props.options.matchAny) passedFilter = isActiveAny(killmail, action.meta.props, [])
                else passedFilter = isActiveAll(killmail, action.meta.props)

                if(!passedFilter) killmail.active = false
                if(state.length >= parseInt(action.meta.props.options.maxKillmails)) return [killmail].concat(state.slice(0, -1))
                return [killmail].concat(state) // concatenate killmails to the beginning of array
            }
            return state

        case INITIALIZE_KILLMAILS:
            const initialKillmails = action.payload.map((killmail) => {

                let passedFilter
                if(action.meta.props.options.matchAny) passedFilter = isActiveAny(killmail, action.meta.props, filterIDs)
                else passedFilter = isActiveAll(killmail, action.meta.props)

                if(passedFilter) {
                    killmail.active = true
                    if(passedFilter !== true) killmail.passedFilters.push(passedFilter)
                }
                else killmail.active = false
                return killmail
            })
            return initialKillmails

        case INITIALIZE_ZKILL_KILLMAILS:
            return action.payload.filter((killmail) => {
                return isValid(killmail.victim.shipTypeID, killmail.solarSystemID, action.meta.props.options)
            })
            .map((killmail) => {
                return transformZkillKillmail(killmail)
            })
            return state

        case FILTER_KILLMAILS:
            const props = action.payload.props
            if(evaluateNoFilters(props)) return setAllActive(props.killmail_list)

            const filterIDs = getActiveFilterIDs(props)
            return props.killmail_list.map((killmail) => {

                let passedFilter
                if(props.options.matchAny) passedFilter = isActiveAny(killmail, props, filterIDs)
                else passedFilter = isActiveAll(killmail, props, filterIDs)

                if(passedFilter) {
                    killmail.active = true
                    if(passedFilter !== true) killmail.passedFilters.push(passedFilter)
                }
                else killmail.active = false
                return killmail
            })

    }
    return state
}


function addToDatabase(killmail) {
    var request = db.transaction(["killmails"], "readwrite")
        .objectStore("killmails")
        .put(killmail)

    request.onsuccess = function(event) {
        //console.log("Killmail has been added to your database.")
    };

    request.onerror = function(event) {
        //console.log('Unable to add data', killmail)
    }
}

/**
 * Convert a killmail object retrieved from zkillboards Redis queue (https://github.com/zKillboard/RedisQ)
 * into a killmail suited to this application.
 * @param kill - redis killmail object
 * @returns {object} killmail
 */
function transformRedisKillmail(response) {
    const kill = response.killmail
    const shipID = kill.victim.shipType.id
    const systemID = kill.solarSystem.id
    const victimInfo = getVictimInfo(kill.victim)
    const attackerCorporationInfo = getAttackerCorporation(kill.attackers)
    const attackerAllianceInfo = getAttackerAlliance(kill.attackers)
    return {
        killID: kill.killID,
        shipID: shipID,
        shipName: shipdata[shipID].shipname,
        systemID: systemID,
        system: systemData[systemID].name,
        region: getRegionName(systemData[systemID].region),
        security: systemData[systemID].security.toFixed(1),
        victimName: victimInfo[0],
        victimID: victimInfo[1],
        victimCorp: victimInfo[2],
        victimCorpID: victimInfo[3],
        victimAlliance: victimInfo[4],
        victimAllianceID: victimInfo[5],
        attackerCount: kill.attackerCount,
        attackerIDs: getAttackerIDs(kill.attackers),
        attackerShips: getAttackerShips(kill.attackers),
        attackerCorporation: attackerCorporationInfo[0],
        attackerCorporationIDs: attackerCorporationInfo[1],
        attackerAlliance: attackerAllianceInfo[0],
        attackerAllianceIDs: attackerAllianceInfo[1],
        value: response.zkb.totalValue,
        time: kill.killTime.substring(10, 16),
        passedFilters: [],
        active: true
    }
}

/**
 * Convert a killmail object retrieved from zkillboards api (https://github.com/zKillboard/zKillboard/wiki/API-(Killmails))
 * into a killmail suited to this application.
 * @param kill - redis killmail object
 * @returns {object} killmail
 */
function transformZkillKillmail(kill) {
    const attackerAllianceInfo = getZkillAttackerAlliance(kill.attackers)
    let groupID = kill.victim.corporationID
    let groupName = kill.victim.corporationName
    if(kill.victim.allianceID) {
        groupID = kill.victim.allianceID
        groupName = kill.victim.allianceName
    }
    const killmail = {
        killID: kill.killID,
        shipID: kill.victim.shipTypeID,
        shipName: shipdata[kill.victim.shipTypeID].shipname,
        systemID: kill.solarSystemID,
        system: systemData[kill.solarSystemID].name,
        security: Math.round(systemData[kill.solarSystemID].security * 10) / 10,
        victimName: kill.victim.characterName,
        victimCorp: groupName,
        victimGroupID: groupID,
        attackerCount: kill.attackers.length,
        attackerShips: getAttackerShips(kill.attackers),
        attackerAlliance: attackerAllianceInfo[0],
        attackerAllianceIDs: attackerAllianceInfo[1],
        time: kill.killTime.substring(10,16),
        passedFilters: [],
        active: true
    }
    return killmail
}

/**
 * Generate victim information from killmail
 * @param victim - victim object from killmail
 * @returns {array} Index 0: Name of victim
 *                Index 1: Victim's corporation name
 *                Index 2: Victim's corporation ID
 *                Index 3: Victim's alliance name
 *                Index 4: Victim's alliance ID
 */
function getVictimInfo(victim) {
    let victimAlliance = ''
    let victimAllianceID = ''
    if(victim.alliance) {
        victimAlliance = victim.alliance.name
        victimAllianceID = victim.alliance.id
    }
    let victimName = 'Unkown'
    let victimID = ''
    if(victim.character) {
        victimName = victim.character.name
        victimID = victim.character.id
    }
    return [victimName, victimID, victim.corporation.name, victim.corporation.id, victimAlliance, victimAllianceID]
}

/**
 * Take in a list of killmails and set all of them active
 * @param killmails - array of killmail objects
 * @returns {*}
 */
function setAllActive(killmails) {
    return killmails.map((killmail) => {
        killmail.active = true
        return killmail
    })
}

/**
 * Check to make sure this killmail is valid; killmails that do not pass this will not
 * be entered into the store OR the indexedb, essentially never existing.
 * @param   {integer} shipID   - Type ID of the ship
 * @param   {integer} systemID - Type ID of the system
 * @param   {object} options - options object from redux store
 * @returns {boolean}   - Whether or not the killmail is valid
 */
function isValid(shipID, systemID, options) {
    if(options.ignorePods && (shipID === 670 || shipID === 33328)) return false // ignore pods
    if(options.ignoreRookieShips && (groups.RookieShips.indexOf(shipID) != -1)) return false // ignore rookie ships
    if(options.ignoreShuttles && (groups.Shuttles.indexOf(shipID) != -1)) return false // ignore shuttles
    if(!shipdata[shipID] || !systemData[systemID]) return false // if we do not have the system on record
    if(!options.showHighsec && (systemData[systemID].security >= 0.5)) return false
    if(!options.showLowsec && (systemData[systemID].security < 0.5 && systemData[systemID].security > 0)) return false
    if(!options.showNullsec && (systemData[systemID].security <= 0)) return false
    return true
}

/**
 * Given a list of attackers iterate through and find the most common alliance
 * @param   {array} attackers - attacker object from zkill killmail
 * @returns {array} Index 0: most occuring alliance on the killmail
 *                  Index 1: array of alliance type ids that were involved on the kill
 */
function getZkillAttackerAlliance(attackers) {
    let allianceCount = {}
    let allianceIDs = []
    for(let i in attackers) {
        const attacker = attackers[i]
        let attackerGroup = attacker.corporationName
        let attackerGroupID = attacker.corporationID
        if(attacker.allianceName.trim().length > 0) {
            attackerGroup = attacker.allianceName
            attackerGroupID = attacker.allianceID
        }
        if(!(attackerGroup in allianceCount)) {
            allianceCount[attackerGroup] = 1
            allianceIDs.push(attackerGroupID)
        }
        else allianceCount[attackerGroup]++
    }
    let alliance = _.max(Object.keys(allianceCount), function (o) { return allianceCount[o]; });
    if(alliance == -Infinity) alliance = getAttackerCorporation(attackers)
    return [alliance, allianceIDs]
}

/**
 * Given a list of attackers iterate through and find the most common alliance
 * @param   {array} attackers - attacker object from redis killmail
 * @returns {array} Index 0: most occuring alliance on the killmail
 *                  Index 1: array of alliance type ids that were involved on the kill
 */
function getAttackerAlliance(attackers) {
  let allianceCount = {}
  let allianceIDs = []
  for(let i in attackers) {
    const attacker = attackers[i]
    if(attacker.alliance) {
      if(!(attacker.alliance.name in allianceCount)) {
          allianceCount[attacker.alliance.name] = 1
          allianceIDs.push(attacker.alliance.id)
      }
      else allianceCount[attacker.alliance.name]++
    }
  }
  let alliance = _.max(Object.keys(allianceCount), function (o) { return allianceCount[o]; });
  if(alliance == -Infinity) alliance = ''
  return [alliance, allianceIDs]
}

/**
 * Given a list of attackers iterate through and find the most common corporation
 * @param   {array} attackers - attacker object from zkill killmail
 * @returns {String} most occuring corporation on the killmail
 */
function getAttackerCorporation(attackers) {
    let corpCount = {}
    let corpIDs = []
    for(let i in attackers) {
        const attacker = attackers[i]
        if(attacker.corporation) {
            if(!(attacker.corporation.name in corpCount)) {
                corpCount[attacker.corporation.name] = 1
                corpIDs.push(attacker.corporation.id)
            }
            else corpCount[attacker.corporation.name]++
        }
    }
    let corporation = _.max(Object.keys(corpCount), function (o) { return corpCount[o]; })
    if(corporation == -Infinity) corporation = ''
    return [corporation, corpIDs]
}

/**
 * Return an array of type IDs that correspond to the attacker ships from a killmail
 * @param   {array} attackers array of attackers from the killmail object
 * @returns {array} list of type ids
 */
function getAttackerShips(attackers) {
  return attackers.filter((attacker) => {
      if(attacker.shipType || attacker.shipTypeID) return true
  })
  .map((attacker) => {
      if(attacker.shipType) return attacker.shipType.id
      else if(attacker.shipTypeID) return attacker.shipTypeID
  })
}

/**
 * Return an array of type IDs corresponding to all the characters who were an attacker
 * on a killmail
 * @param attackers array of attacker objects from the parent killmail object
 * @returns {Array} list of type IDs
 */
function getAttackerIDs(attackers) {
    return attackers.filter((attacker) => {
        if(attacker.character) return true
    })
    .map((attacker) => {
        return attacker.character.id
    })
}

/**
 * Given a region type ID return the region name
 * @param id - type ID
 * @returns {*} region name if it exists, 'Unkown' otherwise
 */
function getRegionName(id) {
    for(let i in regions) {
        if(regions[i].id === id) return regions[i].name
    }
    return 'Unknown'
}
/**
 * Determine if the input is an integer - used to test user inputs
 * @param   {Unknown} input field being tested
 * @returns {Boolean}  if the input is an integer or can be converted
 *                     to an integer
 */
function isInteger(input) {
    if (input == parseInt(input, 10)) return true
    return false
}

function formatLabel(label, maxChars) {
    if(label.length > maxChars) return `${label.substring(0, maxChars - 3)}...`
    return label
}

// gatecamps
// time
function isActiveAny(killmail, props, filterIDs) {
    if(!killmail) return false

    // evaluate static filters
    const iskFilter =  evaluateISKFilter(killmail, props.options.minIsk, props.options.maxIsk)
    const playerFilter =  evaluatePlayersInvolvedFilter(killmail, props.options.minPlayers, props.options.maxPlayers)
    if(iskFilter && playerFilter) return true

    // Check to see if no dynamic filters are being applied
    if(evaluateExistingFilter(killmail, filterIDs)) return true
    if(evaluateNoFilters(props)) return true

    // evaluate dynamic filters
    const groupEvaluate =  evaluateGroupFilter(props.filters.groups, killmail)
    if(props.filters.groups.length > 0 && groupEvaluate) return groupEvaluate

    const shipEvaluate = evaluateShipFilter(props.filters.ships, killmail)
    if(props.filters.ships.length > 0 && shipEvaluate) return shipEvaluate

    const allianceEvaluate = evaluateAllianceFilter(props.filters.alliances, killmail)
    if(props.filters.alliances.length > 0 && allianceEvaluate) return allianceEvaluate

    const corporationEvaluate = evaluateCorporationFilter(props.filters.corporations, killmail)
    if(props.filters.corporations.length > 0 && corporationEvaluate) return corporationEvaluate

    const characterEvaluate = evaluateCharacterFilter(props.filters.characters, killmail)
    if(props.filters.characters.length > 0 && characterEvaluate) return characterEvaluate

    const systemEvaluate = evaluateSystemFilter(props.system_filter, killmail, props.jump_filter)
    if(props.system_filter.length > 0 && systemEvaluate) return systemEvaluate

    const regionEvaluate = evaluateRegionFilter(props.filters.regions, killmail)
    if(props.filters.regions.length > 0 && regionEvaluate) return regionEvaluate

    return false
}


function isActiveAll(killmail, props) {
    if(!killmail) return false

    // evaluate static filters
    const iskEvaluate = evaluateISKFilter(killmail, props.options.minIsk, props.options.maxIsk)
    if(!iskEvaluate) return false

    const playersInvolvedEvaluate = evaluatePlayersInvolvedFilter(killmail, props.options.minPlayers, props.options.maxPlayers)
    if(!playersInvolvedEvaluate) return false

    // Check to see if no dynamic filters are being applied
    if(evaluateNoFilters(props)) return true

    // evaluate dynamic filters
    const groupEvaluate =  evaluateGroupFilter(props.filters.groups, killmail)
    if(props.filters.groups.length > 0 && !groupEvaluate) return false

    const shipEvaluate = evaluateShipFilter(props.filters.ships, killmail)
    if(props.filters.ships.length > 0 && !shipEvaluate) return false

    const allianceEvaluate = evaluateAllianceFilter(props.filters.alliances, killmail)
    if(props.filters.alliances.length > 0 && !allianceEvaluate) return false

    const corporationEvaluate = evaluateCorporationFilter(props.filters.corporations, killmail)
    if(props.filters.corporations.length > 0 && !corporationEvaluate) return false

    const characterEvaluate = evaluateCharacterFilter(props.filters.characters, killmail)
    if(props.filters.characters.length > 0 && !characterEvaluate) return false

    const systemEvaluate = evaluateSystemFilter(props.system_filter, killmail, props.jump_filter)
    if(props.system_filter.length > 0 && !systemEvaluate) return false

    const regionEvaluate = evaluateRegionFilter(props.filters.regions, killmail)
    if(props.filters.regions.length > 0 && !regionEvaluate) return false
    return true
}


/**
 * Find the intersection between the passedFilters variable on a killmail and the
 * list of filter ids in the Redux store. If an intersection exists then the killmail
 * will be allowed to pass filters without re-checking it.
 * @param killmail - killmail object
 * @param filterIDs - filter IDs of all filters in the redux store
 * @returns {boolean} - whether or not the killmail has already passed this filter
 */
function evaluateExistingFilter(killmail, filterIDs ) {
    if(filterIDs) {
        const intersection = filterIDs.filter((n) => {
            return killmail.passedFilters.indexOf(n) != -1
        })
        if (intersection.length > 0)  return true
    }
    return false
}

/**
 * Check to see if there are no applied filters
 * @param   {object}   props - container object properties
 * @returns {Boolean} if there are any filters being applied
 */
function evaluateNoFilters(props) {
    if(props.system_filter.length === 0 &&
        props.options.minIsk.trim() === '' &&
        props.options.maxIsk.trim() === '' &&
        props.options.minPlayers.trim() === '' &&
        props.options.maxPlayers.trim() === '' &&
        props.filters.ships.length === 0 &&
        props.filters.alliances.length === 0 &&
        props.filters.corporations.length === 0 &&
        props.filters.characters.length === 0 &&
        props.filters.groups.length === 0 &&
        props.filters.regions.length === 0) return true
    return false
}

/**
 * Iterate over all system filters and see if the killmail matches one of the following:
 *   1. In a system specified
 *   2. Within the user specified LY distance (if specified)
 *   3. Within the user specified jump distance (if specified)
 * @param   {object}  systemFilter list of filter objects that contain systems and their jump ranges
 * @param   {object}  killmail     killmail object from reducer
 * @param   {object}  jumpFilter   object with all systems within the user specified systems and jump ranges
 * @returns {Boolean} if the killmail matches the user specified system requirements
 */
function evaluateSystemFilter(systemFilter, killmail, jumpFilter) {
    for(let i in systemFilter) {
        const filter = systemFilter[i]
        if((filter.jumps === 0 || filter.jumps == '') && killmail.system == filter.system) return filter.filterID
        if(isInteger(filter.ly) && inLyRange(killmail.systemID, filter.systemId, filter.ly )) return filter.filterID
        if(isInteger(filter.jumps) && jumpFilter.indexOf(killmail.systemID) !== -1) return filter.filterID
    }
    return false
}

/**
 * Iterate over all ship filters and test if the killmail matches any of them. The status
 * can be used to further filter to show only victims, only attackers or both.
 * @param   {object}   shipFilter object representing a collection of ships
 * @param   {object}   killmail   killmail object from reducer
 * @param   {String}   status     'both', 'victim', or 'attacker'
 * @returns {Boolean} if the killmail matches a ship filter
 */
function evaluateShipFilter(shipFilter, killmail) {
    for(let i in shipFilter) {
        const status = shipFilter[i].status
        if((status == 'both' || status == 'victim') && (killmail.shipID == shipFilter[i].id)) return shipFilter[i].filterID // victim match
        if(status == 'both' || status == 'attacker') {
            for(let j in killmail.attackerShips) if(killmail.attackerShips[j] == shipFilter[i].id) return shipFilter[i].filterID // attacker match
        }
    }
    return false
}

/**
 * Iterate over all group filters and test if the killmail matches any of them. The status
 * can be used to further filter to show only victims, only attackers or both.
 *
 * -- Need to refactor this and testShipFilter into one method
 *
 * @param   {object}   groupFilter object representing a collection of ship groups
 * @param   {object}   killmail    killmail object from reducer
 * @param   {String}   status      'both, 'victim', or 'attacker'
 * @returns {Boolean}   if the killmail matches any group filter
 */
function evaluateGroupFilter(groupFilter, killmail) {
    for(let i in groupFilter) {
        const status = groupFilter[i].status
        const shipID = groups[groupFilter[i].name]
        if((status == 'both' || status == 'victim') && shipID.indexOf(killmail.shipID) !== -1) return groupFilter[i].filterID // victim match
        if(status == 'both' || status == 'attacker') {
            for(let j in killmail.attackerShips) if(shipID.indexOf(killmail.attackerShips[j]) !== -1) return groupFilter[i].filterID // attacker match
        }
    }
    return false
}

/**
 * Iterate over all alliance filters and test if the killmail matches any of them.
 * @param allianceFilter
 * @param killmail - killmail object from reducer
 * @returns {boolean} - if the killmail matches any alliance filter
 */
function evaluateAllianceFilter(allianceFilter, killmail) {
    for(let i in allianceFilter) {
        const status = allianceFilter[i].status
        if ((status == 'both' || status == 'victim') && (killmail.victimAllianceID == allianceFilter[i].id)) return allianceFilter[i].filterID // victim match
        if ((status == 'both' || status == 'attacker') && (killmail.attackerAllianceIDs.indexOf(parseInt(allianceFilter[i].id)) !== -1)) return allianceFilter[i].filterID
    }
    return false
}

/**
 * Iterate over all alliance filters and test if the killmail matches any of them.
 * @param allianceFilter
 * @param killmail - killmail object from reducer
 * @returns {boolean} - if the killmail matches any alliance filter
 */
function evaluateCorporationFilter(corporationFilter, killmail) {
    for(let i in corporationFilter) {
        const status = corporationFilter[i].status
        if ((status == 'both' || status == 'victim') && (killmail.victimCorpID == corporationFilter[i].id)) return corporationFilter[i].filterID // victim match
        if ((status == 'both' || status == 'attacker') && (killmail.attackerCorporationIDs.indexOf(parseInt(corporationFilter[i].id)) !== -1)) return corporationFilter[i].filterID
    }
    return false
}

/**
 * Iterate over all alliance filters and test if the killmail matches any of them.
 * @param allianceFilter
 * @param killmail - killmail object from reducer
 * @returns {boolean} - if the killmail matches any alliance filter
 */
function evaluateCharacterFilter(characterFilter, killmail) {
    for(let i in characterFilter) {
        const status = characterFilter[i].status
        if ((status == 'both' || status == 'victim') && (killmail.victimID == characterFilter[i].id)) return characterFilter[i].filterID // victim match
        if ((status == 'both' || status == 'attacker') && (killmail.attackerIDs.indexOf(parseInt(characterFilter[i].id)) !== -1)) return characterFilter[i].filterID
    }
    return false
}
/**
 * Iterate over all region filters and test if the killmail matches any of them.
 * @param regionFilter - array of regions to filter against
 * @param killmail - killmail object from reducer
 * @returns {boolean} - if the killmail matches any region filter
 */
function evaluateRegionFilter(regionFilter, killmail) {
    for(let i in regionFilter) {
        if(regionFilter[i].name == killmail.region)  return regionFilter[i].filterID
    }
    return false
}

function evaluateISKFilter(killmail, minIsk, maxIsk) {
    const val = (killmail.value) / 1000000
    if(!val) return false
    if(parseInt(minIsk) > parseInt(maxIsk)) return true
    if(minIsk.trim() == '' && maxIsk.trim() == '') return true
    if(minIsk.trim() != '' && parseInt(minIsk) > val ) return false
    if(maxIsk.trim() != '' && parseInt(maxIsk) < val) return false

    return `ISK-${minIsk}-${maxIsk}`
}

function evaluatePlayersInvolvedFilter(killmail, minPlayers, maxPlayers) {
    const val = killmail.attackerCount
    if(!val) return false
    if(parseInt(minPlayers) > parseInt(maxPlayers)) return true
    if(minPlayers.trim() == '' && maxPlayers.trim() == '') return true
    if(minPlayers.trim() != '' && parseInt(minPlayers) > val ) return false
    if(maxPlayers.trim() != '' && parseInt(maxPlayers) < val) return false
    return `Players-${minPlayers}-${maxPlayers}`
}


/**
 * Consolidate all filterIDs from the filter object into an array of integers
 * @param props - Redux state
 * @returns {Array} - Array of integers
 */
function getActiveFilterIDs(props) {
    let filterIDs = []
    filterIDs = props.system_filter.map((system_filter) => {
        return system_filter.filterID
    }).concat(filterIDs)

    for (let filter in props.filters) {
        filterIDs = props.filters[filter].map((filter) => {
            return filter.filterID
        }).concat(filterIDs)
    }
    return filterIDs
}

