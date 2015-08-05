var rmHrDoubleBarChart = function() {
	
	debugger;
	
	'use strict';
		
	var dataset,
		svg,
		height = 400,
	 	width = 600,
		margin = {top: 20, right: 20, bottom: 20, left: 20},
		errorBars = true,
		min = 0,
		max = 0,
		xAxis,
		barWidth,
		barHeight = 30,
		barPadding = 50,
		cwidth,
		cheight,
		x,
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
		var bars = barContent.selectAll('.carrier-bar')[0];	
		var ties = barContent.selectAll('.carrier-ties')[0];	
		var scores = barContent.selectAll('.scoreText')[0];
		
		var counter = 0;

		$.each(dataset, function(index, v) {
			var multiplier = barHeight * index;
			
			$.each(v, function(i, val) {																	
				d3.select(bars[counter])
					.transition()
					.duration(500)
					.delay(function() { return 100 * counter})
					.ease('exp-out') 				
					.attr("width", x(val.wins + val.ties));
				
				d3.select(ties[counter])
					.transition()
					.duration(500)
					.delay(function() { return 100 * counter})
					.ease('exp-out') 				
					.attr("width", x(val.ties));					
					
				d3.select(scores[counter])
					.transition()
					.duration(500)
					.delay(function() { return 100 * counter})
					.ease('exp-out')
					.attr("x", x(val.wins + val.ties) + 85)
		            .text(val.wins + val.ties);			                 
															
				counter++;	
			});			
		});	
	};
	
	chart.svgInit = function(svg) {
		height = dataset[0].length * (barHeight + barPadding) + margin.top + margin.bottom;
				
		// Set the SVG size.
        svg.attr('width', width)
           .attr('height', height);

        // Append a container group and translate it to consider the margins.
        var g = svg.append('g')
            .attr('class', 'chart-content')
           .attr('transform', 'translate(' + [margin.left, margin.top] + ')');
				
					        
        $.each(dataset, function(index, value) {
	       $.each(value, function(i, v) {
		       var higher = v.ties + v.wins;
			   max = higher > max ? higher : max;
	       })
        });
                
		var y = d3.scale.ordinal()
				.domain([0, max])
				.rangeBands([0, cwidth]);

		x = d3.scale.linear()
				.domain([min, max])
				.range([0, (cwidth - margin.right - margin.left - 75)]);							
				
		svg.append('defs')
		    .append('pattern')
		    .attr('id', 'diagonalHatch')
		    .attr('patternUnits', 'userSpaceOnUse')
		    .attr('width', 7)
		    .attr('height', 7)
		    .attr('patternTransform', 'rotate(45 0 0)')
		    .append('line')
		    .attr('x1', '0')
		    .attr('y1', '0')
		    .attr('x2', '0')
		    .attr('y2', '7')
		    .attr('stroke', '#ffffff')
		    .attr('stroke-width', 2);
		  
		  
		svg.append("line")
			.attr("class", "x axis")
			.attr("x1", margin.left + 75)					
			.attr("x2", margin.left + 75)
			.attr("y1", 0)	
			.attr("y2", height)
			.style("stroke", "#555555")
			.style("stroke-width", 2)       
		
		var bars = g.append('g')
			.attr('class', 'bar-content'); 
			
			   
		bars.selectAll(".carrierText")
			.data(dataset[0])
            .enter()
            .append("text")
            .attr("class", "carrierText")
            .style("fill", "#555555")
            .attr("y", function(d, i) { return i * (barHeight + barPadding) + barHeight + 5} )
            .attr("x", 28)
            .attr('text-anchor', 'end')
            .text(function(d){return d.name;});                    
	 
		$.each(dataset, function(index, v) {
			var multiplier = barHeight * index;
			
			$.each(v, function(i, val) {				                 	
				
				bars.append("rect")
				    .attr("class", function(d) { return val.name })
				    .classed("carrier-bar", true)
			        .style("opacity", function() { return index == 0 ? 0.5 : 1; })
			        .attr("height", barHeight)
					.attr("y", function() { return (i * (barHeight + barPadding) + multiplier) }) 
					.attr("x", 75)			        				
			        .attr("width", 0);
		                
                bars.append("rect")
                	.classed("carrier-ties", true)
	                .attr('fill', 'url(#diagonalHatch)')
	                .style('opacity', 0.5)
	                .attr("height", barHeight)
					.attr("x", 75)
					.attr("y", i * (barHeight + barPadding) + multiplier)					
					.attr("width", 0);	
					
				bars.append("text")
	                .attr("class", "scoreText")
	                .style("fill", "#555555")		                
	                .attr("y", function() { return (i * (barHeight + barPadding) + multiplier + 20) }) 	                
	                .attr("x", 75)
	                .text(val.wins + val.ties);							
			        
			});

		});			
		
	}
	
	
	chart.width = function(value) {
        if (!arguments.length) { return width; }
        width = value;
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
    
    chart.dataset = function(value) {
	    if (!arguments.length) { return dataset; }
	    dataset = value;
	    return chart;
    }
	
	return chart;
};