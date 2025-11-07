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
 * 7️⃣ translator 관련 제거 (완전 삭제 + 잔여 `},` 줄 제거)
 */
output = output
  // translator 블록 전체 제거 (콤마/주석/개행 포함)
  .replace(
    /^[ \t]*translator\s*:\s*\{[\s\S]*?\}\s*,?\s*(?:\/\/[^\n]*)?[\r\n]+/gim,
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
   * 11️⃣ format-type="number0Format" → "number"
   */
  output = output.replace(/format-type\s*=\s*["']number0Format["']/g, 'format-type="number"');

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

/**
 * 8️⃣ export() → excelExport() 변환
 */
  output = output.replace(/\bexport\s*\(\s*\)/g, "excelExport()");

  /**
   * 9️⃣ !this.$.[아무이름].validate() → !this.validate()
   */
  output = output.replace(/!\s*this\.\$\.\s*[a-zA-Z_$][\w$]*\s*\.\s*validate\s*\(\s*\)/g, "!this.validate()");

  /**
   * 🔟 DateField.stringToDate → UT.toDate 변환
   */
  output = output.replace(/\bDateField\s*\.\s*stringToDate\b/g, "UT.toDate");


  /**
 * 🔟 getOldEditingValue / getNewEditingValue 변환
 */
  output = output
  // old value 변환
  .replace(
    /\bvar\s+oldVal\s*=\s*event\.currentTarget\.getOldEditingValue\s*\(\s*event\s*\)\s*;?/g,
    "var oldVal = event.detail.oldValue;"
  )
  // new value 변환
  .replace(
    /\bvar\s+newVal\s*=\s*event\.currentTarget\.getNewEditingValue\s*\(\s*event\s*\)\s*;?/g,
    "var newVal = event.detail.newValue;"
  );

  /**
 * 11️⃣ scrollToIndex → setTopIndex 변환
 */
output = output.replace(
  /\bscrollToIndex\s*\(\s*this\.\$\.\s*datagrid\.selectedIndex\s*\)/g,
  "setTopIndex(this.$.datagrid.selectedIndex)"
);

/**
 * 12️⃣ rpcService.disabledTargetsOnInvoking 설정 제거
 * ex) this.$.getListRPC.rpcService.disabledTargetsOnInvoking = [this];
 */
output = output.replace(
  /^[ \t]*this\.\$\.\w+\.rpcService\.disabledTargetsOnInvoking\s*=\s*\[this\];?\s*$/gm,
  ""
);





  return output;
}
