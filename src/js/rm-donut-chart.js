var rmDonutChart = function() {
	
	'use strict';
		
	var dataset,
		margin = {top: 40, right: 40, bottom: 40, left: 40},
		height = 200,
	 	width = 200,
	 	strokeWidth = 15,
	 	animationComplete = false,
	 	foreground,
	 	percent,
	 	pi,
	 	arc,
	 	g;
	 	
	
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
		setTimeout(function() {
		  foreground.transition()
		      .duration(1000)
		      .ease('elastic')
		      .call(arcTween, percent * pi);
		}, 200);			
	};	
	
	
	chart.svgInit = function(svg) {
		svg.attr('width', width)
           .attr('height', height)
           .attr('class', 'donut-chart'); 


		cwidth = width - margin.right - margin.left;
		cheight = height - margin.top - margin.bottom;
		var radius = Math.min(cwidth, cheight) / 2;
		pi = 2 * Math.PI;
		percent = dataset.values / dataset.total;

		arc = d3.svg.arc()
		    .outerRadius(radius)
		    .innerRadius(radius - strokeWidth)
		    .startAngle(0);
		
		g = svg.append("g")
		   .attr("transform", "translate(" + ((width/2)) + "," + ((height/2)) + ")");
		
		var background = g.append("path")
		    .datum({endAngle: pi})
		    .attr("class", "donut-background")
		    .attr("d", arc);
		
		foreground = g.append("path")
		    .datum({endAngle: 0 })
		    .attr("class", function() { return dataset.carrier; })
		    .attr("d", arc);
		  
	   var text = svg.append("text")
	   				 .attr("text-anchor", "middle")
	   				 .classed("tally", true)
	   				 .attr("y", height/2)
	   				 .attr("x", width/2)
	   				 .attr("fill", "#555")
	   				 .text(dataset.total);
	   				 
	   var carrierText = svg.append("text")
	   				 .attr("text-anchor", "middle")
	   				 .attr("y", (height/2) + 30)
	   				 .attr("x", width/2)
	   				 .attr("class", function() {
		   				 return "carrier " + dataset.carrier;
	   				 })
	   				 .text(dataset.carrier);
		   				 
	}; //chart.svgInit
	
	
	function arcTween(transition, newAngle) {

	  transition.attrTween("d", function(d) {
	    var interpolate = d3.interpolate(d.endAngle, newAngle);
	    
	    return function(t) {
	      d.endAngle = interpolate(t);
	      return arc(d);
	    };
	  });
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
    
    chart.strokeWidth = function(value) {
        if (!arguments.length) { return strokeWidth; }
        strokeWidth = value;
        return chart;
    };
    
    chart.dataset = function(value) {
        if (!arguments.length) { return dataset; }
        dataset = value;
        return chart;
    };
		
	return chart;
}