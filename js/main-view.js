class MainView {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 600
        }
        this.config.margin = _config.margin || { top: 10, bottom: 10, right: 10, left: 10 };

        this.sony_data = [];
        this.microsoft_data = [];
        this.nintendo_data = [];
        this.pc_data = [];
        this.others_data = [];
    }

    initVis() {
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.sony_group = vis.svg.append('g')
            .attr('class', 'sony')
            .attr("x", Math.cos(3 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2)
            .attr("y", Math.sin(3 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2);
        vis.microsoft_group = vis.svg.append('g')
            .attr('class', 'microsoft')
            .attr("x", Math.cos(4 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2)
            .attr("y", Math.sin(4 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2);
        vis.nintendo_group = vis.svg.append('g')
            .attr('class', 'nintendo')
            .attr("x", Math.cos(5 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2)
            .attr("y", Math.sin(5 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2);
        vis.pc_group = vis.svg.append('g')
            .attr('class', 'pc')
            .attr("x", Math.cos(1 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2)
            .attr("y", Math.sin(1 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2);
        vis.others_group = vis.svg.append('g')
            .attr('class', 'others')
            .attr("x", Math.cos(2 / 5 * 2 * Math.PI) * 200 + vis.config.containerWidth / 2)
            .attr("y", Math.sin(2 / 5 * 2 * Math.PI) * 200 + vis.config.containerHeight / 2);

        vis.padding = 3; // padding within cluster
        vis.selectedGame = "";

        vis.render();
        vis.initForce();
    }

    initForce() {
        let circles = d3.selectAll('circles');
        this.force = d3.forceSimulation()
            .force("cluster", this.cluster())
            .force('center', d3.forceCenter(this.config.containerWidth / 2, this.config.containerHeight / 2))
            .force('collide', d3.forceCollide(d => this.circleRadius(d.global_sales) + this.padding)
                .strength(0.7))
            .on('tick', function (e) {
                circles
                    .attr('cx', d => d.x)
                    .attr('cx', d => d.y);
            })
            .nodes(circles);
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
            .data(vis.sony_data)
            .join("circle")
            .transition()
            .attr('class', "sony-nodes")
            .attr('id', d => "sony" + d.index)
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.sony_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.sony_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "Sony");

        vis.microsoft_circles = vis.microsoft_group.selectAll(".microsoft-nodes")
            .data(vis.microsoft_data)
            .join("circle")
            .transition()
            .attr('class', "microsoft-nodes")
            .attr('id', d => "microsoft" + d.index)
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.microsoft_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.microsoft_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "Microsoft");

        vis.nintendo_circles = vis.nintendo_group.selectAll(".nintendo-nodes")
            .data(vis.nintendo_data)
            .join("circle")
            .transition()
            .attr('class', "nintendo-nodes")
            .attr('id', d => "nintendo" + d.index)
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.nintendo_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.nintendo_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "nintendo");

        vis.pc_circles = vis.pc_group.selectAll(".pc-nodes")
            .data(vis.pc_data)
            .join("circle")
            .transition()
            .attr('class', "pc-nodes")
            .attr('id', d => "pc" + d.index)
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.pc_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.pc_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "pc");

        vis.others_circles = vis.others_group.selectAll(".others-nodes")
            .data(vis.others_data)
            .join("circle")
            .transition()
            .attr('class', "others-nodes")
            .attr('id', d => "others" + d.index)
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.others_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.others_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "others");

        vis.handleSelection();
    }

    handleSelection() {
        let vis = this;
        vis.svg.selectAll('circle')
            .on('click', d => {
                console.log(d)
                if (vis.selectedGame === "") { // if not selected, select it 
                    const localSelected = d.console_company + d.index;
                    d3.select("#" + localSelected)
                        .style('stroke', '#b35227');
                    vis.getRelatedIDs(d.name, d.console_company).forEach(d => {
                        d3.select("#" + d)
                            .style('stroke', '#71361c');
                    });
                    vis.selectedGame = localSelected;
                } else if (vis.selectedGame === d.console_company + d.index) { // if selected, unselect it 
                    d3.select("#" + vis.selectedGame)
                        .style('stroke', '#ccc');
                    vis.getRelatedIDs(d.name, d.console_company).forEach(d => {
                        d3.select("#" + d)
                            .style('stroke', '#ccc');
                    });
                    vis.selectedGame = "";
                }

            });
    }

    getRelatedIDs(name, company) {
        let relatedIDs = [];
        const s_result = this.sony_data.find(d => d.name === name)
        const m_result = this.microsoft_data.find(d => d.name === name);
        const n_result = this.nintendo_data.find(d => d.name === name);
        const p_result = this.pc_data.find(d => d.name === name);
        const o_result = this.others_data.find(d => d.name === name);

        if (s_result !== undefined && s_result.console_company !== company) relatedIDs.push(s_result.console_company + s_result.index);
        if (m_result !== undefined && m_result.console_company !== company) relatedIDs.push(m_result.console_company + m_result.index);
        if (n_result !== undefined && n_result.console_company !== company) relatedIDs.push(n_result.console_company + n_result.index);
        if (p_result !== undefined && p_result.console_company !== company) relatedIDs.push(p_result.console_company + p_result.index);
        if (o_result !== undefined && o_result.console_company !== company) relatedIDs.push(o_result.console_company + o_result.index);

        return relatedIDs;
    }

    // Move d to be adjacent to the cluster node.
    // from: https://bl.ocks.org/mbostock/7881887
    cluster() {

        var nodes = d3.selectAll('circle'),
            strength = 0.1;

        function force(alpha) {
            alpha *= strength * alpha; // scale + curve alpha value
            nodes.each(function (d) {
                console.log(d)
                var cluster_x = d3.select(this.parentElement).attr('x'),
                    cluster_y = d3.select(this.parentElement).attr('y');
                let x = d.x - cluster_x,
                    y = d.y - cluster_y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius;

                if (l != r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    cluster_x += x;
                    cluster_y += y;
                }
            });

        }

        force.initialize = function (_) {
            nodes = _;
        }

        force.strength = _ => {
            strength = _ == null ? strength : _;
            return force;
        };

        return force;

    }
}
