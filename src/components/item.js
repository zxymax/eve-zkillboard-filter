import React, { Component } from 'react'

class Item extends Component {

    constructor(props) {
      super(props);
       this.showZkill = this.showZkill.bind(this)
       this.showSystemDotlan = this.showSystemDotlan.bind(this)
    }

    showZkill() {
      const killUrl = `https://zkillboard.com/kill/${this.props.item.killID}/`
      const redirectWindow = window.open(killUrl, '_blank')
      redirectWindow.location
    }

    showSystemDotlan() {
        let region = this.props.item.region.replace(/\s/g, '_')
        const systemURL = `http://evemaps.dotlan.net/map/${region}/${this.props.item.system}`
        const redirectWindow = window.open(systemURL, '_blank')
        redirectWindow.location
    }

    render() {
      const { item, key } = this.props
      const imgUrl = `https://image.eveonline.com/Type/${item.shipID}_64.png`

        item.victimName = formatLabel(item.victimName, 20)
      let victimGroup = formatLabel(chooseName(item.victimCorp, item.victimAlliance), 23)
      let attackerGroup = formatLabel(chooseName(item.attackerCorporation, item.attackerAlliance), 33)
      let secClass = getSecurityClass(item.security)

      return (
            <div className="item-row" key={ key }>
              <div onClick={ this.showZkill } className="victim-img"><img src={ imgUrl } height="42" width="42" /></div>
              <div className="victim-info" onClick={ this.showZkill }>
                  <span className="victim-name">{ item.victimName }</span>
                  <span className="victim-group">{ victimGroup }</span>
              </div>
              <div className="attacker-group">
                  <span className="attacker-label"> { attackerGroup } ({ item.attackerCount })</span>
              </div>
              <div className="system-info"  onClick={ this.showSystemDotlan }>
                  <span className="system-name" >{ item.system }</span>
                  <span className="system-sec"> (<span className={ secClass }>{ item.security }</span>)</span>
                  <span className="system-region"> { item.region }</span>
              </div>
              <div className="kill-time">{ item.time }</div>
            </div>
      )
    }
}

export default Item

function getSecurityClass(security) {
    if(security > 0.4) return 'high'
    else if(security > 0) return 'low'
    else return 'null'
}

function chooseName(initial, preferred) {
    if(preferred !== '') return preferred
    return initial
}

function formatLabel(label, maxChars) {
    if(label.length > maxChars) return `${label.substring(0, maxChars - 3)}...`
    return label
}