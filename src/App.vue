<template>
  <q-page class="q-pa-xl q-px-xl">
    <!-- 상단 제목 -->
    <div class="text-center q-mb-lg">
      <div class="text-h5 text-primary text-bold">
        🧩 AS-IS → TO-BE HTML 변환기
      </div>
      <div class="text-subtitle2 text-grey-7">
        왼쪽에 HTML을 붙여넣으면 자동 변환됩니다.
      </div>
    </div>

    <!-- 좌우 50:50 -->
    <div class="row q-col-gutter-xl q-px-md">
      <!-- 왼쪽: 입력 영역 -->
      <div class="col-6">
        <q-card flat bordered>
          <q-card-section class="bg-blue-1 text-primary text-bold">
            원본 HTML 입력
          </q-card-section>
          <q-separator />
          <q-card-section>
            <textarea
              ref="leftTextarea"
              v-model="inputHtml"
              @input="autoConvert"
              @scroll="syncScroll('left')"
              placeholder="여기에 변환할 HTML 코드를 붙여넣으세요..."
              class="textarea-box"
            ></textarea>
          </q-card-section>
        </q-card>
      </div>

      <!-- 오른쪽: 결과 영역 -->
      <div class="col-6">
        <q-card flat bordered>
          <q-card-section class="bg-green-1 text-green-9 text-bold">
            변환 결과
          </q-card-section>
          <q-separator />

          <q-card-section class="relative-position">
            <textarea
              ref="rightTextarea"
              v-model="converted"
              readonly
              @scroll="syncScroll('right')"
              placeholder="여기에 변환된 코드가 표시됩니다."
              class="textarea-box output"
            ></textarea>

            <button
              class="global-copy-btn"
              @click="copyToClipboard"
              :disabled="!converted"
            >
              <span class="copy-icon">📋</span> 복사
            </button>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { convertFile } from "@/utils/converter";

const $q = useQuasar();
const inputHtml = ref("");
const converted = ref("");
const leftTextarea = ref(null);
const rightTextarea = ref(null);
let isSyncing = false;

function autoConvert() {
  converted.value = inputHtml.value ? convertFile(inputHtml.value) : "";
}

function syncScroll(source) {
  if (isSyncing) return;
  isSyncing = true;

  const left = leftTextarea.value;
  const right = rightTextarea.value;

  if (source === "left" && right) {
    right.scrollTop = left.scrollTop;
    right.scrollLeft = left.scrollLeft;
  } else if (source === "right" && left) {
    left.scrollTop = right.scrollTop;
    left.scrollLeft = right.scrollLeft;
  }

  requestAnimationFrame(() => {
    isSyncing = false;
  });
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(converted.value);

    $q.notify({
      type: "positive",
      message: "변환된 코드가 클립보드에 복사되었습니다!",
      position: "top-right",
      timeout: 1500,
    });
  } catch (err) {
    // 🔥 fallback: execCommand 기반 복사 (legacy 방식)
    const textarea = document.createElement("textarea");
    textarea.value = converted.value;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");

      $q.notify({
        type: "positive",
        message: "복사 되었습니다.",
        position: "top-right",
        timeout: 1500,
      });
    } catch (fallbackError) {
      $q.notify({
        type: "negative",
        message: "복사에 실패했습니다.",
        position: "top-right",
      });
    }

    document.body.removeChild(textarea);
  }
}
</script>

<style scoped>
.textarea-box {
  width: 100%;
  height: 650px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: none;
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
  background-color: #fff;
  color: #333;
  box-sizing: border-box;
  white-space: pre;
  overflow: auto;
}

.textarea-box.output {
  background-color: #f9fafb;
}

.global-copy-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 16px 30px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 14px;
  z-index: 999999;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  /* 배경과 글씨 */
  background: linear-gradient(135deg, #2575fc, #2575fc);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
