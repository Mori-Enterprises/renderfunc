import * as elements from 'better-safe-typed-html';
import { renderList } from 'renderfunc';


interface Row {
    id: string;
    count?: number;
}

class Controller {
    private readonly rows: Row[] = [];

    constructor() {
        const container = document.createElement('div');
        container.id = 'container';
        container.innerHTML = `
            <div><button class="new_row">New Row</button></div>
            <table class="rows"></table>
        `;
        document.body.prepend(container);

        const newButton = container.querySelector<HTMLButtonElement>('.new_row')!;
        newButton.onclick = () => {
            this.rows.push({ id: `${Math.floor(Math.random() * 1000000)}` })
            this.render();
        }

        this.render();
    }

    render() {
        const container = document.getElementById('container');
        if (!container) {
            return;
        }

        const a = <a></a>;
        a.toDom();

        renderList(
            container.querySelector(':scope > .rows')!,
            {
                items: this.rows.map(row => ({
                    id: row.id,
                    data: row,
                })),
                onCreateEl: (item) => (<tr>
                    <td className="count"></td>
                    <td><button onclick={() => {
                        item.data.count = (item.data.count ?? 0) + 1;
                        this.render();
                    }}>Add One</button></td>
                </tr>),
                onUpdate: (el, item) => {
                    el.querySelector(':scope > td.count')!.textContent = `${item.data.count ?? 0}`;
                },
            },
        )
    }
}

let controller: Controller | undefined;
const main = () => {
    controller = new Controller();
};

window.addEventListener('load', main);