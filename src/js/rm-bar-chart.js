var rmBarChart = function() {
	
	'use strict';
		
	var dataset,
		svg,
		height = 400,
	 	width = 600,
	 	ranks = false,
		margin = {top: 40, right: 40, bottom: 60, left: 40},
		min = 0,
		max = 100,
		barWidth,
		recWidth,
		errorBars = true,
		cwidth,
		cheight,
		y,
		animationComplete = false;

	
	function chart(selection) {
		cwidth = width - margin.right - margin.left;
		cheight = height - margin.top - margin.bottom;	
		
		selection.each(function(data) {									
			var div = d3.select(this),               
                $div = $(div[0]);      
                
            svg = div.selectAll('svg').data([data]);                        
               
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
	
	chart.update = function(data) {
		dataset = data;
		svg.call(chart.animate);
	}
	
	chart.animate = function(svg) {
		var barContent = svg.select('.bar-content');							
		var bars = barContent.selectAll('.carrier-bar');	
		var scores = barContent.selectAll('.scoreText');
		var ranks = barContent.selectAll('.rankText');
		var rankCircles = barContent.selectAll('.rankCircle');
		var errorBottom = barContent.selectAll('.error-bar-bottom');
		var errorTop = barContent.selectAll('.error-bar-top');
		var errorBar = barContent.selectAll('.error-bar');
		var carrierText = barContent.selectAll('.carrierText');

		bars.data(dataset)
			.attr("class", function(d) { return d.name })
			.classed('carrier-bar', true)
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i })
			.ease('exp-out')
			.attr("height", function(d) { return cheight - y(d.score); })			
			.attr("y", function(d) { return y(d.score); })		
		
		carrierText.data(dataset)
			.text(function(d){return d.name;});
			
		scores.data(dataset)
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i})
			.ease('exp-out')
			.attr("transform", function(d, i) {
				if(d.upper) {
	            	return "translate(" + ((i * barWidth) + (barWidth/2)) + "," +  (y(d.upper) - 5) + ")";
            	} else {
	            	return "translate(" + ((i * barWidth) + (barWidth/2)) + "," +  (y(d.score) - 5) + ")";
            	} 
			})             
            .text(function(d) { return d.score.toFixed(1) });
            
        errorBar.data(dataset)
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i})
			.ease('exp-out')
			.attr("transform", function(d, i) {
				var upperScale = y(d.upper);
				return "translate(" + ((i * barWidth) + (barWidth/2)) + "," + upperScale + ")"; 
			})
			.attr("height", function(d) {
				var upperScale = y(d.upper);
				var lowerScale = y(d.lower);
				return  (lowerScale - upperScale);   
			})
            
        errorBottom.data(dataset)
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i})
			.ease('exp-out')
			.attr("transform", function(d, i) {
				var lowerScale = y(d.lower);
				return "translate(" + ((barWidth*i) + (barWidth/2) - (recWidth/4)) + "," + lowerScale + ")"; 
			});					
		
		errorTop.data(dataset)
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i})
			.ease('exp-out')
			.attr("transform", function(d, i) {
				var upperScale = y(d.upper);
				return "translate(" + ((barWidth*i) + (barWidth/2) - (recWidth/4)) + "," + upperScale + ")";
			});		
			
		if(ranks) {
	        rankCircles.data(dataset)
                .attr('class', "rankCircle")
                .attr("fill", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "transparent";
					}
				})
				.attr("stroke", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "#999999";
					}
				});
	        
	    	ranks.data(dataset)           
	             .text(function(d) { return d.rank });
        }   	
			             
	};	
	
	chart.svgInit = function(svg) {
		// Set the SVG size.
        svg.attr('width', width)
           .attr('height', height);

        var g = svg.append('g')
            .attr('class', 'chart-content')
            .attr('transform', 'translate(' + [margin.left, margin.top] + ')');
		
		  	
	  	barWidth = cwidth / dataset.length;
	  	recWidth = barWidth / 2;
	  	
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
			
			
		if(errorBars) { 
			bars.selectAll(".error-bar-top")
				.data(dataset)
				.enter()
				.append("rect")
				.attr("class", "error-bar-top")
				.attr("height", 1)
				.attr("width", recWidth/2)
				.attr("transform", function(d, i) { 
					return "translate(" + ((barWidth*i) + (barWidth/2) - (recWidth/4)) + "," + cheight + ")"; 
				})
				.style('display', 'none');			
			
			bars.selectAll(".error-bar-bottom")
				.data(dataset)
				.enter()
				.append("rect")
				.attr("class", "error-bar-bottom")
				.attr("height", 1)
				.attr("width", recWidth/2)
				.attr("transform", function(d, i) {
					return "translate(" + ((barWidth*i) + (barWidth/2) - (recWidth/4)) + "," + cheight + ")"; 
				})
				.style('display', 'none');
				
			bars.selectAll(".error-bar")
				.data(dataset)
				.enter()
				.append("rect")
				.attr("class", function(d) { return d.name })
				.classed("error-bar secondary", true)
				.attr("width", 2)
				.attr("transform", function(d, i) { 
					return "translate(" + ((i * barWidth) + (barWidth/2)) + "," + cheight + ")"; })
				.attr("height", 0);	
		};			
		
		bars.selectAll(".scoreText")
            .data(dataset)
            .enter()
            .append("text")
            .attr("class", "scoreText")
            .attr("text-anchor", "middle")
            .style("fill", "#555")
            .style("font-size", "12px")
            .attr("transform", function(d, i) { 
		        return "translate(" + ((i * barWidth) + (barWidth/2)) + "," +  cheight + ")"; 
             })   
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
				return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; 
            })
            .text(function(d){return d.name;});
            
        if(ranks) {
	        bars.selectAll(".rankCircle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr('class', "rankCircle")
                .attr("fill", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "transparent";
					}
				})
				.attr("stroke", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "#999999";
					}
				})
                .attr("stroke-width", "1px")
                .attr("cy", cheight + 40)
                .attr("r", 10)
                .attr("transform", function(d, i) { return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; }) 	
	        
	    	bars.selectAll(".rankText")
	            .data(dataset)
	            .enter()
	            .append("text")
	            .style("font-size", "12px")
	            .attr("class", "rankText")
	            .style("fill", function(d) {
					if(d.rank == 1) {
						return "#FFFFFF";
					} else {
						return "#555555";
					}
				})
	            .attr("y", cheight + 44)
	            .style("text-anchor", "middle")
	            .attr("transform", function(d, i) { 
					return "translate(" + (((i * barWidth)) + (barWidth /2 )) + ",0)"; 
	            })
	            .text(function(d, i){ return d.rank; });
        }    
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
    
    chart.errorBars = function(value) {
	    if (!arguments.length) { return errorBars; }
	    errorBars = value;
	    return chart;
    }
    
    chart.ranks = function(value) {
	    if (!arguments.length) { return ranks; }
	    ranks = value;
	    return chart;
    }
    
    chart.dataset = function(value) {
	    if (!arguments.length) { return dataset; }
	    dataset = value;
	    return chart;
    }
	
	return chart;
};