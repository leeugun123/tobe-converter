/**
 * 추가 규칙 세트 for ESWarehousingResult 변환
 */
export function convertFile(inputHtml) {
  let output = inputHtml;

  output = output.replace(
    /SCAlert\.show\(\s*(?:this\.translator\.translate\(\s*["']([^"']+)["']\s*\)|["']([^"']+)["'])\s*,\s*["'][^"']+["']\s*,\s*true\s*,\s*Alert\.YES\s*\|\s*Alert\.CANCEL\s*,\s*null\s*,\s*this\.(\w+)\s*\)/g,
    `var me = this;
UT.confirm(this.translate("$1$2"), function(){
    me.$3();
})`
  );

  /**
   * 12️⃣ SCSession.user["..."] → session.prop
   *    단, session 객체 선언이 없는 경우 SCSessionManager.getCurrentUser().prop 으로 대체
   */
  if (
    /session\s*:\s*\{\s*type\s*:\s*Object\s*,\s*value\s*:\s*function\s*\(\)\s*\{\s*return\s+SCSession\.getInstance\s*\(\)\s*;?\s*\}\s*\}/.test(
      output
    )
  ) {
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
  output = output.replace(/\bSCAlert\.show\s*\(/g, "UT.alert(");

  // (선택적) 3) 동일한 문제를 세미콜론 없이 끝나는 표현에서도 정리
  //     예: foo(this.translate("...")));  -> foo(this.translate("..."));
  output = output.replace(/(this\.translate\([^)]*\))\)\s*(?=[\r\n]|$)/g, "$1");

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
   * 🔹 format 문자열 단순 치환
   *   number0Format → number
   *   number1Format → amt
   *   number2Format → qty
   *   number4Format → scoreDecimal
   */
  output = output
    .replace(/number0Format/g, "number")
    .replace(/number1Format/g, "amt")
    .replace(/number2Format/g, "qty")
    .replace(/number3Format/g, "metric")
    .replace(/number4Format/g, "scoreDecimal");

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

  output = output.replace(
    /this\.dispatchEvent\s*\(\s*new\s+SCEvent\s*\(\s*["']([^"']+)["'](?:\s*,\s*([^)]+?))?\s*\)\s*\)/g,
    (match, eventName, eventData) => {
      const toKebabCase = (str) =>
        str
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
          .replace(/[_\s]+/g, "-")
          .toLowerCase();

      const kebabEvent = toKebabCase(eventName.trim());

      if (eventData) {
        return `this.fire('${kebabEvent}', ${eventData.trim()})`;
      } else {
        return `this.fire('${kebabEvent}')`;
      }
    }
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
  // 🔹 this.$.변수.rpcService.disabledTargetsOnInvoking → 제거
output = output.replace(
  /this\.\$\.\w+\.rpcService\.disabledTargetsOnInvoking\s*;?/g,
  ""
);

 // 🔹 this.$.변수.clearParameter() → this.$.변수.clearInputs()
output = output.replace(
  /this\.\$\.(\w+)\.clearParameter\s*\(\s*\)/g,
  "this.$.$1.clearInputs()"
);

// 🔹 this.$.변수.addParameter("x", y) → this.$.변수.addInput("x", y)
output = output.replace(
  /this\.\$\.(\w+)\.addParameter\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/g,
  "this.$.$1.addInput($2, $3)"
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

  /**
   * 🔹 변수.clone() → UT.copy(변수)
   *    this.변수.clone() → UT.copy(this.변수)
   */
  output = output.replace(
    /\b(this\.\w+|\w+)\.clone\s*\(\s*\)/g,
    (match, p1) => `UT.copy(${p1})`
  );

  /**
   * 🔹 var 변수 = event.object.items; → var 변수 = event.detail;
   */
  output = output.replace(
    /\bvar\s+(\w+)\s*=\s*event\.object\.items\s*;?/g,
    "var $1 = event.detail;"
  );

  /**
   * 🔹 변수1.addItem(변수2) → 변수1.push(변수2)
   */
  output = output.replace(
    /\b(\w+)\.addItem\s*\(\s*([\w.]+)\s*\)\s*;?/g,
    "$1.push($2);"
  );

  // 🔹 if (event.detail == Alert.CANCEL) return;   →   (해당 라인 삭제)
  output = output.replace(
    /^\s*if\s*\(\s*event\.detail\s*==\s*Alert\.CANCEL\s*\)\s*return\s*;\s*$/gm,
    ""
  );

  // 🔹 변수1.filterItems({ 변수2: "변수3" })
  //    → 변수1.filter(obj => obj.변수2 == "변수3")

  output = output.replace(
    /(\w+)\.filterItems\s*\(\s*\{\s*(\w+)\s*:\s*["']([^"']+)["']\s*\}\s*\)/g,
    `$1.filter(obj => obj.$2 == "$3")`
  );

  // 🔹 {{isItemEditable}} → isItemEditable
  // 🔹 {{isItemStyle}} → isItemStyle
  output = output.replace(/\{\{\s*(isItemEditable|isItemStyle)\s*\}\}/g, "$1");

  // 🔹 this.$.변수1.selectedChild = this.$.변수2;
  //     → this.$.변수1.selectItem(this.$.변수2);
  output = output.replace(
    /this\.\$\.(\w+)\.selectedChild\s*=\s*this\.\$\.(\w+)/g,
    "this.$.$1.selectItem(this.$.$2)"
  );

  // 🔹 this.session.user.변수 → this.session.변수
  output = output.replace(/this\.session\.user\.(\w+)/g, "this.session.$1");

  // 🔹 SCSessionManager.getCurrentUser().user.변수 → SCSessionManager.getCurrentUser().변수
  output = output.replace(
    /SCSessionManager\.getCurrentUser\(\)\.user\./g,
    "SCSessionManager.getCurrentUser()."
  );

  // 🔹 변수.getItemAt(인덱스) → 변수[인덱스]
  output = output.replace(
    /(\b[\w$.]+)\.getItemAt\s*\(\s*([^)]+?)\s*\)/g,
    "$1[$2]"
  );

  // 🔹 ExternalInterface.call("getFile", "변수명") → attach.getFile("변수명")
output = output.replace(
  /ExternalInterface\.call\s*\(\s*["']getFile["']\s*,\s*([^)\s]+)\s*\)/g,
  "attach.getFile($1)"
);

// 🔹 Dom Module 선언부 3줄 통째로 삭제
output = output.replace(
  /\/\/=+\s*\n\s*\/\/\s*\[\[Dom Module 선언부\]\]\s*\n\s*\/\/=+\s*\n?/g,
  ""
);


  return output;
}
