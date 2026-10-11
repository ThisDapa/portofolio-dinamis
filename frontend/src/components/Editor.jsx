"use client";
import Image from "next/image";
import { useState } from "react";
import { api, imageSource } from "@/lib/api";
import {
  fields,
  entityLabels,
  editorSections,
  fieldHelp,
  projectSlug,
} from "@/lib/admin";

export function Editor({
  entity,
  initial,
  onSaved,
  onCancel,
  onDirtyChange,
  onBusyChange,
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const sections = editorSections[entity] ?? [
    {
      title: "Informasi yang ditampilkan",
      keys: fields[entity].map((field) => field.key),
    },
  ];

  function updateField(key, value) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (
        entity === "projects" &&
        key === "title" &&
        !initial.id &&
        (!current.slug || current.slug === projectSlug(current.title))
      )
        next.slug = projectSlug(value);
      return next;
    });
    onDirtyChange(true);
  }

  async function save(event) {
    event.preventDefault();
    const missingImage = fields[entity].find(
      (field) => field.type === "image" && field.required && !draft[field.key],
    );
    if (missingImage) {
      setError(`Pilih ${missingImage.label.toLowerCase()} terlebih dahulu.`);
      document.getElementById(`field-${missingImage.key}`)?.focus();
      return;
    }
    setBusy(true);
    onBusyChange(true);
    setError("");
    const body = Object.fromEntries(
      fields[entity].map((field) => [
        field.key,
        field.type === "stack" && typeof draft[field.key] === "string"
          ? draft[field.key]
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
          : draft[field.key],
      ]),
    );
    try {
      await api(
        `/admin/${entity}${entity !== "profile" && initial.id ? `/${initial.id}` : ""}`,
        {
          method: entity === "profile" || initial.id ? "PUT" : "POST",
          body: JSON.stringify(body),
        },
      );
      onSaved("Perubahan berhasil disimpan.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Belum bisa menyimpan. Isian Anda tetap ada, silakan coba lagi.",
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }

  async function upload(event, key) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Pilih gambar JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.");
      return;
    }
    setUploading(true);
    onBusyChange(true);
    setError("");
    const data = new FormData();
    data.append("image", file);
    try {
      const result = await api("/admin/uploads", {
        method: "POST",
        body: data,
      });
      updateField(key, result.url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gambar belum terunggah. Coba pilih ulang.",
      );
    } finally {
      setUploading(false);
      onBusyChange(false);
    }
  }

  function renderField(field) {
    const id = `field-${field.key}`;
    const help = fieldHelp[field.key];
    const common = {
      id,
      required: field.required,
      maxLength: field.max,
      "aria-describedby": help ? `${id}-help` : undefined,
    };
    return (
      <div
        className={
          ["textarea", "image", "checkbox"].includes(field.type)
            ? "field wide"
            : "field"
        }
        key={field.key}
      >
        <label htmlFor={id}>
          {field.label}
          {field.required && (
            <span className="required-mark" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        {help && (
          <p id={`${id}-help`} className="field-help">
            {help}
          </p>
        )}
        {field.type === "textarea" ? (
          <textarea
            {...common}
            value={draft[field.key] ?? ""}
            rows={field.key === "content" ? 7 : 3}
            onChange={(event) => updateField(field.key, event.target.value)}
          />
        ) : field.type === "checkbox" ? (
          <div className="checkbox-control">
            <input
              {...common}
              type="checkbox"
              checked={Boolean(draft[field.key])}
              onChange={(event) => updateField(field.key, event.target.checked)}
            />
            <span>{draft[field.key] ? "Ya, aktif" : "Tidak aktif"}</span>
          </div>
        ) : field.type === "status" ? (
          <select
            {...common}
            value={draft[field.key]}
            onChange={(event) => updateField(field.key, event.target.value)}
          >
            <option value="draft">Simpan dulu (belum tampil)</option>
            <option value="published">Tampilkan di website</option>
          </select>
        ) : field.type === "image" ? (
          <div className="image-field">
            {draft[field.key] ? (
              <Image
                src={imageSource(draft[field.key])}
                alt="Pratinjau gambar yang dipilih"
                width={240}
                height={160}
                className="upload-preview"
                unoptimized
              />
            ) : (
              <p className="image-empty">Belum ada gambar yang dipilih.</p>
            )}
            <input
              id={id}
              type="file"
              aria-required={field.required || undefined}
              accept="image/jpeg,image/png,image/webp"
              aria-describedby={`${id}-help`}
              onChange={(event) => {
                void upload(event, field.key);
              }}
            />
            <p id={`${id}-help`} className="field-help">
              {uploading
                ? "Mengunggah gambar…"
                : "Pilih gambar dari perangkat. JPG, PNG, atau WebP, maksimal 5 MB."}
            </p>
            {draft[field.key] && !field.required && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  updateField(field.key, "");
                }}
              >
                Hapus gambar dari halaman
              </button>
            )}
          </div>
        ) : (
          <input
            {...common}
            type={
              field.type === "number"
                ? "number"
                : field.type === "url"
                  ? "url"
                  : "text"
            }
            min={field.type === "number" ? 0 : undefined}
            max={field.type === "number" ? 9999 : undefined}
            pattern={
              field.key === "slug" ? "[a-z0-9]+(-[a-z0-9]+)*" : undefined
            }
            value={
              Array.isArray(draft[field.key])
                ? draft[field.key].join(", ")
                : (draft[field.key] ?? "")
            }
            placeholder={field.type === "url" ? "https://…" : undefined}
            onChange={(event) =>
              updateField(
                field.key,
                field.type === "number"
                  ? Number(event.target.value)
                  : event.target.value,
              )
            }
          />
        )}
      </div>
    );
  }

  return (
    <form
      className="editor"
      onSubmit={save}
      onInvalid={(event) => {
        const details = event.target.closest("details");
        if (details) details.open = true;
      }}
    >
      <div className="editor-heading">
        <h2>
          {entity === "profile"
            ? "Ubah profil saya"
            : `${initial.id ? "Ubah" : "Tambah"} ${entityLabels[entity].toLowerCase()}`}
        </h2>
        <p>
          Isi bagian yang diperlukan, lalu pilih Simpan perubahan. Tanda *
          berarti wajib diisi.
        </p>
      </div>
      <fieldset disabled={busy || uploading} className="editor-content">
        {sections.map((section) => {
          const content = (
            <div className="editor-fields">
              {section.keys.map((key) =>
                renderField(fields[entity].find((field) => field.key === key)),
              )}
            </div>
          );
          return section.collapsible ? (
            <details className="editor-section" key={section.title}>
              <summary>
                {section.title}
                <span>Opsional, buka jika ingin mengubah</span>
              </summary>
              {content}
            </details>
          ) : (
            <section
              className="editor-section"
              key={section.title}
              aria-label={section.title}
            >
              <h3>{section.title}</h3>
              {content}
            </section>
          );
        })}
      </fieldset>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="editor-actions">
        <div>
          <button className="button" disabled={busy || uploading}>
            {uploading
              ? "Mengunggah…"
              : busy
                ? "Menyimpan…"
                : "Simpan perubahan"}
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={busy || uploading}
            onClick={() => {
              onCancel();
            }}
          >
            Batal
          </button>
        </div>
        <small>Simpan sebelum berpindah ke bagian lain.</small>
      </div>
    </form>
  );
}
