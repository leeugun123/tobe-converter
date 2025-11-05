// src/utils/converter.js

/**
 * EMRO HTML → 신버전 변환기 (규칙 기반)
 * 현재까지 학습한 컨버전 규칙들을 자동으로 적용
 */
export function convertFile(inputHtml) {
  let output = inputHtml;
  /**
   * alert 관련 통일
   * SCAlert.show → UT.alert
   *
   */
  output = output.replace(/SCAlert\.show\s*\(/g, "UT.alert(");

  /**
   *
   * DateField.dateToString → UT.formatDate
   */
  output = output.replace(/DateField\.dateToString/g, "UT.formatDate");

  /**
   * SCSession → SCSessionManager
   */
  output = output.replace(
    /SCSession\.getInstance\s*\(\s*\)/g,
    "SCSessionManager.getCurrentUser()"
  );
  /**
   *  Polymer 초기화 방식 변경
   * var ESOrdSel1 = Polymer({...}) → Polymer({...})
   */
  output = output.replace(/var\s+\w+\s*=\s*Polymer\s*\(/g, "Polymer(");

  /**
   *  그리드 관련 속성 정리
   * - show-number-line="false" 추가
   */
  if (!/show-number-line\s*=/.test(output)) {
    output = output.replace(
      /<sc-grid([^>]+)>/,
      `<sc-grid$1 show-number-line="false">`
    );
  }

  /**
   * 5️⃣ format-type="number1Format" → "number"
   */
  output = output.replace(
    /format-type\s*=\s*["']number1Format["']/g,
    'format-type="number"'
  );

  /**
   * translator 속성 삭제
   * translator: { type: Object, value: function() {...} }
   */
  output = output.replace(/translator\s*:\s*\{[\s\S]*?\},?/g, "");

  /** 🔹 translator → translate 단순화 규칙 추가 **/
  output = output.replace(
    /\bthis\.translator\.translate\s*\(/g,
    "this.translate("
  );

  /**
   *  dispatchEvent(new CloseEvent(...)) → this.fire('close')
   */
  output = output.replace(
    /dispatchEvent\s*\(\s*new\s+CloseEvent\s*\([\s\S]*?\)\s*\)/g,
    "fire('close')"
  );

  return output;
}
