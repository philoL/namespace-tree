/************************************************
 * D3 sync tree render function
 ************************************************/
var nameTreeData = [
  {
    "components": [],
    "parent": "null",
    "children": []
  }
];

// var colorSet = ["#d1ebbb", "#7bafd0", "#deb276", "#92c3ad", "#f49158"];

var colorSet = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", 
                "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", 
                "#651067", "#329262", "#5574a6", "#3b3eac"];

var dataNodeColor = "#AAAAAA";

// ************** Generate the tree diagram  *****************
var width_total = 4000;
var height_total = 754;
//document.body.clientHeight - document.getElementById("connect-section").offsetHeight- document.getElementById("option-section").offsetHeight;

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = width_total - margin.right - margin.left,
    height = height_total - margin.top - margin.bottom;

var i = 0,
    duration = 750,
    nameRoot;

var tree = d3.layout.tree().size([height, width]);
var multiParents = [];

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });
 
var svgNameTree,
    svgNameTreeDetails;

function createNameTreeSvg() {
  svgNameTree = d3.select("#view-container").append("svg")
    .attr("id", "nameTree")
    .attr("viewbox", "0, 0, " + width_total + ", " + height_total)
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.select("svg#nameTree").append("text")
    .attr("x", 10)
    .attr("y", 20)
    .text("Name Tree");

  svgNameTreeDetails = d3.select("#view-container").append("svg")
    .attr("id", "nameTreeDetails")
    .attr("viewbox", "0, 0, " + 850 + ", " + 300)
    .attr("width", 850 + margin.right + margin.left)
    .attr("height", 300 + margin.top + margin.bottom)
    .append("g")
    .attr("id", "nameTreeDetails")
    .attr("transform", "translate(" + margin.left*0.5 + "," + margin.top*2 + ")");

  d3.select("svg#nameTreeDetails").append("text")
    .attr("x", 10)
    .attr("y", 20)
    .text("Packet Details");

  d3.select(self.frameElement).style("height", "500px");

  nameRoot = nameTreeData[0];
  updateNameTree(nameRoot);
}

