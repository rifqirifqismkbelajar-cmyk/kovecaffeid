"use strict";

/* =========================================
   DATA UTAMA
========================================= */

const USERNAME = "wiwit";
const PASSWORD = "1234567";

let keranjang = [];
let menuDibuka = null;

try {
  const dataTersimpan = JSON.parse(localStorage.getItem("keranjang") || "[]");
  keranjang = Array.isArray(dataTersimpan)
    ? dataTersimpan.filter(item =>
        item &&
        Number.isInteger(Number(item.id)) &&
        Number(item.jumlah) > 0 &&
        Number(item.harga) >= 0
      ).map(item => ({
        id: Number(item.id),
        jumlah: Math.floor(Number(item.jumlah)),
        harga: Number(item.harga),
        nama: item.nama || "",
        gambar: item.gambar || ""
      }))
    : [];
} catch {
  keranjang = [];
}

/* =========================================
   FUNGSI BANTU
========================================= */

function ambil(id) {
  return document.getElementById(id);
}

function cariKartu(id) {
  return document.querySelector(
    '.kartu[data-id="' + id + '"]'
  );
}

function rupiah(angka) {
  return "Rp" + Math.max(0, Number(angka) || 0)
    .toLocaleString("id-ID");
}

function sudahMasuk() {
  return localStorage.getItem("masuk") === "ya";
}

function simpanData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    alert("Penyimpanan penuh atau tidak tersedia. Silakan coba lagi.");
    return false;
  }
}

function dataMenu(item) {
  const kartu = cariKartu(item.id);

  return {
    nama: kartu?.dataset.nama || item.nama || "Menu tidak tersedia",
    harga: Number(kartu?.dataset.harga || item.harga || 0),
    gambar: kartu?.querySelector(".foto")?.getAttribute("src")
      || item.gambar
      || "logo.jpg"
  };
}

/* =========================================
   HEADER DAN PENCARIAN
========================================= */

ambil("input-cari").addEventListener("input", function () {
  if (location.hash !== "#/") {
    location.hash = "#/";
  }

  tampilkanKatalog();
});

ambil("form-cari").addEventListener("submit", function (e) {
  e.preventDefault();

  location.hash = "#/";
  tampilkanKatalog();
});

ambil("tombol-keluar").addEventListener("click", function () {
  localStorage.removeItem("masuk");
  location.hash = "#/login";
  aturHalaman();
});

/* =========================================
   KATALOG DAN FILTER KATEGORI
========================================= */

function tampilkanKatalog() {
  const pilihan = document.querySelector(
    'input[name="kategori"]:checked'
  );

  const kategori = pilihan ? pilihan.value : "semua";

  const kata = ambil("input-cari").value
    .trim()
    .toLowerCase();

  const kartu = document.querySelectorAll(
    "#grid-produk .kartu"
  );

  let ditemukan = 0;

  kartu.forEach(function (item) {
    const cocokKategori =
      kategori === "semua" ||
      item.dataset.kategori === kategori;

    const cocokCari = item.textContent
      .toLowerCase()
      .includes(kata);

    item.hidden = !(cocokKategori && cocokCari);

    if (!item.hidden) {
      ditemukan++;
    }
  });

  ambil("katalog-kosong").hidden = ditemukan > 0;
}

ambil("halaman-katalog").addEventListener(
  "change",
  tampilkanKatalog
);

/* =========================================
   LOGIN
========================================= */

ambil("form-login").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = ambil("isian-username")
    .value.trim().toLowerCase();

  const password = ambil("isian-password").value;

  const benar =
    username === USERNAME &&
    password === PASSWORD;

  ambil("login-salah").hidden = benar;

  if (benar) {
    localStorage.setItem("masuk", "ya");
    this.reset();
    location.hash = "#/";
  }
});

/* =========================================
   DETAIL MENU
========================================= */

