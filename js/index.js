import { formatData } from "./preprocessing.js"
import GameControllerView from "./game-controller-view.js"

let GameViewMicrosoft = new GameControllerView({
  parentElement: "#microsoft",
  filename: "best-controller.csv"
})
// let GameViewSony = new GameControllerView({
//   parentElement: "#sony",
//   filename: "best-controller.csv"
// })
// let GameViewNintendo = new GameControllerView({
//   parentElement: "#nintendo",
//   filename: "best-controller.csv"
// })
// let GameViewPC = new GameControllerView({
//   parentElement: "#pc",
//   filename: "best-controller.csv"
// })
// let GameViewOther = new GameControllerView({
//   parentElement: "#other",
//   filename: "best-controller.csv"
// })

d3.csv("data/games.csv").then(data => {
  let formattedData = formatData(data)

  let microsoftData = formattedData.filter(
    x => x.platform_company == "Mircosoft"
  )
  console.log(microsoftData)
  GameViewMicrosoft.data = microsoftData
  GameViewMicrosoft.update()
})
