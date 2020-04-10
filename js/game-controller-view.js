import Canvas from "./canvas.js"

class GameControllerView extends Canvas {
  constructor(_config) {
    super(_config)
    this.type = _config.type
    this.filename = _config.filename
    this.initVis()
  }

  initVis() {
    let vis = this

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)

    vis.chart = vis.svg.append("g").attr("class", "main-group")

    d3.csv(`data/${vis.filename}`).then((data) => {
      data.forEach((point) => {
        point.x = +point.x
        point.y = +point.y
      })
      vis.rectPoints = data
    })
  }

  getMin(data, attr) {
    return data.reduce((min, b) => Math.min(min, b[attr]), data[0][attr])
  }
  getMax(data, attr) {
    return data.reduce((max, b) => Math.max(max, b[attr]), data[0][attr])
  }

  update() {
    let vis = this

    vis.render()
  }

  render() {
    let vis = this

    vis.chart
      .selectAll("rect")
      .data(vis.rectPoints)
      .enter()
      .append("rect")
      .attr("id", (d) => "game" + d.id)
      .attr("width", (d) => d.size)
      .attr("height", (d) => d.size)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", (d) => d.color)
  }
}

export default GameControllerView
