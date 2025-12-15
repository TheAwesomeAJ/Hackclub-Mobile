import { spawn } from "child_process";
import prompts from "prompts";

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

(async () => {
  console.log(`Step 1: Setting up convex
We recommend using a cloud deployment, but local will work as well
Follow the prompts from the Convex CLI`);

  await exec("bunx", ["convex", "dev", "--until-success"]);
})();
