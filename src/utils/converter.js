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
 * 🔹 precision 값에 따라 format-type 자동 변경
 *   precision:0 → number
 *   precision:2 → amt
 *   precision:3 → qty
 */



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
 * 🔹 this.$.<변수명>.bind() → this.$.<변수명>.service()
 */
output = output.replace(
  /\bthis\.\$\.(\w+)\.bind\s*\(\s*\)\s*;?/g,
  "this.$.$1.service();"
);

/**
 * 🔹 this.$.<변수명1>.outputs = [new SCServiceOutput("변수명2", this.<변수명3>)];
 *     → this.$.<변수명1>.addOutput("변수명2", this.<변수명3>);
 */
output = output.replace(
  /\bthis\.\$\.(\w+)\.outputs\s*=\s*\[\s*new\s+SCServiceOutput\s*\(\s*(['"])([^'"]+)\2\s*,\s*(this\.\w+)\s*\)\s*\]\s*;?/g,
  "this.$.$1.addOutput(\"$3\", $4);"
);

/**
 * 🔹 this.$.<변수명1>.inputs = [new SCServiceInput("변수명2", this.<변수명3>)] ;
 *     → this.$.<변수명1>.addInput("변수명2", this.<변수명3>);
 */

output = output.replace(
  /\bthis\.\$\.(\w+)\.inputs\s*=\s*\[\s*new\s+SCServiceInput\s*\(\s*(['"])([^'"]+)\2\s*,\s*(this\.\w+)\s*\)\s*\]\s*;?/g,
  "this.$.$1.addInput(\"$3\", $4);"
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

/**
 * 🔹 SCSessionManager.getCurrentUser().user.<key> → this.session.<key>
 */
output = output.replace(
  /\bSCSessionManager\.getCurrentUser\(\)\.user\.(\w+)/g,
  "this.session.$1"
);


  return output;
}
