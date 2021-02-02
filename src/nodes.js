// nodes.js  ---  nodes (of an array of tree structures) implementation.
//
// Every node has these mandatory fields:
//
//  * type: the value is a string, it's 'folder' for a node with children elements, or something other for a final node;
//  * visible: an integer, if zero then the node is considered as if it was deleted;
//
// eventually the property 'children' contains an array of children nodes.
//
// The "nodes" parameter is always an array of nodes.
//
// The "cursor" parameter is a string and has this format: N1.N2.N3, for example 2.3.5 means the 5th children of the 3rd children of the 2nd element.

import saveAs from 'file-saver';

// Return true if all the nodes have all the fields in the "fields" array of strings.
//
function all_nodes_have_all_fields_p(nodes, fields) {
  if (nodes) {
    for (let n = 0; n < nodes.length; n++) {
      for (let f = 0; f < fields.length; f++) {
        if (nodes[n][fields[f]] === undefined) {
          return false;
        }
      }
      try {
        if (!all_nodes_have_all_fields_p(nodes[n].children, fields)) {
          return false;
        }
      } catch (err) {
        console.log('all_nodes_have_all_fields_p: exceeding nodes will be considered ok because of error: ' + err);
        continue;
      }
    }
  }
  return true;
}

// Add node to nodes, return the cursor of the new node.
//
function add_node(nodes, cursor, newnode) {
  let oldCursor = [];
  let newCursor = [];
  let node = null;
  let tmpnodes = [];
  if (cursor === undefined || cursor === null) {
    newCursor = nodes.length.toString();
    tmpnodes = nodes;
  } else {
    oldCursor = cursor.split(".");
    if (oldCursor.length > 0) {
      tmpnodes = nodes;
      node = tmpnodes[oldCursor[0]];
      newCursor.push(oldCursor[0]);
    }
    for (let i = 1; i < oldCursor.length; i++) {
      tmpnodes = node.children;
      node = tmpnodes[oldCursor[i]];
      newCursor.push(oldCursor[i]);
    }
    if (node.children === undefined || node.children === null) {
      node.children = [];
    }
    tmpnodes = node.children;
    newCursor.push((node.children.length).toString());
    newCursor = newCursor.concat().join('.');
  }
  tmpnodes.push(newnode);
  return newCursor;
}

// Return the node at cursor.
//
function get_node(nodes, cursor) {
  let oldCursor = [];
  let node = null;
  if (nodes && cursor) {
    oldCursor = cursor.split(".");
    if (oldCursor.length > 0) {
      node = nodes[oldCursor[0]];
    }
    for (let i = 1; node && i < oldCursor.length; i++) {
      node = node.children[oldCursor[i]];
    }
  }
  return node;
}

// Change to new_value the value of the field "field" for node at cursor. 
//
// Return true on success, false on failure.
//
function change_node_field(nodes, cursor, field, new_value) {
  let node = get_node(nodes, cursor);
  if (node) {
    node[field] = new_value;
    return true;
  }
  return false;
}

// Delete node at cursor. Really it just makes it invisible.
//
// Return true on success, false on failure.
//
function delete_node(nodes, cursor) {
  return change_node_field(nodes, cursor, 'visible', 0);
}

// Swap the values of nodes a and b.
//
function swap_nodes_values(a, b) {
  const emptynode = {};
  const akeys = Object.keys(a);
  const bkeys = Object.keys(b);
  let tmpnode = {};

  akeys.forEach((key, index) => {
    tmpnode[key] = a[key];
    a[key] = emptynode[key];
  });

  bkeys.forEach((key, index) => {
    a[key] = b[key];
    b[key] = emptynode[key];
  });

  akeys.forEach((key, index) => {
    b[key] = tmpnode[key];
  });
}

