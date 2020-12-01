
/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */



class AreaChart {

	constructor(parentElement, data) {
		this.parentElement = parentElement;
		this.data = data;
		this.displayData = [];
		this.initVis();
	}


	/*
	 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
	 */

	initVis() {
		let vis = this;

		vis.margin = {top: 60, right: 60, bottom: 60, left: 60};

		vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
		vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		vis.svg.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", vis.width)
			.attr("height", vis.height);

		// Scales and axes
		vis.x = d3.scaleTime()
			.range([0, vis.width])
			// .domain(d3.extent(vis.data, d => d.survey));

		vis.y = d3.scaleLinear()
			.range([vis.height, 0])
			// .domain(d3.extent(vis.data.length))

		vis.xAxis = d3.axisBottom()
			.scale(vis.x)
			// .tickFormat(formatDate)
			.ticks(4);

		vis.yAxis = d3.axisLeft()
			.scale(vis.y);

		// Map data to area
		vis.area = d3.area()
			.curve(d3.curveCardinal)
			.x(d => vis.x(d.key))
			.y0(vis.height)
			.y1(d => vis.y(d.value));

		// Create axes groups
		vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")")

		vis.svg.append("g")
			.attr("class", "y-axis axis")

		// (Filter, aggregate, modify data)
		vis.wrangleData();

		// Initialize brush component
		vis.brush = d3.brushX()
			.extent([[0, 0], [vis.width, vis.height]])
			.on("brush", brushed);

		// TO-DO: Append brush component here
		vis.svg.append("g")
			.attr("class", "x brush")
			.call(vis.brush)
			.selectAll("rect")
			.attr("y", -6)
			.attr("height", vis.height + 7);

	}

	/*
	 * Data wrangling
	 */

	wrangleData() {
		let vis = this;

		// (1) Group data by date and count survey results for each day

		vis.rollup = d3.rollup(vis.data, leaves => leaves.length, d => d.survey);
		vis.arrayByDate = Array.from(vis.rollup,([key, value]) => ({key, value}));

		// vis.countGroups = Array.from(d3.rollup(vis.data, group => group.length, d => d.survey))
		// console.log(vis.countGroups)

		// Parse dates
		vis.arrayByDate.forEach(d => {
			d.key = parseDate(d.key)
			return d;
		})

		// Sort data
		vis.arrayByDate.sort(function(a,b) { return a.key - b.key; })

		console.log(vis.arrayByDate);

		// Update the visualization
		vis.updateVis();
	}


	/*
	 * The drawing function
	 */

	updateVis() {

		let vis = this;

		// Update domain
		// Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
		// vis.y.domain([0, d3.max(vis.displayData, function(d) {
		// 	return d3.max(d, function(e) {
		// 		return e[1];
		// 	});
		// })
		// ]);

		// Update x domain
		vis.x.domain([d3.min(vis.arrayByDate, d => d.key), d3.max(vis.arrayByDate, d => d.key)]);
		vis.y.domain([0, d3.max(vis.arrayByDate, d => d.value)]);

		let areaPath = vis.svg.append("path")
			.datum(vis.arrayByDate)
			.attr("class", "area")
			.attr("d", vis.area)
			.attr("fill", "IndianRed")

		vis.svg.select(".x-axis").call(vis.xAxis);
		vis.svg.select(".y-axis").call(vis.yAxis);

	}
}

