import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { randomBytes, timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);
  const origin = config.getOrThrow<string>("APP_ORIGIN");

  app.setGlobalPrefix("api");
  app.enableCors({ origin, credentials: true });
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", origin],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET" && req.path === "/api/auth/csrf") {
      const token = randomBytes(32).toString("hex");
      res.cookie("csrf_token", token, { sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/" });
      res.locals.csrfToken = token;
    }
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      if (!req.cookies?.csrf_token || !req.headers["x-csrf-token"]) {
        res.status(403).json({ message: "Missing CSRF token" });
        return;
      }
      const cookieToken = Buffer.from(String(req.cookies.csrf_token));
      const headerToken = Buffer.from(String(req.headers["x-csrf-token"]));
      if (cookieToken.length !== headerToken.length || !timingSafeEqual(cookieToken, headerToken)) {
        res.status(403).json({ message: "Invalid CSRF token" });
        return;
      }
    }
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true }, forbidNonWhitelisted: true }));

  const docs = new DocumentBuilder()
    .setTitle("Payroll SaaS API")
    .setDescription("API-first multi-tenant payroll platform")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, docs));

  await app.listen(config.get<number>("API_PORT", 4000));
}

bootstrap();
