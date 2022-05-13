const { getOptional, getTag, readChunk, readRegion, writeChunk, writeRegion } = require('@webmc/nbt')
const fg = require('fast-glob')
const fs = require('fs')

function processChunk(chunks, chunk) {
	const root = readChunk(chunks, chunk.x, chunk.z).nbt
	const level = getTag(root.value, 'Level', 'compound')
	const biomes = getOptional(() => getTag(level, 'Biomes', 'intArray'), undefined)

	if (biomes) {
		const newBiomes = biomes?.map(b => b >= 174 ? b + 2 : b)
		level['Biomes'].value = newBiomes
		
		dirty = true
		writeChunk(chunks, chunk.x, chunk.z, root)
	}
	return true
}

function convertRegion(regionFile) {
	const chunks = readRegion(regionFile)

	let dirty = false
	chunks.forEach(chunk => {
		if (processChunk(chunks, chunk)) {
			dirty = true
		}
	})

	if (dirty) {
		return writeRegion(chunks)
	} else {
		return false
	}
}

function processFile(file) {
	const name = file.replace(/.*\//g, '')
	console.log(`Reading ${name}...`)
	fs.readFile(file, null, (err, data) => {
		if (err) {
			console.log(`Error reading ${name}`)
			return
		}
		const result = convertRegion(data)
		if (result) {
			console.log(`Writing to ${name}...`)
			fs.writeFile(file, result, {}, (err) => {
				if (err) {
					console.log(`Error writing ${name}`)
					return
				}
				console.log(`Converted ${name}!`)
			})
		} else {
			console.log(`Ignored ${name}`)
		}
	})
}

const args = process.argv.slice(2)
fg(`${args[0]}/r.*.mca`).then(files => {
	files.forEach(processFile)
})
