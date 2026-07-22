import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { CommentaryEntry } from "../schema/content";

export const collections = {
  // Collection id kept as "pd" to avoid route/type churn; it now holds all
  // Chapter 06 editorial entries, not only personality disorders.
  pd: defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/pd" }),
    schema: CommentaryEntry,
  }),
};
