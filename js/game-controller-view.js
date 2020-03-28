import Canvas from "./canvas.js"

class GameControllerView extends Canvas {
  constructor(_config) {
    super(_config)
    this.initVis()
  }

  initVis() {
    let vis = this

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)

    vis.chart = vis.svg.append("g").attr("class", "main-group")

    d3.csv("data/best-controller.csv").then(data => {
      console.log("csv points", data)
      data.forEach(point => {
        point.x = +point.x
        point.y = +point.y
      })
      vis.controllerPathPoints = data
    })
  }

  update() {
    let vis = this

    vis.render()
  }

  render() {
    let vis = this

    let lineFunction = d3
      .line()
      .x(d => d.x)
      .y(d => d.y)
    //   .interpolate("linear")

    // vis.chart
    //   .append("path")
    //   .attr("d", lineFunction(vis.controllerPathPoints))
    //   .attr("stroke", "black")
    //   .attr("stroke-width", 1)
    //   .attr("fill", "none")

    let rects = vis.chart
      .selectAll("rect")
      .data(vis.data)
      .enter()
      .append("rect")
      .attr("id", d => "game" + cleanId(d.name))
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", (d, i) => (i % 100) * 12)
      .attr("y", (d, i) => Math.floor(i / 100) * 12)

    rects.each((d, i) => {
      let rect = d3.select(`#game${cleanId(d.name)}`)
      let point = [+rect.attr("x"), +rect.attr("y")]
      if (pointInsidePath(point, vis.controllerPathPoints)) {
        rect.classed("selected", true)
      }
    })
  }
}

const cleanId = str => {
  return str.replace(/[\s\.\-\/\!\:\&\(\)\'\,\$\*\+\?\#\~\@\;\%\[\]]/gi, "")
}

// from https://github.com/substack/point-in-polygon
const pointInsidePath = function(point, vs) {
  let i, j, intersect
  let x = point[0] + 5
  let y = point[1] + 5
  let inside = false

  for (i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x
    let yi = vs[i].y
    let xj = vs[j].x
    let yj = vs[j].y
    intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}
export default GameControllerView
