// SVG drawing area
let margin = {top: 40, right: 40, bottom: 60, left: 60};

let width = 600 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Date parser
let formatDate = d3.timeFormat("%Y");
let parseDate = d3.timeParse("%Y");

// Scales
let x = d3.scaleTime()
	.range([0, width]);

let y = d3.scaleLinear()
	.range([height, 0]);

let xAxis = d3.axisBottom()
	.tickFormat(d3.timeFormat('%Y'))
	.ticks(12)
	.scale(x)

let xAxisGroup = svg.append("g")
	.attr("class", "x-axis axis")
	.selectAll("text")
	.style("text-anchor", "end")
	.attr("dx", "-.8em")
	.attr("dy", ".15em")
	// .attr("transform", "rotate(-45) translate(30," + height + ")")

let yAxis = d3.axisLeft()
	.scale(y)

let yAxisGroup = svg.append("g")
	.attr("class", "y-axis axis")
// .style("text-anchor", "middle");

// Define lines and dots outside of updateViz()
let linePath = svg.append("path")
	.attr("class", "line")

// let dotPath = svg.append("circle")
// 	.attr("class", "dot")

// Initialize data
loadData();

// FIFA world cup
let data;

// Load CSV file
function loadData() {
	d3.csv("data/fifa-world-cup.csv").then(function(csv) {

		csv.forEach(function(d){
			// Convert string to 'date object'
			d.YEAR = parseDate(d.YEAR);
			
			// Convert numeric values to 'numbers'
			d.TEAMS = +d.TEAMS;
			d.MATCHES = +d.MATCHES;
			d.GOALS = +d.GOALS;
			d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
			d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
		});

		// Store csv data in global variable
		data = csv;

		// Draw the visualization for the first time
		updateVisualization();

		// Set default data for table
		document.getElementById("tb-edition").innerHTML = data[0].EDITION;
		document.getElementById("tb-winner").innerHTML = data[0].WINNER;
		document.getElementById("tb-goals").innerHTML = data[0].GOALS;
		document.getElementById("tb-avg-goals").innerHTML = data[0].AVERAGE_GOALS;
		document.getElementById("tb-matches").innerHTML = data[0].MATCHES;
		document.getElementById("tb-teams").innerHTML = data[0].TEAMS;
		document.getElementById("tb-avg-attendance").innerHTML = data[0].AVERAGE_ATTENDANCE;
	});
}

// Define drop down selections

d3.select("#data-type").on("change", function(d) {
	updateVisualization();
})

// Define slider for bonus section

let sliderYears = document.getElementById("slider-range");

noUiSlider.create(sliderYears, {
	start: [1930, 2014],
	step: 4,
	connect: true,
	range: {
		'min': 1930,
		'max': 2014
	},
	orientation: 'horizontal',
	behaviour: 'tap-drag',
	tooltips: true,
	format: wNumb({
		decimals: 0
	}),

});

sliderYears.style.width = '175px';
sliderYears.style.margin = '0 auto 30px';

// Render visualization
function updateVisualization() {

	data.sort((a,b) => a.YEAR - b.YEAR);
	console.log(data);

	// Define filtered year values
	let lowerYear = +sliderYears.noUiSlider.get()[0];
	let upperYear = +sliderYears.noUiSlider.get()[1];

	// Filter data when dates are submitted
	let filteredData = data.filter(function(d) {
		return formatDate(d.YEAR) >= lowerYear & formatDate(d.YEAR) <= upperYear;
	})

	// Sort data after filter
	console.log(filteredData);

	// Get drop down option for the y axis graph
	let selectedOption = d3.select("#data-type").property("value");

	// Set dynamic ordinal scale for x and y axis
	x.domain([d3.min(filteredData, d=>d.YEAR), d3.max(filteredData, d=>d.YEAR)]);
	y.domain([0, d3.max(filteredData, d=>d[selectedOption])]);

	let toolTip = d3.tip()
		.attr('class', 'd3-tip')
		.html(function(d)
		{
			return "Value: " + d[selectedOption] + "<br>" + "Edition: " + formatDate(d.YEAR);
		});

	svg.call(toolTip);

	// Generate line chart with paths and dots
	let lineGen = d3.line()
		.x(function(d) { return x(d.YEAR); })
		.y(function(d) { return y(d[selectedOption]); })
		.curve(d3.curveMonotoneX)

	linePath.datum(filteredData)
		.transition()
		.duration(600)
		.attr("d", lineGen(filteredData, d=>d.YEAR));

	let dotPath = svg.selectAll("circle")
		.data(filteredData, d=>d.YEAR)

	dotPath.enter().append("circle")
		.attr("cx", function(d) { return x(d.YEAR); })
		.attr("cy", function(d) { return y(d[selectedOption]); })
		.attr("r", 6)
		.on("mouseover", function(event, d)
		{
			toolTip.show(d, this);
		})
		.on("mouseout", function(d)
		{
			toolTip.hide(d, this);
		})
		.on("click", function(event, d)
		{
			d3.selectAll("circle")
				.attr("r", 6).style("fill", "green");
			d3.select(this)
				.transition()
				.duration(400)
				.attr("r", 8).style("fill", "purple");
			showEdition(d);
		})
		.merge(dotPath)
		.attr("class", "dot")
		.transition()
		.duration(600)
		.attr("cx", function(d) { return x(d.YEAR); })
		.attr("cy", function(d) { return y(d[selectedOption]); })
		.attr("fill", "green")
		.attr("opacity", 0.7)

	dotPath.exit().remove();

	svg.select(".x-axis")
		.attr("transform", "translate(0," + height + ")")
		.transition()
		.duration(800)
		.call(xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-65)")

	svg.select(".y-axis")
		.transition()
		.duration(800)
		.call(yAxis);
}

// Call slider function
sliderYears.noUiSlider.on("set", function(){
	updateVisualization();
});

// Show details for a specific FIFA World Cup
function showEdition(d){

	document.getElementById("tb-edition").innerHTML = d.EDITION;
	document.getElementById("tb-winner").innerHTML = d.WINNER;
	document.getElementById("tb-goals").innerHTML = d.GOALS;
	document.getElementById("tb-avg-goals").innerHTML = d.AVERAGE_GOALS;
	document.getElementById("tb-matches").innerHTML = d.MATCHES;
	document.getElementById("tb-teams").innerHTML = d.TEAMS;
	document.getElementById("tb-avg-attendance").innerHTML = d.AVERAGE_ATTENDANCE;

}
