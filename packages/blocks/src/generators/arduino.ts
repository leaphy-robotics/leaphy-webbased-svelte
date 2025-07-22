import * as Blockly from "blockly/core";
import {
	type Block,
	ConnectionType,
	Msg,
	type Workspace,
	type WorkspaceSvg,
} from "blockly/core";
import { Dependencies } from "./arduino/dependencies";
import { addI2CDeclarations } from "./arduino/i2c";
import { procedureManager } from "./arduino/procedures";

export class Arduino extends Blockly.Generator {
	public ORDER_ATOMIC = 0; // 0 "" ...
	public ORDER_UNARY_POSTFIX = 1; // expr++ expr-- () [] .
	public ORDER_UNARY_PREFIX = 2; // -expr !expr ~expr ++expr --expr
	public ORDER_MULTIPLICATIVE = 3; // * / % ~/
	public ORDER_ADDITIVE = 4; // + -
	public ORDER_SHIFT = 5; // << >>
	public ORDER_RELATIONAL = 6; // is is! >= > <= <
	public ORDER_EQUALITY = 7; // == != === !==
	public ORDER_BITWISE_AND = 8; // &
	public ORDER_BITWISE_XOR = 9; // ^
	public ORDER_BITWISE_OR = 10; // |
	public ORDER_LOGICAL_AND = 11; // &&
	public ORDER_LOGICAL_OR = 12; // ||
	public ORDER_CONDITIONAL = 13; // expr ? expr : expr
	public ORDER_ASSIGNMENT = 14; // = *= /= ~/= %= += -= <<= >>= &= ^= |=
	public ORDER_COMMA = 15; // ,
	public ORDER_UNARY_NEGATION = 16;
	public ORDER_MEMBER = 17;
	public ORDER_NONE = 99; // (...)

	public PinTypes = {
		INPUT: "INPUT",
		OUTPUT: "OUTPUT",
		PWM: "PWM",
		SERVO: "SERVO",
		STEPPER: "STEPPER",
		SERIAL: "SERIAL",
		I2C: "I2C/TWI",
		SPI: "SPI",
		LEDSTRIP: "LEDSTRIP",
	};

	public DEF_FUNC_NAME = this.FUNCTION_NAME_PLACEHOLDER_;

	public TYPES: Record<string, string> = {
		Number: "double",
		Boolean: "boolean",
		String: "String",
	};
	public DEFAULTS: Record<string, string> = {
		Number: "0",
		Boolean: "false",
		String: '""',
	};

	public pins_: Record<string, string> = {};
	public includes_: Record<string, string> = {};
	public setups_: Record<string, string | undefined> = {};
	public declarations_: Record<string, { priority: number; code: string }> = {};
	public dependencies = new Set<string>();

	public robotType = "l_uno";

	constructor() {
		super("Arduino");
		this.addReservedWords(
			"Blockly," + // In case JS is evaled in the current window.
				"setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto," +
				"define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,integer," +
				"constants,floating,point,void,boolean,char,unsigned,byte,int,word,long," +
				"float,double,string,String,array,static,volatile,const,sizeof,pinMode," +
				"digitalWrite,digitalRead,analogReference,analogRead,analogWrite,tone," +
				"noTone,shiftOut,shitIn,pulseIn,millis,micros,delay,delayMicroseconds," +
				"min,max,abs,constrain,map,pow,sqrt,sin,cos,tan,randomSeed,random," +
				"lowByte,highByte,bitRead,bitWrite,bitSet,bitClear,bit,attachInterrupt," +
				"detachInterrupt,interrupts,noInterrupts",
		);
	}

