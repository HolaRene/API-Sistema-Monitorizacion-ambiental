import { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";
import { API_KEYS, API_KEY_HEADER } from "../config/env";

const configuredKeys = (API_KEYS ?? "")
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean);

const hasConfiguredKeys = configuredKeys.length > 0;
const apiKeyHeader = (API_KEY_HEADER ?? "x-api-key").toLowerCase();

const safeEqual = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
};

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  if (!hasConfiguredKeys) {
    res.status(500).json({
      success: false,
      message: "API key validation is not configured on server.",
    });
    return;
  }

  const requestApiKey = req.header(apiKeyHeader) ?? req.header("x-api-key") ?? "";

  if (!requestApiKey) {
    res.status(401).json({
      success: false,
      message: `Missing API key. Use header: ${apiKeyHeader}`,
    });
    return;
  }

  const isValid = configuredKeys.some((validKey) => safeEqual(requestApiKey, validKey));

  if (!isValid) {
    res.status(403).json({
      success: false,
      message: "Invalid API key.",
    });
    return;
  }

  next();
};
