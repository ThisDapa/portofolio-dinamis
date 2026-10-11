import { test } from "node:test";
import assert from "node:assert/strict";
import {
  projectSlug,
  editorSections,
  fields,
  emptyRecord,
} from "../src/lib/admin.js";
test("project addresses normalize punctuation, accents and long titles", () => {
  assert.equal(projectSlug("  Café & Warung Kita!  "), "cafe-warung-kita");
  assert.equal(projectSlug("---"), "");
  const long = projectSlug("a".repeat(119) + " " + "judul");
  assert.equal(long.length, 119);
  assert.match(projectSlug("Website UMKM 2026"), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});
test("grouped editors keep every editable field exactly once", () => {
  for (const [entity, sections] of Object.entries(editorSections)) {
    const keys = sections.flatMap((section) => section.keys);
    assert.equal(new Set(keys).size, keys.length);
    assert.deepEqual(
      keys.toSorted(),
      fields[entity].map((field) => field.key).toSorted(),
    );
  }
  assert.equal(emptyRecord("testimonials").status, "draft");
  assert.deepEqual(emptyRecord("projects").techStack, []);
});
