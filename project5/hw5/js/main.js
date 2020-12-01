// Define JSON object for bar chart
let shelterTypes = [{type: "Caravans",
	percentage: 79.68},

	{type: "Tents",
	percentage: 9.51},

	{type: "Combination",
	percentage: 10.81}
];

// Margin object with properties for the four directions
let margin = {top: 20, right: 10, bottom: 20, left: 10};

// Width and height as the inner dimensions of the chart area
let width = 500 - margin.left - margin.right,
	height = 560 - margin.top - margin.bottom;

// Load CSV file
d3.csv("data/zaatari-refugee-camp-population.csv", (row) =>{

	row.population = +row.population;
	return row;

}).then((data)=> {

	// Loop through refugeeData to replace date columns
	let parseDate = d3.timeParse("%Y-%m-%d");

	data.forEach(function(d) {
		d.date = parseDate(d.date);
	});

	// Sort data by ascending date and assign global variable
	let refugeeData = data.sort( (a, b) => {
		return a.date - b.date;
	})

	console.log(refugeeData);

	/* -------------- AREA CHART --------------- */

	// Define svg drawing space for left column
	let svgLeft = d3.select("#chart-area-left")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("class", "group-left")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Left chart, define and draw the x axis
	let padding = 50;

	let dateMin = d3.min(refugeeData, d=>d.date);
	let dateMax = d3.max(refugeeData, d=>d.date);

	let dateScale = d3.scaleTime()
		.domain([dateMin, dateMax])
		.range([padding, width - padding]);

	let xAxisLeft = d3.axisBottom()
		.scale(dateScale)
		.tickFormat(d3.timeFormat("%B %Y"))
		.ticks(15)

	let xAxisGroupLeft = svgLeft.append("g")
		.attr("class", "axis x-axis")
		.attr("transform", "translate(0," + (height - padding) + ")")
		.call(xAxisLeft)
		.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-65)")

	// Define and draw the y axis
	let popMin = d3.min(refugeeData, d=>d.population);
	let popMax = d3.max(refugeeData, d=>d.population);

	let popScale = d3.scaleLinear()
		.domain([0, popMax])
		.range([height - padding, padding]);

	let yAxisLeft = d3.axisLeft()
		.scale(popScale)
		.ticks(10)

	let yAxisGroupLeft = svgLeft.append("g")
		.attr("class", "axis y-axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxisLeft);

	// Add the area to the chart
	let areaGroup = svgLeft.append("g")

	// Write function to add area
	let areaGen = d3.area()
		.x(d => dateScale(d.date))
		.y0(popScale(0))
		.y1(d => popScale(d.population))

	areaGroup.append("path")
		.datum(refugeeData)
		.attr("class", "area-fill")
		.attr("d", areaGen)
		.attr("fill", "chocolate")

	// Create area path for over 100,000 population
	let topAreaGen = d3.area()
		.x(function(d) {
			if (d.population >= 100000) {
				return dateScale(d.date);
			} else {
				return dateScale(0)
			}
		})
		.y0(popScale(0))
		.y1(function(d) {
			if (d.population >= 100000)
			{
				return popScale(d.population)
			}
			else
			{
				return popScale(0)
			}
		});

	// Make clipping mask for top area
	areaGroup.append("clipPath")
		.attr("id", "rectangle-clip")
		.append("rect")
		.attr("x", padding)
		.attr("y", padding)
		.attr("width", width)
		.attr("height", popScale(10000));

	// Draw upper area path and clip to mask
	let topAreaPath = areaGroup.append("path")
		.datum(refugeeData)
		.attr("class", "new-area-fill")
		.attr("clip-path", "url(#rectangle-clip)")
		.attr("d", topAreaGen)
		.attr("fill", "OrangeRed")

	// Add the 100,000 population line
	areaGroup.append("line")
		.attr("class", "thousand-line")
		.attr("x1", 0 + padding)
		.attr("x2", dateScale(dateMax))
		.attr("y1", popScale(100000))
		.attr("y2", popScale(100000))
		.style("stroke", "black")
		.style("stroke-dasharray", ("3, 3"))
		.style("stroke-width", "4px")

	// Create tooltip for the area chart
	// Define focus within svgLeft
	let tooltipGroup = areaGroup.append("g")
		.attr("class", "tooltip-group")
		.attr("height", height - margin.top - margin.bottom)
		.attr("width", width - margin.left - margin.right)

	// Add the tooltip path
	tooltipGroup.append("line")
		.attr("class", "tooltip-line")
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", 0 - padding - margin.bottom)
		.attr("y2", height)
		// .style("stroke", "brown")
		// .style("stroke-width", "2px")

	// Define empty svg text for population value
	tooltipGroup.append("text")
		.attr("class", "tooltip-pop")
		.attr("x", 10)
		.attr("y", 15)
		.attr("fill", "brown")

	// Define empty svg text for date value
	tooltipGroup.append("text")
		.attr("class", "tooltip-date")
		.attr("x", 10)
		.attr("y", 30)
		.attr("fill", "brown")

	// Define area for tooltip interactivity
	tooltipGroup.append("rect")
		.attr("x", 0 + padding)
		.attr("y", 0 + padding)
		.attr("width", 380)
		.attr("height", 420)
		.style("opacity", "0")
		.on("mouseover", function() {
			d3.select(".tooltip-line")
				.style("opacity", "1")
			d3.select(".tooltip-pop")
				.style("opacity", "1")
			d3.select(".tooltip-date")
				.style("opacity", "1")
			})
		.on("mousemove", function () {
			mouseMove(event, refugeeData);
		})
		.on("mouseout", function() {
			d3.select(".tooltip-line")
				.style("opacity", "0")
			d3.select(".tooltip-pop")
				.style("opacity", "0")
			d3.select(".tooltip-date")
				.style("opacity", "0")
		});

	// Define mouseMove function
	function mouseMove() {

		// Get the x position of the mouse pointer
		let bisectDate = d3.bisector(d=>d.date).left;

		let currentPosition = d3.pointer(event)[0];

		let invertDate = dateScale.invert(currentPosition);

		let indexDate = bisectDate(refugeeData, invertDate);

		// Update the tooltip group location and text attributes of the tooltip
		d3.select(".tooltip-line")
			.attr("x1", currentPosition)
			.attr("x2", currentPosition)
			.attr("y1", 0)
			.attr("y2", height - padding)
			.attr("stroke", "brown")
			.attr("stroke-width", "2px")
			.attr("opacity", "1")

		let popFormat = d3.format(",");

		d3.select(".tooltip-pop")
			.attr("x", currentPosition + 10)
			.attr("y", 15)
			.attr("stroke", "brown")
			.attr("font-family", "monospace")
			.attr("font-size", "15px")
			.style("font-weight", "bold")
			.attr("opacity", "1")
			.text("Pop. " + popFormat(refugeeData[indexDate].population));

		let dateFormat = d3.timeFormat("%B %d, %Y");

		d3.select(".tooltip-date")
			.attr("x", currentPosition + 10)
			.attr("y", 30)
			.attr("stroke", "brown")
			.attr("font-family", "monospace")
			.attr("font-size", "12px")
			.attr("opacity", "1")
			.text(dateFormat(refugeeData[indexDate].date));
	}

	/* -------------- 	BAR CHART --------------- */

	// Define svg drawing space for right column
	let svgRight = d3.select("#chart-area-right")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("class", "group-right")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Draw x axis for bar chart

	let typeScale = d3.scaleBand()
		.domain(shelterTypes.map(d => d.type))
		.rangeRound([margin.left, width - margin.right])
		.padding(0.1)

	let xAxisRight = d3.axisBottom()
		.scale(typeScale)

	let xAxisGroupRight = svgRight.append("g")
		.attr("class", "axis x-axis")
		.attr("transform", "translate(40," + (height - padding) + ")")
		.call(xAxisRight)

	// Draw y axis for bar chart
	let percentMin = d3.min(shelterTypes, d=>d.percentage);
	let percentMax = d3.max(shelterTypes, d=>d.percentage);

	let percentScale = d3.scaleLinear()
		.domain([0, 100])
		.range([height - padding, padding]);

	let yAxisRight = d3.axisLeft()
		.scale(percentScale)
		.tickFormat(function(d) {
			return d + "%";
		}).ticks(10)

	let yAxisGroupRight = svgRight.append("g")
		.attr("class", "axis y-axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxisRight);

	// Draw bars - adapted from https://observablehq.com/@d3/lets-make-a-bar-chart/4
	svgRight.selectAll(".bar")
		.data(shelterTypes)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return typeScale(d.type) + padding; })
		.attr("y", function(d) { return percentScale(d.percentage); })
		.attr("width", typeScale.bandwidth())
		.attr("height", function(d) { return height - percentScale(d.percentage) - padding; })
		.style("fill", "chocolate")

	svgRight.selectAll("text.bar-label")
		.data(shelterTypes)
		.enter()
		.append("text")
		.attr("class", "bar-label")
		.text(function(d) { return d.percentage + "%";})
		.attr("x", function(d) { return typeScale(d.type) + padding + 70; })
		.attr("y", function(d) { return percentScale(d.percentage) - 10; })
		.attr("text-anchor", "middle")
		.attr("font-weight", "bold")
		.attr("font-family", "monospace")
		.attr("font-size", "12px")

});