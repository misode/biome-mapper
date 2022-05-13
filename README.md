# biome-mapper

Simple node script to convert biome IDs in a folder of region files

## Usage

```
node index.js path/to/region
```

### Versions before 21w43a
On line 6 in `index.js` edit the logic to convert the biome IDs.

The example `b >= 174 ? b + 2 : b` adds two to the biome ID if the original biome ID is >= 174.

### Versions after 21w43a
On line 10 in `index.js` edit the logic to convert the biome IDs.

The example converts plains into deserts.

You can also convert biomes based on their position (section based)

```js
function convertBiomeStr(id, chunkX, chunkZ, sectionY) {
	if (chunkX > 3) {
		return 'minecraft:desert'
	}
	return 'minecraft:plains'
}
```
