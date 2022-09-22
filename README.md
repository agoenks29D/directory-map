# Directory Map

Directory mapping for Node.js

```bash
npm i directory-map
```

## Usage

```javascript
const dirmap = require('directory-map');

var map = dirmap.resultArray(__dirname, {
	maxDepth: 4
});

console.log(map);
```

```javascript
const dirmap = require('directory-map');

var map = dirmap.resultObject(__dirname, {
	maxDepth: 4
});

console.log(map);
```

## Options

| Name | Description |
|------|-------------|
| `maxDepth` | Maximum directory depth |
