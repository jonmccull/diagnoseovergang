import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { PdCommentaryEntry } from "../schema/content";

export const collections = {
  pd: defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/pd" }),
    schema: PdCommentaryEntry,
  }),
};
