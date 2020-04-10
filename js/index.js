import { formatData } from "./preprocessing.js"
import GameControllerView from "./game-controller-view.js"

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