function tampilkanDetail(id) {
  menuDibuka = cariKartu(id);

  ambil("detail-tidak-ada").hidden = Boolean(menuDibuka);
  ambil("isi-detail").hidden = !menuDibuka;

  if (!menuDibuka) {
    return;
  }

  const gambar = menuDibuka.querySelector(".foto");

  ambil("detail-gambar").src =
    gambar ? gambar.src : "logo.jpg";

  ambil("detail-gambar").alt =
    menuDibuka.dataset.nama;

  ambil("detail-nama").textContent =
    menuDibuka.dataset.nama;

  ambil("detail-deskripsi").textContent =
    menuDibuka.dataset.deskripsi || "";

  ambil("isian-jumlah").value = 1;

  hitungKasir();
}

function hitungKasir() {
  if (!menuDibuka) return;

  const kolom = ambil("isian-jumlah");

  const jumlah = Math.max(
    1,
    Math.min(999, Math.floor(Number(kolom.value) || 1))
  );

  kolom.value = jumlah;

  const harga = Number(menuDibuka.dataset.harga);

  ambil("tombol-kurang").disabled = jumlah <= 1;

  ambil("kasir-nama").textContent =
    menuDibuka.dataset.nama;

  ambil("kasir-harga").textContent = rupiah(harga);

  document.querySelectorAll(".total-teks").forEach(function (el) {
    el.textContent = rupiah(harga * jumlah);
  });
}

ambil("tombol-kurang").addEventListener("click", function () {
  const kolom = ambil("isian-jumlah");

  kolom.value = Math.max(1, Number(kolom.value) - 1);

  hitungKasir();
});

ambil("tombol-tambah").addEventListener("click", function () {
  const kolom = ambil("isian-jumlah");

  kolom.value = Math.min(999, Number(kolom.value) + 1);

  hitungKasir();
});

ambil("isian-jumlah").addEventListener("input", hitungKasir);
ambil("isian-jumlah").addEventListener("change", hitungKasir);

/* =========================================
   TAMBAH MENU KE KERANJANG
========================================= */

function masukKeranjang(tambah) {
  if (!menuDibuka) return;

  const id = Number(menuDibuka.dataset.id);

  const jumlah = Math.max(
    1,
    Math.min(999, Math.floor(Number(ambil("isian-jumlah").value) || 1))
  );

  const harga = Number(menuDibuka.dataset.harga);

  const nama = menuDibuka.dataset.nama;

  const gambar = menuDibuka.querySelector(".foto")?.getAttribute("src")
    || "logo.jpg";

  const item = keranjang.find(i => i.id === id);

  if (item) {
    item.jumlah = tambah
      ? Math.min(999, item.jumlah + jumlah)
      : jumlah;

    item.harga = harga;
    item.nama = nama;
    item.gambar = gambar;
  } else {
    keranjang.push({
      id,
      jumlah,
      harga,
      nama,
      gambar
    });
  }

  simpanKeranjang();

  return true;
}

ambil("tombol-keranjang").addEventListener("click", function () {
  if (masukKeranjang(true)) {
    alert("Menu berhasil ditambahkan ke keranjang!");
  }
});

ambil("tombol-pesan").addEventListener("click", function () {
  if (masukKeranjang(false)) {
    location.hash = "#/checkout";
  }
});

/* =========================================
   PERHITUNGAN KERANJANG
========================================= */

function jumlahBarang() {
  return keranjang.reduce(function (total, item) {
    return total + item.jumlah;
  }, 0);
}

function totalHarga() {
  return keranjang.reduce(function (total, item) {
    return total + item.harga * item.jumlah;
  }, 0);
}

function simpanKeranjang() {
  if (!simpanData("keranjang", keranjang)) {
    return false;
  }

  ambil("lencana-keranjang").textContent = jumlahBarang();

  return true;
}

/* =========================================
   TAMPILKAN BARIS PRODUK
========================================= */

