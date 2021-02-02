# nodes

Implementation of nodes of a tree structure where the nodes are either folders or final nodes (documents for example).

## Installation

```sh
npm install @marcoparrone/nodes
```

## Usage

```js
import {
  all_nodes_have_all_fields_p,
  add_node, get_node, change_node_field, delete_node, swap_nodes_values,
  move_node_backward, move_node_forward, move_node_upward, move_node_downward,
  load_nodes, save_nodes, export_nodes, import_nodes
} from '@marcoparrone/nodes';
```

See the src/nodes.js file for informations about the functions provided by this library.
