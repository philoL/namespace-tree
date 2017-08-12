
// ************** Generate the svgs  *****************
var accessControlOverviewWidthTotal = 1000;
var accessControlOverviewHeightTotal = 150;
var accessControlTimelineWidthTotal = 800;
var accessControlTimelineHeightTotal = 160;
var accessControlDetailsWidthTotal = 4000;
var accessControlDetailsHeightTotal = 600;

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    accessControlOverviewWidth = accessControlOverviewWidthTotal - margin.right - margin.left,
    accessControlOverviewHeight = accessControlOverviewHeightTotal - margin.top - margin.bottom,
    accessControlTimelineWidth = accessControlTimelineWidthTotal - margin.right - margin.left,
    accessControlTimelineHeight= accessControlTimelineHeightTotal - margin.top - margin.bottom;
    accessControlDetailsWidth = accessControlDetailsWidthTotal - margin.right - margin.left,
    accessControlDetailsHeight= accessControlDetailsHeightTotal - margin.top - margin.bottom;

//color set
var rectColorSet = ["#cccccc", "#109618"]

//svgs
var svgAccessControlOverview,
	  svgAccessControlTimeline,
    svgAccessControlDetails;

//rect
var rectWidth = 100;
var rectHeight = 30;

//text in rect
var textX = 25;
var textY = 28;

//data structure for access control overview
var accessControlObj;

//data structure for timeline
class TimelineEntry {
  constructor(label) {
    this.label = label;
    this.times = [];
  }

  addTimeEntry(timeEntry){
    this.times.push(timeEntry);
  }
}

class TimelineTimeEntry {
  constructor(color, startTime, endTime) {
    this.color = color;
    this.starting_time = startTime;
    this.ending_time = endTime;
  }
}

