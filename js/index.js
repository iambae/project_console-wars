import { preprocessor } from "./preprocessor.js";
import WidgetPane from "./widget-pane.js";

const mainView = new MainView({ parentElement: "#main" });
const widgetPane = new WidgetPane({ parentElement: "#widgets" }, mainView);

preprocessor.then(processedData => {
	const { mainViewData, salesMax, salesMin, criticMax, criticMin, userMax, userMin } = processedData;
	widgetPane.data = _.flatMap(mainViewData);

	mainView.sony_data = mainViewData[0];
	mainView.microsoft_data = mainViewData[1];
	mainView.nintendo_data = mainViewData[2];
	mainView.pc_data = mainViewData[3];
	mainView.others_data = mainViewData[4];
	mainView.salesMax = salesMax;
	mainView.salesMin = salesMin;
	mainView.criticMax = criticMax;
	mainView.criticMin = criticMin;
	mainView.userMax = userMax;
	mainView.userMin = userMin;

	// Initialize widget pane with default values
	// Default game genre to show
	widgetPane.genreList = _.uniq(_.map(widgetPane.data, "genre")).sort();
	widgetPane.selectedGenre = widgetPane.genreList[8];

	// Default release years of games
	widgetPane.yearList = _.uniq(_.map(widgetPane.data, "year"))
		.filter(year => !Number.isNaN(year))
		.sort();
	widgetPane.selectedYear = 2013;

	// Default game score data
	widgetPane.selectedOption = "Critics";
	widgetPane.scoreData = {
		critics: {
			name: "Critics", // for dropdown
			default: [40, 90],
			all: [criticMin, criticMax],
			color: d3.interpolateBlues
		},
		users: {
			name: "Users", // for dropdown
			default: [40, 90],
			all: [userMin, userMax],
			color: d3.interpolatePurples
		}
	};

	widgetPane.initVis();

	mainView.widgetPane = widgetPane;
	mainView.initVis();
});