// swap the values of the node at cursor with the values of the previous one.
//
// Return true on success, false on failure.
//
function move_node_backward(nodes, cursor) {
  let oldCursor = cursor.split(".");
  let node = null;
  let othernode = null;
  let i = 0;
  let tmpIntCusor = 0;
  let tmpParent = {};
  if (oldCursor.length > 0) {
    node = nodes[oldCursor[0]];
    if (oldCursor.length === 1) {
      tmpIntCusor = parseInt(oldCursor[0]);
      for (let otherID = tmpIntCusor - 1; otherID >= 0 && otherID < nodes.length; otherID--) {
        if (nodes[otherID].visible !== 0) {
          othernode = nodes[otherID];
          break;
        }
      }
    } else {
      for (i = 1; i < oldCursor.length; i++) {
        tmpParent = node;
        node = node.children[oldCursor[i]];
      }
      i--;
      tmpIntCusor = parseInt(oldCursor[i]);
      for (let otherID = tmpIntCusor - 1; otherID >= 0 && otherID < tmpParent.children.length; otherID--) {
        if (tmpParent.children[otherID].visible !== 0) {
          othernode = tmpParent.children[otherID];
          break;
        }
      }
    }
    if (othernode !== null) {
      swap_nodes_values(node, othernode);
      return true;
    }
  }
  return false;
}

// swap the values of the node at cursor with the values of the following one.
//
// Return true on success, false on failure.
//
function move_node_forward(nodes, cursor) {
  let oldCursor = cursor.split(".");
  let node = null;
  let othernode = null;
  let i = 0;
  let tmpIntCusor = 0;
  let tmpParent = {};
  if (oldCursor.length > 0) {
    node = nodes[oldCursor[0]];
    if (oldCursor.length === 1) {
      tmpIntCusor = parseInt(oldCursor[0]);
      for (let otherID = tmpIntCusor + 1; otherID >= 0 && otherID < nodes.length; otherID++) {
        if (nodes[otherID].visible !== 0) {
          othernode = nodes[otherID];
          break;
        }
      }
    } else {
      for (i = 1; i < oldCursor.length; i++) {
        tmpParent = node;
        node = node.children[oldCursor[i]];
      }
      i--;
      tmpIntCusor = parseInt(oldCursor[i]);
      for (let otherID = tmpIntCusor + 1; otherID >= 0 && otherID < tmpParent.children.length; otherID++) {
        if (tmpParent.children[otherID].visible !== 0) {
          othernode = tmpParent.children[otherID];
          break;
        }
      }
    }
    if (othernode !== null) {
      swap_nodes_values(node, othernode);
      return true;
    }
  }
  return false;
}

// move node out of its current parent node.
//
// Return true on success, false on failure.
//
function move_node_upward(nodes, cursor, emptynode) {
  let oldCursor = cursor.split(".");
  let node = null;
  let othernode = null;
  let i = 0;
  let tmpParent = {};
  let tmpParentParent = {};

  if (oldCursor.length > 2) {
    // I find the node, the parent, and the parent's parent.
    node = nodes[oldCursor[0]];
    for (i = 1; i < oldCursor.length; i++) {
      tmpParentParent = tmpParent;
      tmpParent = node;
      node = node.children[oldCursor[i]];
    }

    // I add a new element to the parent's parent "children" array.
    tmpParentParent.children.push(emptynode);

    // I swap the new element with the selected element.
    othernode = tmpParentParent.children[tmpParentParent.children.length - 1];
    if (othernode !== null) {
      swap_nodes_values(node, othernode);
      return true;
    }
  } else if (oldCursor.length > 1) {
    // I find the node, I already know the parent's parent (it's nodes).
    node = nodes[oldCursor[0]];
    for (i = 1; i < oldCursor.length; i++) {
      node = node.children[oldCursor[i]];
    }

    // I add a new element to the parent's parent "children" array.
    nodes.push(emptynode);

    // I swap the new element with the selected element.
    othernode = nodes[nodes.length - 1];
    if (othernode !== null) {
      swap_nodes_values(node, othernode);
      return true;
    }
  }
  return false;
}

