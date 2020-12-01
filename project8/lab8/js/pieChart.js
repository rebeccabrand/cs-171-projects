/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */


class PieChart {

    // constructor method to initialize Timeline object
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.circleColors = ['#b2182b','#d6604d','#f4a582','#fddbc7'];

        // call initVis method
        this.initVis()
    }

    initVis(){
        let vis = this;

        // margin conventions
        vis.margin = {top: 10, right: 50, bottom: 10, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title pie-title')
            .append('text')
            .text('Nondescript Pie Chart!')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');


        // TODO
        // Pie chart group
        vis.pieGroup = vis.svg.append("g")
            .attr('class', 'pie-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");

        // Inner and outer radii
        vis.outerRadius = vis.width / 2;
        vis.innerRadius = 0;

        // Pie chart layout
        vis.pie = d3.pie()
            .value(function(d){
                console.log(d)
                return d.value
            });

        // // Ordinal color scale
        // vis.color = d3.scaleOrdinal(d3.schemeCategory10);

        // Path generator
        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);

        // Define tooltip
        // append tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')
            .style("opacity", 0);

        // call next method in pipeline
        this.wrangleData();
    }

    // wrangleData method
    wrangleData(){
        let vis = this

        vis.displayData = []

        // generate random data
        for (let i = 0; i < 4; i++){
            let random = Math.floor(Math.random() * 100)
            vis.displayData.push({
                value: random,
                color: vis.circleColors[i]
            })
        }

        vis.updateVis()

    }

    // updateVis method
    updateVis(){
        let vis = this;

        // Bind data
        vis.arcs = vis.pieGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData))

        // Append paths
        vis.arcs.enter()
            .append("path")

            // merge new data
            .merge(vis.arcs)
            .attr("d", vis.arc)
            .attr("fill", d => d.data.color)

            // On click attributes
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(173,222,255,0.62)')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3>Arc with index #${d.index}<h3>
                             <h4> value: ${d.value}</h4>      
                             <h4> startAngle: ${d.startAngle}</h4> 
                             <h4> endAngle: ${d.endAngle}</h4>   
                             <h4> data: ${JSON.stringify(d.data)}</h4>                         
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d => d.data.color)
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        // Exit
        vis.arcs.exit().remove();

    }
}