/* eslint-disable no-param-reassign */
/* eslint-disable no-multi-str */
import ace from 'ace-builds';

(ace as any)['define'](
  'ace/theme/prom-query-editor',
  ['require', 'exports', 'module', 'ace/lib/dom'],
  (acequire: any, exports: any) => {
    exports.isDark = false;
    exports.cssClass = 'lp-code-bright';
    exports.cssText =
      '.lp-code-bright .ace_gutter {\
  background: #2f3129;\
  color: #8f908a\
  }\
  .lp-code-bright .ace_print-margin {\
  width: 1px;\
  background: #555651\
  }\
  .lp-code-bright {\
  background-color: #FFF;\
  color: #1C0732\
  }\
  .lp-code-bright .ace_cursor {\
  color: #1C0732\
  }\
  .lp-code-bright .ace_marker-layer .ace_selection {\
  background: rgba(31, 0, 230, 0.15)\
  }\
  .lp-code-bright.ace_multiselect .ace_selection.ace_start {\
  box-shadow: 0 0 3px 0px #272822;\
  }\
  .lp-code-bright .ace_marker-layer .ace_step {\
  background: rgb(102, 82, 0)\
  }\
  .lp-code-bright .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid rgba(31, 0, 230, 0.15)\
  }\
  .lp-code-bright .ace_marker-layer .ace_active-line {\
  background: #202020\
  }\
  .lp-code-bright .ace_gutter-active-line {\
  background-color: #272727\
  }\
  .lp-code-bright .ace_marker-layer .ace_selected-word {\
  border: 1px solid rgba(31, 0, 230, 0.15)\
  }\
  .lp-code-bright .ace_invisible {\
  color: #52524d\
  }\
  .lp-code-bright .ace_keyword{\
  color: #f92672\
  }\
  .lp-code-bright .ace_entity.ace_name.ace_tag,\
  .lp-code-bright .ace_meta.ace_tag,\
  .lp-code-bright .ace_storage {\
  color: #0070EE\
  }\
  .lp-code-bright .ace_punctuation,\
  .lp-code-bright .ace_punctuation.ace_tag {\
  color: #0070EE\
  }\
  .lp-code-bright .ace_constant.ace_character,\
  .lp-code-bright .ace_constant.ace_language,\
  .lp-code-bright .ace_constant.ace_numeric,\
  .lp-code-bright .ace_constant.ace_other {\
  color: #fe85fc\
  }\
  .lp-code-bright .ace_invalid {\
  color: #f8f8f0;\
  background-color: #f92672\
  }\
  .lp-code-bright .ace_invalid.ace_deprecated {\
  color: #f8f8f0;\
  background-color: #ae81ff\
  }\
  .lp-code-bright .ace_support.ace_constant,\
  .lp-code-bright .ace_support.ace_function {\
  color: 	#006400\
  }\
  .lp-code-bright .ace_fold {\
  background-color: #a6e22e;\
  border-color: #f8f8f2\
  }\
  .lp-code-bright .ace_storage.ace_type,\
  .lp-code-bright .ace_support.ace_class,\
  .lp-code-bright .ace_support.ace_type {\
  font-style: italic;\
  color: #74e680\
  }\
  .lp-code-bright .ace_entity.ace_name.ace_function,\
  .lp-code-bright .ace_entity.ace_other,\
  .lp-code-bright .ace_entity.ace_other.ace_attribute-name,\
  .lp-code-bright .ace_variable {\
  color: #0070EE\
  }\
  .lp-code-bright .ace_variable.ace_parameter {\
  font-style: italic;\
  color: #f0a842\
  }\
  .lp-code-bright .ace_string {\
  color: #5B44BA\
  }\
  .lp-code-bright .ace_paren {\
    color: #ED5C0C\
  }\
  .lp-code-bright .ace_operator {\
    color: #59e6e3\
  }\
  .lp-code-bright .ace_comment {\
  color: #75715e\
  }\
  .lp-code-bright .ace_indent-guide {\
  background: url(data:image/png;base64,ivborw0kggoaaaansuheugaaaaeaaaaccayaaaczgbynaaaaekleqvqimwpq0fd0zxbzd/wpaajvaoxesgneaaaaaelftksuqmcc) right repeat-y\
  }';

    const dom = acequire('ace/lib/dom');
    dom.importCssString(exports.cssText, exports.cssClass);
  }
);
