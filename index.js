const btn = document.querySelector('addNum')


//Simple Node struct (base represents a fake leaf)
class Node {
  constructor(val=null) {
    this.data = val;
    this.rank = 0;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.mySide = null;
  }
}

class WAVL {
// the constructor checks to see if a node has been passed through
// if there is a node then it will increment the rank of the node
// and then create two new "fake" leaves
  constructor(rootNode = null) {
    if (rootNode === null) {
      this.root = new Node();
      this.instruc = [];
    }
  }

  // when inserting a new node, change a fake leaf node to a real one
  // and add two new child "fake" nodes
  insert(num) {
    num = Number(num);
    var node = this.root;

    // variable that will allow us to determine who sibling is
    let flag = "";

    // check if at root node
    if (node.data === null) {
      node.rank += 1;
      node.data = num;
      node.left = new Node();
      node.left.parent = node;
      node.right = new Node();
      node.right.parent = node;
      this.instruc.push("Inserted root node and created two fake leaves both with rank 0.");
    } // else loop till the right fake leaf is found
    else {
      while (node.rank != 0) {
        if (num > node.data) {
          //console.log("right");
          node = node.right;
          flag = "right";
        }
        else {
          //console.log("left");
          node = node.left;
          flag = "left";
        }
      }  
        
      //convert fake leaf to real leaf
      node.data = num;
      node.rank += 1;
      node.left = new Node();
      node.left.parent = node;
      node.right = new Node();
      node.right.parent = node;
      node.mySide = flag;

      this.instruc.push("Converted fake leaf into real node with a rank of 1 (and two fake leaves as its children).");

      this.fixUp(node);
      

    }

  }

  // method that checks upwards to fix any violations
  fixUp(node) {
    while (node.parent !== null) {
      var sibling = null;
      if (node.mySide == "right") { sibling = node.parent.left; }
      else if (node.mySide == "left") { sibling = node.parent.right; }

      if (node.parent.rank > node.rank) {
        this.instruc.push(" Parent node (" + node.parent.data + ") rank is greater than current node (" + node.data + ") rank");
        return;
      }
      // we have same rank as parent
      else {
        if (node.parent.rank == (sibling.rank + 1)) {
          node.parent.rank += 1;
          this.instruc.push(" Parent node (" + node.parent.data + ") rank incremented.");
        }
        else {
          // need to do the rotations + rank fixes
          if ((node.right.rank == (node.rank - 2)) && (node.mySide == "left")) {
            let gp = node.parent.parent;
            let newSubtree = this.rightRotate(node.parent);
            this.instruc.push(" Right Rotate on " + node.parent.data + " and decrement rank.");

            if (gp !== null) {
              newSubtree.parent = gp;
              if (node.mySide == "right") { gp.right = newSubtree; }
              else { gp.left = newSubtree; }
            } else {
              newSubtree.parent = null;
              this.root = newSubtree;
            }

            node.right.rank -= 1;
            return;
          }
          // mirror of previous but for rigth subtree
          else if ((node.left.rank == (node.rank - 2)) && (node.mySide == "right")) {
            let gp = node.parent.parent;
            let newSubtree = this.leftRotate(node.parent);
            this.instruc.push(" Left Rotate on " + node.parent.data + " and decrement rank.");

            if (gp !== null) {
              newSubtree.parent = gp;
              if (node.mySide == "right") { gp.right = newSubtree; }
              else { gp.left = newSubtree; }
            } else {
              newSubtree.parent = null;
              this.root = newSubtree;
            }

            node.left.rank -= 1;
            return;
          }
          else {
            let gp = node.parent;
            let newSubtree = this.leftRotate(node);
            node = newSubtree;
            this.instruc.push(" Left Rotate on " + node.data + ".");

            if (gp !== null) {
              newSubtree.parent = gp;
              if (node.mySide == "right") { gp.right = newSubtree; }
              else { gp.left = newSubtree; }
            } else {
              newSubtree.parent = null;
              this.root = newSubtree;
            }

            // now do a right rotate
            gp = node.parent.parent
            newSubtree = this.rightRotate(node.parent);
            this.instruc.push(" Right Rotate on " + node.parent.data + " and decrement ranks.");

            if (gp !== null) {
              newSubtree.parent = gp;
              if (node.mySide == "right") { gp.right = newSubtree; }
              else { gp.left = newSubtree; }
            } else {
              newSubtree.parent = null;
              this.root = newSubtree;
            }

            node.rank += 1;
            node.left.rank -= 1;
            node.right.rank -= 1;

            // console.log(node);
            return;
          }
        }
        
      }

      node = node.parent;
    }
  }

