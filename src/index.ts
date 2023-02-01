export interface RenderItem<T> {
    id: string;
    data: T;
}

interface RenderNode {
    toDom(): Text | HTMLElement;
}

type RenderableElement = HTMLElement | RenderNode;

export function idToClass(
    id: string,
): string {
    return 'c' + id.replace(/[^a-z0-9]/g, (s) => {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
}

export function renderList<T>(
    container: HTMLElement,
    options: {
        items: RenderItem<T>[],
        onCreateEl?: (item: RenderItem<T>) => RenderableElement | [RenderableElement, () => void],
        tag?: string,
        onCreate?: (el: HTMLElement, item: RenderItem<T>) => (() => void) | void,
        onUpdate?: (el: HTMLElement, item: RenderItem<T>) => void,
    },
) {
    const { items } = options;

    const seen = new Set<string>();
    let lastEl: Element | undefined;

    for (const item of items) {
        const cssClass = idToClass(item.id);
        seen.add(cssClass);

        let itemEl = container.querySelector<HTMLElement>(`:scope > .${cssClass}`);
        if (itemEl) {
            let beforeEl = itemEl.previousElementSibling;
            if (lastEl && lastEl != beforeEl) {
                itemEl.remove();
                lastEl.insertAdjacentElement('afterend', itemEl);
            } else if (!lastEl && beforeEl) {
                itemEl.remove();
                container.prepend(itemEl);
            }
        } else {
            let cleanup: (() => void) | undefined | void;
            if (options.onCreateEl) {
                const createResult = options.onCreateEl(item);
                let resultEl: RenderableElement;
                if (Array.isArray(createResult)) {
                    resultEl = createResult[0];
                    cleanup = createResult[1];
                } else {
                    resultEl = createResult;
                }

                if (resultEl instanceof HTMLElement) {
                    itemEl = resultEl;
                } else {
                    const node = resultEl.toDom();
                    if (!(node instanceof HTMLElement)) {
                        throw new Error('Only HTML elements can be rendered');
                    }

                    itemEl = node;
                }
            } else {
                itemEl = document.createElement(options.tag ?? 'div');
            }

            itemEl.classList.add(cssClass);
            itemEl.setAttribute('data-renderfunc-id', cssClass);

            if (lastEl) {
                lastEl.insertAdjacentElement('afterend', itemEl);
            } else {
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

        options.onUpdate?.(itemEl, item);
        lastEl = itemEl;
    }

    if (container.children.length !== items.length) {
        const toRemove: HTMLElement[] = [];
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
                toRemove.push(child as HTMLElement);
            }
        }

        for (const el of toRemove) {
            // @ts-ignore
            const cleanup: (() => void) | undefined = el.__render_func_cleanup;
            if (cleanup) {
                cleanup();
            }
            el.remove();
        }
    }
}
