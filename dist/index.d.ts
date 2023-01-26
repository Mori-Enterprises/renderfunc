export interface RenderItem<T> {
    id: string;
    data: T;
}
interface RenderNode {
    toDom(): Text | HTMLElement;
}
type RenderableElement = HTMLElement | RenderNode;
export declare function renderList<T>(container: HTMLElement, options: {
    items: RenderItem<T>[];
    onCreateEl?: (item: RenderItem<T>) => RenderableElement | [RenderableElement, () => void];
    tag?: string;
    onCreate?: (el: HTMLElement, item: RenderItem<T>) => (() => void) | void;
    onUpdate?: (el: HTMLElement, item: RenderItem<T>) => void;
}): void;
export {};