	public init(workspace: WorkspaceSvg) {
		this.pins_ = Object.create(null);
		this.functionNames_ = Object.create(null);
		this.declarations_ = Object.create(null);

		super.init(workspace);

		if (!this.nameDB_) {
			this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
		} else {
			this.nameDB_.reset();
		}

		this.nameDB_.setVariableMap(workspace.getVariableMap());
		this.nameDB_.populateVariables(workspace);
		this.nameDB_.populateProcedures(workspace);

		const defvars = [];
		// Add developer Blockly.Variables (not created or named by the user).
		const devVarList = Blockly.Variables.allDeveloperVariables(workspace);
		for (let i = 0; i < devVarList.length; i++) {
			defvars.push(
				this.nameDB_.getName(
					devVarList[i],
					Blockly.Names.NameType.DEVELOPER_VARIABLE,
				),
			);
		}

		// Add user Blockly.Variables, but only ones that are being used.
		const variables = Blockly.Variables.allUsedVarModels(workspace);
		const variableSetters = workspace.getBlocksByType("variables_set");
		const variableGetters = workspace.getBlocksByType("variables_get");
		for (let i = 0; i < variables.length; i++) {
			const setters = variableSetters.filter(
				(block) => block.getFieldValue("VAR") === variables[i].getId(),
			);
			const types = setters.map((block) => {
				const output = block.getChildren(true)[0];
				return {
					block,
					type: output?.outputConnection
						? output.outputConnection.getCheck()?.[0]
						: undefined,
				};
			});
			// check for mismatch
			if (
				types.some(({ type }) => type !== types[0].type && type !== undefined)
			) {
				types.forEach(({ block }) => {
					block.setWarningText(
						`Variable has conflicting types: ${types
							.map(({ type }) => type)
							.join(", ")}`,
					);
				});
			} else {
				types.forEach(({ block }) => {
					block.setWarningText(null);
				});
			}

			const type = types[0]?.type || "Number";
			variableGetters.forEach((block) => {
				if (block.getFieldValue("VAR") === variables[i].getId()) {
					block.outputConnection?.setCheck(type);
				}
			});

			const arduinoType = this.TYPES[type];
			const defaultValue = this.DEFAULTS[type];
			const name = this.nameDB_.getName(
				variables[i].getId(),
				Blockly.Names.NameType.VARIABLE,
			);

			defvars.push(`${arduinoType} ${name} = ${defaultValue}`);
		}

		// Declare all of the variables.
		if (defvars.length) {
			this.definitions_.variables = `${defvars.join(";\n")};\n`;
		}

		// Type inference for procedures
		const definitions = workspace.getBlocksByType("procedures_defreturn");
		const usages = workspace.getBlocksByType("procedures_callreturn");
		const returns = workspace.getBlocksByType("procedures_ifreturn");
		definitions.forEach((definition) => {
			const input = definition.getInput("RETURN");
			if (!input) return;

			const check = input.connection?.targetConnection?.getCheck();
			const type = (check ? check[0] : "Number") || "Number";

			usages.forEach((block) => {
				block.outputConnection?.setCheck(type);
			});

			returns.forEach((block) => {
				if (block.getRootBlock().id !== definition.id) return;

				block.getInput("VALUE")?.setCheck(type);
			});
		});

		// Remote procedure manager
		const procedures = [
			...workspace.getBlocksByType("procedures_defreturn"),
			...workspace.getBlocksByType("procedures_defnoreturn"),
		];
		const remotes = workspace
			.getBlocksByType("mesh_add_procedure")
			.map((block) => block.getFieldValue("METHOD"));

		procedureManager.setProcedures(
			procedures.map((procedure) => {
				const name = procedure.getFieldValue("NAME");
				const funcName = generator.nameDB_?.getName(
					name,
					Blockly.Names.NameType.PROCEDURE,
				) as string;

				return {
					name,
					funcName,
					arguments: procedure.getVarModels().map((e) => ({
						id: e.getId(),
						name: e.name,
					})),
					remote: remotes.includes(funcName),
				};
			}),
		);

		// Create a dictionary of definitions to be printed at the top of the sketch
		this.includes_ = Object.create(null);
		this.dependencies = new Set();
		// Create a dictionary of setups to be printed in the setup() function
		this.setups_ = Object.create(null);
		// Create a dictionary of pins to check if their use conflicts
		this.pins_ = Object.create(null);

		// Define all user lists
		const lists = listManager.getLists();
		const types = Object.fromEntries(
			lists.map((list) => [list.id, [] as string[]]),
		);
		const setters = [
			...workspace.getBlocksByType("lists_add"),
			...workspace.getBlocksByType("lists_insert"),
			...workspace.getBlocksByType("lists_replace"),
		];

		const typedSetters = setters
			.map((block) => {
				const list = block.getFieldValue("LIST");
				const input = block.getInput("VALUE");
				if (!input) return;

				const check = input.connection?.targetConnection?.getCheck();
				const type = check ? check[0] : undefined;

				if (type) types[list].push(type);
				return [block, list, type];
			})
			.filter((e) => e) as [Blockly.Block, string, string][];
		typedSetters.forEach(([block, list, type]) => {
			if (type === types[list][0] || !type) {
				block.setWarningText(null);
			} else {
				block.setWarningText("List has conflicting types");
			}
		});

		const getters = workspace.getBlocksByType("lists_get");
		getters.forEach((block) => {
			const list = block.getFieldValue("LIST");
			const type = types[list][0] || "Number";

			block.outputConnection?.setCheck(type);
		});

		const defLists: string[] = [];
		lists.forEach((list) => {
			const type = this.TYPES[types[list.id][0] || "Number"];

			const name = list.name.replaceAll(" ", "_");
			defLists.push(`List<${type}> ${name}`);
		});

		if (defLists.length) {
			this.definitions_.lists = `${defLists.join(";\n")};\n`;
			this.includes_.lists = "#include <List.hpp>";
		}

		this.isInitialized = true;
	}

