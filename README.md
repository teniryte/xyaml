# xyaml

YAML extension

## Features

### Loading yaml from file

```js
const xyaml = require('xyaml');

let data = xyaml.loadFile(__dirname + '/settings.yaml');
```

### Importing xyaml file to property

```yaml
ui: ~import './ui.yaml'

server: ~import server from './ui.yaml'
```

### Including xyaml file into current file

```yaml
~include: './common.yaml'

~include: server from './common.yaml'
```

### Download and import file

```yaml
ui: $import 'https://cdn.sencort.com/test.yaml'
```

### Download and include file

```yaml
$include: 'https://cdn.sencort.com/test.yaml'
```

### Referencing to data tree

```yaml
host: localhost
port: 8000
url: ${self.host + ':' + self.port}
```

### Context

```yaml
name: ${context.name}
```

### Functions

```yaml
add: fn (a, b) {
    return a + b;
}
```