function updateNameTree(source) {
  // Summary about how this D3 .update(), .enter(), .exit(), .transition() abstraction works

  // Compute the new tree layout.
  var nodes = tree.nodes(nameRoot).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 120; });

  // Update the nodes
  var node = svgNameTree.selectAll("g.node")
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { 
      return "translate(" + source.y + "," + source.x + ")"; 
    })
    .on("click", click)
    .on("dblclick", doubleClick)
    .on("mouseover", function(d){ d3.select(this).selectAll("text").style("display", "block"); })
    .on("mouseout", function(d){ 
      if (d.textName.length < 20 || d.depth < 2) {
        d3.select(this).selectAll("text").style("display", "block");
      } else {
        d3.select(this).selectAll("text").style("display", "none");
      }
    });

  nodeEnter.append("circle")
    .attr("r", 1e-6)
    .style("fill", function(d) {
      if (d.children == undefined) 
        return dataNodeColor;
      
      return colorSet[d.depth % colorSet.length];
    });
  
  // append text on top of the nodes
  var dy = 0.5;

  nodeEnter.append("text")
    .attr("id", function(d) {  return "nodText";})
    .attr("x", function(d) { return d.children || d._children ? 0 : 0; })
    .attr("dy", "-" + dy.toString() + "em")
    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
    .text(updateText)
    .style("fill-opacity", 1)
    .style("display", function(d) {
      if (d.textName.length < 20 || d.depth < 2) {
        return "block";
      } else {
        return "none";
      }
    });

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) { 
      return "translate(" + d.y + "," + d.x + ")"; 
    });

  nodeUpdate.select("circle")
    .attr("r", 10)
    .style("stroke", function(d) {
      if (d._children) {
        return "#000";
      }
      return '#fff';
    })
    .style("fill", function(d) {
      if (d.children == undefined && !d._children) 
        return dataNodeColor;
      
      return colorSet[d.depth % colorSet.length];
    });

  nodeUpdate.select("text")
    .text(updateText)
    .style("display", function(d) {
      if (d.textName.length < 20 || d.depth < 2) {
        return "block";
      } else {
        return "none";
      }
    });

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);

  // Update the links
  var link = svgNameTree.selectAll("path.link")
    .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = {x: source.x, y: source.y};
      return diagonal({source: o, target: o});
    });

  // Transition links to their new position.
  link.transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr("d", function(d) {
      var o = {x: source.x, y: source.y};
      return diagonal({source: o, target: o});
    })
    .remove();

  // Stash the old positions for transition.
  // nodes.forEach(function(d) {
  //   d.x0 = d.x;
  //   d.y0 = d.y;
  // });
  
  // for trust relationship links
  if (showTrustRelationship) {
    var multiLinks = svgNameTree.selectAll("g.additionalParentLink")
      .data(multiParents, function(d) {
        return d.child.id; 
      });
    
    // remove the old links to refresh
    svgNameTree.selectAll('path.additionalParentLink').remove();
    multiLinks.enter().insert("path", "g")
      .attr("class", "additionalParentLink")
      .attr("d", function(d) {
        console.log("** trust relationship append **");
        var oTarget = {
          x: d.parent.x,
          y: d.parent.y
        };
        var oSource = {
          x: d.child.x,
          y: d.child.y
        };
        return diagonal({
          source: oSource,
          target: oTarget
        });
      });
  } else {
    svgNameTree.selectAll('path.additionalParentLink').remove();
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function updateText(d) {
  var name;

  //for the root
  if (d.components.length == 0) {
    name = "/";
  } else if (cutOffLength <= 0) {
    name = d.components.join("/");
  } else if (d.is_content === true) {
    name = d.components.join("/");
  } else {
    for (var idx in d.components) {
      var componentString = d.components[idx];
      if (componentString.length > cutOffLength + 3) {
        name += componentString.substring(0, cutOffLength) + ".../";
      } else {
        name += componentString + "/";
      }
    }
  }

  d["textName"] = name;
  return name;
}

// Toggle children display on click.
function click(d) {
  console.log(d, fetchContentOfNode(d));

  if (!d.children && !d._children) {
    //leaf
    d3.select("g#nameTreeDetails")
      .selectAll("*")
      .remove();

    d3.select("g#nameTreeDetails")
      .append("foreignObject")
      .attr("width", 800)
      .attr("height", 500)
      .append("xhtml:body")
      .style("font", "12px 'Helvetica Neue'")
      .html("<strong>Name:</strong><br>"+GetFullName(d)+"<br><br><strong>Content:</strong><br>"+fetchContentOfNode(d));
  }  

  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  updateNameTree(nameRoot);
}

function doubleClick(d) {
  var textElement = document.getElementById("text-name-" + d.id);
  if (textElement !== undefined) {
    console.log(textElement.style.display);
    if (textElement.style.display === "block") {
      textElement.style.display = "none";
    } else {
      textElement.style.display = "block";
    }
  }
}

function getTheMaxChildLength(node){
  //find the maximun components length among children
  var maxLength = 0;
  for (var i in node.children) {
    console.log("####", node.children[i]);
    if (!"components" in node.children[i]) {
      continue;
    }
    
    if (node.children[i]["components"].length > maxLength)
      maxLength = node.children[i]["components"].length;
  }

  return maxLength;
}

function findNodeInNameTree(node, dataNameString) {
  console.log("findNodeInNameTree node: ", node, " dataNameString: ", dataNameString);
  if (node.components[0] == dataNameString) {
    return node;
  } else {
    for (var i in node.children) {
      var child = node.children[i];
      var result = findNodeInNameTree(child, dataNameString);
      if (result != null) 
        return result;
    }
  }
  return null;
}

function GetFullName(node) {
  //only when a node is the leaf (a data) returns the full name
  if (node.children) {
    return "";
  } else {
    var tmpNode = node.parent;
    var fullName = node.textName;
    while (typeof(tmpNode.textName) === "string") {
      if (tmpNode.textName == "/")
        fullName = tmpNode.textName+fullName;
      else 
        fullName = tmpNode.textName+"/"+fullName;
      tmpNode = tmpNode.parent;

      if (tmpNode == undefined)
        break;
    }
    return fullName;
  }
}

function findLeafInNameTree(node, dataNameString) {
  // console.log("findLeafInNameTree node: ", node, " dataNameString: ", dataNameString);
  var fullName = GetFullName(node);
  // console.log(fullName);
  if (fullName.startsWith(dataNameString)) {
    return node;
  } else {
    for (var i in node.children) {
      var child = node.children[i];
      var result = findLeafInNameTree(child, dataNameString);
      if (result != null) 
        return result;
    }
  }
  return null;
}

function findLeavesInNameTree(result, node, dataNameString) {
  // console.log("findLeafInNameTree node: ", node, " dataNameString: ", dataNameString);
  var fullName = GetFullName(node);
  if (fullName.startsWith(dataNameString)) {
    result.push(node);
  } else {
    for (var i in node.children) {
      var child = node.children[i];
      findLeavesInNameTree(result, child, dataNameString);
    }
  }
}

function removeFromTree(data) {
  var dataName = data.getName();
  var nameSize = dataName.size();

  var treeNode = nameRoot;
  var idx = 0;
  
  var matchStack = [nameRoot];

  while (idx < nameSize && treeNode["children"].length > 0) {
    childMatch = false;
    for (var child in treeNode["children"]) {
      var tempNode = treeNode["children"][child];

      if (tempNode["components"][0] == dataName.get(idx).toEscapedString()) {
        childMatch = true;
        // this child matches the initial component
        idx += 1;
        for (var i = 1; i < tempNode["components"].length; i++) {
          var matchComponent = "";
          if (idx < nameSize) {
            matchComponent = dataName.get(idx).toEscapedString();
          }
          if (tempNode["components"][i] != matchComponent) {
            // we cannot fully match with this node, meaning no matching data entries exist
            return -1;
          } else {
            idx ++;
          }
        }

        // we can fully match with this node, need to try its children
        matchStack.push(tempNode);
        treeNode = tempNode;
        break;
      }
    }
    if (!childMatch) {
      return -1;
    }
  }
  
  if (idx < nameSize) {
    // we were at the end of our tree, yet still no match
    return -1;
  }
  
  // for each remove call, we remove one content element associated with what we've found
  if (treeNode["children"].length == 0) {
    // we found the name, but don't see any children in it
    return -1;
  }
  var removeIdx = -1;
  for (var childIdx = 0; childIdx < treeNode["children"].length; childIdx ++) {
    if (treeNode["children"][childIdx]["is_content"] == true) {
      removeIdx = childIdx;
    }
  }
  
  if (removeIdx < 0) {
    // we found the name, but don't see data object associated with it
    return -1;
  }
  
  // we can now update the tree according to matchStack
  while (matchStack.length > 0) {
    var tempNode = matchStack.pop();
    tempNode["children"].splice(removeIdx, 1);
    removeIdx = -1;

    // remove propagates to parent if needed
    if (tempNode["children"].length == 0) {
      if (matchStack.length > 0) {
        var parentElement = matchStack[matchStack.length - 1];
        for (var childIdx = 0; childIdx < parentElement["children"].length; childIdx ++ ) {
          // object pointer equal check
          if (parentElement["children"][childIdx] == tempNode) {
            removeIdx = childIdx;
            // console.log("remove: " + removeIdx);
          }
        }
      }
    } else if (tempNode["children"].length == 1 && tempNode["children"][0]["is_content"] !== true && tempNode != nameRoot) {
      // merge if needed (except nameRoot)
      var childNode = tempNode["children"][0];
      tempNode["components"].push.apply(tempNode["components"], childNode["components"]);
      tempNode["children"] = childNode["children"];
    }
    if (removeIdx < 0) {
      break;
    }
  }

  updateNameTree(nameRoot);
  return 0;
}

function insertToTree(root, data, ignoreMaxBranchingDepth) {
  var dataName = data.getName();
  var nameSize = dataName.size();

  var treeNode = root;
  var idx = 0;

  if (treeNode["children"] === undefined) {
    treeNode["children"] = [];
  }

  //get content
  var content = "";
  try {
    content = data.getContent().buf().toString('binary');
  } catch (e) {
    content = "[DATA]";
  }

  // update names
  while (idx < nameSize && treeNode["children"].length > 0) {
    childMatch = false;
    for (var child in treeNode["children"]) {
      var tempNode = treeNode["children"][child];

      if (tempNode["components"][0] == dataName.get(idx).toEscapedString()) {
        childMatch = true;
        // this child matches the initial component
        idx += 1;
        for (var i = 1; i < tempNode["components"].length; i++) {
          var matchComponent = "";
          if (idx < nameSize) {
            matchComponent = dataName.get(idx).toEscapedString();
          }
          if (tempNode["components"][i] != matchComponent) {
            // we cannot fully match with this node, need to break this node into two
            remainingComponents = tempNode["components"].slice(i, tempNode["components"].length);
            var remainingChild = {
              "components": remainingComponents,
              "children": tempNode["children"]
            };

            tempNode["components"] = tempNode["components"].slice(0, i);
            
            var newChildComponents = [];
            while (idx < nameSize) {
              newChildComponents.push(dataName.get(idx).toEscapedString());
              idx ++;
            }
            
            if (newChildComponents.length > 0) {
              var newChild = {
                "components": newChildComponents,
                "children": []
              };
              tempNode["children"] = [newChild, remainingChild];
              tempNode = newChild;
            } else {
              tempNode["children"] = [remainingChild];
            }
            
            break;
          } else {
            idx ++;
          }
        }
        // we can fully match with this node, need to try its children
        treeNode = tempNode;
        if (treeNode["children"] === undefined) {
          treeNode["children"] = [];
        }
        break;
      }
    }
    if (!childMatch) {
      // we tried all the children of this tree node, and none can match, we break out of the outer loop
      break;
    }
  }

  if (idx < nameSize) {
    // no children of tree node can match, we need to insert new nodes
    var newChildComponents = [];
    while (idx < nameSize) {
      newChildComponents.push(dataName.get(idx).toEscapedString());
      idx += 1;
    }

    var newChild = {
      "components": newChildComponents,
      "children": [],
      "content" : content
    };
    
    if (maxBranchingFactor < 0) {
      treeNode["children"].push(newChild);
    } else if (treeNode["children"].length < maxBranchingFactor || ignoreMaxBranchingDepth === true) {
      treeNode["children"].push(newChild);
    } else {
      // not added, return defined
      return;
    }
    
    isDone = true;
    treeNode = newChild;
  }

  // insert data content object after this insertion's end node
  var content = "";
  try {
    content = data.getContent().buf().toString('binary');
  } catch (e) {
    content = "[DATA]";
  }

  treeNode["content"] = content;


  // // append to last treeNode
  var contentNode = {
    "components": [content],
    "is_content": true
  };
  // treeNode["children"].push(contentNode);

  updateNameTree(nameTreeData[0]);
  return contentNode;
}


function fetchContentOfNode(node) {
  if (node.content) {
    return node.content;
  } else {
    tmp = node.parent;
    while (tmp) {
      if (tmp.content)
        return tmp.content;
      else 
        tmp = tmp.parent;
    }
    return "";
  }
}

/**************************
 * Older helper functions
 **************************/

function findAmongChildren(node, str) {
  for (var child in node["children"]) {
    if (node["children"][child]["components"][0] == str) {
      return node["children"][child];
    }
  }
  return null;
}

function debugTree(node) {
  if (node === undefined) {
    return;
  }
  console.log(node["components"].join("/"));
  for (var idx in node["children"]) {
    debugTree(node["children"][idx]);
  }
}

function clone(obj) {
  if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
    return obj;

  if (obj instanceof Date)
    var temp = new obj.constructor(); //or new Date(obj);
  else
    var temp = obj.constructor();

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj['isActiveClone'] = null;
      temp[key] = clone(obj[key]);
      delete obj['isActiveClone'];
    }
  }

  return temp;
}