// move node inside the next folder node.
//
// Return true on success, false on failure.
//
function move_node_downward(nodes, cursor, emptynode) {
  let oldCursor = cursor.split(".");
  let node = null;
  let othernode = null;
  let nextfolder = null;
  let i = 0;
  let tmpIntCusor = 0;
  let tmpParent = {};

  if (oldCursor.length > 0) {
    // I find the element and the next folder element.
    node = nodes[oldCursor[0]];
    if (oldCursor.length === 1) {
      tmpIntCusor = parseInt(oldCursor[0]);
      for (let otherID = tmpIntCusor + 1; otherID >= 0 && otherID < nodes.length; otherID++) {
        if (nodes[otherID].visible !== 0 && nodes[otherID].type === 'folder') {
          nextfolder = nodes[otherID];
          break;
        }
      }
    } else {
      for (i = 1; i < oldCursor.length; i++) {
        tmpParent = node;
        node = node.children[oldCursor[i]];
      }
      i--;
      tmpIntCusor = parseInt(oldCursor[i]);
      for (let otherID = tmpIntCusor + 1; otherID >= 0 && otherID < tmpParent.children.length; otherID++) {
        if (tmpParent.children[otherID].visible !== 0 && tmpParent.children[otherID].type === 'folder') {
          nextfolder = tmpParent.children[otherID];
          break;
        }
      }
    }
    if (nextfolder !== null) {
      // I add a new element to the next folder "children" array.
      if (nextfolder.children === undefined) {
        nextfolder.children = [];
      }
      nextfolder.children.push(emptynode);

      // I swap the new element with the selected element.
      othernode = nextfolder.children[nextfolder.children.length - 1];
      swap_nodes_values(node, othernode);
      return true;
    }
  }
  return false;
}

// Load nodes from localStorage item "item", and return them.
//
function load_nodes(item) {
  let nodes = localStorage.getItem(item);
  if (nodes) {
    return JSON.parse(nodes);
  }
}

// Save nodes to localStorage item "item".
//
function save_nodes(nodes, item) {
  let newnodes = [];

  // Save in local storage, skipping deleted nodes.
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].visible !== 0) {
      newnodes.push(nodes[i]);
    }
  }
  localStorage.setItem(item, JSON.stringify(newnodes));
}

// Export nodes to file name-timestamp.json
//
function export_nodes(nodes, name) {
  let newnodes = [];
  // Pad N to two digits.
  const pad2 = (n) => { return n < 10 ? '0' + n : n; }
  // Return a timestamp.
  const timestamp = () => {
    let dt = new Date();
    return dt.getFullYear() + pad2(dt.getMonth()) + pad2(dt.getDay()) + 'T' + pad2(dt.getHours()) + pad2(dt.getMinutes()) + pad2(dt.getSeconds());
  }
  // Export to JSON file, skipping deleted nodes.
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].visible !== 0) {
      newnodes.push(nodes[i]);
    }
  }
  // Save the generated JSON file.
  saveAs(new Blob([JSON.stringify(newnodes)], { type: "application/json;charset=utf-8" }),
    name + '-' + timestamp() + '.json');
}

// Import new nodes from evt.target.files[0] JSON file, overwriting old nodes on success.
//
// fields_to_check is an array of strings containing the keys of the mandatory fields
// that must be found in every node, if they are not found in all the nodes, then the
// nodes will not be imported.
//
// text_error_loadfile is the error string to display when there is an error loading the file,
// for example: "error: cannot load file."
//
// text_error_fileformat is the error string to display when the format of the file is wrong,
// for example: "error: file format is wrong."
//
// call_on_success is a callback function to call when the nodes are imported successfully.
//
function import_nodes(nodes, evt, fields_to_check, text_error_loadfile, text_error_fileformat, call_on_success) {
  let file = evt.target.files[0];
  if (!file) {
    if (evt.target.files.length > 0) {
      alert(text_error_loadfile);
    }
    return;
  }
  let reader = new FileReader();
  reader.onload = (evt) => {
    let newnodes = {};
    let missingFields = false;
    try {
      newnodes = JSON.parse(evt.target.result);
    } catch {
      alert(text_error_fileformat);
    } finally {
      if (!all_nodes_have_all_fields_p(newnodes, fields_to_check)) {
        missingFields = true;
        alert(text_error_fileformat);
      }
      if (missingFields === false && newnodes.length > 0) {
        // Delete extra entries in the old nodes.
        nodes.splice(newnodes.length - 1);
        // Overwrite old nodes with new nodes.
        for (let i = 0; i < newnodes.length; i++) {
          nodes[i] = newnodes[i];
        }
        // Call the callback function.
        if (call_on_success) {
          call_on_success();
        }
      }
    }
  };
  reader.readAsText(file);
}

export {
  all_nodes_have_all_fields_p,
  add_node, get_node, change_node_field, delete_node, swap_nodes_values,
  move_node_backward, move_node_forward, move_node_upward, move_node_downward,
  load_nodes, save_nodes, export_nodes, import_nodes
};