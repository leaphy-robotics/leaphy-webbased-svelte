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
  modes: ComponentType[];
}
export interface RobotListing extends BaseRobot {
  variants: RobotDevice[][];
}
export type Robot = RobotDevice | RobotListing;

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
  programmer: new AvrDude('atmega328p')
}

const baseNanoRP2040 = {
  mapping: PinMapping.NANO,
  fqbn: "arduino:mbed_nano:nanorp2040connect",
  programmer: new AvrDude('atmega328p')
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
            modes: [Mode.BLOCKS, Mode.ADVANCED],
          },
          {
            ...baseNano,
            id: "l_flitz_nano",
            type: RobotType.L_FLITZ_NANO,
            name: "Flitz Nano",
            libraries: DEFAULT_LIBRARIES,
            icon: flitzIcon,
            modes: [Mode.BLOCKS, Mode.ADVANCED],
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
            modes: [Mode.BLOCKS, Mode.ADVANCED],
          },
          {
            ...baseNano,
            id: "l_original_nano",
            type: RobotType.L_ORIGINAL_NANO,
            name: "Original Nano",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: originalIcon,
            modes: [Mode.BLOCKS, Mode.ADVANCED],
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
            modes: [Mode.BLOCKS, Mode.ADVANCED],
          },
          {
            ...baseNanoRP2040,
            id: "l_original_nano_rp2040",
            type: RobotType.L_ORIGINAL_NANO_RP2040,
            name: "Original Nano RP2040",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: originalIcon,
            modes: [Mode.BLOCKS, Mode.ADVANCED],
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
      modes: [Mode.BLOCKS, Mode.ADVANCED],
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
            modes: [Mode.BLOCKS, Mode.ADVANCED],
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
            modes: [Mode.BLOCKS, Mode.ADVANCED],
          },
          {
            ...baseNanoRP2040,
            id: "l_nano_rp2040",
            type: RobotType.L_NANO_RP2040,
            name: "Arduino Nano RP2040",
            libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
            icon: nanoIcon,
            modes: [Mode.BLOCKS, Mode.ADVANCED],
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
      modes: [Mode.BLOCKS, Mode.ADVANCED],
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
      modes: [Mode.BLOCKS, Mode.ADVANCED],
    },
  ],
  [
    {
      ...baseUno,
      id: "l_cpp",
      type: RobotType.L_CPP,
      name: "Leaphy C++",
      libraries: DEFAULT_LIBRARIES.concat(["QMC5883LCompass", "Arduino_APDS9960"]),
      icon: cppIcon,
      modes: [Mode.ADVANCED],
    },
    {
      ...baseNanoRP2040,
      id: "l_python",
      type: RobotType.L_MICROPYTHON,
      name: "MicroPython",
      libraries: [],
      icon: microPythonIcon,
      modes: [Mode.ADVANCED],
    },
  ],
];

export type Robots = {
  [identifier: string]: Robot;
};
export const robots = robotListing
  .flat()
  .flatMap((robot) => {
    if ("type" in robot) return robot;
    return robot.variants.flat();
  })
  .reduce((robots, robot) => {
    robots[robot.id] = robot;
    return robots;
  }, {} as Robots);
