import * as z from "zod";
import { ConfigSchema } from "./zod.zodobject";

export type AppConfig = z.infer<typeof ConfigSchema>
