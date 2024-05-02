import flitzIcon from "$assets/robots/icons/l_flitz.svg";
import originalIcon from "$assets/robots/icons/l_original.svg";
import clickIcon from "$assets/robots/icons/l_click.svg";
import nanoIcon from "$assets/robots/icons/l_nano.svg";
import unoIcon from "$assets/robots/icons/l_uno.svg";
import megaIcon from "$assets/robots/icons/l_mega.svg";
import cppIcon from "$assets/robots/icons/l_c++.svg";
import microPythonIcon from "$assets/robots/icons/l_micropython.svg";
import { Mode } from "$state/workspace.svelte";
import type { ComponentType } from "svelte";
import { RobotType, type Programmer } from "./robots.types";
import AvrDude from "../programmers/AvrDude";
import defaultCPP from "$assets/default-program.ino?raw"
import defaultPython from "$assets/default-program.py?raw"
import DFU from "../programmers/DFU";
import Pico from "../programmers/Pico";

const DEFAULT_LIBRARIES = [
  "Leaphy Extensions",
  "Servo",
  "Adafruit GFX Library",
  "Adafruit SSD1306",
  "Adafruit LSM9DS1 Library",
  "Adafruit Unified Sensor",
  "List",
  "Adafruit SGP30 Sensor",
  "Adafruit_VL53L0X",
  "Adafruit BMP280 Library",
  "TM1637",
  "LedControl",
];

interface BaseRobot {
  id: string;
  name: string;
  icon: string;
}

export interface RobotDevice extends BaseRobot {
  type: number,
  mapping: PinMapping,
  programmer: Programmer,
  libraries: string[],
  fqbn: string,
}
export interface RobotListing extends BaseRobot {
  variants: RobotDevice[][];
}
export interface RobotMode extends BaseRobot {
  mode: ComponentType,
  defaultRobot: string,
  defaultProgram: string
}
export type Robot = RobotDevice | RobotListing | RobotMode;

export enum PinMapping {
  UNO,
  NANO,
  MEGA
}

const baseUno = {
  mapping: PinMapping.UNO,
  fqbn: "arduino:avr:uno",
  programmer: new AvrDude('atmega328p')
}

const baseNano = {
  mapping: PinMapping.NANO,
  fqbn: "arduino:avr:nano",
  programmer: new AvrDude('atmega328p')
}

const baseNanoESP32 = {
  mapping: PinMapping.NANO,
  fqbn: "arduino:esp32:nano_nora",
  programmer: new DFU()
}

const baseNanoRP2040 = {
  mapping: PinMapping.NANO,
  fqbn: "arduino:mbed_nano:nanorp2040connect",
  programmer: new Pico()
}

export const robotListing: Robot[][] = [
  [
    {
      name: "Leaphy Flitz",
      id: "flitz_group",
      icon: flitzIcon,
      variants: [
        [
          {
            ...baseUno,
            id: "l_flitz_uno",
            type: RobotType.L_FLITZ_UNO,
            name: "Flitz Uno",
            libraries: DEFAULT_LIBRARIES,
            icon: flitzIcon,
          },
          {
            ...baseNano,
            id: "l_flitz_nano",
            type: RobotType.L_FLITZ_NANO,
            name: "Flitz Nano",
            libraries: DEFAULT_LIBRARIES,
            icon: flitzIcon,
          },
        ],
      ],
    },
    {
      name: "Leaphy Original",
      id: "original_group",
      icon: originalIcon,
      variants: [
        [
          {
            ...baseUno,
            id: "l_original_uno",
            type: RobotType.L_ORIGINAL_UNO,
            name: "Original Uno",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: originalIcon,
          },
          {
            ...baseNano,
            id: "l_original_nano",
            type: RobotType.L_ORIGINAL_NANO,
            name: "Original Nano",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: originalIcon,
          },
        ],
        [
          {
            ...baseNanoESP32,
            id: "l_original_nano_esp32",
            type: RobotType.L_ORIGINAL_NANO_ESP32,
            name: "Original Nano ESP32",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: originalIcon,
          },
          {
            ...baseNanoRP2040,
            id: "l_original_nano_rp2040",
            type: RobotType.L_ORIGINAL_NANO_RP2040,
            name: "Original Nano RP2040",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: originalIcon,
          },
        ],
      ],
    },
    {
      ...baseUno,
      id: "l_click",
      type: RobotType.L_CLICK,
      name: "Leaphy Click",
      libraries: DEFAULT_LIBRARIES,
      icon: clickIcon,
    },
  ],
  [
    {
      name: "Arduino Nano",
      id: "nano_group",
      icon: nanoIcon,
      variants: [
        [
          {
            ...baseNano,
            id: "l_nano",
            type: RobotType.L_NANO,
            name: "Arduino Nano",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: nanoIcon,
          },
        ],
        [
          {
            ...baseNanoESP32,
            id: "l_nano_esp32",
            type: RobotType.L_NANO_ESP32,
            name: "Arduino Nano ESP32",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: nanoIcon,
          },
          {
            ...baseNanoRP2040,
            id: "l_nano_rp2040",
            type: RobotType.L_NANO_RP2040,
            name: "Arduino Nano RP2040",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: nanoIcon,
          },
        ],
      ],
    },
    {
      ...baseUno,
      id: "l_uno",
      type: RobotType.L_UNO,
      name: "Arduino Uno",
      libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
      icon: unoIcon,
    },
    {

      id: "l_mega",
      type: RobotType.L_MEGA,
      mapping: PinMapping.MEGA,
      name: "Arduino Mega",
      programmer: new AvrDude("atmega2560"),
      fqbn: "arduino:avr:mega",
      libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
      icon: megaIcon,
    },
  ],
  [
    {
      id: "l_cpp",
      name: "Leaphy C++",
      icon: cppIcon,
      mode: Mode.ADVANCED,
      defaultRobot: "l_uno",
      defaultProgram: defaultCPP
    },
    {
      id: "l_python",
      name: "MicroPython",
      icon: microPythonIcon,
      mode: Mode.PYTHON,
      defaultRobot: "l_nano_rp2040",
      defaultProgram: defaultPython
    },
  ],
];

export type Robots = {
  [identifier: string]: RobotDevice;
};
export const robots = robotListing
  .flat()
  .flatMap((robot) => {
    if ("type" in robot) return robot;
    if ("mode" in robot) return []
    return robot.variants.flat();
  })
  .reduce((robots, robot) => {
    robots[robot.id] = robot;
    return robots;
  }, {} as Robots);

export function inFilter(robot: RobotDevice, filter: number[]) {
  if (filter.includes(-robot.type)) return false;

  return filter.includes(robot.type);
}
