/**
 * 추가 규칙 세트 for ESWarehousingResult 변환
 */
export function convertFile(inputHtml) {
  let output = inputHtml;

 /**
 * 12️⃣ SCSession.user["..."] → session.prop
 *    단, session 객체 선언이 없는 경우 SCSessionManager.getCurrentUser().prop 으로 대체
 */
if (/session\s*:\s*\{\s*type\s*:\s*Object\s*,\s*value\s*:\s*function\s*\(\)\s*\{\s*return\s+SCSession\.getInstance\s*\(\)\s*;?\s*\}\s*\}/.test(output)) {
  // ✅ session 정의 존재 → this.session 사용
  output = output.replace(
    /this\.session\.user\[['"](\w+)['"]\]/g,
    "this.session.$1"
  ); 
} else {
  // ❌ session 정의 없음 → SCSessionManager.getCurrentUser() 사용
  output = output.replace(
    /this\.session\.user\[['"](\w+)['"]\]/g,
    "SCSessionManager.getCurrentUser().$1"
  );
}

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

// 1) this.translator.translate(...)   -> this.translate(...)
output = output.replace(
  /\bthis\s*\.\s*translator\s*\.\s*translate\s*\(/g,
  "this.translate("
);

// 2) translator.translate(...)        -> this.translate(...)
output = output.replace(
  /\btranslator\s*\.\s*translate\s*\(/g,
  "this.translate("
);

// 3) SCAlert.show(...) -> UT.alert(...) (이미 하셨다면 중복 적용되지 않음)
output = output.replace(
  /\bSCAlert\.show\s*\(/g,
  "UT.alert("
);

// (선택적) 3) 동일한 문제를 세미콜론 없이 끝나는 표현에서도 정리
//     예: foo(this.translate("...")));  -> foo(this.translate("..."));
output = output.replace(
  /(this\.translate\([^)]*\))\)\s*(?=[\r\n]|$)/g,
  '$1'
);


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
   * 🔹 format-type 값에 따라 자동 변경
   *   number0Format → number
   *   number2Format → amt
   *   number3Format → qty
   */
/**
 * 🔹 format 문자열 단순 치환
 *   number0Format → number
 *   number2Format → amt
 *   number3Format → qty
 */
output = output
  .replace(/number0Format/g, "number")
  .replace(/number2Format/g, "amt")
  .replace(/number3Format/g, "qty");


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
  output = output.replace(
    /!\s*this\.\$\.\s*[a-zA-Z_$][\w$]*\s*\.\s*validate\s*\(\s*\)/g,
    "!this.validate()"
  );

  /**
   * 🔟 DateField.stringToDate → UT.toDate 변환
   */
  output = output.replace(/\bDateField\s*\.\s*stringToDate\b/g, "UT.toDate");

  /**
   * 🔟 getOldEditingValue / getNewEditingValue 변환
   */
  output = output
    // old value 변환 (변수명 무관)
    .replace(
      /event\.currentTarget\.getOldEditingValue\s*\(\s*event\s*\)/g,
      "event.detail.oldValue"
    )
    // new value 변환 (변수명 무관)
    .replace(
      /event\.currentTarget\.getNewEditingValue\s*\(\s*event\s*\)/g,
      "event.detail.newValue"
    );

  /**
   * 11️⃣ scrollToIndex → setTopIndex 변환
   */
  output = output.replace(
    /\bscrollToIndex\s*\(\s*this\.\$\.\s*datagrid\.selectedIndex\s*\)/g,
    "setTopIndex(this.$.datagrid.selectedIndex)"
  );
  /*
/**
 * 12️⃣ rpcService.disabledTargetsOnInvoking 설정 제거
 * ex) this.$.getListRPC.rpcService.disabledTargetsOnInvoking = [this];
 */
  output = output.replace(
    /^[ \t]*this\.\$\.\w+\.rpcService\.disabledTargetsOnInvoking\s*=\s*\[this\];?\s*$/gm,
    ""
  );

  /**
   * 🔹 this.$.<변수명>.clearParameter(); 제거
   */
  output = output.replace(
    /^[ \t]*this\.\$\.\w+\.clearParameter\s*\(\s*\)\s*;?\s*$/gm,
    ""
  );

  /**
   * 🔹 this.$.<변수명>.bind() / this.$.<변수명>.service()
   *     → UT.request(this.$.<변수명>);
   */
  output = output.replace(
    /\bthis\.\$\.(\w+)\s*\.\s*(?:bind|service)\s*\(\s*\)\s*;?/g,
    "UT.request(this.$.$1);"
  );

  /**
   * 🔹 UT.alert("문구") → UT.alert(this.translate("문구"))
   *   (단, 이미 translate로 감싸진 건 제외)
   */
  output = output.replace(
    /\bUT\.alert\s*\(\s*(?!this\.translate\()(['"`])([\s\S]*?)\1\s*\)/g,
    'UT.alert(this.translate("$2"))'
  );

  /**
   * 🔹 dataProviderFunc 내 filterItems → filter (화살표 함수)
   *    예: this._list.filterItems({ 'key': item.key })
   *        → this._list.filter(obj => obj.key === item.key)
   */
  output = output.replace(
    /\bthis\.(\w+)\.filterItems\s*\(\s*\{\s*['"](\w+)['"]\s*:\s*item\.(\w+)\s*\}\s*\)/g,
    "this.$1.filter(obj => obj.$2 === item.$3)"
  );


  // replace both literal "\n" (backslash + n) and actual newlines inside attribute values
 // "..." 또는 '...' 안에 있는 \n 만 치환
output = output.replace(
  /(["'])([^"']*?)\\n([^"']*?)\1/g,
  (match, quote, before, after) => `${quote}${before}&#13;${after}${quote}`
);

  return output;
}
