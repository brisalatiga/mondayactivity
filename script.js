let currentLatitude = null;
let currentLongitude = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        currentLatitude = position.coords.latitude;
        currentLongitude = position.coords.longitude;
        document.getElementById("lokasi").innerText = `Lokasi: ${currentLatitude}, ${currentLongitude}`;
        validateForm();
      },
      function () {
        document.getElementById("lokasi").innerText = "❌ Gagal mendapatkan lokasi.";
      }
    );
  } else {
    document.getElementById("lokasi").innerText = "❌ Geolocation tidak didukung.";
  }
}

function validateForm() {
  const form = document.getElementById("activityForm");
  const isValid = form.checkValidity();
  const hasLocation = currentLatitude !== null && currentLongitude !== null;
  const submitBtn = document.getElementById("submitBtn");

  submitBtn.disabled = !(isValid && hasLocation);
}

function resetForm() {
  document.getElementById("activityForm").reset();
  document.getElementById("lokasi").innerText = "";
  document.getElementById("uploadResult").innerText = "";
  currentLatitude = null;
  currentLongitude = null;
  getLocation();
  validateForm();
}

document.addEventListener("DOMContentLoaded", function () {
  getLocation();
  validateForm();

  const inputs = document.querySelectorAll("#activityForm input, #activityForm select");
  inputs.forEach((input) => {
    input.addEventListener("input", validateForm);
    input.addEventListener("change", validateForm);
  });

  document.getElementById("activityForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const loader = document.getElementById("loaderSubmit");
    const submitText = document.getElementById("submitText");
    const uploadResult = document.getElementById("uploadResult");

    submitBtn.disabled = true;
    loader.style.display = "inline-block";
    submitText.textContent = "Mengirim...";
    uploadResult.innerText = "Mengirim data...";

    const formData = new FormData();
    formData.append("pekerja", document.getElementById("namaPekerja").value);
    formData.append("pn", document.getElementById("pnPekerja").value);
    formData.append("nasabah", document.getElementById("nasabah").value);
    formData.append("telepon", document.getElementById("noTelepon").value);
    formData.append("refferal", document.getElementById("refferal").value);
    formData.append("informasi", document.getElementById("informasi").value);
    formData.append("latitude", currentLatitude);
    formData.append("longitude", currentLongitude);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://script.google.com/macros/s/AKfycbxQ-Ax5Mqgq5UohAX2r4dpdN4Caqa8s2qvcOxwfcGzhVW-MQY42G5m5SGQCm3fk8hqJXA/exec", true);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        uploadResult.innerText = `Progress: ${percent}%`;
      }
    };

    xhr.onload = function () {
      loader.style.display = "none";
      submitText.textContent = "Submit";
      if (xhr.status === 200) {
        uploadResult.innerText = "✅ Data berhasil dikirim.";
        showToast("Data berhasil dikirim.");
        resetForm();
      } else {
        uploadResult.innerText = "❌ Gagal mengirim data.";
        showToast("Gagal mengirim data.");
        submitBtn.disabled = false;
      }
    };

    xhr.onerror = function () {
      loader.style.display = "none";
      submitText.textContent = "Submit";
      uploadResult.innerText = "❌ Terjadi kesalahan jaringan.";
      showToast("Terjadi kesalahan jaringan.");
      submitBtn.disabled = false;
    };

    xhr.send(formData);
  });
});
