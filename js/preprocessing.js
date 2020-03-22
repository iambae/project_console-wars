let mainView = new MainView({ parentElement: "#main" })

d3.csv("data/games.csv").then(data => {

    let salesMax = 0,
        salesMin = Infinity;

    function formatDataForMain() {
        const games = [[/*Sony*/], [/*Microsoft*/], [/*Nintendo*/], [/*PC*/], [/*Others*/]];
        data.forEach(d => {
            // update max min
            if (salesMax < +d.Global_Sales) salesMax = +d.Global_Sales;
            if (salesMin > +d.Global_Sales) salesMin = +d.Global_Sales;

            const game = {};
            game.name = d.Name;
            game.platform = d.Platform;
            game.genre = d.Genre;
            game.publisher = d.Publisher;
            game.year = +d.Year_of_Release;
            game.na_sales = +d.NA_Sales;
            game.eu_sales = +d.EU_Sales;
            game.jp_sales = +d.JP_Sales;
            game.other_sales = +d.Other_Sales;
            game.global_sales = +d.Global_Sales;

            // Add platform_company column
            if (d.Platform.match(/^(PS|PS2|PS3|PS4|PSP|PSV)$/)) games[0].push(game);
            else if (d.Platform.match(/^(XB|X360|XOne)$/)) games[1].push(game);
            else if (d.Platform.match(/^(3DS|DS|GB|GBA|GC|N64|NES|SNES|Wii|WiiU)$/)) games[2].push(game);
            else if (d.Platform == "PC") games[3].push(game);
            else games[4].push(game);
        });
        return games;
    }
    mainView.data = formatDataForMain();
    mainView.salesMax = salesMax;
    mainView.salesMin = salesMin;
    mainView.initVis();
});
