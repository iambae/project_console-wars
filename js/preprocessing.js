d3.csv("data/games.csv").then(data => {
    function formatData() {
        const games = new Map();
        data.forEach(d => {
            // Just add Sales data if game already exists on other platforms
            const i = games.get(d.Name);
            if (i) {
                i.sales.push({
                    sales_platform: d.Platform,
                    na_sales: +d.NA_Sales,
                    eu_sales: +d.EU_Sales,
                    jp_sales: +d.JP_Sales,
                    other_sales: +d.Other_Sales,
                    global_sales: +d.Global_Sales
                });
                return;
            }
            const game = {};
            game.name = d.Name;
            game.platform = d.Platform;
            
            // Add platform_company column
            if (d.Platform.match(/^(PS|PS2|PS3|PS4|PSP|PSV)$/)) game.platform_company = "Sony";
            else if (d.Platform.match(/^(XB|X360|XOne)$/)) game.platform_company = "Mircosoft";
            else if (d.Platform == "PC") game.platform_company = "PC";
            else if (d.Platform.match(/^(3DS|DS|GB|GBA|GC|N64|NES|SNES|Wii|WiiU)$/)) game.platform_company = "Nintendo";
            else game.platform_company = 'Others';

            game.year = +d.Year_of_Release;
            game.genre = d.Genre;
            game.publisher = d.Publisher;
            game.sales = [{
                sales_platform: game.platform,
                na_sales: +d.NA_Sales,
                eu_sales: +d.EU_Sales,
                jp_sales: +d.JP_Sales,
                other_sales: +d.Other_Sales,
                global_sales: +d.Global_Sales
            }];
            games.set(game.name, game);
        });
        console.log(games);
        return games;
    }
    console.time('formatData');
    formatData();
    console.timeEnd('formatData');
});