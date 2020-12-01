
// Global variable with 60 attractions (JSON format)
// console.log(attractionData);

// Activity 3

dataFiltering();

function dataFiltering() {

	// Call data manipulation function
	let valueType = dataManipulation();

	// Filter data based on type category selected in website
	let attractions = attractionData.filter((value, index, attractions) => {
		if (valueType != "all")
		{
			return (value.Category === valueType);
		}
		else
		{
			return true
		}
	});

	// Sort attraction data in descending order by visitors
	attractions.sort( (a, b) => {
		return b.Visitors - a.Visitors;
	})

	// Pass a function to attractions.filter () to list top 5 attractions of that type
	let topFiveAttractions = attractions.filter( (value, index) => {
		return (index < 5);
	});

	// Render bar chart
	renderBarChart(topFiveAttractions)

	// Include array function trigger
	document.getElementById("attraction-category").onchange = function() {dataFiltering()};
}

function dataManipulation() {
	let selectBox = document.getElementById("attraction-category");
	let selectedValue = selectBox.options[selectBox.selectedIndex].value;
	return selectedValue;
}



