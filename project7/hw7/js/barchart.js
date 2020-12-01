

/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */


class BarChart {

	constructor(parentElement, data, config) {
		this.parentElement = parentElement;
		this.data = data;
		this.config = config;
		this.displayData = data;

		console.log(this.displayData);

		this.initVis();
	}

	/*
	 * Initialize visualization (static content; e.g. SVG area, axes)
	 */
	// // Scales and axes
	// vis.x = d3.scaleTime()
	// 	.range([0, vis.width])
	// 	.domain(d3.extent(vis.data, d=> d.Year));
	//
	// vis.y = d3.scaleLinear()
	// 	.range([vis.height, 0]);
	//
	// vis.xAxis = d3.axisBottom()
	// 	.scale(vis.x);
	//
	// vis.yAxis = d3.axisLeft()
	// 	.scale(vis.y);

	initVis() {

		let vis = this;

		vis.margin = {top: 60, right: 80, bottom: 60, left: 100};

		vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
		vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

		// SVG drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		// Overlay with path clipping
		// vis.svg.append("defs").append("clipPath")
		// 	.attr("id", "clip")
		// 	.append("rect")
		// 	.attr("width", vis.width)
		// 	.attr("height", vis.height);

		// Scales and axes
		vis.x = d3.scaleLinear()
			.range([0, vis.width])

		vis.y = d3.scaleBand()
			.range([0, vis.height])
			.paddingInner(0.3)

		vis.xAxis = d3.axisBottom()
			.scale(vis.x);

		vis.yAxis = d3.axisLeft()
			.scale(vis.y);

		vis.svg.append("g")
			.attr("class", "x-axis axis bar-axis")
			.attr("transform", "translate(0," + vis.height + ")");

		vis.svg.append("g")
			.attr("class", "y-axis axis bar-axis");

		// vis.barText = vis.svg.selectAll(".bar-text")
		// 	.attr("class", "bar-text")

		vis.svg.append("text")
			.attr("class", "bar-title")
			.attr("x", 0)
			.attr("y", -15)
			.attr("dy", "0.35em")
			.text(vis.config.title)
			.attr("text-anchor", "end")
			.attr("font-weight", "bold");

		// (Filter, aggregate, modify data)
		vis.wrangleData();
	}

	/*
	 * Data wrangling
	 */

	wrangleData() {
		let vis = this;

		// (1) Group data by key variable (e.g. 'electricity') and count leaves
		// (2) Sort columns descending

		// d3.group produces a map
		// vis.groups = d3.group(data, d=>d[this.config.key])
		// console.log(vis.religions)

		vis.countGroups = Array.from(d3.rollup(vis.displayData, group => group.length, d=>d[vis.config.key]))
		console.log(vis.countGroups)

		// Sort data
		vis.sortedGroups = vis.countGroups.sort((a,b) => b[1] - a[1]);


		// Update the visualization
		vis.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
	 */

	updateVis() {
		let vis = this;

		// (1) Update domains
		vis.x.domain([0, d3.max(vis.sortedGroups.map(d => d[1]))]);
		// vis.x.domain(vis.sortedGroups.map(d=>d[1]))
		vis.y.domain(vis.sortedGroups.map(d=>d[0]))

		// Update y axis
		vis.svg.select(".y-axis").call(vis.yAxis);

		// (2) Draw rectangles
		vis.barRect = vis.svg.selectAll("rect").data(vis.sortedGroups, d=>d[0])

		// enter
		vis.barRect.enter().append("rect")
			.attr("class", "bars")
			.attr("fill", "IndianRed")

		// merge
			.merge(vis.barRect)
			.attr("x", 0)
			.attr("y", d => vis.y(d[0]))
			.attr("height", vis.y.bandwidth())
			.transition()
			.duration(800)
			.attr("width", d => vis.x(d[1]))

		// exit
		vis.barRect.exit().remove();

		// let barText = vis.svg.selectAll("text").data(vis.sortedGroups, d=>d[0]);

		vis.barText = vis.svg.selectAll(".bar-text").data(vis.sortedGroups, d=>d[0])

		vis.barText.enter()
			.append("text")
			.attr("class", "bar-text")
			.attr("font-size", "12px")
			.attr("text-anchor", "start")

			// merge
			.merge(vis.barText)
			.attr("x", d => vis.x(d[1]) + 15)
			.attr("y", d => vis.y(d[0]) + 0.5 + vis.y.bandwidth())
			.transition()
			.duration(800)
			.text(d => d[1])

		// Exits
		vis.barText.exit().remove();

		// Update the y-axis
		// vis.svg.select(".x-axis").call(vis.xAxis);

	}


	/*
	 * Filter data when the user changes the selection
	 * Example for brushRegion: 07/16/2016 to 07/28/2016
	 */

	selectionChanged(brushRegion) {

		let vis = this;

		// Get lower and upper bounds of new region to filter
		let lowerDate = d3.min(brushRegion)
		let upperDate = d3.max(brushRegion)

		// Filter data accordingly without changing the original data
		vis.displayData = vis.data.filter(function(d) {
			return parseDate(d.survey) >= lowerDate && parseDate(d.survey) <= upperDate;
		})

		// Update the visualization
		vis.wrangleData();
	}
}
