import { dropdownGenreWidget } from "./widgets/dropdown-genre.js";
import { scentedYearView } from "./widgets/scented-year.js";

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
		this.selectedGenre = "";
		this.yearList = [];
		this.selectedYears = [];
		this.mainView = mainView;
		this.data = [];
		this.scoreData = {};
	}

	initVis() {
		let vis = this;

		vis.div = d3
			.select(vis.config.parentElement)
			.attr("width", vis.config.containerWidth)
			.attr("height", vis.config.containerHeight);

		// Add a dropdown to filter by game genre to wiget pane
		vis.dropdownGenreWidget = vis.div.insert("div", ".header.crit-score").attr("id", "dropdown");

		// Add to wiget pane a scented widget for selecting years of game release
		vis.scentedYearView = vis.div.select("#dates-bars");

		// Add critic score filter to wiget pane
		vis.critScoreFilterWidget = d3
			.select("#critic")
			.append("svg")
			.append("g")
			.attr("transform", "translate(50, 100)");

		// Add year slider to wiget pane
		vis.userScoreFilterWidget = d3
			.select("#user")
			.append("svg")
			.append("g")
			.attr("transform", "translate(100, 100)");

		// Add filter view for each game score type
		_.map(_.keys(vis.scoreData), type => {
			vis.initFilterWidget(type);
		});

		vis.render();
	}

	update() {
		let vis = this;

		vis.render();
		vis.mainView.update();
	}

	render() {
		let vis = this;

		vis.dropdownGenreWidget.call(dropdownGenreWidget, {
			options: vis.genreList,
			onOptionSelected: option => {
				vis.selectedGenre = option;
				vis.update();
			},
			selectedGenre: vis.selectedGenre || vis.genreList[0]
		});

		// vis.scentedYearView.call(scentedYearView, {
		// 	data: vis.data,
		// 	subRange: this.selectedYears,
		// 	totalRange: [this.yearList[0], this.yearList[this.yearList.length - 1]],
		// 	onRangeChanged: range => {
		// 		console.log(range);
		// 	}
		// });
	}

	initFilterWidget(scoreType) {
		let vis = this;

		const defaultOptions = {
			w: 400,
			h: 150,
			margin: {
				top: 20,
				bottom: 20,
				left: 0,
				right: 20
			},
			bucketSize: 5
		};

		const [min, max] = d3.extent(this.scoreData[scoreType].all);
		const scoreRange = _.range(min, max + 1);
		const range = [min, max + 1];

		// set width and height of svg
		const { w, h, margin, bucketSize } = defaultOptions;

		// dimensions of slider bar
		const width = w - margin.left - margin.right;
		const height = h - margin.top - margin.bottom;

		scoreType == "critics"
			? vis.critScoreFilterWidget.join("g").attr("class", "container")
			: vis.userScoreFilterWidget.join("g").attr("class", "container");

		const roundScale = d => Math.round(xScale(d) / 5) * 5;
		// create x scale
		const xScale = d3
			.scaleLinear()
			.domain(range)
			.range([0, width])
			.nice();
		const xAxis = d3.axisBottom().scale(xScale);

		let bar =
			scoreType == "critics"
				? vis.critScoreFilterWidget
						.selectAll("g")
						.data(scoreRange)
						.enter()
						.append("g")
						.call(xAxis)
						.attr("x", d => roundScale(d))
				: vis.userScoreFilterWidget
						.selectAll("g")
						.data(scoreRange)
						.enter()
						.append("g")
						.call(xAxis)
						.attr("x", d => roundScale(d));

		bar.selectAll("text")
			.attr("y", 0)
			.attr("x", 9)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "start")
			.style("font-size", "15px");

		const color = d3.scaleSequential(vis.scoreData[scoreType].color).domain(range);

		bar.selectAll("text")
			.attr("y", 0)
			.attr("x", 9)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "start");

		const gradientScale = bar
			.append("rect")
			.attr("x", d => xScale(d))
			.attr("y", height - 110)
			.attr("width", width / (range[1] - range[0]))
			.attr("height", 110)
			.style("fill", d => color(d))
			.style("stroke", d => color(d));

		// Define brush
		// (from https://observablehq.com/@trebor/snapping-histogram-slider)
		let brush = d3
			.brushX()
			.extent([
				[0, 0],
				[width, height]
			])
			.on("brush", function() {
				let s = d3.event.selection;

				// Update and move labels
				const minScore = Math.round(xScale.invert(s[0]));
				const maxScore = Math.round(xScale.invert(s[1]));

				// Update default range for given score type
				vis.scoreData[scoreType].default = [minScore, maxScore];

				// Move brush handles
				handle.attr("display", null).attr("transform", (d, i) => "translate(" + [s[i], -height / 4] + ")");

				// Update view;
				// if the view should only be updated after brushing is over,
				// move these two lines into the on('end') part below

				if (scoreType == "critics") {
					vis.critScoreFilterWidget.node().value = s.map(d => bucketSize * Math.round(xScale.invert(d)));
					vis.critScoreFilterWidget.node().dispatchEvent(new CustomEvent("input"));
				} else {
					vis.userScoreFilterWidget.node().value = s.map(d => bucketSize * Math.round(xScale.invert(d)));
					vis.userScoreFilterWidget.node().dispatchEvent(new CustomEvent("input"));
				}
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
		let gBrush =
			scoreType == "critics"
				? vis.critScoreFilterWidget
						.append("g")
						.attr("class", "brush")
						.call(brush)
				: vis.userScoreFilterWidget
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
		gBrush.call(brush.move, [vis.scoreData[scoreType].default[0], vis.scoreData[scoreType].default[1]].map(xScale));

		return scoreType == "critics" ? vis.critScoreFilterWidget.node() : vis.userScoreFilterWidget.node();
	}
}
