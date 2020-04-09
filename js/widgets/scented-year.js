export const scentedYearView = (selection, props) => {
	const { data, defaultYearRange, totalRange, onSelectedYearRangeChanged } = props;

	const width = 500;
	const height = 300;
	const margin = { top: 10, right: 10, bottom: 10, left: 10 };
	const histHeight = height / 3;

	// x scale for years
	const x = d3.scaleLinear().domain(totalRange).range([0, width]);

	const xAxis = d3.axisBottom().scale(x).tickFormat(d3.format("d"));

	// y scale for histogram
	const y = d3.scaleLinear().range([histHeight, 0]);

	const colorScale = d3.scaleSequential(d3.interpolateGreys).domain([0, 2000]);

	// set parameters for histogram
	const histogram = d3
		.histogram()
		.value((d) => d.year)
		.domain(x.domain());

	const hist = selection
		.append("g")
		.attr("class", "histogram")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// group data for bars
	const bins = histogram(data);

	// y domain based on binned data
	y.domain([0, d3.max(bins, (d) => d.length)]);

	const bar = hist
		.selectAll(".bar")
		.data(bins)
		.enter()
		.append("g")
		.attr("class", "bar")
		.attr("transform", (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")");

	bar.append("rect")
		.attr("class", "bar")
		.attr("x", 1)
		.attr("width", (d) => x(d.x1) - x(d.x0) - 1)
		.attr("height", (d) => histHeight - y(d.length))
		.attr("fill", (d) => colorScale(d.length));

	bar.append("text")
		.attr("dy", ".75em")
		.attr("y", "6")
		.attr("x", (d) => (x(d.x1) - x(d.x0)) / 2)
		.attr("text-anchor", "middle")
		.text((d, i) => {
			if (d.length > 30) {
				return d.length;
			}
		})
		.style("fill", "white");

	hist.append("g").attr("class", "slider-labels").attr("transform", "translate(0, 120)").call(xAxis);

	const dataset = data;

	const slider = selection
		.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(" + margin.left + "," + (margin.top + histHeight + 5) + ")");

	slider
		.append("line")
		.attr("class", "track")
		.attr("x1", x.range()[0])
		.attr("x2", x.range()[1])
		.select(function () {
			return this.parentNode.appendChild(this.cloneNode(true));
		})
		.attr("class", "track-inset")
		.select(function () {
			return this.parentNode.appendChild(this.cloneNode(true));
		})
		.attr("class", "track-overlay");

	const startHandle = slider
		.insert("ellipse", ".track-overlay")
		.attr("class", "handle left")
		.attr("rx", 9)
		.attr("ry", 9)
		.attr("cx", x(defaultYearRange[0]))
		.style("fill", "rgb(250, 121, 0)");

	const endHandle = slider
		.insert("ellipse", ".track-overlay")
		.attr("class", "handle right")
		.attr("rx", 9)
		.attr("ry", 9)
		.attr("cx", x(defaultYearRange[1]))
		.style("fill", "rgb(250, 121, 0)");

	let dx = 0; // change in x position, negative if moved left, init

	slider.call(
		d3
			.drag()
			.on("start.interrupt", function () {
				slider.interrupt();
			})
			.on("drag end", function () {
				if (d3.event.active == 1) dx = d3.event.dx;
				if (d3.event.type == "end") {
					const currentLeftX = d3.select(".handle.left").attr("cx");
					const currentRightX = d3.select(".handle.right").attr("cx");
					const xloc = d3.event.x; // x position of end event

					// define conditions of brush movement
					const rightMovedRight = xloc > currentLeftX + dx && xloc > currentRightX && dx > 0;
					const leftMovedRight = xloc > currentLeftX + dx && xloc < currentRightX && dx > 0;
					const leftMovedLeft = xloc < currentLeftX && xloc < currentRightX && dx < 0;
					const rightMovedLeft = xloc >= currentLeftX && xloc <= currentRightX && dx < 0;

					if (rightMovedRight || rightMovedLeft) {
						updateEndRange(xloc, currentLeftX);
					} else if (leftMovedRight || leftMovedLeft) {
						updateStartRange(xloc, currentRightX);
					}
				}
			})
	);

	function updateStartRange(newLeftX, oldRightX) {
		const updatedStartYear = Math.round(x.invert(newLeftX));
		startHandle.transition().delay(250).attr("cx", x(updatedStartYear));

		const endYear = Math.round(x.invert(oldRightX));
		const newRange = [updatedStartYear, endYear];

		// callback to update range
		onSelectedYearRangeChanged(newRange);

		// histogram bar colors
		d3.selectAll(".slider-labels")
			.selectAll(".tick")
			.select("text")
			.attr("stroke", (d) => {
				if (d == updatedStartYear || d == endYear) {
					return "white";
				}
			});
	}

	function updateEndRange(newRightX, oldLeftX) {
		const updatedEndYear = Math.round(x.invert(newRightX));
		endHandle.transition().delay(250).attr("cx", x(updatedEndYear));

		const startYear = Math.round(x.invert(oldLeftX));
		const newRange = [startYear, updatedEndYear];

		// callback to update range
		onSelectedYearRangeChanged(newRange);

		// histogram bar colors
		d3.selectAll(".slider-labels")
			.selectAll(".tick")
			.select("text")
			.attr("stroke", (d) => {
				if (d == startYear || d == updatedEndYear) {
					return "white";
				}
			});
	}
};
