export const scentedYearView = (selection, props) => {
	const { data, subRange, totalRange, onRangeChanged } = props;

	console.log(totalRange);
	console.log(subRange);

	const cf = crossfilter(data);

	const yearDim = cf.dimension(d => d.year);
	const yearGroup = yearDim.group();
	const width = 700;
	const height = 200;
	const xScale = d3
		.scaleLinear()
		.domain(totalRange)
		.rangeRound([0, width]);
	const binWidth = 25;
	const binGap = 5;
	const axisFormat = d3.axisBottom().tickFormat(d3.format("d"));

	const datesBarChart = dc.barChart(selection);

	datesBarChart
		.width(width)
		.height(height)
		.dimension(yearDim)
		.group(yearGroup)
		.x(xScale)
		.xUnits(d => binWidth)
		.gap(binGap)
		.elasticY(true)
		.brushOn(true)
		.xAxis(axisFormat)
		.filter(dc.filters.RangedFilter(subRange[0], subRange[1]));

	datesBarChart.on("filtered", function(chart) {
		const filters = chart.filters();
		const range = filters[0];
		if (filters.length) {
			console.log("Range:", Math.round(range[0]), Math.round(range[1]));
		} else console.log("No filters");
	});

	// .width(400)
	// .height(200)
	// .transitionDuration(800)
	// .margins({ top: 10, right: 50, bottom: 30, left: 40 })
	// .dimension(yearDim)
	// .group(yearGroup)
	// .x(d3.scaleTime().domain(range))
	// .xUnits(d3.timeYear)
	// .centerBar(true)
	// .renderHorizontalGridLines(true)
	// .brushOn(true)
	// .xAxis()
	// .tickFormat(d3.timeFormat("%Y"));

	//     barChart()
	//   .dimension(date)
	//   .group(dates)
	//   .round(d3.timeDay.round)
	//   .x(d3.scaleTime()
	//     .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
	//     .rangeRound([0, 10 * 90]))
	//   .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)]),

	// datesBarChart.on("filtered", function(chart) {
	// 	var filters = chart.filters();
	// 	if (filters.length) {
	// 		var range = filters[0];
	// 		console.log("range:", range[0], range[1]);
	// 	} else console.log("no filters");
	// });

	dc.renderAll();

	// let select = selection
	// 	.selectAll("select")
	// 	.data([null])
	// 	.join("select")
	// 	.on("change", function() {
	// 		const selected = this.value;
	// 		onOptionSelected(selected);
	// 	});

	// let dropdown = select
	// 	.selectAll("option")
	// 	.data(options)
	// 	.join("option");

	// dropdown
	// 	.attr("value", d => d)
	// 	.property("selected", d => d === selectedOption)
	// 	.text(d => d);
};
