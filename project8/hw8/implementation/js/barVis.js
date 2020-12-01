/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVis {

    constructor(parentElement, statesData, statesAlbersData, covidData, usaData, isDescending){
        this.parentElement = parentElement;
        this.statesData = statesData;
        this.statesAlbersData = statesAlbersData;
        this.covidData = covidData;
        this.usaData = usaData;
        this.isDescending = isDescending;

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('COVID-19 in Discrete States')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // Bar chart tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')
        //.style("opacity", 0);

        // Scales and axes
        // Define color scale
        vis.colorScale = d3.scaleLinear()
            .range(["white", "DarkCyan"])

        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1)

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis bar-axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .ticks(5);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis bar-axis");

        vis.wrangleData();
    }

    wrangleData(iterable){
        let vis = this

        // I think one could use a lot of the dataWrangling from dataTable.js here...

        let filteredData = [];
        // if there is a region selected
        if (selectedTimeRange.length !== 0){

            console.log(selectedTimeRange[0], selectedTimeRange[1]);

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
        let covidDataByState = Array.from(d3.group(filteredData, d => d.state), ([key, value]) => ({key, value}))

        // init final data structure in which both data sets will be merged into
        vis.stateInfo = [];

        covidDataByState.forEach( state => {

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

        console.log(vis.stateInfo);

        // maybe a boolean in the constructor could come in handy ?
        if (vis.isDescending){
            vis.stateInfo.sort((a,b) => {return b[selectedCategory] - a[selectedCategory]})
        } else {
            vis.stateInfo.sort((a,b) => {return a[selectedCategory] - b[selectedCategory]})
        }

        console.log('final data structure', vis.stateInfo);

        vis.topTenData = vis.stateInfo.slice(0, 10)

        console.log('final data structure', vis.topTenData);

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        console.log('here')

        // Update domains
        vis.colorScale
            .domain([0, d3.max(vis.stateInfo, d => d[selectedCategory])]);

        vis.y.domain([0, d3.max(vis.topTenData, d => d[selectedCategory])])

        //vis.x.domain([0, d3.max(vis.topTenData, d => d[selectedCategory])])

        // vis.x.domain([0, d3.max(vis.topTenData, d => (d, i) => {
        //     return vis.topTenData[i].state
        // })])

        vis.x.domain(vis.topTenData.map((d,i) => {
            return vis.topTenData[i].state
        }))

        vis.bars = vis.svg.selectAll("rect")
            .data(vis.topTenData);

        vis.bars.enter().append("rect")
            .attr("class", "bar")
            .attr("fill", d => {
                let info = vis.topTenData.find(({state}) => state === d.state)
                return vis.colorScale(info[selectedCategory]);
            })
            .merge(vis.bars)
            .on('mouseover', function(event, d){
                let info = vis.topTenData.find(({state}) => state === d.state)
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
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .style("fill", d => {
                        let info = vis.topTenData.find(({state}) => state === d.state)
                        return vis.colorScale(info[selectedCategory]);
                    })
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .attr("x", d => vis.x(d.state))
            .attr("width", vis.x.bandwidth())
            .attr("y", d => vis.y(0))
            .attr("height", 0)
            .transition()
            .duration(800)
            .attr("y", d => vis.y(d[selectedCategory]))
            .attr("height", d => vis.height - vis.y(d[selectedCategory]))

        vis.bars.exit().remove();

        vis.svg.select(".x-axis")
            .transition()
            .duration(800)
            .call(vis.xAxis)
            .selectAll("text")
            .attr("font-size", "8px")
            .attr("dy", ".35em")
            //.attr("transform", "rotate(35)")

        vis.svg.select(".y-axis")
            .transition()
            .duration(800)
            .call(vis.yAxis)
            .selectAll("text")
            .attr("font-size", "8px")
            .attr("dy", ".35em")

        // // (1) Update domains
        // vis.x.domain([0, d3.max(vis.sortedGroups.map(d => d[1]))]);
        // // vis.x.domain(vis.sortedGroups.map(d=>d[1]))
        // vis.y.domain(vis.sortedGroups.map(d=>d[0]))
        //
        // // Update y axis
        // vis.svg.select(".y-axis").call(vis.yAxis);
        //
        // // (2) Draw rectangles
        // vis.barRect = vis.svg.selectAll("rect").data(vis.sortedGroups, d=>d[0])
        //
        // // enter
        // vis.barRect.enter().append("rect")
        //     .attr("class", "bars")
        //     .attr("fill", "IndianRed")
        //
        //     // merge
        //     .merge(vis.barRect)
        //     .attr("x", 0)
        //     .attr("y", d => vis.y(d[0]))
        //     .attr("height", vis.y.bandwidth())
        //     .transition()
        //     .duration(800)
        //     .attr("width", d => vis.x(d[1]))
        //
        // // exit
        // vis.barRect.exit().remove();
    }
}