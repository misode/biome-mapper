# biome-mapper

Simple node script to convert biome IDs in a folder of region files

## Usage

On line 11 in `index.js` edit the logic to convert the biome IDs.

The example `b => b >= 174 ? b + 2 : b` adds two to the biome ID if the original biome ID is >= 174.

Then run:
```
node index.js path/to/region
```
