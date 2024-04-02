import { type ClassValue, clsx } from "clsx";
import { Buffer } from "buffer";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decryptLink({
  encryptedPath,
  encryptMethod,
}: {
  encryptedPath: string;
  encryptMethod: string;
}) {
  switch (encryptMethod) {
    case "encoded as base64":
      return `task_${Buffer.from(
        encryptedPath.split("task_")[1],
        "base64"
      ).toString()}`;

    case "inserted some non-hex characters":
      return `task_${encryptedPath.replace(/[^0-9a-fA-F]+/g, "")}`;

    default:
      return encryptedPath;
  }
}
