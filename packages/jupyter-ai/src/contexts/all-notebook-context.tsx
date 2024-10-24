import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotebookSelections, NotebookWatcher } from '../notebook-watcher';

type NotebookSelectionContextType = [NotebookSelections, (value: NotebookSelections) => void];

const NotebookSelectionContext = createContext<NotebookSelectionContextType>([
  [],
  () => {
  }
]);

export function useNotebookSelectionContext() {
  return useContext(NotebookSelectionContext);
}

type NotebookSelectionContextProviderProps = {
  children: React.ReactNode;
  notebookWatcher: NotebookWatcher;
};

export function NotebookSelectionContextProvider({
  children,
  notebookWatcher
}: NotebookSelectionContextProviderProps) {
  const [selections, setSelections] = useState<NotebookSelections>([]);

  useEffect(() => {

    notebookWatcher.selectionChanged.connect((sender, newSelections) => {
      if (newSelections) {
        console.log('NotebookSelectionContextProvider: Otrzymano nowe zaznaczenia:', newSelections);
        setSelections(newSelections);
      }
    });
  }, [notebookWatcher]);

  return (
    <NotebookSelectionContext.Provider value={[selections, setSelections]}>
      {children}
    </NotebookSelectionContext.Provider>
  );
}