	public finish(code: string) {
		// Convert the includes, definitions, and functions dictionaries into lists
		const includes = Object.values(this.includes_);
		const definitions: string[] = Object.values(this.definitions_);
		const declarations = Object.values(this.declarations_)
			.sort((a, b) => b.priority - a.priority)
			.map(({ code }) => code);

		if (includes.length) includes.push("\n");
		if (definitions.length) definitions.push("\n");

		// userSetupCode is always added at the very end of the setup function
		const userSetup = this.setups_.userSetupCode || "";
		this.setups_.userSetupCode = undefined;
		const setups = Object.values(this.setups_);

		this.nameDB_?.reset();

		const allDefs =
			includes.join("\n") + definitions.join("\n") + declarations.join("\n");
		const setup = `\n\nvoid setup() {\n\t${setups.join("\n  ")}\n  ${userSetup}\n}\n\n`;
		const loop = `void loop() {\n  ${code.replace(/\n/g, "\n  ")}\n}`;

		return allDefs + setup + loop;
	}

	public addInclude(includeTag: string, code: string) {
		if (!this.includes_[includeTag]) {
			this.includes_[includeTag] = code;
		}
	}

	public addDependency(...dependencies: string[]) {
		dependencies.forEach((dependency) => {
			this.dependencies.add(dependency);
		});
	}

	public getDependencies() {
		return Array.from(this.dependencies.values());
	}

	/*
       Includes the right header file for Servo functions
       for the current robotType
     */
	public includeServoHeader() {
		if (this.robotType.includes("esp32")) {
			this.addDependency(Dependencies.ESP_SERVO);
			this.addInclude("servo", "#include <ESP32Servo.h>");
		} else {
			this.addDependency(Dependencies.SERVO);
			this.addInclude("servo", "#include <Servo.h>");
		}
	}

	public addDefinition(
		definitionTag: string,
		code: string,
		overwrite = false,
	) {
		if (this.definitions_[definitionTag] === undefined || overwrite) {
			this.definitions_[definitionTag] = code;
		}
	}

	public addDeclaration(
		declarationTag: string,
		code: string,
		overwrite = false,
		priority = 0,
	) {
		if (this.declarations_[declarationTag] === undefined || overwrite) {
			this.declarations_[declarationTag] = {
				priority,
				code,
			};
		}
	}

	public addSetup(setupTag: string, code: string, overwrite = false) {
		let overwritten = false;
		if (overwrite || this.setups_[setupTag] === undefined) {
			this.setups_[setupTag] = code;
			overwritten = true;
		}

		return overwritten;
	}

