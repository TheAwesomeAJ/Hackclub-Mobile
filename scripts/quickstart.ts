import { spawn } from "child_process";
import prompts from "prompts";
import fsPromises from "fs/promises";
import fs from "fs";
import path from "path";
import { exit } from "process";
import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env.local");
let convexUrl = "";
let convexSiteUrl = "";

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

  const envVars = dotenv.parse(fs.readFileSync(envPath));
  convexUrl = envVars.EXPO_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("Failed to retrieve Convex URL from environment variables");
    process.exit(1);
  }
}

async function addConvexSiteUrl() {
  if (convexUrl.endsWith(".convex.cloud")) {
    console.log("Convex cloud deployment detected");
    convexSiteUrl = convexUrl.replace(".convex.cloud", ".convex.site");
  } else if (convexUrl.endsWith(":3210")) {
    console.log("Convex local deployment detected");
    convexSiteUrl = convexUrl.replace(":3210", ":3211");
  } else {
    console.error("Unsupported Convex deployment type");
    process.exit(1);
  }

  const envVars = dotenv.parse(fs.readFileSync(envPath));

  if (!envVars.EXPO_PUBLIC_CONVEX_SITE_URL) {
    await fsPromises.appendFile(
      path.resolve(process.cwd(), ".env.local"),
      `EXPO_PUBLIC_CONVEX_SITE_URL=${convexSiteUrl}\n`,
    );
    console.log("Convex site URL added to .env.local");
  }
}

async function authSetup() {
  console.log(`Step 2: Setting up authentication
Go to https://auth.hackclub.com/developer/apps and create a new app.

Use the redirect URI: ${convexSiteUrl}/api/auth/oauth2/callback/hackclub

Enable the following scopes:
 - openid
 - profile
 - email
 - name
 - slack_id
`);

  const { clientId, clientSecret } = await prompts([
    {
      type: "text",
      name: "clientId",
      message: "Enter the Client ID",
    },
    {
      type: "text",
      name: "clientSecret",
      message: "Enter the Client Secret",
    },
  ]);
}

(async () => {
  await checkEnvs();
  await convexSetup();
  await addConvexSiteUrl();
  await authSetup();
})();
