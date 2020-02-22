const margin = {top: 50, right: 50, bottom: 50, left: 50}, 
                width = 800 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom

d3.csv('gapminder.csv').then((data) => {
    const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    const svg = d3.select('#display').append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    const tooltipSvg = div.append("svg")
        .attr('width', 500)
        .attr('height', 400)

    dataMain = data.filter(d => d['year'] == "1980");

    const xScale = d3.scaleLinear()
        .domain([1, 10])
        .range([margin.left, width + margin.left])
    svg.append("g")
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale))

    const yLimit = d3.extent(dataMain, d => d['life_expectancy']) 
    const yScale = d3.scaleLinear()
        .domain([yLimit[1] + 5, yLimit[0] - 5])
        .range([margin.top, margin.top + height])
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale))

    svg.append("text")
        .attr("transform", "translate(400,20)")    
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "underline")  
        .text("Fertility vs Life Expectancy (1980)");

    svg.append("text")             
        .attr("transform", "translate(400,585)")
        .style("text-anchor", "middle")
        .text("Fertility");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", -300)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Life Expectancy"); 
    
    svg.selectAll('.country').data(dataMain)
        .enter()
        .append('circle')
            .attr('cx', d => xScale(d['fertility']))
            .attr('cy', d => yScale(d['life_expectancy']))
            .attr('r', d => d['population'] / 100000000 + 2)
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1)
            .attr('fill', 'transparent')
            .on("mouseover", function(d) {
                createTooltip(data, d.country, tooltipSvg)

                div.transition()
                    .duration(200)
                    .style('opacity', 0.9)

                div.style('left', d3.event.pageX + "px")
                    .style('top', (d3.event.pageY - 28) + "px")
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(300)
                    .style('opacity', 0)
            })
    
    let dataLabels = dataMain.filter(d => d['population'] >= 100000000);
    svg.selectAll('.country').data(dataLabels)
        .enter()
        .append('text')
            .attr('x', d => xScale(d['fertility']) + 20)
            .attr('y', d => yScale(d['life_expectancy']) - 8)
            .attr("dy", "1em")
            .text(d => d.country)


    function createTooltip(data, country, tooltipSvg) {
        tooltipSvg.selectAll("svg > *").remove();
        dataTooltip = data.filter(d => d['country'] == country)
        dataTooltip = dataTooltip.filter(d => d['population'] != "NA");
        let xLimitTool = d3.extent(dataTooltip, d => d['year'])
        let xScaleTool = d3.scaleLinear()
            .domain([Math.min(xLimitTool[0], xLimitTool[1]),
                    Math.max(xLimitTool[0], xLimitTool[1])])
            .range([50, 450])
        tooltipSvg.append("g")
            .attr("transform", "translate(0,350)")
            .call(d3.axisBottom(xScaleTool))

        //let yLimitTool = d3.extent(dataTooltip, d => d['population'])
        //Had to forde to be first and last data point because d3 min/max/extent was not returning correct value
        let yScaleTool = d3.scaleLinear()
            .domain([dataTooltip[55].population, dataTooltip[0].population])
            .range([50, 350])
        tooltipSvg.append("g")
            .attr("transform", "translate(50,0)")
            .call(d3.axisLeft(yScaleTool)
            .tickFormat(d3.format(".5s")))
        
        let line = d3.line()
            .x(d => xScaleTool(d['year']))
            .y(d => yScaleTool(d['population']))

        tooltipSvg.append("path")
            .datum(dataTooltip)
            .attr("d", d => { return line(d) })
            .attr("stroke", "steelblue")

        tooltipSvg.append("text")
            .attr("transform", "translate(250,20)")    
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text(country + ": Population vs Year");

        tooltipSvg.append("text")             
            .attr("transform", "translate(250,380)")
            .style("text-anchor", "middle")
            .text("Year");

        tooltipSvg.append("text")
            .attr("transform", "translate(30,40)")
            .style("text-anchor", "middle")
            .text("Population"); 
    }
})