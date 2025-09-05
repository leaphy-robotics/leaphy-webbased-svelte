import { pseudo } from "$domain/blockly/pseudo";
import type { BlockSvg } from "blockly";
import { locale } from "svelte-i18n";
import { get } from "svelte/store";

class AIState {
	loading = $state(true);
	content = $state<string>();

	visible = $state(false);
	block = $state<BlockSvg>();

	async explain(block: BlockSvg) {
		this.loading = true;
		this.block = block;
		this.visible = true;

		const workspace = block.workspace;
		const code = pseudo(workspace, block);

		const locales = {
			en: "English",
			nl: "Dutch",
		};

		try {
			const res = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/ai/generate`,
				{
					method: "post",
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify({
						messages: [
							{
								role: "system",
								content: `explain the selected portion of the following pseudo code (SELECT_BEGIN - SELECT_END) in simple terms, the pseudo code is directly generated from a blockly environment to program robots called Leaphy EasyBloqs, you must do this in ${
									locales[get(locale)]
								}`,
							},
							{
								role: "user",
								content: `\`\`\`\n${code}\n\`\`\``,
							},
							{
								role: "system",
								content:
									"please only return the explanation for the given set of code in simple terms, like you're explaining it to someone who has never touched code before, do not explain the code around the given set of code unless directly related, do not talk about or reference the pseudo code directly, you are talking about the selected code almost exclusively, so you do not have to include the **begin_select** and **end_select** tokens in your response, only include your explanation in the response",
							},
						],
					}),
				},
			);

			this.content = await res.json();
			this.loading = false;
		} catch {
			this.content = null;
			this.loading = false;
		}
	}
}

export default new AIState();
