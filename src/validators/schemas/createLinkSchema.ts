import { z } from "zod";

export enum LinkTtl {
  Once = "once",
  OneDay = "1",
  ThreeDays = "3",
  SevenDays = "7",
}

export const createLinkSchema = z.object({
  body: z.object({
    originalLink: z
      .string({
        required_error: "originalLink is required",
      })
      .min(15)
      .url({ message: "Invalid url" }),
    ttl: z.nativeEnum(LinkTtl),
  }),
});
