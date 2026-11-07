import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import translations from "../src/msg/translations";

const languages = ["en", "nl", "ua"] as const;

function readClientTranslations(language: string): Record<string, string> {
	return JSON.parse(
		readFileSync(
			new URL(
				`../../client/src/assets/translations/${language}.json`,
				import.meta.url,
			),
			"utf-8",
		),
	);
}

describe("translations", () => {
	const english = Object.keys(readClientTranslations("en")).sort();

	for (const language of languages) {
		it(`app translations for ${language} match English`, () => {
			expect(Object.keys(readClientTranslations(language)).sort()).toEqual(
				english,
			);
		});
	}

	it("block translations for ML and Teachable Machine exist in every language", () => {
		const relevant = Object.keys(translations.en).filter(
			(key) =>
				key.startsWith("ML_") ||
				key.startsWith("TEACHABLE_") ||
				key.endsWith("_CLASS") ||
				key.includes("MESH_CATEGORY"),
		);
		for (const language of languages) {
			const messages = translations[language] as Record<string, string>;
			for (const key of relevant) {
				expect(messages[key], `${language}.${key}`).toBeTruthy();
			}
		}
	});
});
