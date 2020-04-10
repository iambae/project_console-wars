export const dropdownGenreWidget = (selection, props) => {
	const { options, onOptionSelected, selectedGenre } = props;

	let select = selection
		.selectAll("select")
		.data([null])
		.join("select")
		.attr("class", "dropdown-genre")
		.on("change", function() {
			const selected = this.value;
			onOptionSelected(selected);
		});

	let dropdown = select
		.selectAll("option")
		.data(options)
		.join("option");

	dropdown
		.attr("value", d => d)
		.property("selected", d => d === selectedGenre)
		.text(d => d);
};
