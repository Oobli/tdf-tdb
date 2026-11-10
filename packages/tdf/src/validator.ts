import type { Document } from "../../shared/src/types";
import { validateDocument } from "../../shared/src/validation";

export function validateTDF(document: Document): void {
  validateDocument(document);
}