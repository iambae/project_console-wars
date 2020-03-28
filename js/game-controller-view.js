import Canvas from "./canvas.js"
import { pathToPolygonViaSubdivision, polyArea } from "./path-to-polygon.js"
class GameControllerView extends Canvas {
  constructor(_config) {
    super(_config)
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
    console.log(vis.filename)
    d3.csv(`data/${vis.filename}`).then(data => {
      console.log("csv points", data)
      data.forEach(point => {
        point.x = +point.x * 2
        point.y = +point.y * 2
      })
      vis.controllerPathPoints = data

      vis.minX = this.getMin(data, "x")
      vis.maxX = this.getMax(data, "x")
      vis.minY = this.getMin(data, "y")
      vis.maxY = this.getMax(data, "y")
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

    let lineFunction = d3
      .line()
      .x(d => d.x)
      .y(d => d.y)
    //   .interpolate("linear")

    vis.chart
      .append("path")
      .attr("d", lineFunction(vis.controllerPathPoints))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("id", "controller-path")

    let pathElement = document.getElementById("controller-path")
    let poly = pathToPolygonViaSubdivision(pathElement, null, 20)
    let area = polyArea(poly)

    console.log("Area of polygon: ", area / vis.data.length)
    vis.diff = Math.floor(Math.sqrt(area / vis.data.length))
    vis.side = vis.diff - 2

    let rects = vis.chart
      .selectAll("rect")
      .data(vis.data)
      .enter()
      .append("rect")
      .attr("id", d => "game" + cleanId(d.name))
      .attr("width", vis.side)
      .attr("height", vis.side)
      .attr("x", 0)
      .attr("y", 0)

    let nextX = vis.minX
    let nextY = vis.minY
    rects.each((d, i) => {
      let rect = d3.select(`#game${cleanId(d.name)}`)
      let point = [+rect.attr("x"), +rect.attr("y")]
      let inside = pointInsidePath(point, vis.controllerPathPoints)
      while (!inside) {
        point = [nextX, nextY]

        if (nextX >= vis.maxX) {
          nextX = vis.minX
          nextY = nextY + vis.diff
        } else {
          nextX = nextX + vis.diff
        }
        inside = pointInsidePath(point, vis.controllerPathPoints)
      }
      rect.attr("x", nextX)
      rect.attr("y", nextY)
      rect.classed("selected", true)
    })
  }
}

const cleanId = str => {
  return str.replace(/[\s\.\-\/\!\:\&\(\)\'\,\$\*\+\?\#\~\@\;\%\[\]]/gi, "")
}

// from https://github.com/substack/point-in-polygon
const pointInsidePath = function(point, vs) {
  let i, j, intersect
  let x = point[0]
  let y = point[1]
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
