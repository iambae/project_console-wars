export const preprocessor = d3.csv("data/games.csv").then(data => {
	let salesMax = 0,
		salesMin = Infinity;

	function formatDataForMain() {
		const games = [
			[
				/*Sony*/
			],
			[
				/*Microsoft*/
			],
			[
				/*Nintendo*/
			],
			[
				/*PC*/
			],
			[
				/*Others*/
			]
		];
		for (const [i, d] of data.entries()) {
			if (d.Critic_Score === "" || d.User_Score === "") continue;
			// update max min
			if (salesMax < +d.Global_Sales) salesMax = +d.Global_Sales;
			if (salesMin > +d.Global_Sales) salesMin = +d.Global_Sales;

			const game = {};
			game.name = d.Name;
			game.platform = d.Platform;
			game.genre = d.Genre == "Platform" ? "N/A" : d.Genre;
			game.publisher = d.Publisher;
			game.year = +d.Year_of_Release;
			game.na_sales = +d.NA_Sales;
			game.eu_sales = +d.EU_Sales;
			game.jp_sales = +d.JP_Sales;
			game.other_sales = +d.Other_Sales;
			game.global_sales = +d.Global_Sales;
			game.crit_score = +d.Critic_Score;
			game.user_score = +d.User_Score / 10;
			game.id_num = i;

			// Add platform_company column
			if (d.Platform.match(/^(PS|PS2|PS3|PS4|PSP|PSV)$/)) {
				game.console_company = "sony";
				games[0].push(game);
			} else if (d.Platform.match(/^(XB|X360|XOne)$/)) {
				game.console_company = "microsoft";
				games[1].push(game);
			} else if (
				d.Platform.match(/^(3DS|DS|GB|GBA|GC|N64|NES|SNES|Wii|WiiU)$/)
			) {
				game.console_company = "nintendo";
				games[2].push(game);
			} else if (d.Platform == "PC") {
				game.console_company = "pc";
				games[3].push(game);
			} else {
				game.console_company = "others";
				games[4].push(game);
			}
		}
		return games;
	}

	const mainViewData = formatDataForMain();
	console.log(mainViewData)

	return { mainViewData, salesMax, salesMin };
});
