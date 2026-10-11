import bcrypt from "bcryptjs";
import { db } from "../src/services/db.js";
import { config } from "../src/config.js";
await db.admin.upsert({
  where: { email: config.ADMIN_EMAIL.toLowerCase() },
  update: {},
  create: {
    email: config.ADMIN_EMAIL.toLowerCase(),
    passwordHash: await bcrypt.hash(config.ADMIN_PASSWORD, 12),
  },
});
const initialized = await db.profile.findUnique({ where: { id: 1 } });
if (!initialized) {
  await db.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Muh. Faudzan Irfan",
      role: "Frontend Developer",
      intro:
        "Saya membuat tampilan website yang rapi dan mudah digunakan, dari menu warung makan hingga katalog UMKM. Fokus saya pada responsive layout, interaksi yang jelas, dan detail antarmuka.",
      location: "Makassar, Indonesia · lokasi contoh",
      availability: "Open for collaboration",
      avatarUrl: "/samples/avatar.svg",
      avatarAlt: "Monogram FI untuk Muh. Faudzan Irfan",
      cvUrl: "",
      footerNote: "Selalu ada detail kecil yang bisa dibuat lebih baik.",
      projectHeading: "Selected Projects",
      skillHeading: "Frontend Skills",
      contactHeading: "Let’s discuss your project.",
      contactIntro:
        "Butuh landing page, katalog produk, atau perbaikan tampilan website? Ceritakan kebutuhan dan perkiraan waktunya. Kita bisa mulai dari sana.",
      testimonialHeading: "Feedback & Testimonials",
      navProjects: "Projects",
      navSkills: "Skills",
      navContact: "Contact",
      projectCta: "View Projects",
      contactCta: "Let’s Talk",
      cvLabel: "View Resume",
      copyright: "Muh. Faudzan Irfan",
      exampleMode: true,
    },
  });
  const projects = [
    {
      slug: "warung-harian",
      title: "Warung Harian",
      description:
        "Website menu warung makan dengan pilihan lauk, harga, jam buka, dan petunjuk lokasi. Konsep frontend yang dirancang agar mudah dibaca dari ponsel.",
      content:
        "Concept project untuk portofolio. Nama usaha, menu, dan harga adalah contoh, bukan pekerjaan klien.\n\nThe Challenge\nCalon pembeli ingin melihat menu dan kisaran harga sebelum datang. Informasi itu perlu mudah ditemukan tanpa membuka banyak halaman.\n\nThe Approach\nRancangan menempatkan menu nasi, lauk, dan minuman sebagai bagian utama. Kategori membantu pengunjung menemukan pilihan, sementara jam buka dan lokasi ditempatkan setelah daftar menu.\n\nFrontend Focus\nHTML semantik untuk struktur halaman, CSS Grid untuk daftar menu, dan JavaScript untuk filter kategori. Desain direncanakan tetap terbaca pada ponsel dengan tombol yang nyaman disentuh.\n\nProject Status\nStudi konsep antarmuka dengan data contoh. Belum ada aplikasi demo, sistem pemesanan, atau integrasi pembayaran.",
      imageUrl: "/samples/warung-harian.svg",
      imageAlt:
        "Ilustrasi konsep website Warung Harian dengan menu nasi ayam, soto ayam, dan es teh; seluruh harga adalah contoh",
      techStack: ["HTML", "CSS", "JavaScript"],
      featured: true,
      sortOrder: 0,
    },
    {
      slug: "kriya-lokal",
      title: "Kriya Lokal",
      description:
        "Katalog produk UMKM untuk tas anyaman dan aksesori kain. Konsep tampilan yang membantu pembeli melihat produk, bahan, dan harga sebelum menghubungi penjual.",
      content:
        "Concept project untuk portofolio. Nama usaha, produk, dan harga adalah contoh, bukan pekerjaan klien.\n\nThe Challenge\nProduk UMKM sering hanya ditampilkan lewat unggahan media sosial. Calon pembeli membutuhkan katalog yang lebih mudah ditelusuri untuk membandingkan bahan, ukuran, dan harga.\n\nThe Approach\nRancangan terdiri dari katalog dengan filter kategori dan halaman detail produk. Informasi bahan serta ukuran ditampilkan sebelum tombol untuk menghubungi penjual melalui WhatsApp.\n\nFrontend Focus\nReact untuk komponen kartu produk dan filter, Next.js untuk struktur halaman, serta CSS untuk layout responsif. Rancangan mencakup kondisi pencarian tanpa hasil dan deskripsi gambar untuk pembaca layar.\n\nProject Status\nStudi konsep frontend dengan data produk contoh. Belum ada demo, pengiriman pesan WhatsApp, checkout, atau transaksi pembayaran.",
      imageUrl: "/samples/kriya-lokal.svg",
      imageAlt:
        "Ilustrasi konsep katalog UMKM Kriya Lokal dengan tas anyaman dan dompet kain; seluruh produk dan harga adalah contoh",
      techStack: ["React", "Next.js", "JavaScript", "CSS"],
      featured: false,
      sortOrder: 1,
    },
  ];
  for (const item of projects)
    await db.project.upsert({
      where: { slug: item.slug },
      update: {},
      create: { ...item, demoUrl: "", repoUrl: "" },
    });
  const skills = [
    {
      id: "seed-html-css",
      name: "HTML & CSS",
      category: "Web Fundamentals",
      context:
        "Menyusun halaman dengan HTML semantik dan mengatur layout menggunakan Flexbox serta CSS Grid.",
      sortOrder: 0,
    },
    {
      id: "seed-javascript",
      name: "JavaScript",
      category: "Web Fundamentals",
      context:
        "Membuat interaksi seperti menu mobile, filter katalog, dan validasi form di browser.",
      sortOrder: 1,
    },
    {
      id: "seed-react",
      name: "React & Next.js",
      category: "UI Development",
      context:
        "Membangun komponen antarmuka, mengelola state, serta menampilkan loading dan error state saat mengambil data.",
      sortOrder: 2,
    },
    {
      id: "seed-responsive",
      name: "Responsive Design & Accessibility",
      category: "UI Development",
      context:
        "Menyesuaikan layout untuk ponsel hingga desktop, dengan navigasi keyboard, fokus yang terlihat, dan kontras yang cukup.",
      sortOrder: 3,
    },
  ];
  for (const item of skills)
    await db.skill.upsert({ where: { id: item.id }, update: {}, create: item });
  await db.testimonial.upsert({
    where: { id: "seed-draft" },
    update: {},
    create: {
      id: "seed-draft",
      name: "Contoh saja, ganti dengan pemberi izin",
      relation: "Draft panduan testimoni",
      quote:
        "Minta rekan menceritakan satu perubahan konkret setelah bekerja bersama. Ganti teks ini dengan kutipan asli dan izin publikasi.",
      photoUrl: "",
      status: "draft",
    },
  });
  await db.social.upsert({
    where: { id: "seed-social" },
    update: {},
    create: {
      id: "seed-social",
      label: "GitHub · sample link",
      url: "https://github.com",
      sortOrder: 0,
    },
  });
}
await db.$disconnect();
