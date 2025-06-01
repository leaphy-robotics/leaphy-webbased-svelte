import Dexie, { type EntityTable } from "dexie";

interface BaseSave {
	id: number;
	mode: string;
	robot: string;
	date: number;
}

export interface SavedFile extends BaseSave {
	fileHandle: FileSystemFileHandle;
}

export interface SavedContent extends BaseSave {
	content: string;
	fileSave?: number;
}

export const projectDB = new Dexie("ProjectStorage") as Dexie & {
	saves: EntityTable<SavedFile, "id">;
	tempSaves: EntityTable<SavedContent, "id">;
};
projectDB.version(1).stores({
	saves: "++id, mode, robot, date, fileHandle",
	tempSaves: "++id, mode, robot, date, content, fileSave",
});
