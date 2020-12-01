
// The function is called every time when an order comes in or an order gets processed
// The current order queue is stored in the variable 'orders'

// Activity 1
// Add svg element (drawing space)
let svg = d3.select("#chart-area").append("svg")
	.attr("width", 700)
	.attr("height", 200);

function updateVisualization(orders) {
	console.log(orders);

	// Data-join (circle now contains the update selection)
	let circle = svg.selectAll("circle")
		.data(orders, function (d) {
			return d;
		});

	// Count order total for printing later
	let total = d3.selectAll(orders).size()

	// Enter (initialize the newly added elements)
	circle.enter().append("circle")
		.attr("class", "dot")
		.attr("fill", function (d) {
			if (d.product === "coffee")
			{
				return "brown";
			}
			else
			{
				return "green";
			}
		})
		// Enter and Update (set the dynamic properties of the elements)
		.merge(circle)
		.attr("r", 25)
		.attr("cx",(d,index)=>(index * 80) + 250)
		.attr("cy", 80);

	svg.selectAll("text").remove();

	svg.append("text")
		.attr("x", 70)
		.attr("y", 90)
		.text("Orders: " + total);

	// Exit
	circle.exit().remove();

	d3.csv('wealth-health-2014.csv').then(data =>{
		console.log(data)
	})
}