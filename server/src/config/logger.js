import pino from "pino";
import pinoHttpMiddleware from "pino-http";
import { randomUUID } from "crypto";

// ─── Environment ────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL || (isProduction ? "info" : "debug");

// ─── Redaction paths ────────────────────────────────────────────────
// Strips sensitive values from any log object, regardless of nesting.
const redactPaths = [
    "req.headers.authorization",
    "req.headers.cookie",
    "req.headers['x-forwarded-for']",
    "req.headers['cf-connecting-ip']",
    "req.headers['true-client-ip']",
    "password",
    "token",
    "*.password",
    "*.token",
    "*.secret",
];

// ─── Base logger ────────────────────────────────────────────────────
const logger = pino({
    name: "careerconnect",
    level: logLevel,
    redact: {
        paths: redactPaths,
        censor: "[REDACTED]",
    },
    // In production: epoch ms (fastest, machine-parseable).
    // In development: ISO string via pino-pretty's translateTime instead.
    timestamp: isProduction ? pino.stdTimeFunctions.epochTime : true,

    // pino-pretty transport is only loaded in development.
    ...(isProduction
        ? {}
        : {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                },
            },
        }),
});

// ─── pino-http middleware ───────────────────────────────────────────

/**
 * Determine log level based on HTTP status code:
 *   5xx → "error"
 *   4xx → "warn"
 *   everything else → "info"
 */
function customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
}

const pinoHttp = pinoHttpMiddleware({
    logger,

    // ── Log level by status code ────────────────────────────────────
    customLogLevel,

    // ── Request ID ──────────────────────────────────────────────────
    // Prefer the upstream proxy's id; fall back to a new UUID.
    genReqId: (req) => req.headers["x-request-id"] || randomUUID(),

    // ── Silence noisy health-check pings ────────────────────────────
    autoLogging: {
        ignore: (req) => req.url === "/health",
    },

    // ── Minimal serializers (strip full headers / body) ─────────────
    serializers: {
        req(req) {
            return {
                method: req.method,
                url: req.url,
                // Only keep remoteAddress; everything else (headers, body) is omitted.
                remoteAddress: req.remoteAddress,
            };
        },
        res(res) {
            return { statusCode: res.statusCode };
        },
        // Keep pino's default err serializer (stack + message).
        err: pino.stdSerializers.err,
    },

    // ── Clean log messages ──────────────────────────────────────────
    customSuccessMessage: (_req, res) =>
        `request completed — ${res.statusCode}`,

    customErrorMessage: (_req, res, err) =>
        `request errored — ${res.statusCode} ${err?.message ?? ""}`,

    // ── Flatten responseTime into the top-level log object ──────────
    customAttributeKeys: {
        req: "req",
        res: "res",
        err: "err",
        responseTime: "responseTime",
        reqId: "requestId",
    },

    // ── Extra props merged into every request log line ──────────────
    customProps: (req) => ({
        method: req.method,
        url: req.url,
    }),
});

export { logger, pinoHttp };
