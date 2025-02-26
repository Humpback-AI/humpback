"use server";

import jwt from "jsonwebtoken";

const TINYBIRD_SIGNING_TOKEN = process.env.TINYBIRD_SIGNING_TOKEN ?? "";
const WORKSPACE_ID = process.env.TINYBIRD_WORKSPACE ?? "";
const PIPE_ID = "t_fb9b9a15a78c4a2d8f8ffa18a8c2552b";

export async function generateJWT() {
  const next10minutes = new Date();
  next10minutes.setTime(next10minutes.getTime() + 1000 * 60 * 10);

  const payload = {
    workspace_id: WORKSPACE_ID,
    name: "app_jwt",
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
