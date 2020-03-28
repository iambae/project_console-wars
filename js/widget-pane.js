import { dateSlider } from "./widgets/date-slider.js";
import { genreDropdown } from "./widgets/genre-dropdown.js";

export default class WidgetPane {
	constructor(_config, mainView) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 300,
			containerHeight: _config.containerHeight || 600,
			margin: _config.margin || {
				top: 10,
				bottom: 10,
				right: 10,
				left: 10
			}
		};

		this.mainView = mainView;

		this.genreList = [];
		this.selectedOption = "Action";

		this.yearList = [];
		this.selectedYears = this.yearList; // redyce the default years selected by brush
	}

	initVis() {
		let vis = this;

		vis.svg = d3
			.select(vis.config.parentElement)
			.attr("width", vis.config.containerWidth)
			.attr("height", vis.config.containerHeight);

		// Add genreDropdown to wiget pane
		vis.genre_dropdown = vis.svg
			.append("g")
			.attr("id", "dropdown")
			.attr(
				"transform",
				`translate(${vis.config.containerWidth / 2}, ${vis.config
					.containerHeight / 5})`
			);

		// Add dateSlider to wiget pane
		vis.date_slider = vis.svg
			.append("g")
			.attr("id", "slider")
			.attr(
				"transform",
				`translate(${vis.config.containerWidth / 2}, ${vis.config
					.containerHeight / 4})`
			);

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

		// TODO: Get date slider to work
		// vis.date_slider.call(dateSlider, {
		// 	years: vis.yearList,
		// 	onYearsSelected: years => {
		// 		vis.selectedYears = years;
		// 		vis.update();
		// 	},
		// 	selectedYears: vis.selectedYears || vis.yearList,
		// 	containerWidth: vis.config.containerWidth,
		// 	containerHeight: vis.config.containerHeight / 3
		// });
	}
}
