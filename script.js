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
        lokasiText.textContent = `Lokasi: ${currentLatitude}, ${currentLongitude}`;
        progress.style.display = "none";
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
  initLocation(); // ambil lokasi saat halaman dimuat
  const form = document.getElementById("activityForm");
  const inputs = form.querySelectorAll("input, select");

  inputs.forEach((el) => {
    el.addEventListener("input", validateForm);
    el.addEventListener("change", validateForm);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return;
    submitData();
  });
});

function resetForm() {
  document.getElementById("activityForm").reset();
  document.getElementById("submitBtn").disabled = true;
  document.getElementById("lokasi").textContent = "";
  document.getElementById("progressText").style.display = "none";
  document.getElementById("uploadResult").innerText = "";
  currentLatitude = null;
  currentLongitude = null;
  initLocation();
}

function submitData() {
  const btn = document.getElementById("submitBtn");
  const loader = document.getElementById("loaderSubmit");
  const text = document.getElementById("submitText");

  btn.disabled = true;
  loader.style.display = "inline-block";
  text.textContent = "Mengirim...";

  const formData = new FormData();
  formData.append("pekerja", document.getElementById("namaPekerja").value);
  formData.append("pn", document.getElementById("pnPekerja").value);
  formData.append("nasabah", document.getElementById("nasabah").value);
  formData.append("telepon", document.getElementById("noTelepon").value);
  formData.append("refferal", document.getElementById("refferal").value);
  formData.append("informasi", document.getElementById("informasi").value);
  formData.append("latitude", currentLatitude);
  formData.append("longitude", currentLongitude);

  fetch("https://script.google.com/macros/s/AKfycbxwE2xNZc1d5fzgAqNXVhJr0mTi7jjHMATjcHnNfK9RPzAGwQFtw_Hv9FUsAvW3UIiqtg/exec", {
    method: "POST",
    body: formData
  })
    .then(res => res.text())
    .then(msg => {
      showToast("✅ " + msg);
      resetForm();
    })
    .catch(err => showToast("❌ Gagal simpan: " + err, false))
    .finally(() => {
      text.textContent = "Submit";
      loader.style.display = "none";
    });
}

