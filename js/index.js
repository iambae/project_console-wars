import { preprocessor } from "./preprocessor.js";
import WidgetPane from "./widget-pane.js";

const mainView = new MainView({ parentElement: "#main" });

preprocessor.then(processedData => {
	const { mainViewData, salesMax, salesMin } = processedData;
	const allGames = _.flatMap(mainViewData);

	mainView.sony_data = mainViewData[0].slice(0, 100);
	mainView.microsoft_data = mainViewData[1].slice(0, 100);
	mainView.nintendo_data = mainViewData[2].slice(0, 100);
	mainView.pc_data = mainViewData[3].slice(0, 100);
	mainView.others_data = mainViewData[4].slice(0, 100);
	mainView.salesMax = salesMax;
	mainView.salesMin = salesMin;

	const widgetPane = new WidgetPane({ parentElement: "#widgets" });

	widgetPane.mainView = mainView;
	widgetPane.yearList = _.uniq(_.map(allGames, "year"))
		.filter(year => !Number.isNaN(year))
		.sort();

	widgetPane.genreList = _.uniq(_.map(allGames, "genre")).sort();
	widgetPane.selectedOption = widgetPane.genreList[0];

	widgetPane.initVis();

	mainView.widgetPane = widgetPane;
	mainView.initVis();
});
