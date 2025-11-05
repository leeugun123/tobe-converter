// src/utils/converter.js

/**
 * EMRO HTML → 신버전 변환기 (규칙 기반)
 * 현재까지 학습한 컨버전 규칙들을 자동으로 적용
 */

export function convertFile(inputHtml) {
  let output = inputHtml;
  /**
   * 5️⃣ alert / confirm / popup 관련 통일
   * SCAlert.show → UT.alert
   * SCPopupManager → UT.popup
   */
  output = output
    .replace(/SCAlert\.show\s*\(/g, "UT.alert(")
    .replace(/SCPopupManager\.getInstance\(\)\.addPopUp/g, "UT.popup");

  return output;
}
