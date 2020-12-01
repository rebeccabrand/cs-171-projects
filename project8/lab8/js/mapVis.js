/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, airportData, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.airportData = airportData;

        // define colors
        this.colors = ['#fddbc7','#f4a582','#d6604d','#b2182b']

        this.initVis()
    }

    initVis() {
        let vis = this;


        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .text('Map of the World!')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');


        // Draw globe
        vis.projection = d3.geoOrthographic() // d3.geoStereographic()
            .translate([vis.width / 2, vis.height / 2])
            .scale(240)

        // Define path
        vis.path = d3.geoPath()
            .projection(vis.projection)

        // Convert TopoJSON into GeoJSON
        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features

        // Add sphere
        vis.svg.append("path")
            .datum(d3.geoGraticule())
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // Draw countries (transparent fill)
        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .style("fill", "white")

        // Map tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')
            .style("opacity", 0);

        // Legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 2.8 / 4}, ${vis.height - 20})`)

        // Airports group
        vis.links = vis.svg.selectAll("line")
            .data(vis.airportData.links)
            .enter()
            .append("line")
            .attr("x1", function(d) { return vis.projection([vis.airportData.nodes[d.source].longitude, vis.airportData.nodes[d.source].latitude])[0]; })
            .attr("y1", function(d) { return vis.projection([vis.airportData.nodes[d.source].longitude, vis.airportData.nodes[d.source].latitude])[1]; })
            .attr("x2", function(d) { return vis.projection([vis.airportData.nodes[d.target].longitude, vis.airportData.nodes[d.target].latitude])[0]; })
            .attr("y2", function(d) { return vis.projection([vis.airportData.nodes[d.target].longitude, vis.airportData.nodes[d.target].latitude])[1]; })
            .style("stroke", "gray")
            .style("stroke-width", 2);

        vis.nodes = vis.svg.selectAll("circle")
            .data(vis.airportData.nodes)
            .enter()
            .append("circle")
            .attr('cx', d => vis.projection([d.longitude, d.latitude])[0])
            .attr('cy', d => vis.projection([d.longitude, d.latitude])[1])
            .attr("r", 5)
            .style("fill", "yellow")
            .style("stroke", "gray")
            .style("stroke-width", 0.5);


        // Make the map draggable
        let m0,
            o0;

        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)

                    // d3.selectAll("circle").attr("d", vis.path)
                    // d3.selectAll("line").attr("d", vis.path)
                })
        )

        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        // create random data structure with information for each land
        vis.countryInfo = {};
        vis.geoData.objects.countries.geometries.forEach( d => {
            let randomCountryValue = Math.random() * 4
            vis.countryInfo[d.properties.name] = {
                name: d.properties.name,
                category: 'category_' + Math.floor(randomCountryValue),
                color: vis.colors[Math.floor(randomCountryValue)],
                value: randomCountryValue/4 * 100
            }
        })

        console.log(vis.countryInfo);

        vis.updateVis(vis.countryInfo)
    }



    updateVis(){
        let vis = this;

        // TODO
        // Grab selection and change fill

        // let dataMap = {}
        // vis.countryInfo.forEach(function(d){
        //
        //     dataMap[d["name"]]=d;
        //
        // })
        //
        // console.log(dataMap);

        // Bind data
        vis.svg.selectAll(".country")
            .style("fill", function (d) {
               return (vis.countryInfo[d.properties.name].color);
            })
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'white')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3> Name: ${vis.countryInfo[d.properties.name].name}<h3>
                             <h4> Category: ${vis.countryInfo[d.properties.name].category}</h4>
                             <h4> Value: ${vis.countryInfo[d.properties.name].value}</h4>
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .style("fill", function (d) {
                        return (vis.countryInfo[d.properties.name].color);
                    })
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

            // Merge
            // .merge(vis.filledCountries)
            // .attr("d", vis.path)
            // .style("fill", d => d.countryInfo.color)

        // Exit
        // vis.filledCountries.exit().remove();

        // Create legend here
        vis.legend.selectAll().data(vis.colors)
            .enter()
            .append("rect")
            .attr("x", (d,i) => (i*50))
            .attr("y", 0)
            .attr("height", "50px")
            .attr("width", "50px")
            .style("fill", function (d) {
                return d;
            })

        vis.axis = vis.legend.append("g")
            .attr('class', 'axis')

        vis.x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, 200])

        vis.xAxis = d3.axisTop()
            .scale(vis.x)
            .ticks(3)

        // Call legend axis inside the legend group
        vis.svg.select(".axis")
            //.attr("transform", "translate(20,)")
            .call(vis.xAxis)

    }
}