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
        showToast("❌ Gagal ambil lokasi: " + err.message, false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    lokasiText.textContent = "❌ Geolocation tidak didukung.";
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
  const form = document.getElementById("activityForm");
  const inputs = form.querySelectorAll("input, select");

  inputs.forEach((el) => {
    el.addEventListener("input", validateForm);
    el.addEventListener("change", (e) => {
      validateForm();
      if (el.id === "refferal") {
        initLocation();
      }
    });
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
  currentLatitude = null;
  currentLongitude = null;
}

function submitData() {
  const btn = document.getElementById("submitBtn");
  const loader = document.getElementById("loaderSubmit");
  const text = document.getElementById("submitText");

  btn.disabled = true;
  loader.style.display = "inline-block";
  text.textContent = "Mengirim...";

  const data = new URLSearchParams();
  data.append("pekerja", document.getElementById("namaPekerja").value);
  data.append("pn", document.getElementById("pnPekerja").value);
  data.append("nasabah", document.getElementById("nasabah").value);
  data.append("telepon", document.getElementById("noTelepon").value);
  data.append("refferal", document.getElementById("refferal").value);
  data.append("informasi", document.getElementById("informasi").value);
  data.append("latitude", currentLatitude);
  data.append("longitude", currentLongitude);

  fetch("https://script.google.com/macros/s/AKfycbxQ-Ax5Mqgq5UohAX2r4dpdN4Caqa8s2qvcOxwfcGzhVW-MQY42G5m5SGQCm3fk8hqJXA/exec" + data.toString())
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
