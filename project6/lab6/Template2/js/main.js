
// SVG drawing area

let margin = {top: 40, right: 10, bottom: 60, left: 60};

let width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Scales
	let x = d3.scaleBand()
		.rangeRound([0, width])
		.paddingInner(0.1);

	let y = d3.scaleLinear()
		.range([height, 0]);

	let xAxis = d3.axisBottom()
		.scale(x)

	let xAxisGroup = svg.append("g")
		.attr("class", "x-axis axis")
		// .attr("transform", "translate(0," + height + ")");

	let yAxis = d3.axisLeft()
		.scale(y)

	let yAxisGroup = svg.append("g")
		.attr("class", "y-axis axis")
		// .style("text-anchor", "middle");

	let booleanClick = false;

	// Initialize data
	loadData();

// Create a 'data' property under the window object
	// to store the coffee chain data
	Object.defineProperty(window, 'data', {
		// data getter
		get: function() { return _data; },
		// data setter
		set: function(value) {
			_data = value;
			// update the visualization each time the data property is set by using the equal sign (e.g. data = [])
			updateVisualization()
		}
});

// Load CSV file
function loadData() {
	d3.csv("data/coffee-house-chains.csv").then(csv=> {

		csv.forEach(function(d){
			d.revenue = +d.revenue;
			d.stores = +d.stores;
		});

		// Store csv data in global variable
		data = csv;

        // updateVisualization gets automatically called within the data = csv call;
		// basically(whenever the data is set to a value using = operator);
		// see the definition above: Object.defineProperty(window, 'data', { ...
	});
}

// Render visualization
function updateVisualization() {

  	console.log(data);

	if (d3.select("#ranking-type").property("value") === "revenue")
		{
			if (booleanClick == false)
			{
				data.sort((a, b) => b.revenue - a.revenue);
				console.log(booleanClick);
			}
			else if (booleanClick == true)
			{
				data.sort((a, b) => a.revenue - b.revenue);
				console.log(booleanClick);
			}

			// Set dynamic ordinal scale for x axis
			x.domain(data.map(d => d.company));

			svg.select(".x-axis")
				.attr("transform", "translate(0," + height + ")")
				.transition()
				.duration(1500)
				.call(xAxis);

			// Set dynamic linear scale for y axis
			y.domain([0, d3.max(data, d => d.revenue)]);

			svg.select(".y-axis")
				// .transition()
				// .duration(1500)
				.call(yAxis);

			let bars = svg.selectAll("rect")
				.data(data, d=>d.company)

			bars.enter().append("rect")
				.merge(bars)
				.attr("class", "bar")
				.attr("fill", "brown")
				.transition()
				.duration(1000)
				.attr("x", d => x(d.company))
				.transition()
				.duration(1000)
				.attr("width", x.bandwidth())
				.attr("y", d => y(0))
				.attr("height", 0)
				.transition()
				.delay(250)
				.duration(1500)
				.attr("y", d => y(d.revenue))
				.attr("height", d => height - y(d.revenue))


			// x.exit().remove();
			// y.exit().remove();
			bars.exit().remove();
		}
	else if (d3.select("#ranking-type").property("value") === "stores")
		{
			if (booleanClick == false)
			{
				data.sort((a, b) => b.stores - a.stores);
				console.log(booleanClick);
			}
			else if (booleanClick == true)
			{
				data.sort((a, b) => a.stores - b.stores);
				console.log(booleanClick);
			}

			// Set dynamic ordinal scale for x axis
			x.domain(data.map(d => d.company));

			svg.select(".x-axis")
				.attr("transform", "translate(0," + height + ")")
				.transition()
				.duration(1500)
				.call(xAxis);

			// Set dynamic linear scale for y axis
			y.domain([0, d3.max(data, d => d.stores)]);

			svg.select(".y-axis")
				// .transition()
				// .duration(1500)
				.call(yAxis);

			let bars = svg.selectAll("rect")
				.data(data, d=>d.company)

			bars.enter().append("rect")
				.merge(bars)
				.attr("class", "bar")
				.attr("fill", "brown")
				.transition()
				.duration(1000)
				.attr("x", d => x(d.company))
				.attr("y", d => y(d.stores))
				.transition()
				.duration(1000)
				.attr("width", x.bandwidth())
				.attr("y", d => y(0))
				.attr("height", 0)
				.transition()
				.delay(250)
				.duration(1500)
				.attr("y", d => y(d.stores))
				.attr("height", d => height - y(d.stores))


			// x.exit().remove();
			// y.exit().remove();
			bars.exit().remove();
		}
}

// Initiate data switch with changing the drop down menu

d3.select("#ranking-type").on("change", function () {

	updateVisualization();

});

// Initiate sort change with click
d3.select("#change-sorting").on("click", function() {

	booleanClick = !booleanClick;
	console.log(booleanClick);

	updateVisualization();

	/* if (d3.select("#ranking-type").property("value") === "revenue")
	{
		booleanClick !== booleanClick;

		if (booleanClick = false)
		{
			data.sort((a, b) => b.revenue - a.revenue);
			console.log(booleanClick);
		}
		else if (booleanClick = true)
		{
			data.sort((a, b) => a.revenue - b.revenue);
			console.log(booleanClick);
		}

		// Set dynamic ordinal scale for x axis
		x.domain(data.map(d => d.company));

		svg.select(".x-axis")
			.attr("transform", "translate(0," + height + ")")
			.transition()
			.duration(1500)
			.call(xAxis);

		svg.select(".bar")
			.style("opacity", 0.5)
			.transition()
			.duration(1000)
			.data(data, d=>(d))
			.attr("x", d => x(d.company))
			.attr("y", d => y(d.revenue))
			.attr("width", x.bandwidth())
			.attr("y", d => y(d.revenue))
			.attr("height", d => height - y(d.revenue))

	}
	else if (d3.select("#ranking-type").property("value") === "stores")
	{
		booleanClick != booleanClick;

		if (booleanClick = false)
		{
			data.sort((a, b) => b.stores - a.stores);
			console.log(booleanClick);
		}
		else if (booleanClick = true)
		{
			data.sort((a, b) => a.stores - b.stores);
			console.log(booleanClick);
		}

		// Set dynamic ordinal scale for x axis
		x.domain(data.map(d => d.company));

		svg.select(".x-axis")
			.attr("transform", "translate(0," + height + ")")
			.transition()
			.duration(1500)
			.call(xAxis);

		svg.select(".bar")
			.style("opacity", 0.5)
			.transition()
			.duration(1000)
			.data(data, d=>(d))
			.attr("x", d => x(d.company))
			.attr("y", d => y(d.stores))
			.attr("width", x.bandwidth())
			.attr("y", d => y(d.stores))
			.attr("height", d => height - y(d.stores))

		/* svg.select(".bar")
			.transition()
			.duration(1000)
			.style("opacity", 1) */
});
