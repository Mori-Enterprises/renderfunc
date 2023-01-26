import { renderList } from 'renderfunc';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, scan } from 'rxjs/operators';

interface Row {
    id: string;
    count: BehaviorSubject<number>;
}

class Controller {
    private rowSubject = new Subject<Row>();

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
            this.rowSubject.next({
                id: `${Math.floor(Math.random() * 1000000)}`,
                count: new BehaviorSubject(0),
            });
        }

        this.rowSubject
            .pipe(
                scan<Row, Row[]>((rows, row) => [...rows, row], []),
            )
            .subscribe((rows) => this.render(rows));

        this.render([]);
    }

    render(rows: Row[]) {
        const container = document.getElementById('container');
        if (!container) {
            return;
        }

        renderList(
            container.querySelector(':scope > .rows')!,
            {
                items: rows.map(row => ({
                    id: row.id,
                    data: row,
                })),
                tag: 'tr',
                onCreate: (el, item) => {
                    el.innerHTML = '<td class="count"></td><td><button>Add One</button></td>'
                    el.querySelector<HTMLElement>(':scope > td > button')!.onclick = () => {
                        item.data.count.next(item.data.count.getValue() + 1);
                    }

                    const subscription = item.data.count.subscribe(count => {
                        el.querySelector(':scope > td.count')!.textContent = `${count}`;
                    });
                    return () => subscription.unsubscribe();
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
