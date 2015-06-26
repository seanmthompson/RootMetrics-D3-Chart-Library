var rmScatterPlot = function() {
	
	'use strict';
	
	var margin = {top: 40, right: 40, bottom: 40, left: 40},
		dataset,
		tooltip,
		radius = 7,
		width = 550,
		min = 0,
		max = 100,
		height = 550,
		carrier = 'EE',
		xLabel = 'Speed RootScore',
		yLabel = 'Reliability RootScore',
		animationComplete = false;

		
	var cwidth = width - margin.right - margin.left;
	var cheight = height - margin.top - margin.bottom;
	
	function chart(selection) {
		
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
		svg.selectAll(".scatter-dot")
	      	.transition()
	      	.duration(750)
	      	.delay(function(d, i) { return i * 100; })	
	      	.ease('elastic')			  					  	
		  	.attr("r", radius)		
	};		
	
	chart.svgInit = function(svg) {
		svg.attr('width', width)
           .attr('height', height);                   
           
        var cwidth = width - margin.right - margin.left;
		var cheight = height - margin.top - margin.bottom;
		
		var g = svg.append('g')
            .attr('class', 'chart-content')
            .attr('transform', 'translate(' + [margin.left, margin.top] + ')');
            
        var x = d3.scale.linear().range([0, cwidth]);
   		var y = d3.scale.linear().range([cheight, 0]);						   					   					   					   		
   				   	
		
		var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(-cwidth);
		var xAxis = d3.svg.axis().scale(x).orient("bottom");
		    
		x.domain([min, max]);
		y.domain([min, max]);    
		
		
		function zoomed() {
			g.select(".x.axis").call(xAxis);
			g.select(".y.axis").call(yAxis);
			
			g.selectAll('circle')
			.attr("cx", function(d) {
			  	return x(d.x); 
			})
		  	.attr("cy", function(d) { 
			  	return y(d.y); 
			})
			
		}
			    
		var zoom = d3.behavior.zoom()
							.scaleExtent([1, 8])
						    .x(x)
						    .y(y)
						    .on("zoom", zoomed);
	
		
		svg.call(zoom);
		svg.on("mousemove", function() { 
			return tooltip.style("top", (d3.event.pageY-10)+"px")
						  .style("left",(d3.event.pageX+10)+"px"); 
		}); 
		
		g.append("g")
	      .attr("class", "x axis")
	      .call(xAxis)
	      .attr("transform", "translate(0," + cheight + ")");

	
		g.append("g")
	      .attr("class", "y axis")
	      .call(yAxis);
	      
	     	      
	    g.selectAll(".scatter-dot")
		      	.data(dataset)
			  	.enter().append("circle")					  					  	
			  	.attr("class", "scatter-dot")
			  	.attr("r", 0)
			  	.attr("cx", function(d) {
				  	return x(d.x); 
				})
			  	.attr("cy", function(d) { 
				  	return y(d.y); 
				})
				.on("mouseover", function(d){ return showTooltip(d);})
				.on("mouseout", hideTooltip);
		
		tooltip = d3.select('body').append("div")
					.attr("class", "tooltip")
					.style("position", "absolute")
					.style("visibility", "hidden");		  					
							
	};
	
	function showTooltip(d, allDataLookup) {
		tooltip.style("visibility", "visible")				
			.html(function () {
				var str='<p><b>' + d.name + '</b></p>';
                str += '<p>Reliability: <b>' + d.x.toFixed(1) + '</b></p>';
                str += '<p>Speed: <b>' + d.y.toFixed(1) + '</b></p>';
	                return str;
                });						
	}

	function hideTooltip() {
		tooltip.style("visibility", "hidden");
	}
	
	chart.width = function(value) {
        if (!arguments.length) { return width; }
        width = value;
        return chart;       
    };
    
    chart.height = function(value) {
        if (!arguments.length) { return height; }
        height = value;
        return chart;
    };

	chart.radius = function(value) {
        if (!arguments.length) { return radius; }
        radius = value;
        return chart;
    };

	    
    chart.margin = function(value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return chart;
    };
    
    chart.min = function(value) {
	    if (!arguments.length) { return min; }
	    min = value;
	    return chart;
    };
    
    chart.max = function(value) {
	    if (!arguments.length) { return max; }
	    max = value;
	    return chart;
    };
    
    chart.xLabel = function(value) {
	    if (!arguments.length) { return xLabel; }
	    xLabel = value;
	    return chart;
    };
    
    chart.yLabel = function(value) {
	    if (!arguments.length) { return yLabel; }
	    yLabel = value;
	    return chart;
    };

	chart.dataset = function(value) {
	    if (!arguments.length) { return dataset; }
	    dataset = value;
	    return chart;	    
    }

	return chart;
};