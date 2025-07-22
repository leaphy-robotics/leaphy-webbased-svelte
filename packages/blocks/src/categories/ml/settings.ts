export interface Setting<ReturnType> {
	id: string,
	type: string
	name: string
	description: string
	_returnType: ReturnType

	options?: [string, any][]
	default?: string
	pinType?: string
}

export function selectSetting<Id extends string, Type>(id: Id, name: string, description: string, options: [string, Type][]) {
	return {
		type: 'select',
		_returnType: null as unknown as Type,

		id, options, name, description,
	} as Setting<Type> & { id: Id, options: [string, Type][] }
}

export function textSetting<Id extends string>(id: Id, name: string, description: string) {
	return {
		type: 'text',
		_returnType: null as unknown as string,

		id, name, description,
	} as Setting<string> & { id: Id }
}

export function i2cSetting<Id extends string>(id: Id) {
	return selectSetting(id, 'Channel', 'Select an I2C channel', [
		['None', -1],
		['0', 0],
		['1', 1],
		['2', 2],
		['3', 3],
		['4', 4],
		['5', 5],
		['6', 6],
		['7', 7],
	])
}

export function pinSetting<Id extends string>(id: Id, type: 'digital' | 'analog' | 'pwm', name: string, description: string, defaultValue='') {
	return {
		type: 'pin',
		pinType: type,
		default: defaultValue,

		id, name, description,
	} as Setting<string> & { id: Id, pinType: 'digital' | 'analog' | 'pwm', default: string }
}

export type SettingsToObject<T extends readonly Setting<any>[]> = {
	[K in T[number] as K['id']]: K['_returnType']
}
