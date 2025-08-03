let currentLatitude = null;
let currentLongitude = null;

function showToast(msg, success = true) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = success ? "show success" : "show error";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function initLocation() {
  const lokasiText = document.getElementById("lokasi");
  const progress = document.getElementById("progressText");

  progress.style.display = "block";
  progress.textContent = "Mengambil lokasi...";

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentLatitude = pos.coords.latitude;
        currentLongitude = pos.coords.longitude;
        lokasiText.textContent = `Lokasi: ${currentLatitude.toFixed(6)}, ${currentLongitude.toFixed(6)}`;
        progress.textContent = "Lokasi terdeteksi."; // bisa juga disembunyikan kalau mau
        validateForm();
      },
      (err) => {
        lokasiText.textContent = "❌ Lokasi tidak bisa diakses.";
        progress.textContent = "Gagal ambil lokasi.";
        showToast("❌ Gagal ambil lokasi: " + err.message, false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    lokasiText.textContent = "❌ Geolocation tidak didukung.";
    progress.textContent = "Geolocation tidak tersedia.";
    showToast("❌ Geolocation tidak didukung.", false);
  }
}

function validateForm() {
  const form = document.getElementById("activityForm");
  const submitBtn = document.getElementById("submitBtn");

  if (
    form.checkValidity() &&
    currentLatitude !== null &&
    currentLongitude !== null
  ) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLocation(); // ambil lokasi segera saat halaman terbuka

  const form = document.getElementById("activityForm");
  const inputs = form.querySelectorAll("input, select");

  inputs.forEach((el) => {
    el.addEventListener("input", validateForm);
    el.addEventListener("change", () => {
      validateForm();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity() || currentLatitude === null || currentLongitude === null) return;
    submitData();
  });
});

function resetForm() {
  document.getElementById("activityForm").reset();
  document.getElementById("submitBtn").disabled = true;
  document.getElementById("lokasi").textContent = "";
  currentLatitude = null;
  currentLongitude = null;
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) progressBar.style.width = "0%";
  const progressText = document.getElementById("progressText");
  progressText.textContent = "Lokasi sedang diambil...";
  initLocation();
}

function submitData() {
  const btn = document.getElementById("submitBtn");
  const loader = document.getElementById("loaderSubmit");
  const text = document.getElementById("submitText");
  const progressText = document.getElementById("progressText");
  const progressBarWrapper = document.getElementById("uploadResult");

  // pastikan elemen progress bar ada
  let progressBar = document.querySelector(".progress-bar");
  if (!progressBar) {
    progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBarWrapper.innerHTML = "";
    progressBarWrapper.appendChild(progressBar);
  }

  btn.disabled = true;
  loader.style.display = "inline-block";
  text.textContent = "Mengirim...";
  progressText.style.display = "block";
  progressText.textContent = "Mengirim data...";
  progressBar.style.width = "0%";

  const params = new URLSearchParams();
  params.append("pekerja", document.getElementById("namaPekerja").value);
  params.append("pn", document.getElementById("pnPekerja").value);
  params.append("nasabah", document.getElementById("nasabah").value);
  params.append("telepon", document.getElementById("noTelepon").value);
  params.append("refferal", document.getElementById("refferal").value);
  params.append("informasi", document.getElementById("informasi").value);
  params.append("latitude", currentLatitude);
  params.append("longitude", currentLongitude);

  const url = "https://script.google.com/macros/s/AKfycbxQ-Ax5Mqgq5UohAX2r4dpdN4Caqa8s2qvcOxwfcGzhVW-MQY42G5m5SGQCm3fk8hqJXA/exec";

  // Gunakan XMLHttpRequest supaya bisa track progress
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Accept", "text/plain");

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `Mengirim... ${percent}%`;
    } else {
      // fallback animasi
      progressBar.style.width = "50%";
      progressText.textContent = "Mengirim...";
    }
  });

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      loader.style.display = "none";
      text.textContent = "Submit";
      if (xhr.status >= 200 && xhr.status < 300) {
        progressBar.style.width = "100%";
        progressText.textContent = "Sukses terkirim.";
        showToast("✅ " + xhr.responseText);
        setTimeout(() => {
          resetForm();
        }, 800);
      } else {
        progressText.textContent = "Gagal mengirim.";
        showToast("❌ Gagal simpan: " + xhr.statusText, false);
        btn.disabled = false;
      }
    }
  };

  xhr.onerror = () => {
    loader.style.display = "none";
    text.textContent = "Submit";
    progressText.textContent = "Gagal mengirim.";
    showToast("❌ Terjadi kesalahan jaringan.", false);
    btn.disabled = false;
  };

  xhr.send(params);
}
