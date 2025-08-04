/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/CartContext.tsx":
/*!************************************!*\
  !*** ./components/CartContext.tsx ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CartProvider: () => (/* binding */ CartProvider),\n/* harmony export */   useCart: () => (/* binding */ useCart)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst CartContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nfunction useCart() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(CartContext);\n    if (!context) throw new Error(\"useCart must be used within CartProvider\");\n    return context;\n}\nfunction CartProvider({ children }) {\n    const [items, setItems] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const addItem = (item)=>{\n        setItems((prev)=>{\n            const found = prev.find((i)=>i.id === item.id);\n            if (found) {\n                return prev.map((i)=>i.id === item.id ? {\n                        ...i,\n                        quantity: i.quantity + item.quantity\n                    } : i);\n            }\n            return [\n                ...prev,\n                item\n            ];\n        });\n    };\n    const removeItem = (id)=>{\n        setItems((prev)=>prev.filter((i)=>i.id !== id));\n    };\n    const clearCart = ()=>setItems([]);\n    const updateQuantity = (id, quantity)=>{\n        setItems((prev)=>prev.map((i)=>i.id === id ? {\n                    ...i,\n                    quantity\n                } : i));\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(CartContext.Provider, {\n        value: {\n            items,\n            addItem,\n            removeItem,\n            clearCart,\n            updateQuantity\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"/home/octa/Documents/aim-exchange/components/CartContext.tsx\",\n        lineNumber: 51,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL0NhcnRDb250ZXh0LnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQThFO0FBa0I5RSxNQUFNSSw0QkFBY0gsb0RBQWFBLENBQThCSTtBQUV4RCxTQUFTQztJQUNkLE1BQU1DLFVBQVVMLGlEQUFVQSxDQUFDRTtJQUMzQixJQUFJLENBQUNHLFNBQVMsTUFBTSxJQUFJQyxNQUFNO0lBQzlCLE9BQU9EO0FBQ1Q7QUFFTyxTQUFTRSxhQUFhLEVBQUVDLFFBQVEsRUFBMkI7SUFDaEUsTUFBTSxDQUFDQyxPQUFPQyxTQUFTLEdBQUdULCtDQUFRQSxDQUFhLEVBQUU7SUFFakQsTUFBTVUsVUFBVSxDQUFDQztRQUNmRixTQUFTRyxDQUFBQTtZQUNQLE1BQU1DLFFBQVFELEtBQUtFLElBQUksQ0FBQ0MsQ0FBQUEsSUFBS0EsRUFBRUMsRUFBRSxLQUFLTCxLQUFLSyxFQUFFO1lBQzdDLElBQUlILE9BQU87Z0JBQ1QsT0FBT0QsS0FBS0ssR0FBRyxDQUFDRixDQUFBQSxJQUFLQSxFQUFFQyxFQUFFLEtBQUtMLEtBQUtLLEVBQUUsR0FBRzt3QkFBRSxHQUFHRCxDQUFDO3dCQUFFRyxVQUFVSCxFQUFFRyxRQUFRLEdBQUdQLEtBQUtPLFFBQVE7b0JBQUMsSUFBSUg7WUFDM0Y7WUFDQSxPQUFPO21CQUFJSDtnQkFBTUQ7YUFBSztRQUN4QjtJQUNGO0lBRUEsTUFBTVEsYUFBYSxDQUFDSDtRQUNsQlAsU0FBU0csQ0FBQUEsT0FBUUEsS0FBS1EsTUFBTSxDQUFDTCxDQUFBQSxJQUFLQSxFQUFFQyxFQUFFLEtBQUtBO0lBQzdDO0lBRUEsTUFBTUssWUFBWSxJQUFNWixTQUFTLEVBQUU7SUFFbkMsTUFBTWEsaUJBQWlCLENBQUNOLElBQVlFO1FBQ2xDVCxTQUFTRyxDQUFBQSxPQUFRQSxLQUFLSyxHQUFHLENBQUNGLENBQUFBLElBQUtBLEVBQUVDLEVBQUUsS0FBS0EsS0FBSztvQkFBRSxHQUFHRCxDQUFDO29CQUFFRztnQkFBUyxJQUFJSDtJQUNwRTtJQUVBLHFCQUNFLDhEQUFDZCxZQUFZc0IsUUFBUTtRQUFDQyxPQUFPO1lBQUVoQjtZQUFPRTtZQUFTUztZQUFZRTtZQUFXQztRQUFlO2tCQUNsRmY7Ozs7OztBQUdQIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGllbmRhLWJhY2tlbmQtZnVsbC8uL2NvbXBvbmVudHMvQ2FydENvbnRleHQudHN4PzNkNGMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZVN0YXRlLCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCB0eXBlIENhcnRJdGVtID0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHByaWNlOiBudW1iZXI7XG4gIGltYWdlPzogc3RyaW5nO1xuICBxdWFudGl0eTogbnVtYmVyO1xufTtcblxuaW50ZXJmYWNlIENhcnRDb250ZXh0VHlwZSB7XG4gIGl0ZW1zOiBDYXJ0SXRlbVtdO1xuICBhZGRJdGVtOiAoaXRlbTogQ2FydEl0ZW0pID0+IHZvaWQ7XG4gIHJlbW92ZUl0ZW06IChpZDogc3RyaW5nKSA9PiB2b2lkO1xuICBjbGVhckNhcnQ6ICgpID0+IHZvaWQ7XG4gIHVwZGF0ZVF1YW50aXR5OiAoaWQ6IHN0cmluZywgcXVhbnRpdHk6IG51bWJlcikgPT4gdm9pZDtcbn1cblxuY29uc3QgQ2FydENvbnRleHQgPSBjcmVhdGVDb250ZXh0PENhcnRDb250ZXh0VHlwZSB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNhcnQoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KENhcnRDb250ZXh0KTtcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZUNhcnQgbXVzdCBiZSB1c2VkIHdpdGhpbiBDYXJ0UHJvdmlkZXInKTtcbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJ0UHJvdmlkZXIoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkge1xuICBjb25zdCBbaXRlbXMsIHNldEl0ZW1zXSA9IHVzZVN0YXRlPENhcnRJdGVtW10+KFtdKTtcblxuICBjb25zdCBhZGRJdGVtID0gKGl0ZW06IENhcnRJdGVtKSA9PiB7XG4gICAgc2V0SXRlbXMocHJldiA9PiB7XG4gICAgICBjb25zdCBmb3VuZCA9IHByZXYuZmluZChpID0+IGkuaWQgPT09IGl0ZW0uaWQpO1xuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIHJldHVybiBwcmV2Lm1hcChpID0+IGkuaWQgPT09IGl0ZW0uaWQgPyB7IC4uLmksIHF1YW50aXR5OiBpLnF1YW50aXR5ICsgaXRlbS5xdWFudGl0eSB9IDogaSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gWy4uLnByZXYsIGl0ZW1dO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IHJlbW92ZUl0ZW0gPSAoaWQ6IHN0cmluZykgPT4ge1xuICAgIHNldEl0ZW1zKHByZXYgPT4gcHJldi5maWx0ZXIoaSA9PiBpLmlkICE9PSBpZCkpO1xuICB9O1xuXG4gIGNvbnN0IGNsZWFyQ2FydCA9ICgpID0+IHNldEl0ZW1zKFtdKTtcblxuICBjb25zdCB1cGRhdGVRdWFudGl0eSA9IChpZDogc3RyaW5nLCBxdWFudGl0eTogbnVtYmVyKSA9PiB7XG4gICAgc2V0SXRlbXMocHJldiA9PiBwcmV2Lm1hcChpID0+IGkuaWQgPT09IGlkID8geyAuLi5pLCBxdWFudGl0eSB9IDogaSkpO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPENhcnRDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IGl0ZW1zLCBhZGRJdGVtLCByZW1vdmVJdGVtLCBjbGVhckNhcnQsIHVwZGF0ZVF1YW50aXR5IH19PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvQ2FydENvbnRleHQuUHJvdmlkZXI+XG4gICk7XG59XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJjcmVhdGVDb250ZXh0IiwidXNlQ29udGV4dCIsInVzZVN0YXRlIiwiQ2FydENvbnRleHQiLCJ1bmRlZmluZWQiLCJ1c2VDYXJ0IiwiY29udGV4dCIsIkVycm9yIiwiQ2FydFByb3ZpZGVyIiwiY2hpbGRyZW4iLCJpdGVtcyIsInNldEl0ZW1zIiwiYWRkSXRlbSIsIml0ZW0iLCJwcmV2IiwiZm91bmQiLCJmaW5kIiwiaSIsImlkIiwibWFwIiwicXVhbnRpdHkiLCJyZW1vdmVJdGVtIiwiZmlsdGVyIiwiY2xlYXJDYXJ0IiwidXBkYXRlUXVhbnRpdHkiLCJQcm92aWRlciIsInZhbHVlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./components/CartContext.tsx\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_CartContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/CartContext */ \"./components/CartContext.tsx\");\n\n\n\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_CartContext__WEBPACK_IMPORTED_MODULE_2__.CartProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/home/octa/Documents/aim-exchange/pages/_app.tsx\",\n            lineNumber: 8,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/home/octa/Documents/aim-exchange/pages/_app.tsx\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQThCO0FBRTJCO0FBRTFDLFNBQVNDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDNUQscUJBQ0UsOERBQUNILGlFQUFZQTtrQkFDWCw0RUFBQ0U7WUFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7OztBQUc5QiIsInNvdXJjZXMiOlsid2VicGFjazovL3RpZW5kYS1iYWNrZW5kLWZ1bGwvLi9wYWdlcy9fYXBwLnRzeD8yZmJlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJ1xuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJ1xuaW1wb3J0IHsgQ2FydFByb3ZpZGVyIH0gZnJvbSAnLi4vY29tcG9uZW50cy9DYXJ0Q29udGV4dCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPENhcnRQcm92aWRlcj5cbiAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cbiAgICA8L0NhcnRQcm92aWRlcj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJDYXJ0UHJvdmlkZXIiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.tsx"));
module.exports = __webpack_exports__;

})();