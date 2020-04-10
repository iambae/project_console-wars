export default class MainView {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || {
        top: 10,
        bottom: 10,
        right: 10,
        left: 10,
      },
    }

    this.sony_data = []
    this.microsoft_data = []
    this.nintendo_data = []
    this.pc_data = []
    this.others_data = []
  }

  initVis() {
    let vis = this

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", "100%")
      .attr("height", 900)

    let num_cluster = 5

    vis.sony_group = vis.svg
      .append("g")
      .attr("class", "sony")
      .attr(
        "x",
        Math.cos((3.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerWidth / 2
      )
      .attr(
        "y",
        Math.sin((3.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerHeight / 2
      )
    vis.microsoft_group = vis.svg
      .append("g")
      .attr("class", "microsoft")
      .attr(
        "x",
        Math.cos((4.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerWidth / 2
      )
      .attr(
        "y",
        Math.sin((4.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerHeight / 2
      )
    vis.nintendo_group = vis.svg
      .append("g")
      .attr("class", "nintendo")
      .attr(
        "x",
        Math.cos((5.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerWidth / 2
      )
      .attr(
        "y",
        Math.sin((5.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerHeight / 2
      )
    vis.pc_group = vis.svg
      .append("g")
      .attr("class", "pc")
      .attr(
        "x",
        Math.cos((1.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerWidth / 2
      )
      .attr(
        "y",
        Math.sin((1.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerHeight / 2
      )
    vis.others_group = vis.svg
      .append("g")
      .attr("class", "others")
      .attr(
        "x",
        Math.cos((2.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerWidth / 2
      )
      .attr(
        "y",
        Math.sin((2.25 / num_cluster) * 2 * Math.PI) * 250 +
          vis.config.containerHeight / 2
      )

    vis.padding = 2 // padding within cluster
    vis.selectedGame = ""

    // Tooltip Setup
    vis.div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("style", "position: fixed; opacity: 0;")
    vis.widthCenterPercent = 55

    vis.circleRadius = d3
      .scaleLinear()
      .domain([vis.salesMin, vis.salesMax])
      .range([10, 150])

    // Color scale
    vis.critics_colorScaleRange = d3.schemeBlues[9]
    vis.critics_colorScale = d3
      .scaleQuantile()
      .domain([vis.criticMin, vis.criticMax])
      .range(vis.critics_colorScaleRange)

    vis.users_colorScaleRange = d3.schemeReds[9]
    vis.users_colorScale = d3
      .scaleQuantile()
      .domain([vis.userMin, vis.userMax])
      .range(vis.users_colorScaleRange)
    vis.diff_colorScale = d3
      .scaleSequential(d3.interpolateRdBu)
      .domain([vis.maxScoreDiff, vis.minScoreDiff])

    vis.initSequentialLegend()
    vis.update()
  }

  filterGame(gameArr) {
    if (gameArr.length == 0) return gameArr
    return _.filter(
      gameArr,
      (game) =>
        game.genre == this.widgetPane.selectedGenre &&
        _.includes(
          _.range(
            this.widgetPane.selectedYearRange[0],
            this.widgetPane.selectedYearRange[1]
          ),
          game.year
        ) &&
        _.includes(
          _.range(
            this.widgetPane.scoreData["critics"].default[0],
            this.widgetPane.scoreData["critics"].default[1]
          ),
          game.crit_score
        ) &&
        _.includes(
          _.range(
            this.widgetPane.scoreData["users"].default[0],
            this.widgetPane.scoreData["users"].default[1]
          ),
          game.user_score
        )
    )
  }

  update() {
    let vis = this

    vis.filteredData = {
      sony: this.filterGame(this.sony_data),
      microsoft: this.filterGame(this.microsoft_data),
      nintendo: this.filterGame(this.nintendo_data),
      pc: this.filterGame(this.pc_data),
      others: this.filterGame(this.others_data),
    }

    vis.filteredDataArray = _.flatten(_.values(this.filteredData))

    vis.render()
    vis.initForce()
  }

  initForce() {
    const allCircles = d3.selectAll("circle")
    this.force = d3
      .forceSimulation(this.filteredDataArray)
      .force(
        "center",
        d3.forceCenter(
          this.config.containerWidth * (1 - this.widthCenterPercent / 100),
          this.config.containerHeight / 2
        )
      )
      .force("cluster", this.cluster().strength(0.2))
      .force(
        "collide",
        d3
          .forceCollide((d) => this.circleRadius(d.global_sales) + this.padding)
          .strength(0.7)
      )
      .on("tick", function () {
        allCircles.attr("cx", (d) => d.x).attr("cy", (d) => d.y)
      })
  }

  render() {
    let vis = this

    vis.sony_circles = vis.sony_group
      .selectAll(".sony-nodes")
      .data(vis.filteredData["sony"])
      .join("circle")
      .transition()
      .attr("class", "sony-nodes")
      .attr("id", (d) => "sony" + d.id_num)
      .attr("r", (d) => vis.circleRadius(d.global_sales))
      .attr(
        "cx",
        (d) => +vis.sony_group.attr("x") + Math.random() * vis.padding
      )
      .attr(
        "cy",
        (d) => +vis.sony_group.attr("y") + Math.random() * vis.padding
      )
      .attr("cluster", "Sony")

    vis.microsoft_circles = vis.microsoft_group
      .selectAll(".microsoft-nodes")
      .data(vis.filteredData["microsoft"])
      .join("circle")
      .transition()
      .attr("class", "microsoft-nodes")
      .attr("id", (d) => "microsoft" + d.id_num)
      .attr("r", (d) => vis.circleRadius(d.global_sales))
      .attr(
        "cx",
        (d) => +vis.microsoft_group.attr("x") + Math.random() * vis.padding
      )
      .attr(
        "cy",
        (d) => +vis.microsoft_group.attr("y") + Math.random() * vis.padding
      )
      .attr("cluster", "Microsoft")

    vis.nintendo_circles = vis.nintendo_group
      .selectAll(".nintendo-nodes")
      .data(vis.filteredData["nintendo"])
      .join("circle")
      .transition()
      .attr("class", "nintendo-nodes")
      .attr("id", (d) => "nintendo" + d.id_num)
      .attr("r", (d) => vis.circleRadius(d.global_sales))
      .attr(
        "cx",
        (d) => +vis.nintendo_group.attr("x") + Math.random() * vis.padding
      )
      .attr(
        "cy",
        (d) => +vis.nintendo_group.attr("y") + Math.random() * vis.padding
      )
      .attr("cluster", "nintendo")

    vis.pc_circles = vis.pc_group
      .selectAll(".pc-nodes")
      .data(vis.filteredData["pc"])
      .join("circle")
      .transition()
      .attr("class", "pc-nodes")
      .attr("id", (d) => "pc" + d.id_num)
      .attr("r", (d) => vis.circleRadius(d.global_sales))
      .attr("cx", (d) => +vis.pc_group.attr("x") + Math.random() * vis.padding)
      .attr("cy", (d) => +vis.pc_group.attr("y") + Math.random() * vis.padding)
      .attr("cluster", "pc")

    vis.others_circles = vis.others_group
      .selectAll(".others-nodes")
      .data(vis.filteredData["others"])
      .join("circle")
      .transition()
      .attr("class", "others-nodes")
      .attr("id", (d) => "others" + d.id_num)
      .attr("r", (d) => vis.circleRadius(d.global_sales))
      .attr(
        "cx",
        (d) => +vis.others_group.attr("x") + Math.random() * vis.padding
      )
      .attr(
        "cy",
        (d) => +vis.others_group.attr("y") + Math.random() * vis.padding
      )
      .attr("cluster", "others")

    vis.handleSelection()
    vis.handleColor(vis.widgetPane.selectedOption)
  }

  handleSelection() {
    let vis = this
    vis.svg
      .selectAll("circle")
      .on("mouseover", (d) => {
        // if not selected, select it
        const localSelected = d.console_company + d.id_num

        d3.select("#" + localSelected)
          .style("stroke", "#FF4F00")
          .style("stroke-width", "3px")
        vis.getRelatedIDs(d.name, d.console_company).forEach((d) => {
          d3.select("#" + d)
            .style("stroke", "#FF7538")
            .style("stroke-width", "3px")
        })

        // Show Game Info in Tooltips
        // prettier-ignore
        d3.select(".tooltip")
				.style("opacity", 1)
				.style("background", (d) => {
					return vis.widgetPane.selectedOption == "Critics" ?
						vis.critics_colorScaleRange[8] :
						vis.users_colorScaleRange[8]
				})
				.html(
					"<b>" + d.name + "</b> (" + d.year + ")" +
					"<br/>" + d.platform + "  |  " + d.genre +
					"<br/> Global Sales: " +
					d.global_sales + "M"
				)
				.style("top", "400px")
				.style("left", 1000 - +d3.select(".tooltip").style("width").replace("px", "") / 2 + "px");

        vis.selectedGame = localSelected
      })
      .on("mouseout", (d) => {
        // if selected, unselect it
        d3.select("#" + vis.selectedGame)
          .style("stroke", "black")
          .style("stroke-width", "1px")
        vis.getRelatedIDs(d.name, d.console_company).forEach((d) => {
          d3.select("#" + d)
            .style("stroke", "black")
            .style("stroke-width", "1px")
        })

        d3.select(".tooltip").style("opacity", 0) // Hide tooltips

        vis.selectedGame = ""
      })
  }

  getRelatedIDs(name, company) {
    let relatedIDs = []
    const s_result = this.sony_data.find((d) => d.name === name)
    const m_result = this.microsoft_data.find((d) => d.name === name)
    const n_result = this.nintendo_data.find((d) => d.name === name)
    const p_result = this.pc_data.find((d) => d.name === name)
    const o_result = this.others_data.find((d) => d.name === name)

    if (s_result !== undefined && s_result.console_company !== company)
      relatedIDs.push(s_result.console_company + s_result.id_num)
    if (m_result !== undefined && m_result.console_company !== company)
      relatedIDs.push(m_result.console_company + m_result.id_num)
    if (n_result !== undefined && n_result.console_company !== company)
      relatedIDs.push(n_result.console_company + n_result.id_num)
    if (p_result !== undefined && p_result.console_company !== company)
      relatedIDs.push(p_result.console_company + p_result.id_num)
    if (o_result !== undefined && o_result.console_company !== company)
      relatedIDs.push(o_result.console_company + o_result.id_num)

    return relatedIDs
  }

  handleColor(selectedOption) {
    let vis = this

    d3.selectAll("circle")
      .attr("stroke-width", "1px")
      .attr("stroke", "black")
      .attr("fill", (d) => {
        return selectedOption == "Critics"
          ? vis.critics_colorScale(d.crit_score)
          : selectedOption == "Users"
          ? vis.users_colorScale(d.user_score)
          : vis.diff_colorScale(d.score_diff)
      })

    d3.select(".tooltip").style("background", (d) => {
      return selectedOption == "Critics"
        ? vis.critics_colorScaleRange[8]
        : vis.users_colorScaleRange[8]
    })

    if (selectedOption == "Differences")
      d3.select("#legend").style("opacity", 1)
    else d3.select("#legend").style("opacity", 0)
  }

  // from http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f
  initSequentialLegend() {
    const vis = this,
      legendheight = 200,
      legendwidth = 80,
      margin = { top: 10, right: 60, bottom: 10, left: 5 }

    var canvas = d3
      .select("#legend")
      .style("height", legendheight + "px")
      .style("width", legendwidth + "px")
      .style("position", "absolute")
      .style("top", margin.top + "px")
      .style("left", margin.left + "px")
      .append("canvas")
      .attr("height", legendheight - margin.top - margin.bottom)
      .attr("width", 1)
      .style("height", legendheight - margin.top - margin.bottom + "px")
      .style("width", legendwidth - margin.left - margin.right + "px")
      .style("border", "1px solid #000")
      .node()

    var legendscale = d3
      .scaleLinear()
      .range([1, legendheight - margin.top - margin.bottom])
      .domain(vis.diff_colorScale.domain())

    const ctx = canvas.getContext("2d")
    d3.range(legendheight).forEach(function (i) {
      ctx.fillStyle = vis.diff_colorScale(legendscale.invert(i))
      ctx.fillRect(0, i, 1, 1)
    })

    const legendaxis = d3
      .axisRight()
      .scale(legendscale)
      .tickSize(6)
      .ticks(8)
      .tickFormat((d) => (d == 60 ? d + " (User Score - Critics Score)" : d))

    d3.select("#legend")
      .append("svg")
      .attr("height", legendheight + 30 + "px")
      .attr("width", legendwidth + 150 + "px")
      .style("position", "absolute")
      .style("top", "-10px")
      .append("g")
      .attr("class", "axis")
      .attr(
        "transform",
        "translate(" +
          (legendwidth - margin.left - margin.right - 15) +
          "," +
          (margin.top - 1) +
          ")"
      )
      .style("color", "black")
      .style("font-size", "15px")
      .call(legendaxis)
  }

  // Move d to be adjacent to the cluster node.
  // from: https://bl.ocks.org/ericsoco/cd0c38a20141e997e926592264067db3
  cluster() {
    let vis = this
    var nodes,
      strength = 0.1

    function force(alpha) {
      alpha *= strength * alpha // scale + curve alpha value
      nodes.forEach((d) => {
        const group = d3.select("." + d.console_company)
        var cluster_x = group.attr("x"),
          cluster_y = group.attr("y")

        let x = d.x - cluster_x,
          y = d.y - cluster_y,
          l = Math.sqrt(x * x + y * y),
          r = vis.circleRadius(d.global_sales)

        if (l != r) {
          l = ((l - r) / l) * alpha
          d.x -= x *= l
          d.y -= y *= l
          cluster_x += x
          cluster_y += y
        }
      })
    }

    force.initialize = function (_) {
      nodes = _
    }

    force.strength = (_) => {
      strength = _ == null ? strength : _
      return force
    }

    return force
  }
}
