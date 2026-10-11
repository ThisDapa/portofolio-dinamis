"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { emptyRecord, entityLabels } from "@/lib/admin";
import { Editor } from "./Editor";
import { DeleteConfirmation } from "./DeleteConfirmation";
const tabDescriptions = {
  dashboard:
    "Pilih bagian yang ingin diperbarui. Semua perubahan bisa dilakukan dari sini.",
  projects: "Tambahkan proyek dan gambar untuk ditampilkan di portofolio.",
  skills: "Tulis keahlian dan jelaskan bagaimana Anda menggunakannya.",
  testimonials:
    "Simpan kutipan dari rekan kerja. Anda bisa memilih kapan menampilkannya.",
  profile: "Perbarui nama, perkenalan, foto, dan CV Anda.",
  socials: "Tambahkan link akun agar pengunjung mudah menghubungi Anda.",
  messages:
    "Baca pesan pengunjung. Klik alamat email untuk membalas lewat aplikasi email.",
};
export function Admin({ title }) {
  const [auth, setAuth] = useState("checking");
  const [tab, setTab] = useState("dashboard");
  const [rows, setRows] = useState([]);
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState(null);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [editorBusy, setEditorBusy] = useState(false);
  useEffect(
    function protectChanges() {
      if (!dirty) return;
      function warnBeforeLeaving(event) {
        event.preventDefault();
        event.returnValue = "";
      }
      window.addEventListener("beforeunload", warnBeforeLeaving);
      return function removeWarning() {
        window.removeEventListener("beforeunload", warnBeforeLeaving);
      };
    },
    [dirty],
  );
  function canLeave() {
    if (editorBusy) return false;
    return (
      !dirty ||
      window.confirm(
        "Perubahan belum disimpan. Tinggalkan halaman ini dan batalkan perubahan?",
      )
    );
  }
  useEffect(function checkSession() {
    let alive = true;
    api("/auth/me")
      .then(() => {
        if (alive) setAuth("signed-in");
      })
      .catch((error) => {
        if (alive) {
          setAuth("signed-out");
          if (!(error instanceof ApiError && error.status === 401))
            setError(
              "Layanan belum bisa dihubungi. Coba lagi beberapa saat lagi.",
            );
        }
      });
    return function cancelCheck() {
      alive = false;
    };
  }, []);
  useEffect(
    function refresh() {
      const controller = new AbortController();
      if (auth === "signed-in") {
        api(`/admin/${tab}`, {
          signal: controller.signal,
        })
          .then((result) => {
            if (controller.signal.aborted) return;
            if (tab === "dashboard") setCounts(result);
            else if (tab === "messages") setMessages(result);
            else if (tab === "profile") setEditing(result);
            else setRows(result);
          })
          .catch((error) => {
            if (controller.signal.aborted) return;
            if (error instanceof ApiError && error.status === 401)
              setAuth("signed-out");
            setError(
              error instanceof Error ? error.message : "Data gagal dimuat.",
            );
          })
          .finally(function finishLoad() {
            if (!controller.signal.aborted) setLoading(false);
          });
      }
      return function cancelLoad() {
        controller.abort();
      };
    },
    [auth, tab, revision],
  );
  function refreshData(message) {
    setDirty(false);
    setLoading(true);
    setError("");
    setEditing(null);
    setDeleteId(null);
    if (message) setNotice(message);
    setRevision((value) => value + 1);
  }
  function selectTab(next) {
    if (!canLeave()) return false;
    setTab(next);
    setNotice("");
    refreshData("");
    return true;
  }
  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/auth/login", { method: "POST", body: JSON.stringify(data) });
      setAuth("signed-in");
      refreshData("");
      setNotice("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    if (!canLeave()) return;
    setBusy(true);
    try {
      await api("/auth/logout", { method: "POST" });
      setAuth("signed-out");
      setDirty(false);
      setEditing(null);
      setRows([]);
      setMessages([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Logout gagal.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(id) {
    setBusy(true);
    setError("");
    try {
      await api(`/admin/${tab}/${id}`, { method: "DELETE" });
      setNotice("Data dihapus.");
      setDeleteId(null);
      refreshData("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal menghapus.");
    } finally {
      setBusy(false);
    }
  }
  async function markRead(message) {
    setBusy(true);
    try {
      await api(`/admin/messages/${message.id}`, {
        method: "PATCH",
        body: JSON.stringify({ read: !message.readAt }),
      });
      refreshData("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Gagal memperbarui pesan.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (auth === "checking")
    return (
      <main id="main" className="state-page" role="status">
        Memeriksa sesi…
      </main>
    );
  if (auth === "signed-out")
    return (
      <main id="main" className="login-page">
        <Link className="text-link" href="/">
          Kembali ke portofolio
        </Link>
        <p className="eyebrow">Ruang pengelola</p>
        <h1>{title}</h1>
        <p>Masuk untuk mengubah isi website dan membaca pesan.</p>
        <form onSubmit={signIn}>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
            />
          </label>
          <label>
            Kata sandi
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </label>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
      </main>
    );
  const tabs = [
    ["dashboard", "Beranda"],
    ["projects", "Proyek"],
    ["skills", "Keahlian"],
    ["testimonials", "Testimoni"],
    ["profile", "Profil saya"],
    ["socials", "Media sosial"],
    ["messages", "Pesan masuk"],
  ];
  const selectedForDeletion = (tab === "messages" ? messages : rows).find(
    (row) => row.id === deleteId,
  );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-brand">Kelola portofolio</p>
        <p>Perbarui isi website Anda.</p>
        <label className="admin-mobile-menu">
          Buka bagian
          <select
            value={tab}
            disabled={busy || editorBusy}
            onChange={(event) => {
              if (!selectTab(event.target.value)) event.target.value = tab;
            }}
          >
            {tabs.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Menu admin">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              disabled={busy || editorBusy}
              aria-current={tab === key ? "page" : undefined}
              onClick={() => {
                selectTab(key);
                setNotice("");
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-account-actions">
          <a href="/" target="_blank" rel="noopener noreferrer">
            Lihat website <span className="sr-only">(tab baru)</span>
          </a>
          <button
            className="text-button"
            disabled={busy || editorBusy}
            onClick={signOut}
          >
            Keluar
          </button>
        </div>
      </aside>
      <main id="main" className="admin-main">
        <header className="admin-title">
          <div>
            <h1>{tabs.find((item) => item[0] === tab)?.[1]}</h1>
            <p className="admin-description">{tabDescriptions[tab]}</p>
          </div>
          {!["dashboard", "messages", "profile"].includes(tab) && !editing && (
            <button
              className="button"
              disabled={loading || busy}
              onClick={() => {
                setDirty(false);
                setEditing(emptyRecord(tab));
                setNotice("");
              }}
            >
              Tambah {entityLabels[tab].toLowerCase()}
            </button>
          )}
        </header>
        <p role="status" className={notice ? "admin-notice" : ""}>
          {notice}
        </p>
        {error && (
          <div role="alert" className="error-message">
            {error}{" "}
            <button
              className="text-button"
              onClick={() => {
                refreshData("");
              }}
            >
              Coba lagi
            </button>
          </div>
        )}
        {loading ? (
          <p role="status">Memuat data…</p>
        ) : editing && tab !== "dashboard" && tab !== "messages" ? (
          <Editor
            key={`${tab}-${editing.id ?? "new"}-${revision}`}
            entity={tab}
            initial={editing}
            onDirtyChange={setDirty}
            onBusyChange={setEditorBusy}
            onCancel={function closeEditor() {
              if (!canLeave()) return;
              setDirty(false);
              setEditing(null);
            }}
            onSaved={(message) => {
              setNotice(message);
              setEditing(null);
              refreshData("");
            }}
          />
        ) : tab === "dashboard" && counts ? (
          <>
            <section
              className="admin-quick-start"
              aria-labelledby="quick-start-title"
            >
              <h2 id="quick-start-title">Apa yang ingin Anda perbarui?</h2>
              <div className="quick-actions">
                {[
                  [
                    "profile",
                    "Ubah profil saya",
                    "Nama, foto, perkenalan, dan CV",
                  ],
                  ["projects", "Kelola proyek", "Tambahkan karya dan gambar"],
                  [
                    "messages",
                    "Baca pesan masuk",
                    `${counts.unread} pesan belum dibaca`,
                  ],
                ].map(([key, label, description]) => (
                  <button
                    key={key}
                    onClick={() => {
                      selectTab(key);
                    }}
                  >
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </button>
                ))}
              </div>
            </section>
            <h2 className="admin-section-title">Isi portofolio saat ini</h2>
            <div className="dashboard-counts">
              {[
                ["Proyek", counts.projects],
                ["Keahlian", counts.skills],
                ["Testimoni", counts.testimonials],
                ["Pesan belum dibaca", counts.unread],
              ].map(([label, count]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
            <div className="admin-note">
              <h2>Sebelum dibagikan</h2>
              <p>
                Lengkapi profil, unggah gambar sendiri, tambahkan link CV, dan
                pastikan tautan proyek benar. Matikan penanda contoh di profil
                setelah seluruh konten diganti.
              </p>
              <p>
                Testimoni yang belum ditampilkan hanya terlihat di sini.
                Tampilkan setelah mendapat izin pemilik kutipan.
              </p>
              <button
                className="text-button"
                onClick={() => {
                  selectTab("messages");
                }}
              >
                Lihat semua pesan ({counts.messages})
              </button>
            </div>
          </>
        ) : tab === "messages" ? (
          <div className="inbox">
            {messages.length ? (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={message.readAt ? "message read" : "message"}
                >
                  <div className="admin-title">
                    <h2>{message.name}</h2>
                    <span>{message.readAt ? "Sudah dibaca" : "Baru"}</span>
                  </div>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                  <time dateTime={message.createdAt}>
                    {new Date(message.createdAt).toLocaleString("id-ID")}
                  </time>
                  <p className="message-body">{message.message}</p>
                  <div className="actions">
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => {
                        void markRead(message);
                      }}
                    >
                      {message.readAt
                        ? "Tandai belum dibaca"
                        : "Tandai sudah dibaca"}
                    </button>
                    <button
                      className="text-button danger"
                      disabled={busy}
                      onClick={() => {
                        setError("");
                        setDeleteId(message.id);
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty">Belum ada pesan masuk.</p>
            )}
          </div>
        ) : tab === "profile" ? (
          <button
            className="button"
            onClick={() => {
              refreshData("");
            }}
          >
            Buka editor profil
          </button>
        ) : (
          <div className="admin-list">
            {rows.length ? (
              rows.map((row) => (
                <article className="admin-row" key={String(row.id)}>
                  <div>
                    <h2>{String(row.title ?? row.name ?? row.label)}</h2>
                    <p>
                      {String(
                        row.category ??
                          (row.status
                            ? row.status === "published"
                              ? "Tampil di website"
                              : "Belum ditampilkan"
                            : (row.description ?? row.url ?? "")),
                      )}
                    </p>
                  </div>
                  <div className="actions">
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setDirty(false);
                        setEditing(row);
                      }}
                    >
                      Ubah
                      <span className="sr-only">
                        {" "}
                        {String(row.title ?? row.name ?? row.label)}
                      </span>
                    </button>
                    <button
                      className="text-button danger"
                      onClick={() => {
                        setError("");
                        setDeleteId(String(row.id));
                      }}
                    >
                      Hapus
                      <span className="sr-only">
                        {" "}
                        {String(row.title ?? row.name ?? row.label)}
                      </span>
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty">
                Belum ada data. Gunakan tombol tambah untuk memulai.
              </p>
            )}
          </div>
        )}
        {deleteId && (
          <DeleteConfirmation
            busy={busy}
            name={
              selectedForDeletion?.title ??
              selectedForDeletion?.name ??
              selectedForDeletion?.label ??
              "data ini"
            }
            error={error}
            onConfirm={function confirmDelete() {
              void remove(deleteId);
            }}
            onCancel={function cancelDelete() {
              setDeleteId(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
