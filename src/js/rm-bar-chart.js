var rmBarChart = function() {
	
	'use strict';
		
	var dataset,
		height = 400,
	 	width = 600,
		margin = {top: 40, right: 40, bottom: 40, left: 40},
		min = 0,
		max = 100,
		animationComplete = false;
	
	var cwidth = width - margin.right - margin.left;
	var cheight = height - margin.top - margin.bottom;
	var y; //need the y axis globally available for animation and resize	
	
	function chart(selection) {
		cwidth = width - margin.right - margin.left;
		cheight = height - margin.top - margin.bottom;	
		
		selection.each(function(data) {
			var div = d3.select(this),
                svg = div.selectAll('svg').data([data]),
                $div = $(div[0]);                          
               
            svg.enter().append('svg')
	                   .call(chart.svgInit);    
                                                                                
			// div.node() converts d3 selection to jquery selection for plugin use
			$div.bind('inview', function(event, isInView) {
			  if (isInView) {
			    if(!animationComplete) {
				    animationComplete = true;
				 	svg.call(chart.animate); 
			    }				  	
			  }
			});                                                			
		});
	}
	
	chart.animate = function(svg) {
		var barContent = svg.select('.bar-content');							
		var bars = barContent.selectAll('.carrier-bar');	

		bars.data(dataset)
			.transition()
			.duration(750)
			.delay(function(d, i) { return 100 * i })
			.ease('elastic')
			.attr("height", function(d) { return cheight - y(d.score); })
			.attr("y", function(d) { return y(d.score); })	
			
	};	
	
	chart.svgInit = function(svg) {
		// Set the SVG size.
        svg.attr('width', width)
           .attr('height', height);

        var g = svg.append('g')
            .attr('class', 'chart-content')
            .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

		  	
	  	var barWidth = cwidth / dataset.length;
	  	var recWidth = barWidth / dataset.length;
	  	
	  	y = d3.scale.linear().domain([min, max]).range([cheight, 0]);

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .ticks(10)
		    .tickPadding(10)
		    .tickSize(-cwidth);	
				
			g.append("g")
		    .attr("class", "y axis")

			g.select(".y.axis").call(yAxis);
			
		
		var xAxis = g.append("g")
		    .attr("class", "x axis")
		    .attr('transform', 'translate(' + [barWidth, 0] + ')');
		
		xAxis.selectAll(".xaxis")
			.data(dataset)
			.enter()
			.append("line")
			.attr("class", "xaxis")
			.attr("transform", function(d,i) {
				return "translate(" + ((i * barWidth) ) + ", 0)"
			})
			.attr("x1", 0)					
			.attr("x2", 0)
			.attr("y1", 0)	
			.attr("y2", cheight);					
		
		var bars = g.append('g')
			.attr('class', 'bar-content');
		
		bars.selectAll("rect")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("class", function(d) { return d.name })
			.classed('carrier-bar', true)
			.attr("height", 0)
			.attr("y", function(d) { return cheight; })   											
			.attr("width", recWidth)
			.attr("transform", function(d, i) { return "translate(" + ((i * barWidth) + (barWidth/2) - recWidth/2) + ",0)"; });
			
		bars.selectAll(".error-bar-top")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("class", "error-bar-top")
			.attr("height", 1)
			.attr("width", recWidth/2)
			.attr("transform", function(d, i) { 
				var upperScale = y(d.upper);
				var lowerScale = y(d.lower);
				var difference = (upperScale - lowerScale) / 2;
				return "translate(" + ((barWidth*i) + (barWidth/2) - (recWidth/4)) + "," + (y(d.score) + difference) + ")"; 
			})			
		
		bars.selectAll(".error-bar-bottom")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("class", "error-bar-bottom")
			.attr("height", 1)
			.attr("width", recWidth/2)
			.attr("transform", function(d, i) {
				var upperScale = y(d.upper);
				var lowerScale = y(d.lower);
				var difference = (upperScale - lowerScale) / 2;
				return "translate(" + ((barWidth*i) + (barWidth/2) - (recWidth/4)) + "," + (y(d.score) - difference) + ")"; 
			});
			
		bars.selectAll(".error-bar")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("class", "error-bar")
			.attr("width", 1)
			.attr("transform", function(d, i) { 
				var upperScale = y(d.upper);
				var lowerScale = y(d.lower);
				var difference = (upperScale - lowerScale) / 2;
				return "translate(" + ((i * barWidth) + (barWidth/2)) + "," + (y(d.score) + difference) + ")"; })
			.attr("height", function(d) {
				var upperScale = y(d.upper);
				var lowerScale = y(d.lower);
				return  (lowerScale - upperScale);
		});	
	
		bars.selectAll(".scoreText")
            .data(dataset)
            .enter()
            .append("text")
            .attr("class", "scoreText")
            .attr("text-anchor", "middle")
            .style("fill", "#555")
            .style("font-size", "12px")
            .attr("transform", function(d, i) { 
                return "translate(" + ((i * barWidth) + (barWidth/2)) + "," +  (y(d.upper) - 5) + ")"; })
            .text(function(d) { return d.score.toFixed(1) });  
			      
	    bars.selectAll(".carrierText")
            .data(dataset)
            .enter()
            .append("text")
            .style("font-size", "12px")
            .attr("class", "carrierText")
            .style("fill", "#555555")
            .attr("y", cheight + 20)
            .style("text-anchor", "middle")
            .attr("transform", function(d, i) { 
				return "translate(" + (((i * barWidth)) + (barWidth /2 ))  + ", 0)";
            })
            .text(function(d){return d.name;});
	}
	
	
	chart.width = function(value) {
        if (!arguments.length) { return width; }
        width = value;
        return chart;
    };

    // Height Accessor
    chart.height = function(value) {
        if (!arguments.length) { return height; }
        height = value;
        return chart;
    };

    // Margin Accessor
    chart.margin = function(value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return chart;
    };
    
    chart.min = function(value) {
	    if (!arguments.length) { return min; }
	    min = value;
	    return chart;
    }
    
    chart.max = function(value) {
	    if (!arguments.length) { return max; }
	    max = value;
	    return chart;
    }
    
    chart.dataset = function(value) {
	    if (!arguments.length) { return dataset; }
	    dataset = value;
	    return chart;
    }
	
	return chart;
};