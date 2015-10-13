var rmDoubleBarChart = function() {
	
	'use strict';
		
	var dataset,
		svg,
		height = 400,
	 	width = 600,
		margin = {top: 60, right: 40, bottom: 40, left: 40},
		errorBars = true,
		min = 0,
		max,
		ticks = 5,
		yAxis,
		barWidth,
		recWidth,
		animationComplete = false;
		
	var cwidth = width - margin.right - margin.left;
	var cheight = height - margin.top - margin.bottom;
	var y; //need the y axis globally available for animation and resize		
	
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
		var bars = barContent.selectAll('.carrier-bar')[0];	
		var scores = barContent.selectAll('.scoreText')[0];
		var errorBottom = barContent.selectAll('.error-bar-bottom')[0];
		var errorTop = barContent.selectAll('.error-bar-top')[0];
		var errorBar = barContent.selectAll('.error-bar')[0];
							
		var counter = 0;

		svg.select(".y.axis").call(yAxis);

		$.each(dataset, function(index, v) {
			var multiplier = recWidth * index;
			
			$.each(v, function(i, val) {																	
				d3.select(bars[counter])
					.transition()
					.duration(500)
					.delay(function() { return 100 * counter})
					.ease('exp-out') 				
					.attr("y", function(d) { return y(val.score); })			        
					.attr("height", function() { return cheight - y(val.score); })
					
				d3.select(scores[counter])
					.transition()
					.duration(500)
					.delay(function() { return 100 * counter})
					.ease('exp-out')
					.attr("transform", function(d, iterator) { 
		                return "translate(" + ((i * barWidth) + (barWidth/2) - (recWidth/2) + multiplier) + "," +  ((y(val.upper) - 7)) + ")"; 
		            })
		            .text(function(d) { return +val['score'].toFixed(1) });
		        
		        d3.select(errorBottom[counter])
					.transition()
					.duration(500)
					.delay(function() { return 100 * counter})
					.ease('exp-out')
					.attr("transform", function(d, iterator) { 
		                return "translate(" + ((i * barWidth) + (barWidth/2) - recWidth + multiplier + (recWidth/v.length)) + "," + y(val.lower) + ")"; 	
		            }); 
		            
		        d3.select(errorTop[counter])
					.transition()
					.duration(500)
					.delay(function() { return 100 * counter})
					.ease('exp-out')
					.attr("transform", function(d, iterator) { 
		                return "translate(" + ((i * barWidth) + (barWidth/2) - recWidth + multiplier + (recWidth/v.length)) + "," + y(val.upper) + ")"; 	
		            });
		            
		        d3.select(errorBar[counter])
					.transition()
					.duration(500)
					.delay(function() { return 100 * counter})
					.ease('exp-out')
					.attr("transform", function(d, iterator) { 
		                return "translate(" + ((i * barWidth) + (barWidth/2) - (recWidth/2) + multiplier) + "," + y(val.upper) + ")"; 	
		            })
		            .attr("height", function(d) {
						var upperScale = y(val.upper);
						var lowerScale = y(val.lower);
						return  (lowerScale - upperScale);        
					});		  
															
				counter++;	
			});			
		});							
	};
	
	chart.svgInit = function(svg) {
		// Set the SVG size.
        svg.attr('width', width)
           .attr('height', height);

        // Append a container group and translate it to consider the margins.
        var g = svg.append('g')
            .attr('class', 'chart-content')
            .attr('transform', 'translate(' + [margin.left, margin.top] + ')');


		// checks if there is a custom max set, otherwise, take max value of dataset
		if(!max) {
			max = 0;
			$.each(dataset, function(i, v) {
				$.each(v, function(ind,val) {
					if(val.upper > max) {
						max = val.upper;
					}
				});	
		  	});
		};  	
						  	
	  	barWidth = cwidth / dataset[0].length;
	  	recWidth = barWidth / dataset[0].length;
	  	
	  	y = d3.scale.linear().domain([min, max]).range([cheight, 0]);

		yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .ticks(ticks)
		    .tickPadding(10)
		    .tickSize(-cwidth);	
				
			g.append("g")
		    .attr("class", "y axis")

			g.select(".y.axis").call(yAxis);
			
		
		var xAxis = g.append("g")
		    .attr("class", "x axis")
		    .attr('transform', 'translate(' + [barWidth, 0] + ')');
		
		xAxis.selectAll(".xaxis")
			.data(dataset[0])
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
		

		bars.selectAll(".carrierText")
            .data(dataset[0])
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
            
        $.each(dataset, function(index, v) {
			var multiplier = recWidth * index;
			
			$.each(v, function(i, val) {
				
				//rectangle bars
				bars.append("rect")
				    .attr("class", function(d) { return val.name })
				    .classed("carrier-bar", true)
			        .style("opacity", function() { return index == 0 ? 0.5 : 1; })
			        .attr("height", 0)
					.attr("y", function(d) { return cheight; }) 
			        .attr("width", recWidth)
			        .attr("transform", function(d, iterator) { 
				      return "translate(" + ((i * barWidth) + (barWidth/2) - recWidth + multiplier)  + ",0)"; 
				});

				
				if(errorBars) {
					bars.append("rect")
						.attr("class", function(d) { return val.name  })
						.classed("error-bar secondary", true)
						.attr("width", 2)
						.attr("transform", function(d, iterator) { 
							var upperScale = y(val.upper);
							return "translate(" + ((i * barWidth) + (barWidth/2) - (recWidth/2) + multiplier) + "," + cheight + ")"; })
						.attr("height", function(d) {
							var upperScale = y(val.upper);
							var lowerScale = y(val.lower);
							return  (lowerScale - upperScale);
					});
					
					
					// Upper error bar
					bars.append("rect")
						.attr("class", "error-bar-top")
						.attr("height", 1)
						.attr("width", recWidth/2)
						.attr("transform", function(d, iterator) { 
							var upperScale = y(val.upper);
							return "translate(" + ((i * barWidth) + (barWidth/2) - recWidth + multiplier + (recWidth/v.length)) + "," + cheight + ")"; 						
					})
					.style('display', 'none');
					
					// Lower error bar
					bars.append("rect")
						.attr("class", "error-bar-bottom")
						.attr("height", 1)
						.attr("width", recWidth/2)
						.attr("transform", function(d, iterator) { 
							var lowerScale = y(val.lower);
							return "translate(" + ((i * barWidth) + (barWidth/2) - recWidth + multiplier + (recWidth/v.length)) + "," + cheight + ")"; 						
					})
					.style('display', 'none');
				}	
				
				bars.append("text")
	                .attr("class", "scoreText")
	                .attr("text-anchor", "middle")
	                .style("fill", "#555")
	                .style("alignment-baseline", "baseline")
	                .style("font-size", "12px")
	                .text(function(d) { return +val['score'].toFixed(1) })
	                .attr("transform", function(d, iterator) { 
		                return "translate(" + ((i * barWidth) + (barWidth/2) - (recWidth/2) + multiplier) + "," +  cheight + ")"; 
		        });
	                 	
				
			});			
        });   
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
    
    chart.ticks = function(value) {
	    if (!arguments.length) { return ticks; }
	    ticks = value;
	    return chart;
    }
    
    chart.errorBars = function(value) {
	    if (!arguments.length) { return errorBars; }
	    errorBars = value;
	    return chart;
    }
    
    chart.dataset = function(value) {
	    if (!arguments.length) { return dataset; }
	    dataset = value;
	    return chart;
    }
	
	return chart;
};