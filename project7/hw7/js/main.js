
// Bar chart configurations: data keys and chart titles
let configs = [
	{ key: "ownrent", title: "Own or Rent" },
	{ key: "electricity", title: "Electricity" },
	{ key: "latrine", title: "Latrine" },
	{ key: "hohreligion", title: "Religion" }
];


// Initialize variables to save the charts later
let barcharts = [];
let areachart;


// Date parser to convert strings to date objects
let parseDate = d3.timeParse("%Y-%m-%d");
let formatDate = d3.timeFormat("%b %d");


// (1) Load CSV data
// 	(2) Convert strings to date objects
// 	(3) Create new bar chart objects
// 	(4) Create new are chart object

loadData();

function loadData() {

	d3.csv("data/household_characteristics.csv").then(data => {

		console.log(data);

		// // TO-DO (Activity I): instantiate visualization objects
		areachart = new AreaChart("area-chart", data);

		// TO-DO (Activity I):  init visualizations
		// areachart.initVis();

		// Create bar chart objects
		barcharts = [new BarChart("bar-charts-1", data, configs[0]),
					new BarChart("bar-charts-2", data, configs[1]),
					new BarChart("bar-charts-3", data, configs[2]),
					new BarChart("bar-charts-4", data, configs[3])];
	});
}

// React to 'brushed' event and update all bar charts
function brushed() {

	let vis = this;

	// Get the extent of the current brush
	let selectionRange = d3.brushSelection(d3.select(".brush").node());

	// Convert the extent into the corresponding domain values
	let brushRegion = selectionRange.map(areachart.x.invert);

	console.log(brushRegion);

	barcharts.forEach(function(d) {

		d.selectionChanged(brushRegion);

	})



	// barcharts.selectionChanged(brushRegion);
	// // Set domain in bar charts
	// barcharts.x.domain(selectionDomain);
	//
	// // Update focus chart (detailed information)
	// barcharts.wrangleData();

}
