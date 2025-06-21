import * as loops from "./alternatives";
import * as arduino from "./arduino";
import * as leaphyCommon from "./leaphy_common";
import * as leaphyFlitz from "./leaphy_flitz";
import * as leaphyOriginal from "./leaphy_original";
import * as lists from "./lists";
import * as mesh from "./mesh";
import * as rtc from "./rtc";
import * as texts from "./text";
import * as ml from "./ml"

const blocks = [
	...lists.blocks,
	...texts.blocks,
	...leaphyOriginal.blocks,
	...leaphyFlitz.blocks,
	...arduino.blocks,
	...loops.blocks,
	...leaphyCommon.blocks,
	...mesh.blocks,
	...rtc.blocks,
	...ml.blocks,
];

export { blocks };