function isiBaris(wadah, daftar, hanyaBaca = false) {
  wadah.replaceChildren();

  wadah.classList.toggle("daftar-ringkas", hanyaBaca);

  daftar.forEach(function (item) {
    const data = dataMenu(item);

    const baris = ambil("templat-baris")
      .content.cloneNode(true);

    const kartu = baris.querySelector(".baris-keranjang");

    kartu.dataset.id = item.id;

    const gambar = baris.querySelector(".foto");

    gambar.src = data.gambar;
    gambar.alt = data.nama;

    const tautan = baris.querySelector(".baris-info a");

    tautan.textContent = data.nama;
    tautan.href = "#/detail/" + item.id;

    baris.querySelector(".baris-info p").textContent =
      rupiah(data.harga);

    baris.querySelector(".jumlah").textContent =
      item.jumlah;

    baris.querySelector('[data-aksi="kurang"]').disabled =
      item.jumlah <= 1;

    baris.querySelector(".baris-subtotal").textContent =
      rupiah(data.harga * item.jumlah);

    if (hanyaBaca) {
      baris.querySelector(".pengatur-jumlah").remove();
      baris.querySelector('[data-aksi="hapus"]').remove();
    }

    wadah.append(baris);
  });
}

/* =========================================
   HALAMAN KERANJANG
========================================= */

function tampilkanKeranjang() {
  const kosong = keranjang.length === 0;

  ambil("keranjang-kosong").hidden = !kosong;
  ambil("keranjang-isi").hidden = kosong;

  isiBaris(
    ambil("daftar-keranjang"),
    keranjang
  );

  ambil("keranjang-jumlah").textContent =
    jumlahBarang();

  ambil("keranjang-subtotal").textContent =
    rupiah(totalHarga());
}

/* =========================================
   UBAH JUMLAH DAN HAPUS KERANJANG
========================================= */

ambil("daftar-keranjang").addEventListener("click", function (e) {
  const tombol = e.target.closest("button[data-aksi]");

  if (!tombol) return;

  const baris = tombol.closest("[data-id]");

  if (!baris) return;

  const id = Number(baris.dataset.id);

  const item = keranjang.find(i => i.id === id);

  if (!item) return;

  const aksi = tombol.dataset.aksi;

  if (aksi === "kurang") {
    item.jumlah = Math.max(1, item.jumlah - 1);
  }

  if (aksi === "tambah") {
    item.jumlah = Math.min(999, item.jumlah + 1);
  }

  if (aksi === "hapus") {
    keranjang = keranjang.filter(i => i.id !== id);
  }

  if (simpanKeranjang()) {
    tampilkanKeranjang();
  }
});

/* =========================================
   HALAMAN CHECKOUT
========================================= */

function tampilkanCheckout() {
  isiBaris(
    ambil("ringkasan-checkout"),
    keranjang,
    true
  );

  ambil("checkout-total").textContent =
    rupiah(totalHarga());
}

/* =========================================
   BUAT PESANAN
========================================= */

ambil("form-checkout").addEventListener("submit", function (e) {
  e.preventDefault();

  if (keranjang.length === 0) {
    alert("Keranjang masih kosong!");
    location.hash = "#/keranjang";
    return;
  }

  if (!this.reportValidity()) {
    return;
  }

  const nama = ambil("isian-nama").value.trim();
  const hp = ambil("isian-hp").value.trim();
  const alamat = ambil("isian-alamat").value.trim();
  const kota = ambil("isian-kota").value.trim();
  const pembayaran = ambil("isian-pembayaran").value;
  const catatan = ambil("isian-catatan").value.trim();

  if (!nama || !hp || !alamat || !kota || !pembayaran) {
    alert("Mohon lengkapi semua data pemesanan.");
    return;
  }

  // Salin data agar tidak ikut berubah saat keranjang dikosongkan.
  const barangPesanan = keranjang.map(function (item) {
    const data = dataMenu(item);

    return {
      id: item.id,
      nama: data.nama,
      harga: data.harga,
      jumlah: item.jumlah,
      gambar: data.gambar
    };
  });

  const pesanan = {
    nomor: "CC-" + Date.now(),
    tanggal: new Date().toLocaleString("id-ID"),
    nama: nama,
    hp: hp,
    alamat: alamat,
    kota: kota,
    pembayaran: pembayaran,
    catatan: catatan,
    barang: barangPesanan,
    total: barangPesanan.reduce(function (total, item) {
      return total + item.harga * item.jumlah;
    }, 0)
  };

  // Simpan pesanan terlebih dahulu.
  if (!simpanData("pesananTerakhir", pesanan)) {
    return;
  }

  // Kosongkan keranjang setelah pesanan berhasil disimpan.
  const keranjangLama = keranjang;
  keranjang = [];

  if (!simpanKeranjang()) {
    keranjang = keranjangLama;
    simpanData("pesananTerakhir", null);
    return;
  }

  this.reset();

  location.hash = "#/sukses";
});

