import { createStart } from "@tanstack/react-start";
import { redirectMiddleware } from "@/lib/middleware/redirectMiddleware";
import { dbMiddleware } from "./lib/middleware/db";

export const startInstance = createStart(() => ({
  requestMiddleware: [dbMiddleware],
  functionMiddleware: [redirectMiddleware],
}));
