import { useDispatch } from 'store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragAndDrop from './DragAndDrop';

// ==============================|| KANBAN - BOARD ||============================== //

const Board = () => {
    const dispatch = useDispatch();

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="App" style={{ overflow: 'auto' }}>
                <DragAndDrop />
            </div>
        </DndProvider>
    );
};

export default Board;
