import { createServerOnlyFn } from "@tanstack/react-start";
import { customAlphabet } from "nanoid";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const generateId = createServerOnlyFn((prefix: string) => {
  const nanoid = customAlphabet(ALPHABET, 12);
  return `${prefix}_${nanoid()}`;
});
