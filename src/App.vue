<template>
  <q-page class="q-pa-xl bg-grey-2">
    <!-- 상단 제목 -->
    <div class="text-center q-mb-lg">
      <div class="text-h5 text-primary text-bold">
        🧩 EMRO → TO-BE HTML 변환기
      </div>
      <div class="text-subtitle2 text-grey-7">
        왼쪽에 HTML을 붙여넣으면 자동 변환됩니다.
      </div>
    </div>

    <!-- 좌우 50:50 -->
    <div class="row q-col-gutter-xl">
      <!-- 왼쪽: 입력 영역 -->
      <div class="col-6">
        <q-card flat bordered>
          <q-card-section class="bg-blue-1 text-primary text-bold">
            원본 HTML 입력
          </q-card-section>
          <q-separator />
          <q-card-section>
            <textarea
              v-model="inputHtml"
              @input="autoConvert"
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
          <q-card-section>
            <textarea
              v-model="converted"
              readonly
              placeholder="여기에 변환된 코드가 표시됩니다."
              class="textarea-box output"
            ></textarea>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { convertFile } from "@/utils/converter";

const inputHtml = ref("");
const converted = ref("");

function autoConvert() {
  converted.value = inputHtml.value ? convertFile(inputHtml.value) : "";
}
</script>

<style scoped>
.textarea-box {
  width: 100%;
  height: 500px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: none;
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 12px; /* 🔹 글자 크기 축소 */
  line-height: 1.3; /* 🔹 줄 간격 줄임 */
  background-color: #fff;
  color: #333;
  box-sizing: border-box;
  white-space: pre;
  overflow-x: auto;
}

.textarea-box.output {
  background-color: #f9fafb;
}

.q-page {
  min-height: 100vh;
}
</style>
