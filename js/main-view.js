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
            .data(vis.sony_games)
            .join("circle")
            .transition()
            .attr('class', "sony-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.sony_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.sony_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "Sony");

        vis.microsoft_circles = vis.microsoft_group.selectAll(".microsoft-nodes")
            .data(vis.microsoft_games)
            .join("circle")
            .transition()
            .attr('class', "microsoft-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.microsoft_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.microsoft_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "Microsoft");

        vis.nintendo_circles = vis.nintendo_group.selectAll(".nintendo-nodes")
            .data(vis.nintendo_games)
            .join("circle")
            .transition()
            .attr('class', "nintendo-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.nintendo_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.nintendo_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "nintendo");

        vis.pc_circles = vis.pc_group.selectAll(".pc-nodes")
            .data(vis.pc_games)
            .join("circle")
            .transition()
            .attr('class', "pc-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.pc_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.pc_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "pc");

        vis.others_circles = vis.others_group.selectAll(".others-nodes")
            .data(vis.others_games)
            .join("circle")
            .transition()
            .attr('class', "others-nodes")
            .attr("r", d => vis.circleRadius(d.global_sales))
            .attr('cx', d => +vis.others_group.attr('x') + Math.random() * vis.padding)
            .attr('cy', d => +vis.others_group.attr('y') + Math.random() * vis.padding)
            .attr("cluster", "others");
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
