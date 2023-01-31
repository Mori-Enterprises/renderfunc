# renderfunc

renderfunc is a small library used to render dynamic collections into the DOM. The focus of this library is being very small and very fast.

## Getting Started

```
npm install --save renderfunc
```

## Example

This library consists of a single exported function: `renderList`, which takes a list of items to render. An item has these properties:

```
interface RenderItem<T> {
    id: string; // the ID of data, which controls creating new DOM elements
    data: T;    // data to render
}
```

For instance, if we wanted to render a list of names, we might create them like this:

```
const names = ['sally', 'george', 'maria'];
const items: RenderItem<string>[] = names.map(name => ({ id: name, data: name }));
```

These items can be passed into `renderList`, which has this signature:

```
function renderList<T>(
    container: HTMLElement,     // The parent container to render in
    options: {
        items: RenderItem<T>[], // The items to render
        tag?: string,           // The HTML tag, defaults to `div`.
        onCreate?: (el: HTMLElement, item: RenderItem<T>) => (() => void) | void, // Called when a new element is created
        onUpdate?: (el: HTMLElement, item: RenderItem<T>) => void,                // Called for every element, whether new or existing
    },
) {
```

Putting this all together, we can render the names:

```
import { RenderItem, renderList } from 'renderfunc'

let renderCount = 0;
function render() {
    renderCount += 1;

    const names = ['sally', 'george', 'maria'];
    const items: RenderItem<string>[] = names.map(name => ({ id: name, data: name }));

    const container = document.getElementById('container')!;

    renderList(
        container,
        {
            items,
            onCreate: (el, item) => { console.log('Element', item.data, 'created') },
            onUpdate: (el, item) => {
                console.log('Element', item.data, 'updated');
                el.textContent = item.data + ' ' + renderCount;
            },
        },
    );
}
```

In this example, the names will be rendered everytime `render` is called. The first time `render` is called, `onCreate` will be called for each name. For every subsequent call to `render`, only `onUpdate` will be called. After 3 calls, the HTML will look something like this: 

```
<div id="container">
    <div class="...">sally 3</div>
    <div class="...">george 3</div>
    <div class="...">maria 3</div>
</div>
```
