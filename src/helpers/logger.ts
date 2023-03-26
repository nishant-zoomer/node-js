import { Response } from "express";
import fs from "fs";

export const log = {
    cron: async (text: any) => await appendLog(text, "cron"),
    odds: async (text: any) => await appendLog(text, "odds"),
};

async function appendLog(text: any, file: any) {
    return new Promise((resolve, reject) => {
        try {
            const logFilePath = process.cwd() + `/logs/${file}.txt`;

            fs.appendFile(logFilePath, `${text}\n`, (err) => {
                if (err?.code == "ENOENT") {
                    fs.writeFile(logFilePath, `${text}\n`, (er) => {
                        if (er) {
                            return resolve(er.message);
                        }
                        return resolve("Log saved successfully");
                    });
                    return;
                }

                if (err) {
                    return resolve(err.message);
                }
                return resolve("Log saved successfully");
            });
        } catch (e) {
            resolve(e);
        }
    });
}

export async function readLog(res: Response, file: any) {
    try {
        // Read the log file for the passed date
        const logFilePath = process.cwd() + `/logs/${file}.txt`;
        const fileStream = fs.createReadStream(logFilePath);
        res.type("html");
        res.write(
            `<body style="background: #282A36; color: #BF9EEE; margin: 0px;"><h1>${file} Logs</h1><pre style="white-space: pre-wrap;"><code>`,
        );

        // Return the file stream to the client
        fileStream.pipe(res, { end: false });
        fileStream.on("end", () => {
            res.end("</code></pre></body>");
        });
    } catch (err) {
        console.log(err);
    }
}

export async function removeFile(file: any) {
    try {
        // Read the log file for the passed date
        const logFilePath = process.cwd() + `/logs/${file}.txt`;
        const RemovedFile = fs.unlinkSync(logFilePath);
        console.log(
            "🚀 ~ file: logger.ts:60 ~ removeFile ~ RemovedFile:",
            RemovedFile,
        );
    } catch (err) {
        console.log(err);
    }
}