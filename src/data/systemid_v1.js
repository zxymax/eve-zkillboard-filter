 let systems = []
  Object.keys(systemData).forEach(function (id) {
      const systemObject = systemData[id]
      let system = {
        typeID: id,
        name: systemObject.name,
		region: systemObject.region,
		security: systemObject.security,
		x: systemObject.x,
		y: systemObject.y,
		z: systemObject.z
      }
      systems.push(system)
  })