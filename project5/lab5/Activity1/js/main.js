// (Bonus) Margin object with properties for the four directions
let margin = {top: 20, right: 10, bottom: 20, left: 10};

// Width and height as the inner dimensions of the chart area
let width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// Load CSV file
d3.csv("data/wealth-health-2014.csv", (row) =>{
		row.Income = +row.Income;
		row.LifeExpectancy = +row.LifeExpectancy;
		row.Population = +row.Population;
		return row;
}).then((data)=> {

	// Sort data and set global variable (Activity 3)let nationData = data.sort( (a, b) => {
	// 		return b.Population - a.Population;
	// 	})


	console.log(nationData)

	// Activity 1, assign svg drawing space
	let svg = d3.select("#chart-area")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Define the scales, variables, and create padding
	let padding = 30;

	let incomeMin = d3.min(nationData, d=>d.Income);
	let incomeMax = d3.max(nationData, d=>d.Income);

	// Activity 3 (bumped up here), trying out the log scale
	let incomeScale = d3.scaleLog()
		.domain([incomeMin + 100, incomeMax + 100])
		.range([padding, width - padding]);

	console.log(incomeScale(5000))

	let lifeMin = d3.min(nationData, d=>d.LifeExpectancy);
	let lifeMax = d3.max(nationData, d=>d.LifeExpectancy);

	let lifeExpectancyScale = d3.scaleLinear()
		.domain([lifeMin - 15, lifeMax])
		.range([height - padding, padding]);

	console.log(lifeExpectancyScale(68))

	// Create group element
	let mainGroup = svg.append("g")
		.attr("transform", "translate(70, 50)");

	// Activity 3 (bumped up here), adding scale to population data
	let popMin = d3.min(nationData, d=>d.Population);
	let popMax = d3.max(nationData, d=>d.Population);

	let popScale = d3.scaleLinear()
		.domain([popMin, popMax])
		.range([4, 30]);

	// Activity 3 (bumped up here), adding color scale to region data
	let colorPalette = d3.scaleOrdinal(d3.schemeCategory10);

	// Draw the circles
	let circle = mainGroup.selectAll("circle")
		.data(nationData)
		.enter()
		.append("circle")
		.attr("cx", d=>incomeScale(d.Income))
		.attr("cy", d=>lifeExpectancyScale(d.LifeExpectancy))
		.attr("r", function(d) {return popScale(d.Population)})
		.attr("fill", function(d) {return colorPalette(d.Region)})
		.attr("stroke-width", "1")
		.attr("stroke", "black")

	// Create a horizontal axis with labels placed below the axis
	let xAxis = d3.axisBottom()
		.scale(incomeScale)
		.ticks(3)

	// Draw the x axis
	let xAxisGroup = svg.append("g")
		.attr("class", "axis x-axis")
		.attr("transform", "translate(0," + (height - padding) + ")")
		.call(xAxis);

	// Activity 2, draw the y axis
	let yAxis = d3.axisLeft()
		.scale(lifeExpectancyScale)
		.ticks(8)

	// Draw the x axis
	let yAxisGroup = svg.append("g")
		.attr("class", "axis y-axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);

	// Add axis labels
	let xAxisLabel = xAxisGroup.append("text")
		.attr("class", "axis-label")
		.text("Income per Person (GDP per Capita)")
		.attr("x", 800)
		.attr("y", -10)
		.style("text-anchor", "middle")

	let yAxisLabel = yAxisGroup.append("text")
		.attr("class", "axis-label")
		.text("Life Expectancy")
		.attr("x", -70)
		.attr("y", 20)
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "middle")

	// Activity 3, add a scale function for the circle radius (see above)


});