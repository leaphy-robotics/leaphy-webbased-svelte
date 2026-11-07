import {
	faMicrochip,
	faPlug,
	faSatelliteDish,
	type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import type { SensorGroup } from "@leaphy-robotics/leaphy-blocks/src/categories/ml/sensors";

export const sensorGroupIcons: Record<SensorGroup, IconDefinition> = {
	spark: faMicrochip,
	pins: faPlug,
	i2c: faSatelliteDish,
};

export const sensorGroupNames: Record<SensorGroup, string> = {
	spark: "ML_SENSOR_GROUP_SPARK",
	pins: "ML_SENSOR_GROUP_PINS",
	i2c: "ML_SENSOR_GROUP_I2C",
};