var accessControlTimelineData = [
      {label: "Alice", times: [{"color":"#3366cc", "starting_time": 1355752800000, "ending_time": 1355759900000},
                                  {"color":"#3366cc", "starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {label: "Bob", times: [{"color":"#dc3912", "starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
      {label: "Caros", times: [{"color":"#ff9900", "starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

//selected query data structure from overview
var acQuery = {};

//onClick functions
var selectACRect;

//data structure for access control tree
var acTreeRoot;

//init svgs
function createAccessControlSvgs() {

  //append svg for overview
  svgAccessControlOverview = d3.select("#view-container").append("svg")
    .attr("id", "accessControlOverview")
    .attr("viewbox", "0, 0, " + accessControlOverviewWidthTotal + ", " + accessControlOverviewHeightTotal)
    .attr("width", accessControlOverviewWidth + margin.right + margin.left)
    .attr("height", accessControlOverviewHeight + margin.top + margin.bottom)

  d3.select("svg#accessControlOverview").append("text")
    .attr("x", 10)
    .attr("y", 20)
    .text("Overview");

  //append svg for timeline
  svgAccessControlTimeline = d3.select("#view-container").append("svg")
    .attr("id", "accessControlTimeline")
    .attr("width", accessControlTimelineWidthTotal)
    .attr("height", accessControlTimelineHeightTotal)

  //svg for access control details
  svgAccessControlDetails = d3.select("#view-container").append("svg")
    .attr("id", "accessControlDetails")
    .attr("viewbox", "0, 0, " + accessControlDetailsWidthTotal + ", " + accessControlDetailsHeightTotal)
    .attr("width", accessControlDetailsWidth + margin.right + margin.left)
    .attr("height", accessControlDetailsHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.select("svg#accessControlDetails").append("text")
    .attr("x", 10)
    .attr("y", 20)
    .text("Details");

  d3.select(self.frameElement).style("height", "500px");

  //add g in svgs
  //add g.user with text
  svgAccessControlOverview.append("g")
    .attr("id", "user")
    .attr("transform", "translate(" + 100 + "," + margin.top*2 + ")")
    .append("text")
  	.attr("id", "acOverview-text")
  	.text("User");

  //add g.activityType
  svgAccessControlOverview.append("g")
    .attr("id", "activityType")
    .attr("transform", "translate(" + 300 + "," + margin.top*2 + ")")
  .append("text")
    .attr("id", "acOverview-text")
    .text("Activity Type");

  //add g.activity
  svgAccessControlOverview.append("g")
    .attr("id", "activity")
    .attr("transform", "translate(" + 500 + "," + margin.top*2 + ")")
    .append("text")
    .attr("id", "acOverview-text")
    .text("Activity");

  //add g.location
  svgAccessControlOverview.append("g")
    .attr("id", "timeLocation")
    .attr("transform", "translate(" + 700 + "," + margin.top*2 + ")")
    .append("text")
    .attr("id", "acOverview-text")
    .text("Location");

  //init data for timeline
  accessControlTimelineData = [
      // {label: "", times: [{"color":"white", "starting_time": 1355752800000, "ending_time": 1355759900000}]},
      // {label: "", times: [{"color":"white", "starting_time": 1355759910000, "ending_time": 1355761900000}]},
      // {label: "", times: [{"color":"white", "starting_time": 1355761910000, "ending_time": 1355763910000}]}
  ];

  updateAccessControlSvgs();

  //transition
  d3.selectAll("rect")
  .transition()
  .duration(500)
  .attr("fill", rectColorSet[0]);
}

function updateAccessControlSvgs(){
  //append rect and text in g.user
  var i = 0;
  d3.select("g#user")
  	.selectAll("rect")
  	.data(accessControlObj.meta.userList)
  	.enter()
  	.append("rect")
    .attr("class", "user")
    .attr("id", function(d) {return d.ndnName;})
  	.attr("x", 0)
  	.attr("y", function(d) { var newY=10+rectHeight*i; ++i; return newY; })
  	.attr("width", rectWidth)
  	.attr("height", rectHeight)
  	.attr("stroke","black")
  	.attr("stroke-width","1")
  	.attr("fill", "white")
  	.on("click", selectACRect);

  var i = 0;
  d3.select("g#user")
  	.selectAll("text#user")
  	.data(accessControlObj.meta.userList)
  	.enter()
  	.append("text")
  	.attr("id", "user")
  	.attr("x", textX)
   	.attr("y", function(d) { var newY=textY+rectHeight*i; ++i; return newY; })
   	.attr("font-size", "12px")
  	.text( function(d) {return d.name});

  //append rect and text in g.activityType
  var i = 0;
  d3.select("g#activityType")
  	.selectAll("rect")
  	.data(accessControlObj.meta.activityTypeList)
  	.enter()
  	.append("rect")
    .attr("class", "activityType")
    .attr("id", function(d) {return d.ndnName;})
  	.attr("x", 0)
  	.attr("y", function(d) { var newY=10+rectHeight*i; ++i; return newY; })
  	.attr("width", rectWidth)
  	.attr("height", rectHeight)
  	.attr("stroke","black")
  	.attr("stroke-width","1")
  	.attr("fill", "white")
  	.on("click", selectACRect);

  var i = 0;
  d3.select("g#activityType")
  	.selectAll("text#activityType")
  	.data(accessControlObj.meta.activityTypeList)
  	.enter()
  	.append("text")
  	.attr("id", "user")
  	.attr("x", textX)
   	.attr("y", function(d) { var newY=textY+rectHeight*i; ++i; return newY; })
   	.attr("font-size", "12px")
  	.text( function(d) {return d.name});

  //append rect and text in g.activity
  var i = 0;
  d3.select("g#activity")
  	.selectAll("rect")
  	.data(accessControlObj.meta.activityList)
  	.enter()
  	.append("rect")
    .attr("class", "activity")
    .attr("id", function(d) {return d.ndnName;})
  	.attr("x", 0)
  	.attr("y", function(d) { var newY=10+rectHeight*i; ++i; return newY; })
  	.attr("width", rectWidth)
	  .attr("height", rectHeight)
    .attr("fill", "white")
  	.attr("stroke","black")
  	.attr("stroke-width","1")
    .on("click", selectACRect);

  var i = 0;
  d3.select("g#activity")
  	.selectAll("text#activity")
  	.data(accessControlObj.meta.activityList)
  	.enter()
  	.append("text")
  	.attr("id", "user")
  	.attr("x", textX)
   	.attr("y", function(d) { var newY=textY+rectHeight*i; ++i; return newY; })
   	.attr("font-size", "12px")
  	.text( function(d) {return d.name});

  //append rect and text in g.location
  var i = 0;
  d3.select("g#location")
  	.selectAll("rect")
  	.data(accessControlObj.meta.locationList)
  	.enter()
  	.append("rect")
    .attr("class", "location")
    .attr("id", function(d) {return d.ndnName;})
  	.attr("x", 0)
  	.attr("y", function(d) { var newY=10+rectHeight*i; ++i; return newY; })
  	.attr("width", rectWidth)
  	.attr("height", rectHeight)
  	.attr("stroke","black")
  	.attr("stroke-width","1")
  	.attr("fill", "white")
  	.on("click", selectACRect);

  var i = 0;
  d3.select("g#location")
  	.selectAll("text#location")
  	.data(accessControlObj.meta.activityList)
  	.enter()
  	.append("text")
  	.attr("id", "user")
  	.attr("x", textX)
   	.attr("y", function(d) { var newY=textY+rectHeight*i; ++i; return newY; })
   	.attr("font-size", "12px")
  	.text( function(d) {return d.name});

  
  updateAccessControlTimeline();
}

function updateAccessControlTimeline(){
  //remove all elements in timeline svg
  d3.select("svg#accessControlTimeline")
    .selectAll("*")
    .remove();

  //add time line
  var chart = d3.timeline()
    .beginning(1355752800000) // we can optionally add beginning and ending times to speed up rendering a little
    .ending(1355774400000)
    .stack() // toggles graph stacking
    .margin({left:70, right:30, top:0, bottom:0});

  svgAccessControlTimeline.datum(accessControlTimelineData)
    .call(chart);
}

function filterAccessControlTimelineDataByQuery() {
  var filterUser = acQuery["user"];
  var filterActivityType = acQuery["activityType"];
  var filterActivity = acQuery["activity"];

  if (!filterActivity) {
    filterActivity = "";
  }

  var filterRule = "";
  if (filterActivityType) {
    if (!filterActivity)
      filterRule = "/"+filterActivityType;
    else
      filterRule = "/"+filterActivityType+"/"+filterActivity;
  }
  
  console.log(acQuery);
  console.log(filterUser);
  console.log(filterRule);


  accessControlTimelineData = [];
  if (filterRule == "") {
    //donothing
  } else {
    for (var i in accessControlObj["accessList"]) { 
      //access details for each user
      var userAccessDetailsEntry = accessControlObj["accessList"][i];

      if (userAccessDetailsEntry["user"] == filterUser) {
        var accessDetails = userAccessDetailsEntry["accessDetails"];
        for (var j in accessDetails){
          //create an entry for accessControlTimelineData
          var newEntry = new TimelineEntry(accessDetails[j]["username"]);
          
          for (var k in accessDetails[j]["access"]) {
            //add time entry 
            var curAccess = accessDetails[j]["access"][k];
            
            if (filterRule.startsWith(curAccess["gradularity"])) {
              var newTimeEntry = new TimelineTimeEntry(colorSet[j], curAccess["start"], curAccess["end"]);
              newEntry.addTimeEntry(newTimeEntry);
            }
          }

          accessControlTimelineData.push(newEntry);
          console.log("add an new entry: ", newEntry);
        }
      }
    }
  }

  //update access control tree
  if (filterUser) {
    console.log("update ac tree: ", filterUser);
    acTreeRoot = findNodeInNameTree(nameRoot, filterUser);

    console.log("\n found node: ", acTreeRoot);
    if (acTreeRoot === null) {
      acTreeRoot = {
        "depth" : 1,
        "children" : [],
        "components" : [filterUser]
      };
    }
    updateAccessControlTree(acTreeRoot);
  }
}

function resetRectColorByClass(selectedClass) {
  //reset rect color in access control overview
  if (selectedClass == "all") {
    console.log(selectedClass);
    d3.select("svg#accessControlOverview")
    .selectAll("rect")
    .transition()
    .duration(400)
    .attr("fill", rectColorSet[0]);
  } else {
    console.log(selectedClass);
    d3.select("svg#accessControlOverview")
    .selectAll("."+selectedClass)
    .transition()
    .duration(400)
    .attr("fill", rectColorSet[0]);
  }
}

var selectACRect = (function(){
    return function(){
      // accessControlTimelineData = [
      // {label: "Alice", times: [{"color":"#3366cc", "starting_time": 1355752800000, "ending_time": 1355759900000},
      //                             {"color":"#3366cc", "starting_time": 1355767900000, "ending_time": 1355774400000}]},
      // {label: "Bob", times: [{"color":"#dc3912", "starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
      // {label: "Caros", times: [{"color":"#ff9900", "starting_time": 1355761910000, "ending_time": 1355763910000}]}
      // ];
      var currentColor = d3.select(this).attr("fill");
      var selectedClass = d3.select(this).attr("class");
      var selectedId = d3.select(this).attr("id");

      //if the selected is a user, reset all rect color
      if (selectedClass == "user") {
        if (acQuery[selectedClass] == selectedId) {
          //reselect
          acQuery = {};
          resetRectColorByClass("all");
        } else {
          //select
          acQuery = {};
          acQuery[selectedClass] = selectedId;
          resetRectColorByClass("all");
        }
      } else {
      //select other rect as the query
        if (acQuery[selectedClass] == selectedId) {
          acQuery[selectedClass] = "";
        } else {
          acQuery[selectedClass] = selectedId;
          resetRectColorByClass(selectedClass);
        }
      }

      filterAccessControlTimelineDataByQuery();
      updateAccessControlTimeline();

      //finally change color
      currentColor = currentColor == rectColorSet[0] ? rectColorSet[1] : rectColorSet[0];
      
      d3.select(this)
        .transition()
        .duration(400)
        .attr("fill", currentColor);
    }
})();


function updateAccessControlTree(source) {
  // Compute the new tree layout.
  var nodes = tree.nodes(acTreeRoot).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 120; });

  // Update the nodes
  var node = svgAccessControlDetails.selectAll("g.node")
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { 
      return "translate(" + source.y + "," + source.x + ")"; 
    })
    .on("click", click)
    .on("dblclick", doubleClick);

  nodeEnter.append("circle")
    .attr("r", 1e-6)
    .style("fill", function(d) {
      if (d.is_content) {
        return dataNodeColor;
      }
      return colorSet[d.depth % colorSet.length + 2];
    });
  
  // append text on top of the nodes
  var dy = getRandomInt(1, 3);

  nodeEnter.append("text")
    .attr("id", function(d) {  return "text-name-" + d.id.toString(); })
    .attr("x", function(d) { return d.children || d._children ? 0 : 0; })
    .attr("dy", "-" + dy.toString() + "em")
    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
    .text(updateText)
    .style("fill-opacity", 1e-6)
    .style("display", "block");

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
    });
  
  nodeUpdate.select("text")
    .style("fill-opacity", 1)
    .text(updateText);

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
  var link = svgAccessControlDetails.selectAll("path.link")
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
}
