class MainView {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 600
        }
        this.config.margin = _config.margin || { top: 10, bottom: 10, right: 10, left: 10 };

        this.data = [];
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.group = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Data
        vis.sony_games = vis.data[0];
        vis.microsoft_games = vis.data[1];
        vis.nintendo_games = vis.data[2];
        vis.pc_games = vis.data[3];
        vis.others_games = vis.data[4];

        vis.padding = 0.5; // padding within cluster
        //vis.clusterPadding = 6; // padding between cluster
        vis.maxRadius = 12;

        vis.clusters = [] // [Sony, Microsoft, Nintendo, PC, Others]
        vis.render();
    }

    update() {
        let vis = this;

        vis.render();
    }

    render() {
        let vis = this;

        let circleRadius = d3
            .scaleLinear()
            .domain([vis.salesMin, vis.salesMax])
            .range([4, 14]);

        let sonyNodes = vis.group.selectAll("circle")
            .data(vis.sony_games)
            .join("circle")
            .transition()
            .attr("r", d => circleRadius(d))
            .attr("cluster", "Sony");

        let microsoftNodes = vis.group.selectAll("circle")
            .data(vis.microsoft_games)
            .join("circle")
            .transition()
            .attr("r", d => circleRadius(d))
            .attr("cluster", "Microsoft");
    }

    // Move d to be adjacent to the cluster node.
    // from: https://bl.ocks.org/mbostock/7881887
    cluster() {
        var nodes,
            strength = 0.1;
        function force(alpha) {
            // scale + curve alpha value
            alpha *= strength * alpha
            nodes.forEach(function (d) {
                var cluster = clusters[d.cluster]
                if (cluster === d) return
                let x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + cluster.radius
                if (l != r) {
                    l = ((l - r) / l) * alpha
                    d.x -= x *= l
                    d.y -= y *= l
                    cluster.x += x
                    cluster.y += y
                }
            })
        }
        force.initialize = function (_) {
            nodes = _
        }

        force.strength = _ => {
            strength = _ == null ? strength : _
            return force
        }
        return force
    }
}
