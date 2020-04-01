class MainView {
	constructor(_config, widgetPane) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 1000,
			containerHeight: _config.containerHeight || 600,
			margin: _config.margin || {
				top: 10,
				bottom: 10,
				right: 10,
				left: 10
			}
		};

		this.sony_data = [];
		this.microsoft_data = [];
		this.nintendo_data = [];
		this.pc_data = [];
		this.others_data = [];

		this.widgetPane = widgetPane;
	}

	initVis() {
		let vis = this;

		vis.svg = d3
			.select(vis.config.parentElement)
			.attr("width", "100%")
			.attr("height", 800);

		let num_cluster = 5;

		vis.sony_group = vis.svg
			.append("g")
			.attr("class", "sony")
			.attr("x", Math.cos((3.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerWidth / 2)
			.attr("y", Math.sin((3.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerHeight / 2);
		vis.microsoft_group = vis.svg
			.append("g")
			.attr("class", "microsoft")
			.attr("x", Math.cos((4.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerWidth / 2)
			.attr("y", Math.sin((4.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerHeight / 2);
		vis.nintendo_group = vis.svg
			.append("g")
			.attr("class", "nintendo")
			.attr("x", Math.cos((5.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerWidth / 2)
			.attr("y", Math.sin((5.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerHeight / 2);
		vis.pc_group = vis.svg
			.append("g")
			.attr("class", "pc")
			.attr("x", Math.cos((1.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerWidth / 2)
			.attr("y", Math.sin((1.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerHeight / 2);
		vis.others_group = vis.svg
			.append("g")
			.attr("class", "others")
			.attr("x", Math.cos((2.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerWidth / 2)
			.attr("y", Math.sin((2.25 / num_cluster) * 2 * Math.PI) * 250 + vis.config.containerHeight / 2);

		vis.padding = 2; // padding within cluster
		vis.selectedGame = "";

		vis.allData = vis.sony_data
			.concat(vis.microsoft_data)
			.concat(vis.nintendo_data)
			.concat(vis.pc_data)
			.concat(vis.others_data);

		vis.filteredData = {
			sony: this.filterGame(this.sony_data),
			microsoft: this.filterGame(this.microsoft_data),
			nintendo: this.filterGame(this.nintendo_data),
			pc: this.filterGame(this.pc_data),
			others: this.filterGame(this.others_data)
		};

		// Tooltip Setup
		vis.div = d3
			.select("body")
			.append("div")
			.attr("class", "tooltip")
			.attr("style", "position: fixed; opacity: 0;");
		vis.widthCenterPercent = 41.5;

		vis.render();
		vis.initForce();
	}

	filterGame(gameArr) {
		if (gameArr.length == 0) return gameArr;
		return _.filter(
			gameArr,
			game =>
				game.genre == this.widgetPane.selectedOption &&
				_.includes(_.range(this.widgetPane.selectedYears[0], this.widgetPane.selectedYears[1]), game.year)
		);
	}

	initForce() {
		const allCircles = d3.selectAll("circle");
		this.force = d3
			.forceSimulation(this.allData)
			.force(
				"center",
				d3.forceCenter(
					this.config.containerWidth * (1 - this.widthCenterPercent / 100),
					this.config.containerHeight / 2
				)
			)
			.force("cluster", this.cluster().strength(0.2))
			.force("collide", d3.forceCollide(d => this.circleRadius(d.global_sales) + this.padding).strength(0.7))
			.on("tick", function() {
				allCircles.attr("cx", d => d.x).attr("cy", d => d.y);
			});
	}

	update() {
		let vis = this;

		vis.filteredData = {
			sony: this.filterGame(vis.sony_data),
			microsoft: this.filterGame(vis.microsoft_data),
			nintendo: this.filterGame(vis.nintendo_data),
			pc: this.filterGame(vis.pc_data),
			others: this.filterGame(vis.others_data)
		};

		vis.render();
	}

	render() {
		let vis = this;

		vis.circleRadius = d3
			.scaleLinear()
			.domain([vis.salesMin, vis.salesMax])
			.range([5, 90]);

		vis.sony_circles = vis.sony_group
			.selectAll(".sony-nodes")
			.data(vis.filteredData["sony"])
			.join("circle")
			.transition()
			.attr("class", "sony-nodes")
			.attr("id", d => "sony" + d.id_num)
			.attr("r", d => vis.circleRadius(d.global_sales))
			.attr("cx", d => +vis.sony_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", d => +vis.sony_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "Sony");

		vis.microsoft_circles = vis.microsoft_group
			.selectAll(".microsoft-nodes")
			.data(vis.filteredData["microsoft"])
			.join("circle")
			.transition()
			.attr("class", "microsoft-nodes")
			.attr("id", d => "microsoft" + d.id_num)
			.attr("r", d => vis.circleRadius(d.global_sales))
			.attr("cx", d => +vis.microsoft_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", d => +vis.microsoft_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "Microsoft");

		vis.nintendo_circles = vis.nintendo_group
			.selectAll(".nintendo-nodes")
			.data(vis.filteredData["nintendo"])
			.join("circle")
			.transition()
			.attr("class", "nintendo-nodes")
			.attr("id", d => "nintendo" + d.id_num)
			.attr("r", d => vis.circleRadius(d.global_sales))
			.attr("cx", d => +vis.nintendo_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", d => +vis.nintendo_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "nintendo");

		vis.pc_circles = vis.pc_group
			.selectAll(".pc-nodes")
			.data(vis.filteredData["pc"])
			.join("circle")
			.transition()
			.attr("class", "pc-nodes")
			.attr("id", d => "pc" + d.id_num)
			.attr("r", d => vis.circleRadius(d.global_sales))
			.attr("cx", d => +vis.pc_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", d => +vis.pc_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "pc");

		vis.others_circles = vis.others_group
			.selectAll(".others-nodes")
			.data(vis.filteredData["others"])
			.join("circle")
			.transition()
			.attr("class", "others-nodes")
			.attr("id", d => "others" + d.id_num)
			.attr("r", d => vis.circleRadius(d.global_sales))
			.attr("cx", d => +vis.others_group.attr("x") + Math.random() * vis.padding)
			.attr("cy", d => +vis.others_group.attr("y") + Math.random() * vis.padding)
			.attr("cluster", "others");

		vis.handleSelection();
	}

	handleSelection() {
		let vis = this;
		vis.svg.selectAll("circle").on("click", d => {
			if (vis.selectedGame === "") {
				// if not selected, select it
				const localSelected = d.console_company + d.id_num;

				d3.select("#" + localSelected).style("stroke", "#b35227");
				vis.getRelatedIDs(d.name, d.console_company).forEach(d => {
					d3.select("#" + d).style("stroke", "#71361c");
				});

				// Show Game Info in Tooltips
				d3.select(".tooltip")
					.style("opacity", 1)
					.style("top", "400px")
					.style("left", "600px") // TODO: hardcoded
					.html(
						"<b>" +
							d.name +
							"</b> (" +
							d.year +
							")" +
							"<br/>" +
							d.platform +
							"  |  " +
							d.genre +
							"<br/> Global Sales: " +
							d.global_sales +
							"M"
					);

				vis.selectedGame = localSelected;
			} else if (vis.selectedGame === d.console_company + d.id_num) {
				// if selected, unselect it
				d3.select("#" + vis.selectedGame).style("stroke", "#ccc");
				vis.getRelatedIDs(d.name, d.console_company).forEach(d => {
					d3.select("#" + d).style("stroke", "#ccc");
				});

				d3.select(".tooltip").style("opacity", 0); // Hide tooltips

				vis.selectedGame = "";
			}
		});
	}

	getRelatedIDs(name, company) {
		let relatedIDs = [];
		const s_result = this.sony_data.find(d => d.name === name);
		const m_result = this.microsoft_data.find(d => d.name === name);
		const n_result = this.nintendo_data.find(d => d.name === name);
		const p_result = this.pc_data.find(d => d.name === name);
		const o_result = this.others_data.find(d => d.name === name);

		if (s_result !== undefined && s_result.console_company !== company)
			relatedIDs.push(s_result.console_company + s_result.id_num);
		if (m_result !== undefined && m_result.console_company !== company)
			relatedIDs.push(m_result.console_company + m_result.id_num);
		if (n_result !== undefined && n_result.console_company !== company)
			relatedIDs.push(n_result.console_company + n_result.id_num);
		if (p_result !== undefined && p_result.console_company !== company)
			relatedIDs.push(p_result.console_company + p_result.id_num);
		if (o_result !== undefined && o_result.console_company !== company)
			relatedIDs.push(o_result.console_company + o_result.id_num);

		return relatedIDs;
	}

	// Move d to be adjacent to the cluster node.
	// from: https://bl.ocks.org/ericsoco/cd0c38a20141e997e926592264067db3
	cluster() {
		let vis = this;
		var nodes,
			strength = 0.1;

		function force(alpha) {
			alpha *= strength * alpha; // scale + curve alpha value
			nodes.forEach(d => {
				const group = d3.select("." + d.console_company);
				var cluster_x = group.attr("x"),
					cluster_y = group.attr("y");

				let x = d.x - cluster_x,
					y = d.y - cluster_y,
					l = Math.sqrt(x * x + y * y),
					r = vis.circleRadius(d.global_sales);

				if (l != r) {
					l = ((l - r) / l) * alpha;
					d.x -= x *= l;
					d.y -= y *= l;
					cluster_x += x;
					cluster_y += y;
				}
			});
		}

		force.initialize = function(_) {
			nodes = _;
		};

		force.strength = _ => {
			strength = _ == null ? strength : _;
			return force;
		};

		return force;
	}
}
