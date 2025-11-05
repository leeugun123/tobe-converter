<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-1">EMRO → TO-BE HTML 변환기</h1>

    <input type="file" @change="onFileUpload" accept=".html" />

    <div v-if="converted" class="mt-4">
      <button
        @click="download"
        class="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
        다운로드
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { convertFile } from "./utils/converter";

const converted = ref("");

function onFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const html = String(reader.result || ""); 
    converted.value = convertFile(html);
  };
  reader.readAsText(file);
}

function download() {
  const blob = new Blob([converted.value], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "converted.html";
  link.click();
}
</script>