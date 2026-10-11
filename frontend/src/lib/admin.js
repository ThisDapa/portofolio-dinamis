export const fields = {
  projects: [
    { key: "title", label: "Nama proyek", required: true, max: 150 },
    {
      key: "slug",
      label: "Alamat halaman proyek",
      required: true,
      max: 120,
    },
    {
      key: "description",
      label: "Ringkasan",
      type: "textarea",
      required: true,
      max: 500,
    },
    {
      key: "content",
      label: "Cerita proyek",
      type: "textarea",
      required: true,
      max: 20000,
    },
    { key: "imageUrl", label: "Gambar proyek", type: "image", required: true },
    {
      key: "imageAlt",
      label: "Deskripsi singkat gambar",
      required: true,
      max: 200,
    },
    {
      key: "techStack",
      label: "Teknologi yang digunakan",
      type: "stack",
      required: true,
    },
    { key: "demoUrl", label: "Link website proyek (opsional)", type: "url" },
    { key: "repoUrl", label: "Link kode proyek (opsional)", type: "url" },
    {
      key: "featured",
      label: "Tampilkan sebagai proyek pilihan",
      type: "checkbox",
    },
    { key: "sortOrder", label: "Urutan tampil", type: "number" },
  ],
  skills: [
    { key: "name", label: "Keahlian", required: true, max: 80 },
    { key: "category", label: "Kategori", required: true, max: 80 },
    {
      key: "context",
      label: "Bagaimana keahlian ini digunakan?",
      type: "textarea",
      required: true,
      max: 500,
    },
    { key: "sortOrder", label: "Urutan tampil", type: "number" },
  ],
  testimonials: [
    { key: "name", label: "Nama pemberi testimoni", required: true, max: 100 },
    { key: "relation", label: "Jabatan atau relasi", required: true, max: 150 },
    {
      key: "quote",
      label: "Isi testimoni",
      type: "textarea",
      required: true,
      max: 2000,
    },
    { key: "photoUrl", label: "Foto (opsional)", type: "image" },
    { key: "status", label: "Status publikasi", type: "status" },
  ],
  socials: [
    { key: "label", label: "Nama media sosial", required: true, max: 60 },
    { key: "url", label: "Link akun", type: "url", required: true },
    { key: "sortOrder", label: "Urutan tampil", type: "number" },
  ],
  profile: [
    { key: "name", label: "Nama", required: true, max: 100 },
    { key: "role", label: "Profesi", required: true, max: 150 },
    {
      key: "intro",
      label: "Perkenalan",
      type: "textarea",
      required: true,
      max: 1000,
    },
    { key: "location", label: "Lokasi", required: true, max: 150 },
    {
      key: "availability",
      label: "Status menerima pekerjaan",
      required: true,
      max: 150,
    },
    { key: "avatarUrl", label: "Foto profil", type: "image" },
    {
      key: "avatarAlt",
      label: "Deskripsi foto profil",
      required: true,
      max: 200,
    },
    { key: "cvUrl", label: "Link CV (PDF atau halaman online)", type: "url" },
    { key: "cvLabel", label: "Teks tombol CV", required: true, max: 60 },
    { key: "projectCta", label: "Teks tombol karya", required: true, max: 60 },
    { key: "contactCta", label: "Teks tombol kontak", required: true, max: 60 },
    { key: "navProjects", label: "Navigasi karya", required: true, max: 40 },
    { key: "navSkills", label: "Navigasi keahlian", required: true, max: 40 },
    { key: "navContact", label: "Navigasi kontak", required: true, max: 40 },
    {
      key: "projectHeading",
      label: "Judul bagian karya",
      required: true,
      max: 150,
    },
    {
      key: "skillHeading",
      label: "Judul bagian keahlian",
      required: true,
      max: 150,
    },
    {
      key: "testimonialHeading",
      label: "Judul bagian testimoni",
      required: true,
      max: 150,
    },
    {
      key: "contactHeading",
      label: "Judul bagian kontak",
      required: true,
      max: 150,
    },
    {
      key: "contactIntro",
      label: "Pengantar kontak",
      type: "textarea",
      required: true,
      max: 500,
    },
    {
      key: "footerNote",
      label: "Catatan di bagian bawah website",
      required: true,
      max: 300,
    },
    { key: "copyright", label: "Pemilik hak cipta", required: true, max: 150 },
    {
      key: "exampleMode",
      label: "Tampilkan penanda konten contoh",
      type: "checkbox",
    },
  ],
};
export const entityLabels = {
  projects: "Proyek",
  skills: "Keahlian",
  testimonials: "Testimoni",
  socials: "Media sosial",
  profile: "Profil saya",
};
export function emptyRecord(entity) {
  return Object.fromEntries(
    fields[entity].map((field) => [
      field.key,
      field.type === "checkbox"
        ? false
        : field.type === "number"
          ? 0
          : field.type === "status"
            ? "draft"
            : field.type === "stack"
              ? []
              : "",
    ]),
  );
}

export const editorSections = {
  projects: [
    {
      title: "Tentang proyek",
      keys: ["title", "description", "content", "techStack"],
    },
    {
      title: "Gambar & tautan",
      keys: ["imageUrl", "imageAlt", "demoUrl", "repoUrl", "featured"],
    },
    {
      title: "Pengaturan tambahan",
      keys: ["slug", "sortOrder"],
      collapsible: true,
    },
  ],
  profile: [
    {
      title: "Identitas & perkenalan",
      keys: ["name", "role", "intro", "location", "availability"],
    },
    {
      title: "Foto & CV",
      keys: ["avatarUrl", "avatarAlt", "cvUrl", "cvLabel"],
    },
    {
      title: "Teks di website",
      keys: [
        "projectCta",
        "contactCta",
        "navProjects",
        "navSkills",
        "navContact",
        "projectHeading",
        "skillHeading",
        "testimonialHeading",
        "contactHeading",
        "contactIntro",
        "footerNote",
        "copyright",
        "exampleMode",
      ],
      collapsible: true,
    },
  ],
};
export const fieldHelp = {
  slug: "Dibuat otomatis dari nama proyek baru. Mengubah alamat proyek lama dapat membuat link yang sudah dibagikan tidak berlaku.",
  sortOrder:
    "Angka kecil tampil lebih dulu. Biarkan 0 jika belum perlu diatur.",
  content:
    "Ceritakan tujuan, pekerjaan Anda, dan hasilnya. Pisahkan paragraf dengan baris kosong.",
  techStack: "Pisahkan dengan koma, misalnya: HTML, CSS, JavaScript.",
  imageAlt:
    "Jelaskan isi gambar, misalnya: Tampilan menu Warung Harian di ponsel.",
  avatarAlt:
    "Jelaskan foto atau monogram Anda untuk pengunjung yang memakai pembaca layar.",
  category:
    "Kelompokkan keahlian, misalnya Web Fundamentals atau UI Development.",
  cvUrl:
    "Tempel link CV yang bisa dibuka pengunjung tanpa perlu meminta izin akses.",
  status: "Pilih Tampilkan setelah mendapat izin dari pemberi testimoni.",
  exampleMode:
    "Matikan setelah deskripsi dan proyek contoh diganti dengan pengalaman Anda.",
};
export function projectSlug(title) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120)
    .replace(/-$/, "");
}
