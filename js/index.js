import { preprocessor } from "./preprocessor.js";
import WidgetPane from "./widget-pane.js";

const mainView = new MainView({ parentElement: "#main" });
const widgetPane = new WidgetPane({ parentElement: "#widgets" }, mainView);

preprocessor.then(processedData => {
	const { mainViewData, salesMax, salesMin } = processedData;
	const allGames = _.flatMap(mainViewData);

	mainView.sony_data = mainViewData[0];
	mainView.microsoft_data = mainViewData[1];
	mainView.nintendo_data = mainViewData[2];
	mainView.pc_data = mainViewData[3];
	mainView.others_data = mainViewData[4];
	mainView.salesMax = salesMax;
	mainView.salesMin = salesMin;

	widgetPane.genreList = _.uniq(_.map(allGames, "genre")).sort();
	widgetPane.selectedOption = widgetPane.genreList[8];
	widgetPane.yearList = _.uniq(_.map(allGames, "year"))
		.filter(year => !Number.isNaN(year))
		.sort();
	widgetPane.selectedYears = [2011, 2017];
	widgetPane.initVis();

	mainView.widgetPane = widgetPane;
	mainView.initVis();
});
