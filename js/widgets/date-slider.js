export const dateSlider = (selection, props) => {
	const {
		years,
		onYearsSelected,
		selectedYears,
		containerWidth,
		containerHeight
	} = props;

	// let barChart = barChart()
	// 	.dimension(date)
	// 	.group(dates)
	// 	.round(d3.time.day.round)
	// 	.x(d3.time.scale()
	// 		.domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
	// 		.rangeRound([0, 10 * 90]))
	// 		.filter([new Date(2001, 1, 1), new Date(2001, 2, 1)])

	// let dateChart = selection.selectAll(".chart")
	//   .data(barChart)
	//   .on("brush", renderAll)
	//   .on("brushend", renderAll);

	const barGroup = selection.append("g").attr("class", "barGroup");
	const brushGroup = selection.append("g").attr("class", "brushGroup");

	const sliderMargin = { top: 10, right: 10, bottom: 30, left: 10 };
	const sliderHeight =
		containerHeight - sliderMargin.top - sliderMargin.bottom;
	const sliderWidth = containerWidth - sliderMargin.left - sliderMargin.right;

	var brush = d3
		.brushX()
		.extent([sliderWidth, sliderHeight])
		.on("brush", moveBrush);

	// Set up the visual part of the brush
	var gBrush = d3
		.select(".brushGroup")
		.append("g")
		.attr("class", "brush")
		.call(brush);

	gBrush
		.selectAll(".resize")
		.append("line")
		.attr("x2", containerWidth);

	gBrush.selectAll("rect").attr("width", containerWidth);

	// Mini brushable bar
	// DATA JOIN
	var mini_bar = d3
		.select(".barGroup")
		.selectAll(".bar")
		.data(years);

	// UDPATE
	mini_bar
		.attr("width", containerWidth)
		.attr("y", 50)
		.attr("height", containerHeight);

	// ENTER
	mini_bar
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", 0)
		.attr("width", 10)
		.attr("y", 50)
		.attr("height", 100)
		.style("fill", "black");

	// EXIT
	mini_bar.exit().remove();

	// Start the brush
	gBrush.call(brush);
};
