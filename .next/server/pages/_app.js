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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CartProvider: () => (/* binding */ CartProvider),\n/* harmony export */   useCart: () => (/* binding */ useCart)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst CartContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nfunction useCart() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(CartContext);\n    if (!context) throw new Error(\"useCart must be used within CartProvider\");\n    return context;\n}\nfunction CartProvider({ children }) {\n    const [isMounted, setIsMounted] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [items, setItems] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(()=>{\n        if (false) {}\n        return [];\n    });\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        setIsMounted(true);\n    }, []);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (isMounted) {\n            localStorage.setItem(\"cart-items\", JSON.stringify(items));\n        }\n    }, [\n        items,\n        isMounted\n    ]);\n    const addItem = (item)=>{\n        setItems((prev)=>{\n            const found = prev.find((i)=>i.id === item.id);\n            if (found) {\n                return prev.map((i)=>i.id === item.id ? {\n                        ...i,\n                        quantity: i.quantity + item.quantity\n                    } : i);\n            }\n            return [\n                ...prev,\n                item\n            ];\n        });\n    };\n    const removeItem = (id)=>{\n        setItems((prev)=>prev.filter((i)=>i.id !== id));\n    };\n    const clearCart = ()=>setItems([]);\n    const updateQuantity = (id, quantity)=>{\n        setItems((prev)=>prev.map((i)=>i.id === id ? {\n                    ...i,\n                    quantity\n                } : i));\n    };\n    if (!isMounted) return null;\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(CartContext.Provider, {\n        value: {\n            items,\n            addItem,\n            removeItem,\n            clearCart,\n            updateQuantity\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"/home/octa/Documents/aim-exchange/components/CartContext.tsx\",\n        lineNumber: 70,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL0NhcnRDb250ZXh0LnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQXlGO0FBa0J6RixNQUFNSyw0QkFBY0osb0RBQWFBLENBQThCSztBQUV4RCxTQUFTQztJQUNkLE1BQU1DLFVBQVVOLGlEQUFVQSxDQUFDRztJQUMzQixJQUFJLENBQUNHLFNBQVMsTUFBTSxJQUFJQyxNQUFNO0lBQzlCLE9BQU9EO0FBQ1Q7QUFFTyxTQUFTRSxhQUFhLEVBQUVDLFFBQVEsRUFBMkI7SUFDaEUsTUFBTSxDQUFDQyxXQUFXQyxhQUFhLEdBQUdWLCtDQUFRQSxDQUFDO0lBQzNDLE1BQU0sQ0FBQ1csT0FBT0MsU0FBUyxHQUFHWiwrQ0FBUUEsQ0FBYTtRQUM3QyxJQUFJLEtBQWtCLEVBQWEsRUFHbEM7UUFDRCxPQUFPLEVBQUU7SUFDWDtJQUVBQyxnREFBU0EsQ0FBQztRQUNSUyxhQUFhO0lBQ2YsR0FBRyxFQUFFO0lBRUxULGdEQUFTQSxDQUFDO1FBQ1IsSUFBSVEsV0FBVztZQUNiSyxhQUFhSSxPQUFPLENBQUMsY0FBY0YsS0FBS0csU0FBUyxDQUFDUjtRQUNwRDtJQUNGLEdBQUc7UUFBQ0E7UUFBT0Y7S0FBVTtJQUVyQixNQUFNVyxVQUFVLENBQUNDO1FBQ2ZULFNBQVNVLENBQUFBO1lBQ1AsTUFBTUMsUUFBUUQsS0FBS0UsSUFBSSxDQUFDQyxDQUFBQSxJQUFLQSxFQUFFQyxFQUFFLEtBQUtMLEtBQUtLLEVBQUU7WUFDN0MsSUFBSUgsT0FBTztnQkFDVCxPQUFPRCxLQUFLSyxHQUFHLENBQUNGLENBQUFBLElBQUtBLEVBQUVDLEVBQUUsS0FBS0wsS0FBS0ssRUFBRSxHQUFHO3dCQUFFLEdBQUdELENBQUM7d0JBQUVHLFVBQVVILEVBQUVHLFFBQVEsR0FBR1AsS0FBS08sUUFBUTtvQkFBQyxJQUFJSDtZQUMzRjtZQUNBLE9BQU87bUJBQUlIO2dCQUFNRDthQUFLO1FBQ3hCO0lBQ0Y7SUFFQSxNQUFNUSxhQUFhLENBQUNIO1FBQ2xCZCxTQUFTVSxDQUFBQSxPQUFRQSxLQUFLUSxNQUFNLENBQUNMLENBQUFBLElBQUtBLEVBQUVDLEVBQUUsS0FBS0E7SUFDN0M7SUFFQSxNQUFNSyxZQUFZLElBQU1uQixTQUFTLEVBQUU7SUFFbkMsTUFBTW9CLGlCQUFpQixDQUFDTixJQUFZRTtRQUNsQ2hCLFNBQVNVLENBQUFBLE9BQVFBLEtBQUtLLEdBQUcsQ0FBQ0YsQ0FBQUEsSUFBS0EsRUFBRUMsRUFBRSxLQUFLQSxLQUFLO29CQUFFLEdBQUdELENBQUM7b0JBQUVHO2dCQUFTLElBQUlIO0lBQ3BFO0lBRUEsSUFBSSxDQUFDaEIsV0FBVyxPQUFPO0lBRXZCLHFCQUNFLDhEQUFDUCxZQUFZK0IsUUFBUTtRQUFDQyxPQUFPO1lBQUV2QjtZQUFPUztZQUFTUztZQUFZRTtZQUFXQztRQUFlO2tCQUNsRnhCOzs7Ozs7QUFHUCIsInNvdXJjZXMiOlsid2VicGFjazovL3RpZW5kYS1iYWNrZW5kLWZ1bGwvLi9jb21wb25lbnRzL0NhcnRDb250ZXh0LnRzeD8zZDRjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0LCB1c2VTdGF0ZSwgUmVhY3ROb2RlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCB0eXBlIENhcnRJdGVtID0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHByaWNlOiBudW1iZXI7XG4gIGltYWdlPzogc3RyaW5nO1xuICBxdWFudGl0eTogbnVtYmVyO1xufTtcblxuaW50ZXJmYWNlIENhcnRDb250ZXh0VHlwZSB7XG4gIGl0ZW1zOiBDYXJ0SXRlbVtdO1xuICBhZGRJdGVtOiAoaXRlbTogQ2FydEl0ZW0pID0+IHZvaWQ7XG4gIHJlbW92ZUl0ZW06IChpZDogc3RyaW5nKSA9PiB2b2lkO1xuICBjbGVhckNhcnQ6ICgpID0+IHZvaWQ7XG4gIHVwZGF0ZVF1YW50aXR5OiAoaWQ6IHN0cmluZywgcXVhbnRpdHk6IG51bWJlcikgPT4gdm9pZDtcbn1cblxuY29uc3QgQ2FydENvbnRleHQgPSBjcmVhdGVDb250ZXh0PENhcnRDb250ZXh0VHlwZSB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNhcnQoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KENhcnRDb250ZXh0KTtcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZUNhcnQgbXVzdCBiZSB1c2VkIHdpdGhpbiBDYXJ0UHJvdmlkZXInKTtcbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJ0UHJvdmlkZXIoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkge1xuICBjb25zdCBbaXNNb3VudGVkLCBzZXRJc01vdW50ZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbaXRlbXMsIHNldEl0ZW1zXSA9IHVzZVN0YXRlPENhcnRJdGVtW10+KCgpID0+IHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IHN0b3JlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjYXJ0LWl0ZW1zJyk7XG4gICAgICByZXR1cm4gc3RvcmVkID8gSlNPTi5wYXJzZShzdG9yZWQpIDogW107XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRJc01vdW50ZWQodHJ1ZSk7XG4gIH0sIFtdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc01vdW50ZWQpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjYXJ0LWl0ZW1zJywgSlNPTi5zdHJpbmdpZnkoaXRlbXMpKTtcbiAgICB9XG4gIH0sIFtpdGVtcywgaXNNb3VudGVkXSk7XG5cbiAgY29uc3QgYWRkSXRlbSA9IChpdGVtOiBDYXJ0SXRlbSkgPT4ge1xuICAgIHNldEl0ZW1zKHByZXYgPT4ge1xuICAgICAgY29uc3QgZm91bmQgPSBwcmV2LmZpbmQoaSA9PiBpLmlkID09PSBpdGVtLmlkKTtcbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICByZXR1cm4gcHJldi5tYXAoaSA9PiBpLmlkID09PSBpdGVtLmlkID8geyAuLi5pLCBxdWFudGl0eTogaS5xdWFudGl0eSArIGl0ZW0ucXVhbnRpdHkgfSA6IGkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFsuLi5wcmV2LCBpdGVtXTtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCByZW1vdmVJdGVtID0gKGlkOiBzdHJpbmcpID0+IHtcbiAgICBzZXRJdGVtcyhwcmV2ID0+IHByZXYuZmlsdGVyKGkgPT4gaS5pZCAhPT0gaWQpKTtcbiAgfTtcblxuICBjb25zdCBjbGVhckNhcnQgPSAoKSA9PiBzZXRJdGVtcyhbXSk7XG5cbiAgY29uc3QgdXBkYXRlUXVhbnRpdHkgPSAoaWQ6IHN0cmluZywgcXVhbnRpdHk6IG51bWJlcikgPT4ge1xuICAgIHNldEl0ZW1zKHByZXYgPT4gcHJldi5tYXAoaSA9PiBpLmlkID09PSBpZCA/IHsgLi4uaSwgcXVhbnRpdHkgfSA6IGkpKTtcbiAgfTtcblxuICBpZiAoIWlzTW91bnRlZCkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIChcbiAgICA8Q2FydENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgaXRlbXMsIGFkZEl0ZW0sIHJlbW92ZUl0ZW0sIGNsZWFyQ2FydCwgdXBkYXRlUXVhbnRpdHkgfX0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9DYXJ0Q29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJSZWFjdCIsImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJDYXJ0Q29udGV4dCIsInVuZGVmaW5lZCIsInVzZUNhcnQiLCJjb250ZXh0IiwiRXJyb3IiLCJDYXJ0UHJvdmlkZXIiLCJjaGlsZHJlbiIsImlzTW91bnRlZCIsInNldElzTW91bnRlZCIsIml0ZW1zIiwic2V0SXRlbXMiLCJzdG9yZWQiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiSlNPTiIsInBhcnNlIiwic2V0SXRlbSIsInN0cmluZ2lmeSIsImFkZEl0ZW0iLCJpdGVtIiwicHJldiIsImZvdW5kIiwiZmluZCIsImkiLCJpZCIsIm1hcCIsInF1YW50aXR5IiwicmVtb3ZlSXRlbSIsImZpbHRlciIsImNsZWFyQ2FydCIsInVwZGF0ZVF1YW50aXR5IiwiUHJvdmlkZXIiLCJ2YWx1ZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/CartContext.tsx\n");

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