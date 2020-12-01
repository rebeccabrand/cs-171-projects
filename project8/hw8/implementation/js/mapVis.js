/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    // constructor method to initialize map object
    constructor(parentElement, statesData, statesAlbersData, covidData, usaData) {
        this.parentElement = parentElement;
        this.statesData = statesData;
        this.statesAlbersData = statesAlbersData;
        this.covidData = covidData;
        this.usaData = usaData;
        this.displayData = [];

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
    }

    initVis() {

        let vis = this

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("class", "map")
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .text('United States Geography')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // Draw USA with Albers projection
        vis.projection = d3.geoAlbersUsa()
            .translate([vis.width / 2, vis.height / 2])
            .scale(800)

        // Define path
        vis.path = d3.geoPath()
            .projection(vis.projection)

        vis.USA = topojson.feature(vis.statesData, vis.statesData.objects.states).features

        // Draw states (transparent fill)
        vis.states = vis.svg.selectAll(".states")
            .data(vis.USA)
            .enter().append("path")
            .attr("class", "states")
            .attr("d", vis.path)
            .style("fill", "white")
            //.transform()

        // Map tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')
            //.style("opacity", 0);

        // Legend axis scale
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width * 0.25])

        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)
            .ticks(1)
            .tickFormat(d => {
                if ((d / 1000 >= 1)) {
                    let round = d3.format("0.0f")
                    d = round(d / 1000) + "K";
                }
                return d;
            });

        // Define color scale
        vis.colorScale = d3.scaleLinear()
            .range(["white", "DarkCyan"])

        // Legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 2.8 / 5}, ${vis.height - 50})`)

        //Append a defs (for definition) element to your SVG
        vis.defs = vis.legend.append("defs")

        //Append a linearGradient element to the defs and give it a unique id
        vis.linearGradient = vis.defs.append("linearGradient")
            .attr("id", "linear-gradient");

        //Set the color for the start (0%)
        vis.linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white");

        //Set the color for the end (100%)
        vis.linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "DarkCyan");

        // Color the legend
        vis.legend.append("rect")
            .attr("x", 0)
            .attr("y", -20)
            .attr("height", "20px")
            .attr("width", vis.width * 0.25)
            .style("fill", "url(#linear-gradient)")

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this

        // check out the data
        console.log(vis.covidData)
        console.log(vis.usaData)

        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];

        // if there is a region selected
        if (selectedTimeRange.length !== 0){

            console.log(selectedTimeRange[0], selectedTimeRange[1]);

            // iterate over all rows the csv (dataFill)
            vis.covidData.forEach( row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0].getTime() <= vis.parseDate(row.submission_date).getTime() && vis.parseDate(row.submission_date).getTime() <= selectedTimeRange[1].getTime() ){
                    filteredData.push(row);
                }
            });

        } else {
            filteredData = vis.covidData;
        }

        // prepare covid data by grouping all rows by state
        let covidDataByState = Array.from(d3.group(filteredData, d =>d.state), ([key, value]) => ({key, value}))

        // have a look
        console.log(covidDataByState)

        // init final data structure in which both data sets will be merged into
        vis.stateInfo = [];

        // Object.keys(vis.stateInfo).forEach( key => console.log(vis.stateInfo[key].absCases))

        // merge datasets
        // vis.statesData.objects.states.geometries.forEach(geo => {

            covidDataByState.forEach( state => {

                // if (nameConverter.getFullName(state.key) === geo.properties.name) {

                    // get full state name
                    let stateName = nameConverter.getFullName(state.key)

                    // init counters
                    let newCasesSum = 0;
                    let newDeathsSum = 0;
                    let population = 0;

                    // look up population for the state in the census data set
                    vis.usaData.forEach( row => {
                        if(row.state === stateName){
                            population += +row["2019"].replaceAll(',', '');
                        }
                    })

                    // calculate new cases by summing up all the entries for each state
                    state.value.forEach( entry => {
                        newCasesSum += +entry['new_case'];
                        newDeathsSum += +entry['new_death'];
                    });

                    // vis.statesData.objects.states.geometries.forEach(d => {
                    //     // populate the final data structure
                    //     vis.stateInfo[stateName] =
                    //         {
                    //             state: stateName,
                    //             population: population,
                    //             absCases: newCasesSum,
                    //             absDeaths: newDeathsSum,
                    //             relCases: (newCasesSum / population * 100),
                    //             relDeaths: (newDeathsSum / population * 100)
                    //         }
                    // })

                    // populate the final data structure
                    vis.stateInfo.push(
                        {
                            state: stateName,
                            population: population,
                            absCases: newCasesSum,
                            absDeaths: newDeathsSum,
                            relCases: (newCasesSum/population*100),
                            relDeaths: (newDeathsSum/population*100)
                        }
                    )
            })

        //console.log(vis.stateInfo);

        vis.updateVis();
    }

    updateVis() {

        let vis = this;

        // vis.maxValue = 0;
        //
        // // Find max value
        // Object.keys(vis.stateInfo).forEach( function(key) {
        //     if(vis.stateInfo[key][selectedCategory] > vis.maxValue){
        //         vis.maxValue = vis.stateInfo[key][selectedCategory];
        //     }
        // })

        console.log(selectedCategory);

        // Set domain
        vis.colorScale
            .domain([0, d3.max(vis.stateInfo, d => d[selectedCategory])]);

        vis.xScale
            .domain([0, d3.max(vis.stateInfo, d => d[selectedCategory])]);

        // Call legend axis inside the legend group
        vis.legend
            .transition()
            .duration(800)
            .call(vis.xAxis);

        // console.log((vis.colorScale(vis.stateInfo["Alabama"][selectedCategory])));

        // Bind data
        vis.states
            .style("fill", function(d, i) {
                //let info = vis.stateInfo.find(({state}) => state === d.properties.name)
                let filteredStateInfo = vis.stateInfo.filter(x => (x.state === d.properties.name))
                //console.log(filteredStateInfo);
                if (filteredStateInfo.length > 0)
                {
                    let info = filteredStateInfo[0][selectedCategory];
                    //console.log(vis.colorScale(info))
                    return vis.colorScale(info);
                }
                else
                {
                  return "white";
                }
                // console.log(info)
                // return vis.colorScale(info[selectedCategory]);
            })
            .on('mouseover', function(event, d){
                let info = vis.stateInfo.find(({state}) => state === d.properties.name)
                //console.log(info)
                //console.log(info.population)
                d3.select(this)
                    .attr("stroke-width", "2px")
                    .attr("stroke", "brown")
                    .style("fill", "crimson")
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3>${info.state}</h3>
                             <h6>Population: ${info.population}</h6>
                             <h6>Cases (Absolute): ${info.absCases}</h6>
                             <h6>Deaths (Absolute): ${info.absDeaths}</h6>
                             <h6>Cases (Relative): ${info.relCases}</h6>
                             <h6>Deaths (Relative): ${info.relDeaths}</h6>
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .style("fill", function(d, i) {

                        let filteredStateInfo = vis.stateInfo.filter(x => (x.state === d.properties.name))
                        console.log(filteredStateInfo);
                        if (filteredStateInfo.length > 0)
                        {
                            let info = filteredStateInfo[0][selectedCategory];
                            console.log(vis.colorScale(info))
                            return vis.colorScale(info);
                        }
                        else
                        {
                            return "white";
                        }
                    })
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
    }
}