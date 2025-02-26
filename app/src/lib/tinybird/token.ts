"use server";

import jwt from "jsonwebtoken";

const TINYBIRD_SIGNING_TOKEN = process.env.TINYBIRD_SIGNING_TOKEN ?? "";
const WORKSPACE_ID = process.env.TINYBIRD_WORKSPACE ?? "";
const PIPE_ID = "top_airlines";

export async function generateJWT() {
  const next10minutes = new Date();
  next10minutes.setTime(next10minutes.getTime() + 1000 * 60 * 10);

  const payload = {
    workspace_id: WORKSPACE_ID,
    name: "my_demo_jwt",
    exp: Math.floor(next10minutes.getTime() / 1000),
    scopes: [
      {
        type: "PIPES:READ",
        resource: PIPE_ID,
      },
    ],
  };

  return jwt.sign(payload, TINYBIRD_SIGNING_TOKEN, { noTimestamp: true });
}
