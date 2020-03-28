import { formatData } from "./preprocessing.js"
import GameControllerView from "./game-controller-view.js"

let GameView = new GameControllerView({ parentElement: "#canvas" })

d3.csv("data/games.csv").then(data => {
  let formattedData = formatData(data)
  GameView.data = formattedData

  GameView.update()
})
