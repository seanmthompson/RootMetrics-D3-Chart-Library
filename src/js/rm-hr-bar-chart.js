var rmHrBarChart = function() {
	
	debugger;
	
	'use strict';
		
	var dataset,
		svg,
		height = 400,
	 	width = 600,
	 	ranks = false,
		margin = {top: 20, right: 20, bottom: 20, left: 20},
		errorBars = true,
		min = 0,
		max = 0,
		threshold = false,
		xAxis,
		barWidth,
		barHeight = 30,
		barPadding = 50,
		cwidth,
		cheight,
		x,
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
		var errorBar = barContent.selectAll('.error-bar');
		var carrierText = barContent.selectAll('.carrierText');
		
		bars.data(dataset)
			.attr("class", function(d) { return d.name })
			.classed('carrier-bar', true)
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i })
			.ease('exp-out')
			.attr("width", function(d) { return x(d.score); })			
		
		carrierText.data(dataset)
			.text(function(d){return d.name;});
			
		scores.data(dataset)
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i})
			.ease('exp-out')
			.attr("x", cwidth)            
            .text(function(d) { 
	            if(threshold && d.score.toFixed(1) <= 0) {
		            console.log('test');
					return "*";
				} else {
					return d.score.toFixed(1) 	
				}	            
	        });
            
        errorBar.data(dataset)
	        .attr("class", function(d) { return d.name })
			.classed("error-bar secondary", true)
			.transition()
			.duration(500)
			.delay(function(d, i) { return 100 * i})			
			.ease('exp-out')
			.attr("transform", function(d, i) {
				var lowerScale = x(d.lower);
				return "translate(" + (lowerScale + 90) + "," + (i * (barHeight + barPadding)) + ")";   
			})
			.attr("width", function(d) {
				var upperScale = x(d.upper);
				var lowerScale = x(d.lower);
				return  (upperScale - lowerScale);   
			});	
			
		if(ranks) {
	        rankCircles.data(dataset)
                .attr('class', "rankCircle")
                .style("fill", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "transparent";
					}
				})
				.style("stroke", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "#999999";
					}
				});
	        
	    	ranks.data(dataset) 
	    		 .style("fill", function(d) {
					if(d.rank == 1) {
						return "#FFFFFF";
					} else {
						return "#555555";
					}
				 })          
	             .text(function(d) { 
		            if(threshold && d.score.toFixed(1) <= 0) {
						return "";
					} else {
						return d.rank;	
					}	            
		        });
        }   
	};
	
	chart.svgInit = function(svg) {
		height = dataset.length * (barHeight + barPadding) + margin.top + margin.bottom;
		barWidth = cwidth / dataset.length;
	  	recWidth = barWidth / dataset.length;
	  			
		// Set the SVG size.
        svg.attr('width', width)
           .attr('height', height);

        // Append a container group and translate it to consider the margins.
        var g = svg.append('g')
            .attr('class', 'chart-content')
           .attr('transform', 'translate(' + [margin.left, margin.top] + ')');
				
					        
        $.each(dataset, function(index, v) {
			var higher = v.upper;
			max = higher > max ? higher : max;
        });
        
                
		y = d3.scale.ordinal()
				.domain([0, max])
				.rangeBands([0, cwidth]);

		x = d3.scale.linear()
				.domain([min, max])
				.range([0, (cwidth - margin.right - margin.left - 75)]);						        
		
		
		var bars = g.append('g')
			.attr('class', 'bar-content');
		
		bars.selectAll("rect")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("class", function(d) { return d.name })
			.classed('carrier-bar', true)
			.attr("height", barHeight)
			.attr("y", function(d, i) { return (i * (barHeight + barPadding)- (barHeight/2)) }) 
			.attr("x", 90)			        				
	        .attr("width", 0);
			
		if(errorBars) { 			
			bars.selectAll(".error-bar")
				.data(dataset)
				.enter()
				.append("rect")
				.attr("class", function(d) { return d.name })
				.classed("error-bar secondary", true)
				.attr("height", 2)
				.attr("transform", function(d, i) { 
					return "translate(0," + (i * (barHeight + barPadding)) + ")";
				})			  	
				.attr("width", 0);
		};			
				
		bars.selectAll(".scoreText")
            .data(dataset)
            .enter()
            .append("text")
            .attr("class", "scoreText")
            .attr("text-anchor", "end")
            .style("fill", "#555")
            .style("font-size", "12px")
            .attr("y", function(d, i){
                return i * (barHeight + barPadding) + 4;
            })
            .attr("x", 0)  
            .text(function(d) { 
	            if(threshold && d.score.toFixed(1) <= 0) {
					return "";
				} else {
					return d.score.toFixed(1) 	
				}	            
	        });
            
            
        bars.selectAll(".carrierText")
            .data(dataset)
            .enter()
            .append("text")
            .style("font-size", "12px")
            .attr("class", "carrierText")
            .style("fill", "#555555")
            .attr("y", function(d, i){
                return i * (barHeight + barPadding) + 4;
            })
            .attr("x", 28)
            .text(function(d){return d.name;});    

            
        if(ranks) {
	        bars.selectAll(".rankCircle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class", "rankCircle")
                .style("fill", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "transparent";
					}
				})
				.style("stroke", function(d) {
					if(d.rank == 1) {
						return "#555555";
					} else {
						return "#999999";
					}
				})
                .attr("stroke-width", "1px")
                .attr("r", 10)
                .attr("cx", 11)
                .attr("cy", function(d, i){
                    return i * (barHeight + barPadding);
                })
                 .attr("style", function(d) {
					if(threshold && d.score.toFixed(1) <= 0) {
						return "display: none";
					}
				});
                
            bars.selectAll(".rankText")
                .data(dataset)
                .enter()
                .append("text")
                .style("font-size", "12px")
                .attr("class", "rankText")
                .attr("x", 11)
                .style("fill", function(d) {
					if(d.rank == 1) {
						return "#FFFFFF";
					} else {
						return "#555555";
					}
				})
                .attr("text-anchor", "middle")
                .attr("y", function(d, i) {
                    return i * (barHeight + barPadding) + 5;
                })
                .text(function(d) { 
		            if(threshold && d.score.toFixed(1) <= 0) {
						return "";
					} else {
						return d.rank;	
					}	            
		        });
        } 
		
	}
	
	
	chart.width = function(value) {
        if (!arguments.length) { return width; }
        width = value;
        return chart;
    };

    //Accessors
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
    
    chart.barHeight = function(value) {
	    if (!arguments.length) { return barHeight; }
	    barHeight = value;
	    return chart;
    }
    
    chart.barPadding = function(value) {
	    if (!arguments.length) { return barPadding; }
	    barPadding = value;
	    return chart;
    }
    
    chart.ranks = function(value) {
	    if (!arguments.length) { return ranks; }
	    ranks = value;
	    return chart;
    }
    
    chart.threshold = function(value) {
	    if (!arguments.length) { return threshold; }
	    threshold = value;
	    return chart;
    }
    
    chart.dataset = function(value) {
	    if (!arguments.length) { return dataset; }
	    dataset = value;
	    return chart;
    }
	
	return chart;
};