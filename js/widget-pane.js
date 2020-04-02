import { genreDropdown } from "./widgets/genre-dropdown.js";

export default class WidgetPane {
	constructor(_config, mainView) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 400,
			containerHeight: _config.containerHeight || 400,
			margin: _config.margin || {
				top: 10,
				bottom: 10,
				right: 10,
				left: 10
			}
		};

		this.genreList = [];
		this.selectedOption = "";
		this.yearList = [];
		this.selectedYears = [];
		this.mainView = mainView;
	}

	initVis() {
		let vis = this;

		vis.div = d3
			.select(vis.config.parentElement)
			.attr("width", vis.config.containerWidth)
			.attr("height", vis.config.containerHeight);

		// Add genreDropdown to wiget pane
		vis.genre_dropdown = vis.div.insert("div", ".header.years").attr("id", "dropdown");

		// Add year slider to wiget pane
		vis.year_chart = d3
			.select("#year-chart")
			.append("g")
			.attr("transform", "translate(40, 390)");

		vis.histogramSlider();

		vis.render();
	}

	update() {
		let vis = this;

		vis.render();
		vis.mainView.update();
	}

	render() {
		let vis = this;

		vis.genre_dropdown.call(genreDropdown, {
			options: vis.genreList,
			onOptionSelected: option => {
				vis.selectedOption = option;
				vis.update();
			},
			selectedOption: vis.selectedOption || vis.genreList[0]
		});
	}

	// From https://observablehq.com/@trebor/snapping-histogram-slider
	histogramSlider() {
		let vis = this;

		const defaultOptions = {
			w: 550,
			h: 150,
			margin: {
				top: 20,
				bottom: 20,
				left: 0,
				right: 20
			},
			bucketSize: 5,
			defaultRange: [0, 100]
		};

		const [min, max] = d3.extent(vis.yearList);
		const yearRange = _.range(min, max + 1);
		const range = [min, max + 1];

		// set width and height of svg
		const { w, h, margin, bucketSize, defaultRange } = defaultOptions;

		// dimensions of slider bar
		const width = w - margin.left - margin.right;
		const height = h - margin.top - margin.bottom;

		const gEnter = vis.year_chart
			.enter()
			.append("g")
			.attr("class", "container");
		gEnter.merge(vis.year_chart);

		// create x scale
		const xScale = d3
			.scaleLinear()
			.domain(range)
			.range([0, width]);

		let bar = vis.year_chart
			.selectAll("g")
			.data(yearRange)
			.enter()
			.append("g");

		bar.append("rect")
			.attr("x", d => xScale(d))
			.attr("y", height - 110)
			.attr("width", width / (range[1] - range[0]))
			.attr("height", 110)
			.style("fill", "#BEBEBE");

		bar.append("text")
			.attr("class", "label")
			.attr("x", -60)
			.attr("y", d => xScale(d) + 9)
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-90)")
			.style("fill", "white")
			.text(d => d);

		// define brush
		let brush = d3
			.brushX()
			.extent([
				[0, 0],
				[width, height]
			])
			.on("brush", function() {
				let s = d3.event.selection;

				// Update and move labels
				const startYear = Math.round(xScale.invert(s[0]));
				const endYear = Math.round(xScale.invert(s[1])) - 1;

				vis.selectedYears = [startYear, endYear];

				// Move brush handles
				handle.attr("display", null).attr("transform", (d, i) => "translate(" + [s[i], -height / 4] + ")");

				// Update view;
				// if the view should only be updated after brushing is over,
				// move these two lines into the on('end') part below
				vis.year_chart.node().value = s.map(d => bucketSize * Math.round(xScale.invert(d)));
				vis.year_chart.node().dispatchEvent(new CustomEvent("input"));
			})
			.on("end", function() {
				if (!d3.event.sourceEvent) return;
				let d0 = d3.event.selection.map(xScale.invert);
				let d1 = d0.map(Math.round);
				d3.select(this)
					.transition()
					.call(d3.event.target.move, d1.map(xScale));

				vis.update();
			});

		// Append brush to g
		let gBrush = vis.year_chart
			.append("g")
			.attr("class", "brush")
			.call(brush);

		// Add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
		let brushResizePath = function(d) {
			let e = +(d.type == "e"),
				x = e ? 1 : -1,
				y = height / 2;

			// prettier-ignore
			return (
					"M" + 0.5 * x + "," + y + "A6,6 0 0 " + e + " " + 6.5 * x +	"," + 
					(y + 6) + "V" +	(2 * y - 6) + "A6,6 0 0 " +	e +	" " + 0.5 * x +	"," +
					 2 * y + "Z" +	"M" + 2.5 * x +	"," + (y + 8) +	"V" +
					(2 * y - 8) + "M" +	4.5 * x +	"," + (y + 8) + "V" + (2 * y - 8)
				);
		};

		let handle = gBrush
			.selectAll(".handle--custom")
			.data([{ type: "w" }, { type: "e" }])
			.enter()
			.append("path")
			.attr("class", "handle--custom")
			.attr("stroke", "#FFFFFF")
			.attr("fill", "#EEEEEE")
			.attr("cursor", "ew-resize")
			.attr("d", brushResizePath);

		// Override default behaviour - clicking outside of the selected area
		// will select a small piece there rather than deselecting everything
		// (from https://bl.ocks.org/mbostock/6498000)
		gBrush
			.selectAll(".overlay")
			.each(function(d) {
				d.type = "selection";
			})
			.on("mousedown touchstart", brushcentered)
			.style("pointer-events", "none");

		function brushcentered() {
			let dx = x(1) - x(0), // Use a fixed width when recentering
				cx = d3.mouse(this)[0],
				x0 = cx - dx / 2,
				x1 = cx + dx / 2;
			d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
		}

		// Select default range
		gBrush.call(brush.move, [vis.selectedYears[0], vis.selectedYears[1]].map(xScale));

		return vis.year_chart.node();
	}
}