	public addI2CSetup(sensorName: string, setupCode: string) {
		addI2CDeclarations();

		this.addDeclaration(
			`setup_${sensorName}`,
			`bool ${sensorName}Setup[8];\nvoid setup${sensorName}() {\n    uint8_t channel = i2cGetChannel();\n    if (!${sensorName}Setup[channel]) {\n      ${setupCode}      ${sensorName}Setup[channel] = true;\n    }\n}\n`,
		);
		return `setup${sensorName}();\n`;
	}

	public reservePin(
		block: Blockly.Block,
		pin: string,
		pinType: string,
		warningTag: string,
	) {
		if (this.pins_[pin] && this.pins_[pin] !== pinType) {
			block.setWarningText(
				Msg.ARD_PIN_WARN1.replace("%1", pin)
					.replace("%2", warningTag)
					.replace("%3", pinType)
					.replace("%4", this.pins_[pin]),
				warningTag,
			);
		} else {
			this.pins_[pin] = pinType;
			block.setWarningText(null);
		}
	}

	public scrubNakedValue(line: string): string {
		return `${line};\n`;
	}

	public quote_(string: string) {
		const formattedString = string
			.replace(/\\/g, "\\\\")
			.replace(/\n/g, "\\\n")
			.replace(/\$/g, "\\$")
			.replace(/"/g, '\\"')
			.replace(/'/g, "\\'");
		return `"${formattedString}"`;
	}

	public scrub_(block: Blockly.Block, code: string) {
		if (code === null) {
			return "";
		}

		let commentCode = "";
		// Only collect comments for blocks that aren't inline.
		if (!block.outputConnection || !block.outputConnection.targetConnection) {
			// Collect comment for this block.
			let comment = block.getCommentText();
			if (comment) {
				commentCode += `${this.prefixLines(comment, "// ")}\n`;
			}
			// Collect comments for all value arguments.
			// Don't collect comments for nested statements.
			for (let x = 0; x < block.inputList.length; x++) {
				if (
					(block.inputList[x].type as number) ===
					(ConnectionType.INPUT_VALUE as number)
				) {
					const childBlock = block.inputList[x].connection?.targetBlock();
					if (childBlock) {
						comment = this.allNestedComments(childBlock);
						if (comment) {
							commentCode += this.prefixLines(comment, "// ");
						}
					}
				}
			}
		}

		const nextBlock = block.nextConnection?.targetBlock();
		const nextCode = this.blockToCode(nextBlock as Block);
		return commentCode + code + nextCode;
	}

	public workspaceToCode(workspace: Workspace, robotType?: string): string {
		if (robotType) this.robotType = robotType;
		return super.workspaceToCode(workspace);
	}
}

const generator = new Arduino();

import { listManager } from "../categories/lists";
import * as arduino from "./arduino/arduino";
import * as leaphy_extra from "./arduino/leaphy_extra";
import * as leaphy_flitz from "./arduino/leaphy_flitz";
import * as leaphy_original from "./arduino/leaphy_original";
import * as lists from "./arduino/lists";
import * as logic from "./arduino/logic";
import * as loops from "./arduino/loops";
import * as math from "./arduino/math";
import * as mesh from "./arduino/mesh";
import * as procedures from "./arduino/procedures";
import * as rtc from "./arduino/rtc";
import * as text from "./arduino/text";
import * as leaphy_common from "./arduino/variable_blocks";
import * as variables from "./arduino/variables";
import * as ml from "./arduino/ml"
import * as sensors from "./arduino/sensors"

arduino.default(generator);
leaphy_common.default(generator);
leaphy_extra.default(generator);
leaphy_original.default(generator);
leaphy_flitz.default(generator);
logic.default(generator);
loops.default(generator);
math.default(generator);
procedures.default(generator);
text.default(generator);
variables.default(generator);
lists.default(generator);
mesh.default(generator);
rtc.default(generator);
ml.default(generator);
sensors.default(generator);

export default generator;
