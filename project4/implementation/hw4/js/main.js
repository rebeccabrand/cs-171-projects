console.log("let's get started!");

// Define array of Wiki links
let buildingLinks = [
    "https://en.wikipedia.org/wiki/Burj_Khalifa",
    "https://en.wikipedia.org/wiki/Abraj_Al_Bait",
    "https://en.wikipedia.org/wiki/One_World_Trade_Center",
    "https://en.wikipedia.org/wiki/Taipei_101",
    "https://en.wikipedia.org/wiki/Shanghai_World_Financial_Center",
    "https://en.wikipedia.org/wiki/International_Commerce_Centre",
    "https://en.wikipedia.org/wiki/Petronas_Towers",
    "https://en.wikipedia.org/wiki/Zifeng_Tower",
    "https://en.wikipedia.org/wiki/KK100",
    "https://en.wikipedia.org/wiki/Willis_Tower"
]

d3.csv("data/buildings.csv").then(function(data) {
    console.log(data);
});

d3.csv("data/buildings.csv", function(d) {
    return {
        building: d.building, // Keep string data
        city: d.city, // Same
        completed: parseFloat(d.completed), // Convert string to float
        country: d.country, // Keep string data
        floors: parseFloat(d.floors), // Convert string to float
        height_m: parseFloat(d.height_m), // Same
        height_ft: parseFloat(d.height_ft), // Same
        height_px: parseFloat(d.height_px), // Same
        image: d.image
    };
}).then((data)=> {
    let sortedBuildingsData = data.sort( (a, b) => {
        return b.height_m - a.height_m;
    })


    for (let i = 0; i < sortedBuildingsData.length; i++) {

        sortedBuildingsData[i].link = buildingLinks[i];

    }


    // Set global variable for building stats
    console.log(sortedBuildingsData);

    // Add svg element for left column (drawing space)
    let svg = d3.select("#left-column")
        .append("svg")
        .attr("width", 500)
        .attr("height", 500)

    // Add rectangles and bind the data
    svg.selectAll("rect")
        .data(sortedBuildingsData)
        .enter()
        .append("rect")
        .classed("bar-chart", true)
        .attr("x", 180)
        .attr("y", (d, i) => i * 50)
        .attr("width", (d) => (d.height_m) / 3)
        .attr("height", 30)
        .style("fill", "darkseagreen")
        .on("click", function(event, d){  // Add event listener
            console.log('check out what you have access to', event, d, this)
            interactiveColumn(d);
        });

    // Add building name text
    svg.selectAll("text.building-label")
        .data(sortedBuildingsData)
        .enter()
        .append("text")
        .text((d) => d.building)
        .attr("x", 170)
        .attr("y", (d, i) => 20 + (i * 50))
        .attr("text-anchor", "end")
        .style("font-size", "10")

    // Add building height text
    svg.selectAll("text.building-height")
        .data(sortedBuildingsData)
        .enter()
        .append("text")
        .text((d) => d.height_m)
        .attr("x", (d) => 175 + ((d.height_m) / 3))
        .attr("y", (d, i) => 20 + (i * 50))
        .attr("text-anchor", "end")
        .style("font-size", "12")
        .style("text-color", "white")

    // Set template table on right column to Burj Khalifa

    document.getElementById("building-title").innerHTML = sortedBuildingsData[0].building;
    document.getElementById("tb-height").innerHTML = sortedBuildingsData[0].height_m + " m";
    document.getElementById("tb-city").innerHTML = sortedBuildingsData[0].city;
    document.getElementById("tb-country").innerHTML = sortedBuildingsData[0].country;
    document.getElementById("tb-floors").innerHTML = sortedBuildingsData[0].floors;
    document.getElementById("tb-completion").innerHTML = sortedBuildingsData[0].completed;
    document.getElementById("building-link").href = sortedBuildingsData[0].link;

    // Add svg element for right column (drawing space)
    /* let svg_2 = d3.select("#image-container")
        .append("svg_2")
        .attr("width", 100)
        .attr("height", 100)

    svg_2.selectAll("img")
        .data(sortedBuildingsData)
        .enter()
        .append("img")
        .attr("xlink:href", "img/1.jpg")
        .attr("x", 60)
        .attr("y", 60)
        .attr('width', 60)
        .attr('height', 120) */

    function interactiveColumn(d) {

        selectedBuilding = d;

        document.getElementById("building-image").src = "img/" + selectedBuilding.image;
        document.getElementById("building-title").innerHTML = selectedBuilding.building;
        document.getElementById("tb-height").innerHTML = selectedBuilding.height_m + " m";
        document.getElementById("tb-city").innerHTML = selectedBuilding.city;
        document.getElementById("tb-country").innerHTML = selectedBuilding.country;
        document.getElementById("tb-floors").innerHTML = selectedBuilding.floors;
        document.getElementById("tb-completion").innerHTML = selectedBuilding.completed;
        document.getElementById("building-link").href = selectedBuilding.link;

        /* svg_2.selectAll("image")
            .data(selectedBuilding)
            .enter()
            .append("image")
            .attr("xlink:href", "img/" + d.image)
            .attr('width', 60)
            .attr('height', 120)

        svg_2.selectAll("text.building-title")
            .data(selectedBuilding)
            .enter()
            .append("text")
            .text((d) => d.building)
            .style("font-size", "24") */
    }

});