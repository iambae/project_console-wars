class MainView {

    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 600,
        }

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g');

        vis.padding = 0.5;      // padding within cluster
        //vis.clusterPadding = 6; // padding between cluster
        vis.maxRadius = 12;

        vis.clusters = new Array[5];    // [Sony, Microsoft, Nintendo, PC, Others]
        vis.render();
    }

    update() {
        let vis = this;

        vis.render();
    }

    render() {
        let vis = this;

        circleRadius = d3.scaleLinear()
            .domain([vis.salesMin, vis.salesMax])
            .range([4, 14]);

        const node = vis.chart.selectAll("circle")
            .data(vis.data)
            .join("circle")
            .attr('r', circleRadius(d))
            .attr('cluster', vis.sortIntoCluster(d.platform_company));

    }

    sortIntoCluster(company) {
        if (company == "Sony") return 0;
        else if (company == "Microsoft") return 1;
        else if (company == "Nintedo") return 2;
        else if (company == "PC") return 3;
        else if (company == "Others") return 4;
    }

    // Move d to be adjacent to the cluster node.
    // from: https://bl.ocks.org/mbostock/7881887
    cluster() {
        var nodes, strength = 0.1;

        function force(alpha) {
            // scale + curve alpha value
            alpha *= strength * alpha;
            nodes.forEach(function (d) {
                var cluster = clusters[d.cluster];
                if (cluster === d) return;
                let x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + cluster.radius;
                if (l != r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    cluster.x += x;
                    cluster.y += y;
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