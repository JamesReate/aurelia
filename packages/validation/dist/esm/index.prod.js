import{DI as e,Protocol as t,Metadata as s,toArray as r,ILogger as i,IServiceLocator as n,Registration as a,noop as o}from"@aurelia/kernel";import*as l from"@aurelia/runtime";import{Scope as u,IExpressionParser as c,PrimitiveLiteralExpression as h}from"@aurelia/runtime";const d=e.createInterface("IValidationExpressionHydrator");
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function p(e,t,s,r){var i,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,s):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,s,r);else for(var o=e.length-1;o>=0;o--)(i=e[o])&&(a=(n<3?i(a):n>3?i(t,s,a):i(t,s))||a);return n>3&&a&&Object.defineProperty(t,s,a),a}function m(e,t){return function(s,r){t(s,r,e)}}const g=e.createInterface("IValidationMessageProvider"),$=Object.freeze({aliasKey:t.annotation.keyFor("validation-rule-alias-message"),define:(e,t)=>($.setDefaultMessage(e,t),e),setDefaultMessage(e,{aliases:t},i=!0){const n=i?s.getOwn(this.aliasKey,e.prototype):void 0;if(void 0!==n){const e={...Object.fromEntries(n.map((({name:e,defaultMessage:t})=>[e,t]))),...Object.fromEntries(t.map((({name:e,defaultMessage:t})=>[e,t])))};t=r(Object.entries(e)).map((([e,t])=>({name:e,defaultMessage:t})))}s.define($.aliasKey,t,e instanceof Function?e.prototype:e)},getDefaultMessages(e){return s.get(this.aliasKey,e instanceof Function?e.prototype:e)}});function y(e){return function(t){return $.define(t,e)}}let x=class{constructor(e){this.messageKey=e,this.tag=void 0}canExecute(e){return!0}execute(e,t){throw new Error("No base implementation of execute. Did you forget to implement the execute method?")}accept(e){throw new Error("No base implementation of accept. Did you forget to implement the accept method?")}};x.$TYPE="",x=p([y({aliases:[{name:void 0,defaultMessage:"${$displayName} is invalid."}]})],x);let E=class extends x{constructor(){super("required")}execute(e){return null!=e&&!("string"==typeof e&&!/\S/.test(e))}accept(e){return e.visitRequiredRule(this)}};E.$TYPE="RequiredRule",E=p([y({aliases:[{name:"required",defaultMessage:"${$displayName} is required."}]})],E);let f=class extends x{constructor(e,t="matches"){super(t),this.pattern=e}execute(e){return null==e||0===e.length||this.pattern.test(e)}accept(e){return e.visitRegexRule(this)}};f.$TYPE="RegexRule",f=p([y({aliases:[{name:"matches",defaultMessage:"${$displayName} is not correctly formatted."},{name:"email",defaultMessage:"${$displayName} is not a valid email."}]})],f);let v=class extends x{constructor(e,t){super(t?"maxLength":"minLength"),this.length=e,this.isMax=t}execute(e){return null==e||0===e.length||(this.isMax?e.length<=this.length:e.length>=this.length)}accept(e){return e.visitLengthRule(this)}};v.$TYPE="LengthRule",v=p([y({aliases:[{name:"minLength",defaultMessage:"${$displayName} must be at least ${$rule.length} character${$rule.length === 1 ? '' : 's'}."},{name:"maxLength",defaultMessage:"${$displayName} cannot be longer than ${$rule.length} character${$rule.length === 1 ? '' : 's'}."}]})],v);let w=class extends x{constructor(e,t){super(t?"maxItems":"minItems"),this.count=e,this.isMax=t}execute(e){return null==e||(this.isMax?e.length<=this.count:e.length>=this.count)}accept(e){return e.visitSizeRule(this)}};w.$TYPE="SizeRule",w=p([y({aliases:[{name:"minItems",defaultMessage:"${$displayName} must contain at least ${$rule.count} item${$rule.count === 1 ? '' : 's'}."},{name:"maxItems",defaultMessage:"${$displayName} cannot contain more than ${$rule.count} item${$rule.count === 1 ? '' : 's'}."}]})],w);let R=class extends x{constructor(e,{min:t,max:s}){super(void 0!==t&&void 0!==s?e?"range":"between":void 0!==t?"min":"max"),this.isInclusive=e,this.min=Number.NEGATIVE_INFINITY,this.max=Number.POSITIVE_INFINITY,this.min=null!=t?t:this.min,this.max=null!=s?s:this.max}execute(e,t){return null==e||(this.isInclusive?e>=this.min&&e<=this.max:e>this.min&&e<this.max)}accept(e){return e.visitRangeRule(this)}};R.$TYPE="RangeRule",R=p([y({aliases:[{name:"min",defaultMessage:"${$displayName} must be at least ${$rule.min}."},{name:"max",defaultMessage:"${$displayName} must be at most ${$rule.max}."},{name:"range",defaultMessage:"${$displayName} must be between or equal to ${$rule.min} and ${$rule.max}."},{name:"between",defaultMessage:"${$displayName} must be between but not equal to ${$rule.min} and ${$rule.max}."}]})],R);let P=class extends x{constructor(e){super("equals"),this.expectedValue=e}execute(e){return null==e||""===e||e===this.expectedValue}accept(e){return e.visitEqualsRule(this)}};P.$TYPE="EqualsRule",P=p([y({aliases:[{name:"equals",defaultMessage:"${$displayName} must be ${$rule.expectedValue}."}]})],P);const T=e.createInterface("ICustomMessages");class b{constructor(e,t,s){this.expression=e,this.name=t,this.displayName=s}accept(e){return e.visitRuleProperty(this)}}b.$TYPE="RuleProperty";const M=Object.freeze({name:"validation-rules",defaultRuleSetName:"__default",set(e,r,i){const n=`${M.name}:${null!=i?i:M.defaultRuleSetName}`;s.define(t.annotation.keyFor(n),r,e);const a=s.getOwn(t.annotation.name,e);void 0===a?s.define(t.annotation.name,[n],e):a.push(n)},get(e,r){var i;const n=t.annotation.keyFor(M.name,null!=r?r:M.defaultRuleSetName);return null!==(i=s.get(n,e))&&void 0!==i?i:s.getOwn(n,e.constructor)},unset(e,r){const i=s.getOwn(t.annotation.name,e);for(const n of i.slice(0))if(n.startsWith(M.name)&&(void 0===r||n.endsWith(r))){s.delete(t.annotation.keyFor(n),e);const r=i.indexOf(n);r>-1&&i.splice(r,1)}},isValidationRulesSet(e){const r=s.getOwn(t.annotation.name,e);return void 0!==r&&r.some((e=>e.startsWith(M.name)))}});class N{constructor(e,t,s,r,i,n){this.messageProvider=e,this.$displayName=t,this.$propertyName=s,this.$value=r,this.$rule=i,this.$object=n}$getDisplayName(e,t){return this.messageProvider.getDisplayName(e,t)}}class I{constructor(e,t,s,r,i=[[]]){this.locator=e,this.validationRules=t,this.messageProvider=s,this.property=r,this.$rules=i}accept(e){return e.visitPropertyRule(this)}addRule(e){return this.getLeafRules().push(this.latestRule=e),this}getLeafRules(){return this.$rules[this.$rules.length-1]}async validate(e,t,s,r){void 0===s&&(s=0),void 0===r&&(r=u.create({[S]:e}));const i=this.property.expression;let n;n=void 0===i?e:i.evaluate(s,r,null,this.locator,null);let a=!0;const o=async r=>{const i=async t=>{let r=t.execute(n,e);r instanceof Promise&&(r=await r),a=a&&r;const{displayName:i,name:o}=this.property;let l;if(!r){const r=u.create(new N(this.messageProvider,this.messageProvider.getDisplayName(o,i),o,n,t,e));l=this.messageProvider.getMessage(t).evaluate(s,r,null,null,null)}return new C(r,l,o,e,t,this)},o=[];for(const s of r)!s.canExecute(e)||void 0!==t&&s.tag!==t||o.push(i(s));return Promise.all(o)};return this.$rules.reduce((async(e,t)=>e.then((async e=>a?(async(e,t)=>{const s=await o(t);return e.push(...s),e})(e,t):Promise.resolve(e)))),Promise.resolve([]))}then(){return this.$rules.push([]),this}withMessageKey(e){return this.assertLatestRule(this.latestRule),this.latestRule.messageKey=e,this}withMessage(e){const t=this.latestRule;return this.assertLatestRule(t),this.messageProvider.setMessage(t,e),this}when(e){return this.assertLatestRule(this.latestRule),this.latestRule.canExecute=e,this}tag(e){return this.assertLatestRule(this.latestRule),this.latestRule.tag=e,this}assertLatestRule(e){if(void 0===e)throw new Error("No rule has been added")}displayName(e){return this.property.displayName=e,this}satisfies(e){const t=new class extends x{constructor(){super(...arguments),this.execute=e}};return this.addRule(t)}satisfiesRule(e){return this.addRule(e)}required(){return this.addRule(new E)}matches(e){return this.addRule(new f(e))}email(){return this.addRule(new f(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,"email"))}minLength(e){return this.addRule(new v(e,!1))}maxLength(e){return this.addRule(new v(e,!0))}minItems(e){return this.addRule(new w(e,!1))}maxItems(e){return this.addRule(new w(e,!0))}min(e){return this.addRule(new R(!0,{min:e}))}max(e){return this.addRule(new R(!0,{max:e}))}range(e,t){return this.addRule(new R(!0,{min:e,max:t}))}between(e,t){return this.addRule(new R(!1,{min:e,max:t}))}equals(e){return this.addRule(new P(e))}ensure(e){return this.latestRule=void 0,this.validationRules.ensure(e)}ensureObject(){return this.latestRule=void 0,this.validationRules.ensureObject()}get rules(){return this.validationRules.rules}on(e,t){return this.validationRules.on(e,t)}}I.$TYPE="PropertyRule";class Y{constructor(e,t=M.defaultRuleSetName){this.ruleset=e,this.tag=t}}const A=e.createInterface("IValidationRules");let z=class{constructor(e,t,s,r){this.locator=e,this.parser=t,this.messageProvider=s,this.deserializer=r,this.rules=[],this.targets=new Set}ensure(e){const[t,s]=L(e,this.parser);let r=this.rules.find((e=>e.property.name==t));return void 0===r&&(r=new I(this.locator,this,this.messageProvider,new b(s,t)),this.rules.push(r)),r}ensureObject(){const e=new I(this.locator,this,this.messageProvider,new b);return this.rules.push(e),e}on(e,t){const s=M.get(e,t);return Object.is(s,this.rules)||(this.rules=null!=s?s:[],M.set(e,this.rules,t),this.targets.add(e)),this}off(e,t){const s=void 0!==e?[e]:Array.from(this.targets);for(const e of s)M.unset(e,t),M.isValidationRulesSet(e)||this.targets.delete(e)}applyModelBasedRules(e,t){const s=new Set;for(const r of t){const t=r.tag;s.has(t)&&console.warn(`A ruleset for tag ${t} is already defined which will be overwritten`);const i=this.deserializer.hydrateRuleset(r.ruleset,this);M.set(e,i,t),s.add(t)}}};z=p([m(0,n),m(1,c),m(2,g),m(3,d)],z);const j=/^function\s*\([$_\w\d]+\)\s*\{(?:\s*["']{1}use strict["']{1};)?(?:[$_\s\w\d\/\*.['"\]+;]+)?\s*return\s+[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)\s*;?\s*\}$/,O=/^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)$/,S="$root";function L(e,t){var s;switch(typeof e){case"string":break;case"function":{const t=e.toString(),r=null!==(s=O.exec(t))&&void 0!==s?s:j.exec(t);if(null===r)throw new Error(`Unable to parse accessor function:\n${t}`);e=r[1].substring(1);break}default:throw new Error(`Unable to parse accessor function:\n${e}`)}return[e,t.parse(`${S}.${e}`,53)]}class C{constructor(e,t,s,r,i,n,a=!1){this.valid=e,this.message=t,this.propertyName=s,this.object=r,this.rule=i,this.propertyRule=n,this.isManual=a,this.id=C.nextId++}toString(){return this.valid?"Valid.":this.message}}C.nextId=0;const K=new Set(["displayName","propertyName","value","object","config","getDisplayName"]);let B=class e{constructor(t,s,r){this.parser=t,this.registeredMessages=new WeakMap,this.logger=s.scopeTo(e.name);for(const{rule:e,aliases:t}of r)$.setDefaultMessage(e,{aliases:t})}getMessage(e){var t;const s=this.registeredMessages.get(e);if(void 0!==s)return s;const r=$.getDefaultMessages(e),i=e.messageKey;let n;return n=1===r.length&&void 0===i?r[0].defaultMessage:null===(t=r.find((e=>e.name===i)))||void 0===t?void 0:t.defaultMessage,n||(n=$.getDefaultMessages(x)[0].defaultMessage),this.setMessage(e,n)}setMessage(e,t){const s=this.parseMessage(t);return this.registeredMessages.set(e,s),s}parseMessage(e){const t=this.parser.parse(e,2048);if(24===(null==t?void 0:t.$kind)){for(const s of t.expressions){const t=s.name;if(K.has(t)&&this.logger.warn(`Did you mean to use "$${t}" instead of "${t}" in this validation message template: "${e}"?`),1793===s.$kind||s.ancestor>0)throw new Error("$parent is not permitted in validation message expressions.")}return t}return new h(e)}getDisplayName(e,t){if(null!=t)return t instanceof Function?t():t;if(void 0===e)return;const s=e.toString().split(/(?=[A-Z])/).join(" ");return s.charAt(0).toUpperCase()+s.slice(1)}};var V;B=p([m(0,c),m(1,i),m(2,T)],B),function(e){e.BindingBehaviorExpression="BindingBehaviorExpression",e.ValueConverterExpression="ValueConverterExpression",e.AssignExpression="AssignExpression",e.ConditionalExpression="ConditionalExpression",e.AccessThisExpression="AccessThisExpression",e.AccessScopeExpression="AccessScopeExpression",e.AccessMemberExpression="AccessMemberExpression",e.AccessKeyedExpression="AccessKeyedExpression",e.CallScopeExpression="CallScopeExpression",e.CallMemberExpression="CallMemberExpression",e.CallFunctionExpression="CallFunctionExpression",e.BinaryExpression="BinaryExpression",e.UnaryExpression="UnaryExpression",e.PrimitiveLiteralExpression="PrimitiveLiteralExpression",e.ArrayLiteralExpression="ArrayLiteralExpression",e.ObjectLiteralExpression="ObjectLiteralExpression",e.TemplateExpression="TemplateExpression",e.TaggedTemplateExpression="TaggedTemplateExpression",e.ArrayBindingPattern="ArrayBindingPattern",e.ObjectBindingPattern="ObjectBindingPattern",e.BindingIdentifier="BindingIdentifier",e.ForOfStatement="ForOfStatement",e.Interpolation="Interpolation"}(V||(V={}));class k{static deserialize(e){const t=new k,s=JSON.parse(e);return t.hydrate(s)}hydrate(e){switch(e.$TYPE){case V.AccessMemberExpression:{const t=e;return new l.AccessMemberExpression(this.hydrate(t.object),t.name)}case V.AccessKeyedExpression:{const t=e;return new l.AccessKeyedExpression(this.hydrate(t.object),this.hydrate(t.key))}case V.AccessThisExpression:return new l.AccessThisExpression(e.ancestor);case V.AccessScopeExpression:return new l.AccessScopeExpression(e.name,e.ancestor);case V.ArrayLiteralExpression:return new l.ArrayLiteralExpression(this.hydrate(e.elements));case V.ObjectLiteralExpression:{const t=e;return new l.ObjectLiteralExpression(this.hydrate(t.keys),this.hydrate(t.values))}case V.PrimitiveLiteralExpression:return new l.PrimitiveLiteralExpression(this.hydrate(e.value));case V.CallFunctionExpression:{const t=e;return new l.CallFunctionExpression(this.hydrate(t.func),this.hydrate(t.args))}case V.CallMemberExpression:{const t=e;return new l.CallMemberExpression(this.hydrate(t.object),t.name,this.hydrate(t.args))}case V.CallScopeExpression:{const t=e;return new l.CallScopeExpression(t.name,this.hydrate(t.args),t.ancestor)}case V.TemplateExpression:{const t=e;return new l.TemplateExpression(this.hydrate(t.cooked),this.hydrate(t.expressions))}case V.TaggedTemplateExpression:{const t=e;return new l.TaggedTemplateExpression(this.hydrate(t.cooked),this.hydrate(t.raw),this.hydrate(t.func),this.hydrate(t.expressions))}case V.UnaryExpression:return new l.UnaryExpression(e.operation,this.hydrate(e.expression));case V.BinaryExpression:{const t=e;return new l.BinaryExpression(t.operation,this.hydrate(t.left),this.hydrate(t.right))}case V.ConditionalExpression:{const t=e;return new l.ConditionalExpression(this.hydrate(t.condition),this.hydrate(t.yes),this.hydrate(t.no))}case V.AssignExpression:{const t=e;return new l.AssignExpression(this.hydrate(t.target),this.hydrate(t.value))}case V.ValueConverterExpression:{const t=e;return new l.ValueConverterExpression(this.hydrate(t.expression),t.name,this.hydrate(t.args))}case V.BindingBehaviorExpression:{const t=e;return new l.BindingBehaviorExpression(this.hydrate(t.expression),t.name,this.hydrate(t.args))}case V.ArrayBindingPattern:return new l.ArrayBindingPattern(this.hydrate(e.elements));case V.ObjectBindingPattern:{const t=e;return new l.ObjectBindingPattern(this.hydrate(t.keys),this.hydrate(t.values))}case V.BindingIdentifier:return new l.BindingIdentifier(e.name);case V.ForOfStatement:{const t=e;return new l.ForOfStatement(this.hydrate(t.declaration),this.hydrate(t.iterable))}case V.Interpolation:{const t=e;return new l.Interpolation(this.hydrate(t.cooked),this.hydrate(t.expressions))}default:if(Array.isArray(e))return"object"==typeof e[0]?this.deserializeExpressions(e):e.map(U);if("object"!=typeof e)return U(e);throw new Error(`unable to deserialize the expression: ${e}`)}}deserializeExpressions(e){const t=[];for(const s of e)t.push(this.hydrate(s));return t}}class F{static serialize(e){const t=new F;return null==e||"function"!=typeof e.accept?`${e}`:e.accept(t)}visitAccessMember(e){return`{"$TYPE":"${V.AccessMemberExpression}","name":"${e.name}","object":${e.object.accept(this)}}`}visitAccessKeyed(e){return`{"$TYPE":"${V.AccessKeyedExpression}","object":${e.object.accept(this)},"key":${e.key.accept(this)}}`}visitAccessThis(e){return`{"$TYPE":"${V.AccessThisExpression}","ancestor":${e.ancestor}}`}visitAccessScope(e){return`{"$TYPE":"${V.AccessScopeExpression}","name":"${e.name}","ancestor":${e.ancestor}}`}visitArrayLiteral(e){return`{"$TYPE":"${V.ArrayLiteralExpression}","elements":${this.serializeExpressions(e.elements)}}`}visitObjectLiteral(e){return`{"$TYPE":"${V.ObjectLiteralExpression}","keys":${D(e.keys)},"values":${this.serializeExpressions(e.values)}}`}visitPrimitiveLiteral(e){return`{"$TYPE":"${V.PrimitiveLiteralExpression}","value":${q(e.value)}}`}visitCallFunction(e){return`{"$TYPE":"${V.CallFunctionExpression}","func":${e.func.accept(this)},"args":${this.serializeExpressions(e.args)}}`}visitCallMember(e){return`{"$TYPE":"${V.CallMemberExpression}","name":"${e.name}","object":${e.object.accept(this)},"args":${this.serializeExpressions(e.args)}}`}visitCallScope(e){return`{"$TYPE":"${V.CallScopeExpression}","name":"${e.name}","ancestor":${e.ancestor},"args":${this.serializeExpressions(e.args)}}`}visitTemplate(e){return`{"$TYPE":"${V.TemplateExpression}","cooked":${D(e.cooked)},"expressions":${this.serializeExpressions(e.expressions)}}`}visitTaggedTemplate(e){return`{"$TYPE":"${V.TaggedTemplateExpression}","cooked":${D(e.cooked)},"raw":${D(e.cooked.raw)},"func":${e.func.accept(this)},"expressions":${this.serializeExpressions(e.expressions)}}`}visitUnary(e){return`{"$TYPE":"${V.UnaryExpression}","operation":"${e.operation}","expression":${e.expression.accept(this)}}`}visitBinary(e){return`{"$TYPE":"${V.BinaryExpression}","operation":"${e.operation}","left":${e.left.accept(this)},"right":${e.right.accept(this)}}`}visitConditional(e){return`{"$TYPE":"${V.ConditionalExpression}","condition":${e.condition.accept(this)},"yes":${e.yes.accept(this)},"no":${e.no.accept(this)}}`}visitAssign(e){return`{"$TYPE":"${V.AssignExpression}","target":${e.target.accept(this)},"value":${e.value.accept(this)}}`}visitValueConverter(e){return`{"$TYPE":"${V.ValueConverterExpression}","name":"${e.name}","expression":${e.expression.accept(this)},"args":${this.serializeExpressions(e.args)}}`}visitBindingBehavior(e){return`{"$TYPE":"${V.BindingBehaviorExpression}","name":"${e.name}","expression":${e.expression.accept(this)},"args":${this.serializeExpressions(e.args)}}`}visitArrayBindingPattern(e){return`{"$TYPE":"${V.ArrayBindingPattern}","elements":${this.serializeExpressions(e.elements)}}`}visitObjectBindingPattern(e){return`{"$TYPE":"${V.ObjectBindingPattern}","keys":${D(e.keys)},"values":${this.serializeExpressions(e.values)}}`}visitBindingIdentifier(e){return`{"$TYPE":"${V.BindingIdentifier}","name":"${e.name}"}`}visitHtmlLiteral(e){throw new Error("visitHtmlLiteral")}visitForOfStatement(e){return`{"$TYPE":"${V.ForOfStatement}","declaration":${e.declaration.accept(this)},"iterable":${e.iterable.accept(this)}}`}visitInterpolation(e){return`{"$TYPE":"${V.Interpolation}","cooked":${D(e.parts)},"expressions":${this.serializeExpressions(e.expressions)}}`}serializeExpressions(e){let t="[";for(let s=0,r=e.length;s<r;++s)0!==s&&(t+=","),t+=e[s].accept(this);return t+="]",t}}function D(e){let t="[";for(let s=0,r=e.length;s<r;++s)0!==s&&(t+=","),t+=q(e[s]);return t+="]",t}function q(e){return"string"==typeof e?`"\\"${function(e){let t="";for(let s=0,r=e.length;s<r;++s)t+=_(e.charAt(s));return t}(e)}\\""`:null==e?`"${e}"`:`${e}`}function _(e){switch(e){case"\b":return"\\b";case"\t":return"\\t";case"\n":return"\\n";case"\v":return"\\v";case"\f":return"\\f";case"\r":return"\\r";case'"':return'\\"';case"\\":return"\\\\";default:return e}}function U(e){if("string"==typeof e){if("null"===e)return null;if("undefined"===e)return;return e.substring(1,e.length-1)}return e}class Z{static serialize(e){if(null==e||"function"!=typeof e.accept)return`${e}`;const t=new Z;return e.accept(t)}visitRequiredRule(e){return`{"$TYPE":"${E.$TYPE}","messageKey":"${e.messageKey}","tag":${q(e.tag)}}`}visitRegexRule(e){const t=e.pattern;return`{"$TYPE":"${f.$TYPE}","messageKey":"${e.messageKey}","tag":${q(e.tag)},"pattern":{"source":${q(t.source)},"flags":"${t.flags}"}}`}visitLengthRule(e){return`{"$TYPE":"${v.$TYPE}","messageKey":"${e.messageKey}","tag":${q(e.tag)},"length":${q(e.length)},"isMax":${q(e.isMax)}}`}visitSizeRule(e){return`{"$TYPE":"${w.$TYPE}","messageKey":"${e.messageKey}","tag":${q(e.tag)},"count":${q(e.count)},"isMax":${q(e.isMax)}}`}visitRangeRule(e){return`{"$TYPE":"${R.$TYPE}","messageKey":"${e.messageKey}","tag":${q(e.tag)},"isInclusive":${e.isInclusive},"min":${this.serializeNumber(e.min)},"max":${this.serializeNumber(e.max)}}`}visitEqualsRule(e){const t=e.expectedValue;let s;return s="object"!=typeof t||null===t?q(t):JSON.stringify(t),`{"$TYPE":"${P.$TYPE}","messageKey":"${e.messageKey}","tag":${q(e.tag)},"expectedValue":${s}}`}visitRuleProperty(e){const t=e.displayName;if(void 0!==t&&"string"!=typeof t)throw new Error("Serializing a non-string displayName for rule property is not supported.");const s=e.expression;return`{"$TYPE":"${b.$TYPE}","name":${q(e.name)},"expression":${s?F.serialize(s):null},"displayName":${q(t)}}`}visitPropertyRule(e){return`{"$TYPE":"${I.$TYPE}","property":${e.property.accept(this)},"$rules":${this.serializeRules(e.$rules)}}`}serializeNumber(e){return e===Number.POSITIVE_INFINITY||e===Number.NEGATIVE_INFINITY?null:e.toString()}serializeRules(e){return`[${e.map((e=>`[${e.map((e=>e.accept(this))).join(",")}]`)).join(",")}]`}}let H=class e{constructor(e,t,s){this.locator=e,this.messageProvider=t,this.parser=s,this.astDeserializer=new k}static register(e){this.container=e}static deserialize(t,s){const r=this.container.get(g),i=this.container.get(c),n=new e(this.container,r,i),a=JSON.parse(t);return n.hydrate(a,s)}hydrate(e,t){var s,r;switch(e.$TYPE){case E.$TYPE:{const t=e,s=new E;return s.messageKey=t.messageKey,s.tag=this.astDeserializer.hydrate(t.tag),s}case f.$TYPE:{const t=e,s=t.pattern,r=this.astDeserializer,i=new f(new RegExp(r.hydrate(s.source),s.flags),t.messageKey);return i.tag=r.hydrate(t.tag),i}case v.$TYPE:{const t=e,s=new v(t.length,t.isMax);return s.messageKey=t.messageKey,s.tag=this.astDeserializer.hydrate(t.tag),s}case w.$TYPE:{const t=e,s=new w(t.count,t.isMax);return s.messageKey=t.messageKey,s.tag=this.astDeserializer.hydrate(t.tag),s}case R.$TYPE:{const t=e,i=new R(t.isInclusive,{min:null!==(s=t.min)&&void 0!==s?s:Number.NEGATIVE_INFINITY,max:null!==(r=t.max)&&void 0!==r?r:Number.POSITIVE_INFINITY});return i.messageKey=t.messageKey,i.tag=this.astDeserializer.hydrate(t.tag),i}case P.$TYPE:{const t=e,s=this.astDeserializer,r=new P("object"!=typeof t.expectedValue?s.hydrate(t.expectedValue):t.expectedValue);return r.messageKey=t.messageKey,r.tag=s.hydrate(t.tag),r}case b.$TYPE:{const t=e,s=this.astDeserializer;let r=t.name;r="undefined"===r?void 0:s.hydrate(r);let i=t.expression;null!=i?i=s.hydrate(i):void 0!==r?[,i]=L(r,this.parser):i=void 0;let n=t.displayName;return n="undefined"===n?void 0:s.hydrate(n),new b(i,r,n)}case I.$TYPE:{const s=e;return new I(this.locator,t,this.messageProvider,this.hydrate(s.property,t),s.$rules.map((e=>e.map((e=>this.hydrate(e,t))))))}}}hydrateRuleset(e,t){if(!Array.isArray(e))throw new Error("The ruleset has to be an array of serialized property rule objects");return e.map((e=>this.hydrate(e,t)))}};H=p([m(0,n),m(1,g),m(2,c)],H);let W=class{constructor(e,t,s){this.locator=e,this.messageProvider=t,this.parser=s,this.astDeserializer=new k}hydrate(e,t){throw new Error("Method not implemented.")}hydrateRuleset(e,t){const s=[],r=(e,i=[])=>{for(const[n,a]of e)if(this.isModelPropertyRule(a)){const e=a.rules.map((e=>Object.entries(e).map((([e,t])=>this.hydrateRule(e,t))))),r=i.join("."),o=this.hydrateRuleProperty({name:""!==r?`${r}.${n}`:n,displayName:a.displayName});s.push(new I(this.locator,t,this.messageProvider,o,e))}else r(Object.entries(a),[...i,n])};return r(Object.entries(e)),s}hydrateRule(e,t){switch(e){case"required":return this.hydrateRequiredRule(t);case"regex":return this.hydrateRegexRule(t);case"maxLength":return this.hydrateLengthRule({...t,isMax:!0});case"minLength":return this.hydrateLengthRule({...t,isMax:!1});case"maxItems":return this.hydrateSizeRule({...t,isMax:!0});case"minItems":return this.hydrateSizeRule({...t,isMax:!1});case"range":return this.hydrateRangeRule({...t,isInclusive:!0});case"between":return this.hydrateRangeRule({...t,isInclusive:!1});case"equals":return this.hydrateEqualsRule(t);default:throw new Error(`Unsupported rule ${e}`)}}setCommonRuleProperties(e,t){const s=e.messageKey;null!=s&&(t.messageKey=s),t.tag=e.tag;const r=e.when;if(r)if("string"==typeof r){const e=this.parser.parse(r,0);t.canExecute=t=>e.evaluate(0,u.create({$object:t}),null,this.locator,null)}else"function"==typeof r&&(t.canExecute=r)}isModelPropertyRule(e){return"object"==typeof e&&"rules"in e}hydrateRequiredRule(e){const t=new E;return this.setCommonRuleProperties(e,t),t}hydrateRegexRule(e){const t=e.pattern,s=new f(new RegExp(t.source,t.flags),e.messageKey);return s.tag=e.tag,s}hydrateLengthRule(e){const t=new v(e.length,e.isMax);return this.setCommonRuleProperties(e,t),t}hydrateSizeRule(e){const t=new w(e.count,e.isMax);return this.setCommonRuleProperties(e,t),t}hydrateRangeRule(e){const t=new R(e.isInclusive,{min:e.min,max:e.max});return this.setCommonRuleProperties(e,t),t}hydrateEqualsRule(e){const t=new P(e.expectedValue);return this.setCommonRuleProperties(e,t),t}hydrateRuleProperty(e){const t=e.name;if(!t||"string"!=typeof t)throw new Error("The property name needs to be a non-empty string");const[s,r]=L(t,this.parser);return new b(r,s,e.displayName)}};W=p([m(0,n),m(1,g),m(2,c)],W);class G{constructor(e,t,s,r,i,n=0){this.object=e,this.propertyName=t,this.rules=s,this.objectTag=r,this.propertyTag=i,this.flags=n}}const J=e.createInterface("IValidator");class Q{async validate(e){var t,s,r,i;const n=e.object,a=e.propertyName,o=e.propertyTag,l=e.flags,c=null!==(s=null!==(t=e.rules)&&void 0!==t?t:M.get(n,e.objectTag))&&void 0!==s?s:[],h=u.create({[S]:n});return void 0!==a?null!==(i=await(null===(r=c.find((e=>e.property.name===a)))||void 0===r?void 0:r.validate(n,o,l,h)))&&void 0!==i?i:[]:(await Promise.all(c.map((async e=>e.validate(n,o,l,h))))).flat()}}function X(){return{ValidatorType:Q,MessageProviderType:B,CustomMessages:[],HydratorType:W}}const ee=function e(t){return{optionsProvider:t,register(e){const s=X();return t(s),e.register(a.instance(T,s.CustomMessages),a.singleton(J,s.ValidatorType),a.singleton(g,s.MessageProviderType),a.singleton(d,s.HydratorType),a.transient(A,z),H),e},customize:s=>e(null!=s?s:t)}}(o);export{x as BaseValidationRule,k as Deserializer,P as EqualsRule,T as ICustomMessages,d as IValidationExpressionHydrator,g as IValidationMessageProvider,A as IValidationRules,J as IValidator,v as LengthRule,Y as ModelBasedRule,W as ModelValidationExpressionHydrator,I as PropertyRule,R as RangeRule,f as RegexRule,E as RequiredRule,b as RuleProperty,F as Serializer,w as SizeRule,Q as StandardValidator,G as ValidateInstruction,ee as ValidationConfiguration,H as ValidationDeserializer,B as ValidationMessageProvider,C as ValidationResult,$ as ValidationRuleAliasMessage,z as ValidationRules,Z as ValidationSerializer,U as deserializePrimitive,X as getDefaultValidationConfiguration,L as parsePropertyName,S as rootObjectSymbol,q as serializePrimitive,D as serializePrimitives,y as validationRule,M as validationRulesRegistrar};
