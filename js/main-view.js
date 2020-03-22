class MainView {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 600
        }
        this.config.margin = _config.margin || { top: 10, bottom: 10, right: 10, left: 10 };

        this.data = [];
    }

    initVis() {
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.sony_group = vis.svg.append('g')
            .attr('class', 'sony');
        vis.microsoft_group = vis.svg.append('g')
            .attr('class', 'microsoft');
        vis.nintendo_group = vis.svg.append('g')
            .attr('class', 'nintendo');
        vis.pc_group = vis.svg.append('g')
            .attr('class', 'pc');
        vis.others_group = vis.svg.append('g')
            .attr('class', 'others');

        // Data
        vis.sony_games = vis.data[0];
        vis.microsoft_games = vis.data[1];
        vis.nintendo_games = vis.data[2];
        vis.pc_games = vis.data[3];
        vis.others_games = vis.data[4];

        vis.render();
        vis.initForce();
    }

    initForce() {
        let padding = 1; // padding within cluster
        this.force = d3.forceSimulation()
            .force('center', d3.forceCenter(this.config.containerWidth / 2, this.config.containerHeight / 2))
            //.force('cluster', this.cluster()
            //    .strength(0.2))
            .force('collide', d3.forceCollide(d => this.circleRadius(d.global_sales) + padding)
                .strength(0.7))
            .nodes(d3.selectAll('circles'));
    }

    update() {
        let vis = this;

        vis.render();
    }

    render() {
        let vis = this;

        vis.circleRadius = d3
            .scaleLinear()
            .domain([vis.salesMin, vis.salesMax])
            .range([15, 90]);

        vis.sony_circles = vis.sony_group.selectAll(".sony-nodes")
            .data(vis.sony_games)
            .join("circle")
            .transition()
            .attr('class', "sony-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr("cx", Math.cos(3 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2 + Math.random())    // need to position them next to each other
            .attr("cy", Math.sin(3 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2 + Math.random())
            .attr("cluster", "Sony");

        vis.microsoft_circles = vis.microsoft_group.selectAll(".microsoft-nodes")
            .data(vis.microsoft_games)
            .join("circle")
            .transition()
            .attr('class', "microsoft-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr("cx", Math.cos(4 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2 + Math.random())
            .attr("cy", Math.sin(4 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2 + Math.random())
            .attr("cluster", "Microsoft");

        vis.nintendo_circles = vis.nintendo_group.selectAll(".nintendo-nodes")
            .data(vis.nintendo_games)
            .join("circle")
            .transition()
            .attr('class', "nintendo-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr("cx", Math.cos(5 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2 + Math.random())
            .attr("cy", Math.sin(5 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2 + Math.random())
            .attr("cluster", "nintendo");

        vis.pc_circles = vis.pc_group.selectAll(".pc-nodes")
            .data(vis.pc_games)
            .join("circle")
            .transition()
            .attr('class', "pc-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr("cx", Math.cos(1 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2 + Math.random())
            .attr("cy", Math.sin(1 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2 + Math.random())
            .attr("cluster", "pc");

        vis.others_circles = vis.others_group.selectAll(".others-nodes")
            .data(vis.others_games)
            .join("circle")
            .transition()
            .attr('class', "others-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr("cx", Math.cos(2 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2 + Math.random())
            .attr("cy", Math.sin(2 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2 + Math.random())
            .attr("cluster", "others");
    }
}
