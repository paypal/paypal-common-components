module.exports = function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = !0;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            enumerable: !0,
            get: getter
        });
    };
    __webpack_require__.r = function(exports) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
            value: "Module"
        });
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
    };
    __webpack_require__.t = function(value, mode) {
        1 & mode && (value = __webpack_require__(value));
        if (8 & mode) return value;
        if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, "default", {
            enumerable: !0,
            value: value
        });
        if (2 & mode && "string" != typeof value) for (var key in value) __webpack_require__.d(ns, key, function(key) {
            return value[key];
        }.bind(null, key));
        return ns;
    };
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module.default;
        } : function() {
            return module;
        };
        __webpack_require__.d(getter, "a", getter);
        return getter;
    };
    __webpack_require__.o = function(object, property) {
        return {}.hasOwnProperty.call(object, property);
    };
    __webpack_require__.p = "";
    return __webpack_require__(__webpack_require__.s = 0);
}([ function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, "Spinner", (function() {
        return Spinner;
    }));
    __webpack_require__.d(__webpack_exports__, "SpinnerPage", (function() {
        return SpinnerPage;
    }));
    __webpack_require__.d(__webpack_exports__, "VenmoSpinner", (function() {
        return VenmoSpinner;
    }));
    __webpack_require__.d(__webpack_exports__, "VenmoSpinnerPage", (function() {
        return VenmoSpinnerPage;
    }));
    function _renderChildren(children, renderer) {
        var result = [];
        for (var _i2 = 0; _i2 < children.length; _i2++) {
            var renderedChild = children[_i2].render(renderer);
            if (renderedChild) if (Array.isArray(renderedChild)) for (var _i4 = 0; _i4 < renderedChild.length; _i4++) {
                var subchild = renderedChild[_i4];
                subchild && result.push(subchild);
            } else result.push(renderedChild);
        }
        return result;
    }
    var node_ElementNode = function() {
        function ElementNode(name, props, children) {
            this.type = "element";
            this.name = void 0;
            this.props = void 0;
            this.children = void 0;
            this.onRender = void 0;
            this.name = name;
            this.props = props || {};
            this.children = children;
            var onRender = this.props.onRender;
            if ("function" == typeof onRender) {
                this.onRender = onRender;
                delete props.onRender;
            }
        }
        var _proto = ElementNode.prototype;
        _proto.render = function(renderer) {
            var el = renderer(this);
            this.onRender && this.onRender(el);
            return el;
        };
        _proto.renderChildren = function(renderer) {
            return _renderChildren(this.children, renderer);
        };
        return ElementNode;
    }();
    var node_FragmentNode = function() {
        function FragmentNode(children) {
            this.type = "fragment";
            this.children = void 0;
            this.children = children;
        }
        FragmentNode.prototype.render = function(renderer) {
            return _renderChildren(this.children, renderer);
        };
        return FragmentNode;
    }();
    var node_TextNode = function() {
        function TextNode(text) {
            this.type = "text";
            this.text = void 0;
            this.text = text;
        }
        TextNode.prototype.render = function(renderer) {
            return renderer(this);
        };
        return TextNode;
    }();
    var node_ComponentNode = function() {
        function ComponentNode(component, props, children) {
            this.type = "component";
            this.component = void 0;
            this.props = void 0;
            this.children = void 0;
            this.component = component;
            this.props = props || {};
            this.children = children;
            this.props.children = children;
        }
        var _proto4 = ComponentNode.prototype;
        _proto4.renderComponent = function(renderer) {
            var child = function(child) {
                var children = normalizeChildren(Array.isArray(child) ? child : [ child ]);
                return 1 === children.length ? children[0] : children.length > 1 ? new node_FragmentNode(children) : void 0;
            }(this.component(this.props, this.children));
            if (child) return child.render(renderer);
        };
        _proto4.render = function(renderer) {
            return renderer(this);
        };
        _proto4.renderChildren = function(renderer) {
            return _renderChildren(this.children, renderer);
        };
        return ComponentNode;
    }();
    function normalizeChildren(children) {
        var result = [];
        for (var _i6 = 0; _i6 < children.length; _i6++) {
            var child = children[_i6];
            if (child) if ("string" == typeof child || "number" == typeof child) result.push(new node_TextNode(child.toString())); else {
                if ("boolean" == typeof child) continue;
                if (Array.isArray(child)) for (var _i8 = 0, _normalizeChildren2 = normalizeChildren(child); _i8 < _normalizeChildren2.length; _i8++) result.push(_normalizeChildren2[_i8]); else {
                    if (!child || "element" !== child.type && "text" !== child.type && "component" !== child.type) throw new TypeError("Unrecognized node type: " + typeof child);
                    result.push(child);
                }
            }
        }
        return result;
    }
    var node_node = function(element, props) {
        for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) children[_key - 2] = arguments[_key];
        children = normalizeChildren(children);
        if ("string" == typeof element) return new node_ElementNode(element, props, children);
        if ("function" == typeof element) return new node_ComponentNode(element, props, children);
        throw new TypeError("Expected jsx element to be a string or a function");
    };
    var Fragment = function(props, children) {
        return children;
    };
    var _ELEMENT_DEFAULT_XML_, _ATTRIBUTE_DEFAULT_XM, _ADD_CHILDREN;
    var ELEMENT_DEFAULT_XML_NAMESPACE = ((_ELEMENT_DEFAULT_XML_ = {}).svg = "http://www.w3.org/2000/svg", 
    _ELEMENT_DEFAULT_XML_);
    var ATTRIBUTE_DEFAULT_XML_NAMESPACE = ((_ATTRIBUTE_DEFAULT_XM = {})["xlink:href"] = "http://www.w3.org/1999/xlink", 
    _ATTRIBUTE_DEFAULT_XM);
    function createTextElement(doc, node) {
        return doc.createTextNode(node.text);
    }
    function addProps(el, node) {
        var props = node.props;
        for (var _i4 = 0, _Object$keys2 = Object.keys(props); _i4 < _Object$keys2.length; _i4++) {
            var prop = _Object$keys2[_i4];
            var val = props[prop];
            if (null != val && "el" !== prop && "innerHTML" !== prop) if (prop.match(/^on[A-Z][a-z]/) && "function" == typeof val) el.addEventListener(prop.slice(2).toLowerCase(), val); else if ("string" == typeof val || "number" == typeof val) {
                var xmlNamespace = ATTRIBUTE_DEFAULT_XML_NAMESPACE[prop];
                xmlNamespace ? el.setAttributeNS(xmlNamespace, prop, val.toString()) : el.setAttribute(prop, val.toString());
            } else "boolean" == typeof val && !0 === val && el.setAttribute(prop, "");
        }
        "iframe" !== el.tagName.toLowerCase() || props.id || el.setAttribute("id", "jsx-iframe-" + "xxxxxxxxxx".replace(/./g, (function() {
            return "0123456789abcdef".charAt(Math.floor(Math.random() * "0123456789abcdef".length));
        })));
    }
    var ADD_CHILDREN = ((_ADD_CHILDREN = {}).iframe = function(el, node) {
        var firstChild = node.children[0];
        if (1 !== node.children.length || !firstChild || "element" !== firstChild.type || "html" !== firstChild.name) throw new Error("Expected only single html element node as child of iframe element");
        el.addEventListener("load", (function() {
            var win = el.contentWindow;
            if (!win) throw new Error("Expected frame to have contentWindow");
            var doc = win.document;
            var docElement = doc.documentElement;
            for (;docElement.children && docElement.children.length; ) docElement.removeChild(docElement.children[0]);
            var child = firstChild.render(function(opts) {
                void 0 === opts && (opts = {});
                var _opts$doc = opts.doc, doc = void 0 === _opts$doc ? document : _opts$doc;
                return function domRenderer(node) {
                    if ("component" === node.type) return node.renderComponent(domRenderer);
                    if ("text" === node.type) return createTextElement(doc, node);
                    if ("element" === node.type) {
                        var xmlNamespace = ELEMENT_DEFAULT_XML_NAMESPACE[node.name.toLowerCase()];
                        if (xmlNamespace) return function xmlNamespaceDomRenderer(node, xmlNamespace) {
                            if ("component" === node.type) return node.renderComponent((function(childNode) {
                                return xmlNamespaceDomRenderer(childNode, xmlNamespace);
                            }));
                            if ("text" === node.type) return createTextElement(doc, node);
                            if ("element" === node.type) {
                                var el = function(doc, node, xmlNamespace) {
                                    return doc.createElementNS(xmlNamespace, node.name);
                                }(doc, node, xmlNamespace);
                                addProps(el, node);
                                addChildren(el, node, doc, (function(childNode) {
                                    return xmlNamespaceDomRenderer(childNode, xmlNamespace);
                                }));
                                return el;
                            }
                            throw new TypeError("Unhandleable node");
                        }(node, xmlNamespace);
                        var el = function(doc, node) {
                            return node.props.el ? node.props.el : doc.createElement(node.name);
                        }(doc, node);
                        addProps(el, node);
                        addChildren(el, node, doc, domRenderer);
                        return el;
                    }
                    throw new TypeError("Unhandleable node");
                };
            }({
                doc: doc
            }));
            for (;child.children.length; ) docElement.appendChild(child.children[0]);
        }));
    }, _ADD_CHILDREN.script = function(el, node) {
        var firstChild = node.children[0];
        if (1 !== node.children.length || !firstChild || "text" !== firstChild.type) throw new Error("Expected only single text node as child of script element");
        el.text = firstChild.text;
    }, _ADD_CHILDREN.default = function(el, node, renderer) {
        for (var _i6 = 0, _node$renderChildren2 = node.renderChildren(renderer); _i6 < _node$renderChildren2.length; _i6++) el.appendChild(_node$renderChildren2[_i6]);
    }, _ADD_CHILDREN);
    function addChildren(el, node, doc, renderer) {
        if (node.props.hasOwnProperty("innerHTML")) {
            if (node.children.length) throw new Error("Expected no children to be passed when innerHTML prop is set");
            var html = node.props.innerHTML;
            if ("string" != typeof html) throw new TypeError("innerHTML prop must be string");
            if ("script" === node.name) el.text = html; else {
                el.innerHTML = html;
                !function(el, doc) {
                    void 0 === doc && (doc = window.document);
                    for (var _i2 = 0, _el$querySelectorAll2 = el.querySelectorAll("script"); _i2 < _el$querySelectorAll2.length; _i2++) {
                        var script = _el$querySelectorAll2[_i2];
                        var parentNode = script.parentNode;
                        if (parentNode) {
                            var newScript = doc.createElement("script");
                            newScript.text = script.textContent;
                            parentNode.replaceChild(newScript, script);
                        }
                    }
                }(el, doc);
            }
        } else (ADD_CHILDREN[node.name] || ADD_CHILDREN.default)(el, node, renderer);
    }
    function Spinner(_ref) {
        return node_node("div", {
            class: "preloader spinner"
        }, node_node("style", {
            nonce: _ref.nonce,
            innerHTML: "\n\n    body {\n        width: 100%;\n        height: 100%;\n        overflow: hidden;\n        position: fixed;\n        top: 0;\n        left: 0;\n        margin: 0;\n    }\n\n    .spinner {\n        height: 100%;\n        width: 100%;\n        position: absolute;\n        z-index: 10\n    }\n\n    .spinner .spinWrap {\n        width: 200px;\n        height: 100px;\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        margin-left: -100px;\n        margin-top: -50px\n    }\n\n    .spinner .loader,\n    .spinner .spinnerImage {\n        height: 100px;\n        width: 100px;\n        position: absolute;\n        top: 0;\n        left: 50%;\n        opacity: 1;\n        filter: alpha(opacity=100)\n    }\n\n    .spinner .spinnerImage {\n        margin: 28px 0 0 -25px;\n        background: url(https://www.paypalobjects.com/images/checkout/hermes/icon_ot_spin_lock_skinny.png) no-repeat\n    }\n\n    .spinner .loader {\n        margin: 0 0 0 -55px;\n        background-color: transparent;\n        animation: rotation .7s infinite linear;\n        border-left: 5px solid #cbcbca;\n        border-right: 5px solid #cbcbca;\n        border-bottom: 5px solid #cbcbca;\n        border-top: 5px solid #2380be;\n        border-radius: 100%\n    }\n\n    @keyframes rotation {\n        from {\n            transform: rotate(0deg)\n        }\n        to {\n            transform: rotate(359deg)\n        }\n    }\n"
        }), node_node("div", {
            class: "spinWrap"
        }, node_node("p", {
            class: "spinnerImage"
        }), node_node("p", {
            class: "loader"
        })));
    }
    function SpinnerPage(_ref2, children) {
        var nonce = _ref2.nonce;
        return node_node("html", null, node_node("head", null, node_node("title", null, "PayPal"), node_node("meta", {
            name: "viewport",
            content: "width=device-width, initial-scale=1"
        })), node_node("body", null, node_node(Spinner, {
            nonce: nonce
        }), children));
    }
    function VenmoSpinner(_ref) {
        return node_node(Fragment, null, node_node("style", {
            nonce: _ref.nonce,
            innerHTML: '\n    body {\n        width: 100%;\n        height: 100%;\n        overflow: hidden;\n        position: fixed;\n        top: 0;\n        left: 0;\n        margin: 0;\n    }\n    .spinner {\n        color: official;\n        display: inline-block;\n        width: 80px;\n        height: 80px;\n        position: absolute;\n        left: 50%;\n        top: 50%;\n        -webkit-transform: translate(-50%, -50%);\n        transform: translate(-50%, -50%);\n    }\n    .spinner div {\n        transform-origin: 40px 40px;\n        animation: spinner 1.2s linear infinite;\n    }\n    .spinner div:after {\n        content: " ";\n        display: block;\n        position: absolute;\n        top: 20px;\n        left: 37px;\n        width: 3px;\n        height: 10px;\n        border-radius: 30%;\n        background: #808080;\n    }\n    .spinner div:nth-child(1) {\n        transform: rotate(0deg);\n        animation-delay: -1.1s;\n    }\n    .spinner div:nth-child(2) {\n        transform: rotate(30deg);\n        animation-delay: -1s;\n    }\n    .spinner div:nth-child(3) {\n        transform: rotate(60deg);\n        animation-delay: -0.9s;\n    }\n    .spinner div:nth-child(4) {\n        transform: rotate(90deg);\n        animation-delay: -0.8s;\n    }\n    .spinner div:nth-child(5) {\n        transform: rotate(120deg);\n        animation-delay: -0.7s;\n    }\n    .spinner div:nth-child(6) {\n        transform: rotate(150deg);\n        animation-delay: -0.6s;\n    }\n    .spinner div:nth-child(7) {\n        transform: rotate(180deg);\n        animation-delay: -0.5s;\n    }\n    .spinner div:nth-child(8) {\n        transform: rotate(210deg);\n        animation-delay: -0.4s;\n    }\n    .spinner div:nth-child(9) {\n        transform: rotate(240deg);\n        animation-delay: -0.3s;\n    }\n    .spinner div:nth-child(10) {\n        transform: rotate(270deg);\n        animation-delay: -0.2s;\n    }\n    .spinner div:nth-child(11) {\n        transform: rotate(300deg);\n        animation-delay: -0.1s;\n    }\n    .spinner div:nth-child(12) {\n        transform: rotate(330deg);\n        animation-delay: 0s;\n    }\n    @keyframes spinner {\n        0% {\n            opacity: 1;\n        }\n        100% {\n            opacity: 0;\n        }\n    }\n'
        }), node_node("div", {
            class: "spinner"
        }, node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null), node_node("div", null)));
    }
    function VenmoSpinnerPage(_ref2, children) {
        var nonce = _ref2.nonce;
        return node_node("html", null, node_node("head", null, node_node("title", null, "Venmo"), node_node("meta", {
            name: "viewport",
            content: "width=device-width, initial-scale=1"
        })), node_node("body", null, node_node(VenmoSpinner, {
            nonce: nonce
        }), children));
    }
} ]);