  // method to perform the correct right rotation
  rightRotate(p) {

    let leftChild = p.left;
    
    p.left = leftChild.right;
    leftChild.right = p;
    p.parent = leftChild;
    leftChild.mySide = p.mySide;
    p.mySide = "right";

    return leftChild;
  }

  // method to perform correct left rotation
  leftRotate(w) {
    let rightChild = w.right;

    w.right = rightChild.left;
    rightChild.left = w;
    w.parent = rightChild;
    rightChild.mySide = w.mySide;
    w.mySide = "left";

    return rightChild;
  }

  // wrapper function to start recursive method and put into an array
  genTreeData() {
    let obj = this.genTreeJSON(this.root);
    let arr = [];
    arr.push(obj);
    return arr;
  }

  // method that returns JSON representation of tree to feed into d3 visualization
  genTreeJSON(node) {
    if (node.rank == 0) {
      return {
        "name": "FLN",
        "rank": "rank: 0"
      }
    }
    else {
      let tempArr = []
      tempArr.push(this.genTreeJSON(node.left));
      tempArr.push(this.genTreeJSON(node.right));
      return {
        "name": node.data,
        "rank": "rank: " + node.rank,
        "children": tempArr
      }
    }
  }

  getInstrucList() {
    return this.instruc;
  } 
}

// ------------------------------------------------------------------------ D3 STUFF ----------------------------------------------------------------------------------------- //

// ************** Generate the tree diagram	 *****************
function genTree(treeData) {
  var margin = {top: 40, right: 120, bottom: 20, left: 120},
	width = 1060 - margin.right - margin.left,
	height = 500 - margin.top - margin.bottom;
	
var i = 0;

var tree = d3.layout.tree()
	.size([height, width]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

var svg = d3.select("h4").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

root = treeData[0];
  
update(root);

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 100; });

  // Declare the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; });

  nodeEnter.append("circle")
	  .attr("r", 10)
	  .style("fill", "#fff");

  nodeEnter.append("text")
    .attr("y", function(d) { 
     return d.children || d._children ? -18 : 18; })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.name; })
    .style("fill-opacity", 1);
  
  nodeEnter.append("text")
    .attr("y", function(d) { 
     return d.children || d._children ? -35 : 35; })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.rank; })
    .style("fill-opacity", 1);

  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal);

}
}

//GLOBALS
let avlTree = new WAVL();
// avlTree.insert(7);
// avlTree.insert(8);
// avlTree.insert(6);
// avlTree.rightRotate(avlTree.root);



var form = document.getElementById("insertForm");
form.onsubmit = (e) => {
    e.preventDefault();

    let formData = new FormData(form);
    let num = formData.get("numToAdd");

    avlTree.insert(num);

    let treeData = avlTree.genTreeData();

    //console.log(treeData);

    // delete previous tree
    let treeDisplayDiv = document.getElementById("display-div");
    let child = treeDisplayDiv.firstChild;
    if (child !== null) {
      treeDisplayDiv.removeChild(child);
    }
   
    genTree(treeData);
    let instructions = avlTree.getInstrucList();

    let instrucDiv = document.getElementById("instruc-text");
    let child2 = instrucDiv.firstChild;
    if (child2 !== null) {
      instrucDiv.removeChild(child2);
    }

    let str = "<ul>";
    //let elem = document.createElement("li");
    for (var i = 0; i < instructions.length; i++) {
      //elem = document.createElement("li");
      //const text = document.createTextNode(instructions[i]);
      str += '<li>' + instructions[i] + '</li>';
    }
    str += '</ul>';

    instrucDiv.innerHTML = str;
    avlTree.instruc = [];
}
