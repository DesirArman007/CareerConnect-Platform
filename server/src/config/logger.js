import pino from "pino";
import pinoHttpMiddleware from "pino-http";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
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

const pinoHttp = pinoHttpMiddleware({
    logger,
    autoLogging: true,
});

export { logger, pinoHttp };
