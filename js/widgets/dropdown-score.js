export const dropdownScoreWidget = (selection, props) => {
	const { selectedOption, options, onOptionSelected } = props;

	let select = selection
		.selectAll("select")
		.data([null])
		.join("select")
		.attr("class", "dropdown-score")
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
		.property("selected", d => d === selectedOption)
		.text(d => d);
};
