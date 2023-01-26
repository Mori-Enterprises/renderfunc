"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderList = void 0;
function idToClass(id) {
    return 'c' + id.replace(/[^a-z0-9]/g, (s) => {
        var c = s.charCodeAt(0);
        if (c == 32)
            return '-';
        if (c >= 65 && c <= 90)
            return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
}
function renderList(container, options) {
    var _a, _b;
    const { items } = options;
    const seen = new Set();
    let lastEl;
    for (const item of items) {
        const cssClass = idToClass(item.id);
        seen.add(cssClass);
        let itemEl = container.querySelector(`:scope > .${cssClass}`);
        if (itemEl) {
            let beforeEl = itemEl.previousElementSibling;
            if (lastEl && lastEl != beforeEl) {
                itemEl.remove();
                lastEl.insertAdjacentElement('afterend', itemEl);
            }
            else if (!lastEl && beforeEl) {
                itemEl.remove();
                container.prepend(itemEl);
            }
        }
        else {
            let cleanup;
            if (options.onCreateEl) {
                const createResult = options.onCreateEl(item);
                let resultEl;
                if (Array.isArray(createResult)) {
                    resultEl = createResult[0];
                    cleanup = createResult[1];
                }
                else {
                    resultEl = createResult;
                }
                if (resultEl instanceof HTMLElement) {
                    itemEl = resultEl;
                }
                else {
                    const node = resultEl.toDom();
                    if (!(node instanceof HTMLElement)) {
                        throw new Error('Only HTML elements can be rendered');
                    }
                    itemEl = node;
                }
            }
            else {
                itemEl = document.createElement((_a = options.tag) !== null && _a !== void 0 ? _a : 'div');
            }
            itemEl.classList.add(cssClass);
            itemEl.setAttribute('data-renderfunc-id', cssClass);
            if (lastEl) {
                lastEl.insertAdjacentElement('afterend', itemEl);
            }
            else {
                container.prepend(itemEl);
            }
            if (!options.onCreateEl && options.onCreate) {
                cleanup = options.onCreate(itemEl, item);
            }
            if (cleanup) {
                // @ts-ignore
                itemEl.__render_func_cleanup = cleanup;
            }
        }
        (_b = options.onUpdate) === null || _b === void 0 ? void 0 : _b.call(options, itemEl, item);
        lastEl = itemEl;
    }
    if (container.children.length !== items.length) {
        const toRemove = [];
        for (let i = 0; i < container.children.length; i++) {
            const child = container.children.item(i);
            if (!child) {
                continue;
            }
            const cssClass = child.getAttribute('data-renderfunc-id');
            if (!cssClass) {
                continue;
            }
            if (!seen.has(cssClass)) {
                toRemove.push(child);
            }
        }
        for (const el of toRemove) {
            // @ts-ignore
            const cleanup = el.__render_func_cleanup;
            if (cleanup) {
                cleanup();
            }
            el.remove();
        }
    }
}
exports.renderList = renderList;
//# sourceMappingURL=index.js.map