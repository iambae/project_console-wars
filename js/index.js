import { formatData } from "./preprocessing.js"
import MainView from "./main-view.js"
import GameControllerView from "./game-controller-view.js"
import { preprocessor } from "./preprocessor.js"
import WidgetPane from "./widget-pane.js"

const mainView = new MainView({ parentElement: "#main" })
const widgetPane = new WidgetPane({ parentElement: "#widgets" }, mainView)

let GameViewMicrosoft = new GameControllerView({
  parentElement: "#microsoft",
  filename: "microsoft.csv",
  type: "microsoft",
  scale: 1,
})
let GameViewSony = new GameControllerView({
  parentElement: "#sony",
  filename: "sony.csv",
  type: "sony",
  scale: 0.8,
})
let GameViewNintendo = new GameControllerView({
  parentElement: "#nintendo",
  filename: "nintendo.csv",
  type: "nintendo",
  scale: 1,
})
let GameViewPC = new GameControllerView({
  parentElement: "#pc",
  filename: "pc.csv",
  type: "pc",
  scale: 2,
})
let GameViewOther = new GameControllerView({
  parentElement: "#other",
  filename: "others.csv",
  type: "other",
  scale: 2.5,
})

d3.csv("data/games.csv").then((data) => {
  let formattedData = formatData(data)

  let microsoftData = formattedData.filter(
    (x) => x.platform_company == "Mircosoft"
  )
  GameViewMicrosoft.data = microsoftData
  GameViewMicrosoft.update()

  let sonyData = formattedData.filter((x) => x.platform_company == "Sony")
  console.log("Sony data", sonyData)
  GameViewSony.data = sonyData
  GameViewSony.update()

  let nintendoData = formattedData.filter(
    (x) => x.platform_company == "Nintendo"
  )

  GameViewNintendo.data = nintendoData
  GameViewNintendo.update()

  let pcData = formattedData.filter((x) => x.platform_company == "PC")
  GameViewPC.data = pcData
  GameViewPC.update()

  let othersData = formattedData.filter((x) => x.platform_company == "Others")
  GameViewOther.data = othersData
  GameViewOther.update()
})

preprocessor.then((processedData) => {
  const {
    mainViewData,
    salesMax,
    salesMin,
    criticMax,
    criticMin,
    userMax,
    userMin,
    maxScoreDiff,
    minScoreDiff,
  } = processedData
  console.log(mainViewData)
  widgetPane.data = _.flatMap(mainViewData)

  mainView.sony_data = mainViewData[0]
  mainView.microsoft_data = mainViewData[1]
  mainView.nintendo_data = mainViewData[2]
  mainView.pc_data = mainViewData[3]
  mainView.others_data = mainViewData[4]
  mainView.salesMax = salesMax
  mainView.salesMin = salesMin
  mainView.criticMax = criticMax
  mainView.criticMin = criticMin
  mainView.userMax = userMax
  mainView.userMin = userMin
  mainView.maxScoreDiff = maxScoreDiff
  mainView.minScoreDiff = minScoreDiff

  // Initialize widget pane with default values
  // Default game genre to show
  widgetPane.genreList = _.uniq(_.map(widgetPane.data, "genre")).sort()
  widgetPane.selectedGenre = widgetPane.genreList[8]

  // Default release years of games
  widgetPane.yearList = _.uniq(_.map(widgetPane.data, "year"))
    .filter((year) => !Number.isNaN(year))
    .sort()
  widgetPane.selectedYearRange = [2005, 2013]

  // Default game score data
  widgetPane.selectedOption = "Critics"
  widgetPane.scoreData = {
    critics: {
      name: "Critics", // for dropdown
      default: [40, 70],
      all: [criticMin, criticMax],
      color: d3.interpolateBlues,
    },
    users: {
      name: "Users", // for dropdown
      default: [40, 70],
      all: [userMin, userMax],
      color: d3.interpolateReds,
    },
    diff: {
      name: "Differences", // for dropdown
      default: [40, 90],
      all: [maxScoreDiff, minScoreDiff],
      color: d3.interpolateRdBu,
    },
  }

  widgetPane.initVis()

  mainView.widgetPane = widgetPane
  mainView.initVis()
})
