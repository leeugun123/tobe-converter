/**
 * 추가 규칙 세트 for ESWarehousingResult 변환
 */
export function convertFile(inputHtml) {
  let output = inputHtml;

  /**
   * 3️⃣ SCSession → SCSessionManager
   */
  output = output.replace(
    /SCSession\.getInstance\s*\(\s*\)/g,
    "SCSessionManager.getCurrentUser()"
  );

  /**
   * 4️⃣ SCAlert.show → UT.alert
   */
  output = output.replace(/SCAlert\.show\s*\(/g, "UT.alert(");

  /**
   * 5️⃣ DateField.dateToString → UT.formatDate
   */
  output = output.replace(/DateField\.dateToString/g, "UT.formatDate");

  /**
   * 6️⃣ event.itemRenderer 처리
   */
  output = output
  .replace(
    /\bvar\s+([A-Za-z_$][\w$]*)\s*=\s*event\.itemRenderer\[\s*['"]dataField['"]\s*\]\s*;?/g,
    "var $1 = event.detail.item.dataField;"
  )
  .replace(
    /\bvar\s+([A-Za-z_$][\w$]*)\s*=\s*event\.itemRenderer\.data\s*;?/g,
    "var $1 = event.detail.data;"
  );


  /**
   * 7️⃣ translator 관련 제거
   */
  output = output
  // translator 블록 전체 제거 (콤마·주석·개행 포함)
  .replace(
    /^[ \t]*translator\s*:\s*\{[\s\S]*?\}[ \t]*(,)?[ \t]*(\/\/[^\n]*)?[\r\n]*/gim,
    ""
  )
  // this.translator.translate → this.translate
  .replace(/\bthis\s*\.\s*translator\s*\.\s*translate\s*\(/g, "this.translate(");

  /**
   * 8️⃣ Polymer var 제거
   */
  output = output.replace(
    /var\s+\w+\s*=\s*Polymer\(\s*\{([\s\S]*?)\}\s*\);/g,
    "Polymer({$1});"
  );

  /**
   * 🔟 불필요 behaviors 제거
   */
  output = output.replace(/,\s*behaviors\s*:\s*\[\s*\]/g, "");

  /**
   * 11️⃣ format-type="number1Format" → "number"
   */
  output = output.replace(/format-type\s*=\s*["']number1Format["']/g, 'format-type="number"');

  /**
   * 11️⃣ format-type="number2Format" → "number"
   */
  output = output.replace(/format-type\s*=\s*["']number2Format["']/g, 'format-type="number"');

  /**
   * 12️⃣ SCSession.user["..."] → session.prop
   */
  output = output.replace(/this\.session\.user\[['"](\w+)['"]\]/g, "this.session.$1");

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
   *  dispatchEvent(new CloseEvent(...)) → this.fire('close')
   */
  output = output.replace(
    /dispatchEvent\s*\(\s*new\s+CloseEvent\s*\([\s\S]*?\)\s*\)/g,
    "fire('close')"
  );

    // ✅ Application.application.mdi.mdiContent → UT.createWindow
  output = output.replace(
    /openView\s*:\s*function\s*\([^)]*\)\s*\{[\s\S]*?Application\.application\.mdi\.mdiContent\.createWindow\([^)]*\);\s*\}/g,
    `openView: function(title, url, menuCode) {
      UT.createWindow(menuCode, title, url);
    }`
  );

  return output;
}
