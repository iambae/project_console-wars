export const genreDropdown = (selection, props) => {
	const { options, onOptionSelected, selectedOption } = props;

	let select = selection
		.selectAll("select")
		.data([null])
		.join("select")
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
