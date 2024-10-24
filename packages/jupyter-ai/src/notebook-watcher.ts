import { JupyterFrontEnd } from '@jupyterlab/application';
import { Notebook } from '@jupyterlab/notebook';
import { Widget } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';
import { DocumentWidget } from '@jupyterlab/docregistry';



function getNotebook(widget: Widget | null): Notebook | null {
  if (!(widget instanceof DocumentWidget)) {
    return null;
  }

  const { content } = widget;
  if (!(content instanceof Notebook)) {
    return null;
  }

  return content;
}


/**
 * Typ Selection, reprezentujący zaznaczenie w edytorze kodu.
 */
export type NotebookSelection = {
  start: { line: number; column: number };
  end: { line: number; column: number };
  text: string;
  numLines: number;
  widgetId: string;
  cellId?: string;
};

/**
 * Typ NotebookSelections, reprezentujący listę zaznaczeń dla całego notatnika.
 */
export type NotebookSelections = NotebookSelection[];

/**
 * Funkcja, która pobiera wszystkie komórki z notatnika i zwraca listę Selection.
 * @param notebook Notebook - instancja notatnika JupyterLab.
 * @returns NotebookSelections - lista obiektów Selection, gdzie każdy odpowiada jednej komórce.
 */
export function getNotebookSelections(notebook: Notebook): NotebookSelections {
  const selections: NotebookSelections = [];

  const cellModels = notebook.model?.cells;

  if (cellModels) {
    for (let i = 0; i < cellModels.length; i++) {
      const cell = cellModels.get(i);
      const cellSource = cell?.sharedModel.getSource();
      const cellId = cell?.id;

      if (cellSource && cellId) {
        const numLines = cellSource.split('\n').length;

        const selection: NotebookSelection = {
          start: { line: 0, column: 0 },
          end: { line: numLines - 1, column: cellSource.length },
          text: cellSource,
          numLines,
          widgetId: notebook.id,
          cellId
        };

        selections.push(selection);
      }
    }
  }

  //console.log(selections);

  return selections;
}

export class NotebookWatcher {
  constructor(shell: JupyterFrontEnd.IShell) {
    this._shell = shell;
    this._shell.currentChanged?.connect((sender, args) => {
      this._mainAreaWidget = args.newValue;
    });

    setInterval(this._poll.bind(this), 200);
  }

  get selection(): NotebookSelections {
    return this._selections;
  }

  get selectionChanged(): Signal<this, NotebookSelections> {
    return this._selectionChanged;
  }

  protected _poll(): void {
    const notebook = getNotebook(this._mainAreaWidget);
    const currSelections = notebook ? getNotebookSelections(notebook) : [];

    //console.log(notebook);
    //console.log('To jest Notbook selection', currSelections);

    if (JSON.stringify(this._selections) === JSON.stringify(currSelections)) {
      return;
    }

    this._selections = currSelections;
    this._selectionChanged.emit(currSelections);
  }

  protected _shell: JupyterFrontEnd.IShell;
  protected _mainAreaWidget: Widget | null = null;
  protected _selections: NotebookSelections = [];
  protected _selectionChanged = new Signal<this, NotebookSelections>(this);
}

