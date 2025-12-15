import { spawn } from "child_process";
import prompts from "prompts";
import fsPromises from "fs/promises";
import fs from "fs";
import path from "path";
import { exit } from "process";
import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env.local");

async function confirm(text: string) {
  const { value } = await prompts({
    type: "toggle",
    name: "value",
    message: text,
    initial: true,
    inactive: "Exit",
    active: "Continue",
  });
  if (!value) {
    console.log("Cancelled");
    process.exit(1);
  }
}

async function exec(executable: string, args: string[]) {
  console.log("> " + executable + " " + args.join(" "));

  await confirm("Continue?");

  return new Promise<void>((resolve, reject) => {
    const process = spawn(executable, args, {
      stdio: "inherit",
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

async function checkEnvs() {
  if (fs.existsSync(envPath)) {
    const { value } = await prompts({
      type: "confirm",
      name: "value",
      message: "Environment variables already exist. Delete?",
    });
    if (value === undefined) exit(1);
    if (value) {
      await fsPromises.unlink(envPath);
    }
  }
}

async function convexSetup() {
  console.log(`Step 1: Setting up convex
We recommend using a cloud deployment, but local will work as well
Follow the prompts from the Convex CLI`);

  await exec("bunx", ["convex", "dev", "--until-success"]);
}

(async () => {
  await checkEnvs();
  await convexSetup();
})();
