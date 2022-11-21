import * as path from "path";
import * as fs from "fs";
import * as fsp from "fs/promises";

export const OUTPUT_DIR = path.resolve(__dirname, "..", process.env.OUTPUT_DIR ?? "output/");

export const prepareOutputDir = async (): Promise<void> => {
	if(fs.existsSync(OUTPUT_DIR)) {
		const dirstat = await fsp.lstat(OUTPUT_DIR);
		if(!dirstat.isDirectory()) {
			throw new Error(`ERROR: ${OUTPUT_DIR} should be a directory`);
		}
	} else {
		await fsp.mkdir(OUTPUT_DIR, { recursive: true });
	}
};
