const { getOptional, getTag, loadChunk, readRegion, saveChunk, writeRegion, getListTag} = require('deepslate')
const fg = require('fast-glob')
const fs = require('fs')

function convertBiomeNum(id) {
	return id >= 174 ? id + 2 : id
}

function convertBiomeStr(id) {
	if (id === 'minecraft:plains') {
		return 'minecraft:desert'
	}
	return id
}

function processChunk(chunk) {
	const root = loadChunk(chunk).nbt
	const dataVersion = getTag(root.value, 'DataVersion', 'int')
	if (dataVersion >= 2836) {
		const sections = getListTag(root.value, 'sections', 'compound')
		let dirtySection = false
		for (const section of sections) {
			const biomes = getOptional(() => getTag(section, 'biomes', 'compound'), undefined)
			if (biomes) {
				const palette = getListTag(biomes, 'palette', 'string')
				const newPalette = palette.map(convertBiomeStr)
				biomes['palette'].value = {
					type: 'string',
					value: newPalette
				}
				dirtySection = true
			}
		}
		if (dirtySection) {
			dirty = true
			saveChunk(chunk)
		}
	} else {
		const level = getTag(root.value, 'Level', 'compound')
		const biomes = getOptional(() => getTag(level, 'Biomes', 'intArray'), undefined)
		if (biomes) {
			const newBiomes = biomes.map(convertBiomeNum)
			level['Biomes'].value = newBiomes
			dirty = true
			saveChunk(chunk)
		}
	}
	return true
}

function convertRegion(regionFile) {
	const chunks = readRegion(regionFile)

	let dirty = false
	chunks.forEach(chunk => {
		if (processChunk(chunk)) {
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
