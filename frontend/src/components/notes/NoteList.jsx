import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotes } from '../../features/notes/notesSlice';
import NoteItem from './NoteItem';
import Spinner from '../Spinner';

const NoteList = () => {
  const dispatch = useDispatch();
  const { notes, isLoading, isError, message } = useSelector((state) => state.notes);

  useEffect(() => {
    if (isError) {
      console.log(message);
    }

    dispatch(getNotes());
  }, [dispatch, isError, message]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.length > 0 ? (
        notes.map((note) => <NoteItem key={note._id} note={note} />)
      ) : (
        <h3>You have not set any notes</h3>
      )}
    </div>
  );
};

export default NoteList; 