class ColorPickerState {
	visible = $state(false);
	anchor = $state<Element>();
	trigger?: Element;
	color = $state("#06778f");

	private resolve?: (color: string | undefined) => void;

	/**
	 * Open the color picker next to `anchor`.
	 * Resolves with the picked color, or `undefined` when dismissed.
	 */
	open(
		anchor: Element,
		color = this.color,
		onChange?: (color: string) => void,
	): Promise<string | undefined> {
		this.close();

		this.anchor = anchor;
		this.color = color;
		this.onChange = onChange;
		this.visible = true;

		return new Promise((resolve) => {
			this.resolve = resolve;
		});
	}

	onChange?: (color: string) => void;

	update(color: string) {
		this.color = color;
		this.onChange?.(color);
	}

	/** Set the color from outside (e.g. the edited value changed) without firing `onchange`. */
	sync(color: string) {
		this.color = color;
	}

	close(confirm = true) {
		if (!this.visible) return;
		this.visible = false;
		this.resolve?.(confirm ? this.color : undefined);
		this.resolve = undefined;
		this.onChange = undefined;
	}
}

export default new ColorPickerState();