/* =========================================
   HALAMAN PESANAN BERHASIL
========================================= */

function tampilkanSukses() {
  let pesanan = null;

  try {
    pesanan = JSON.parse(
      localStorage.getItem("pesananTerakhir") || "null"
    );
  } catch {
    pesanan = null;
  }

  const valid =
    pesanan &&
    Array.isArray(pesanan.barang) &&
    pesanan.barang.length > 0;

  ambil("isi-sukses").hidden = !valid;
  ambil("sukses-tidak-ada").hidden = valid;

  if (!valid) return;

  // Informasi pelanggan.
  const info = ambil("sukses-pemesan");

  info.replaceChildren();

  const informasi = [
    "Nomor Pesanan: " + (pesanan.nomor || "-"),
    "Tanggal: " + (pesanan.tanggal || "-"),
    "Nama: " + (pesanan.nama || "-"),
    "Nomor HP: " + (pesanan.hp || "-"),
    "Alamat: " + (pesanan.alamat || "-"),
    "Kecamatan / Kota: " + (pesanan.kota || "-"),
    "Pembayaran: " + (pesanan.pembayaran || "-"),
    "Catatan: " + (pesanan.catatan || "-")
  ];

  informasi.forEach(function (teks) {
    const baris = document.createElement("p");
    baris.textContent = teks;
    info.append(baris);
  });

  // Daftar produk yang dipesan.
  const daftar = pesanan.barang.map(function (item) {
    return {
      id: item.id,
      nama: item.nama,
      harga: item.harga,
      jumlah: item.jumlah,
      gambar: item.gambar
    };
  });

  isiBaris(
    ambil("sukses-daftar"),
    daftar,
    true
  );

  // Total pembayaran.
  const total = daftar.reduce(function (jumlah, item) {
    return jumlah + item.harga * item.jumlah;
  }, 0);

  ambil("sukses-total").textContent =
    rupiah(total);
}

/* =========================================
   PINDAH HALAMAN
========================================= */

const daftarHalaman = [
  "katalog",
  "login",
  "detail",
  "keranjang",
  "checkout",
  "sukses"
];

function aturHalaman() {
  const bagian = location.hash
    .replace(/^#\/?/, "")
    .split("/");

  let halaman = bagian[0] || "katalog";

  if (!daftarHalaman.includes(halaman)) {
    halaman = "katalog";
  }

  // Login tidak perlu ditampilkan jika sudah masuk.
  if (halaman === "login" && sudahMasuk()) {
    location.replace("#/");
    return;
  }

  // Checkout harus mempunyai barang.
  if (halaman === "checkout" && keranjang.length === 0) {
    location.replace("#/keranjang");
    return;
  }

  // Halaman selain katalog dan login wajib login.
  if (
    halaman !== "katalog" &&
    halaman !== "login" &&
    !sudahMasuk()
  ) {
    location.replace("#/login");
    return;
  }

  // Tampilkan hanya halaman yang sedang aktif.
  daftarHalaman.forEach(function (nama) {
    const elemen = ambil("halaman-" + nama);

    if (elemen) {
      elemen.hidden = nama !== halaman;
    }
  });

  // Status login.
  document.documentElement.classList.toggle(
    "sudah-masuk",
    sudahMasuk()
  );

  document.body.dataset.halaman = halaman;

  window.scrollTo(0, 0);

  // Jalankan fungsi halaman.
  switch (halaman) {
    case "katalog":
      tampilkanKatalog();
      break;

    case "login":
      ambil("login-salah").hidden = true;
      break;

    case "detail":
      tampilkanDetail(bagian[1]);
      break;

    case "keranjang":
      tampilkanKeranjang();
      break;

    case "checkout":
      tampilkanCheckout();
      break;

    case "sukses":
      tampilkanSukses();
      break;
  }
}

/* =========================================
   MULAI APLIKASI
========================================= */

window.addEventListener("hashchange", aturHalaman);

simpanKeranjang();
aturHalaman();
