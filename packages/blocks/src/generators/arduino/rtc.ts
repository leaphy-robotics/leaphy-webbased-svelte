import type { Arduino } from "../arduino";

interface Text {
	type: "text";
	value: string;
}
interface Item {
	type: "item";
	item: string;
	fmt: string;
}
export type DateItem = Text | Item;

function getCodeGenerators(arduino: Arduino) {
	function addRTCGet(type: string) {
		arduino.addInclude("RTC", "#include <DS3231.h>");
		arduino.addDeclaration("RTC", "DS3231 RTC;");

		const methods: Record<string, string> = {
			second: "return RTC.getSecond();",
			minute: "return RTC.getMinute();",
			hour:
				"bool h12Flag;\n" +
				"   bool pmFlag;\n" +
				"   return RTC.getHour(h12Flag, pmFlag);",
			weekday: "return RTC.getDoW();",
			day: "return RTC.getDate();",
			month: "bool century;\n" + "   return RTC.getMonth(century);",
			year: "return RTC.getYear() + 2000;",
		};

		const setup = arduino.addI2CSetup("i2c_rtc", "Wire.begin();\n");
		const getDeclaration = `int rtc_get_${type}() {\n   ${setup}\n   ${methods[type]}\n}`;
		arduino.addDeclaration(`RTC_GET_${type}`, getDeclaration);

		return `rtc_get_${type}()`;
	}

	arduino.forBlock.leaphy_i2c_rtc_get = (block) => {
		const type = block.getFieldValue("TYPE");

		return [addRTCGet(type), arduino.ORDER_ATOMIC];
	};

	arduino.forBlock.leaphy_i2c_rtc_set = (block) => {
		arduino.addInclude("RTC", "#include <DS3231.h>");
		arduino.addDeclaration("RTC", "DS3231 RTC;");

		const setup = arduino.addI2CSetup("i2c_rtc", "Wire.begin();\n");
		const getDeclaration = `void RTCSet(String value) {\n   ${setup}\n   RTC.setYear(value.substring(0, 2).toInt());\n   RTC.setMonth(value.substring(2, 4).toInt());\n   RTC.setDate(value.substring(4, 6).toInt());\n   RTC.setDoW(value.substring(6, 7).toInt());\n   RTC.setHour(value.substring(7, 9).toInt());\n   RTC.setMinute(value.substring(9, 11).toInt());\n   RTC.setSecond(value.substring(11, 13).toInt());\n}`;
		arduino.addDeclaration("RTC_SET", getDeclaration);

		return `RTCSet(${arduino.valueToCode(
			block,
			"VALUE",
			arduino.ORDER_ATOMIC,
		)});\n`;
	};

	arduino.forBlock.leaphy_i2c_rtc_format = (block) => {
		arduino.addInclude("RTC", "#include <DS3231.h>");
		arduino.addDeclaration("RTC", "DS3231 RTC;");

		const PAD_DECLARATION =
			"String pad(int original) {\n" +
			"   if (original >= 10) return String(original);\n\n" +
			'   return "0" + String(original);\n' +
			"}";
		arduino.addDeclaration("PAD", PAD_DECLARATION);

		function makeID(length: number) {
			const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			let result = "";

			for (let i = 0; i < length; i++) {
				result += characters[Math.floor(Math.random() * characters.length)];
			}

			return result;
		}
		function getCode(item: DateItem) {
			if (item.type === "text") return `"${item.value}"`;

			if (item.item === "year") {
				if (item.fmt === "full") return addRTCGet("year");
				if (item.fmt === "2-digit") return `${addRTCGet("year")} - 2000`;
			}

			if (item.fmt === "numeric") return addRTCGet(item.item);
			if (item.fmt === "2-digit") return `pad(${addRTCGet(item.item)})`;
			if (item.item === "weekday") {
				arduino.addDeclaration(
					"RTC_WEEKDAYS",
					'String weekdays[] = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};',
				);

				return `weekdays[${addRTCGet(item.item)} - 1]`;
			}
			if (item.item === "month") {
				arduino.addDeclaration(
					"RTC_MONTHS",
					'String months[] = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};',
				);

				return `months[${addRTCGet(item.item)} - 1]`;
			}
		}

		const id = makeID(5);
		const getDeclaration = `String rtc_format_${id}() {\n   String result = "";\n${block
			.saveExtraState?.()
			.map((item: DateItem) => `   result += ${getCode(item)};\n`)
			.join("")}   return result;\n}`;
		arduino.addDeclaration(`RTC_FORMAT_${id}`, getDeclaration);

		return [`rtc_format_${id}()`, arduino.ORDER_ATOMIC];
	};
}
export default getCodeGenerators;
