import { ID, database, storage } from "@/appwrite";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import uploadImage from "@/lib/uploadImage";
import { title } from "process";
import { create } from "zustand";

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoard: (board: Board) => void;
  updateTodoInDB: (todo: Todo, columnId: TypedColumn) => void;
  searchString: string;
  setSearchString: (searchString: string) => void;
  deleteTask: (taskIndex: number, todo: Todo, id: TypedColumn) => void;
  newTaskInput: string;
  setNewTaskInput: (input: string) => void;
  newTaskType: TypedColumn;
  setNewTaskType: (columnId: TypedColumn) => void;
  image: File | null;
  setImage: (image: File | null) => void;
  addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    const board = await getTodosGroupedByColumn();
    set({ board });
  },
  setBoard: (board) => set({ board }),
  updateTodoInDB: async (todo, columnId) => {
    await database.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },

  searchString: "",
  newTaskInput: "",
  setSearchString: (searchString) => set({ searchString }),

  deleteTask: async (taskIndex: number, todo: Todo, id: TypedColumn) => {
    const newColumns = new Map(get().board.columns);

    // delete todoId from newColmuns
    newColumns.get(id)?.todos.splice(taskIndex, 1);

    // update board
    set({
      board: {
        columns: newColumns,
      },
    });

    if (todo.image) {
      const imageObject: Image = JSON.parse(todo.image.toString());
      await storage.deleteFile(imageObject.bucketId, imageObject.fileId);
    }

    await database.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },

  setNewTaskInput: (input: string) => set({ newTaskInput: input }),
  newTaskType: "todo",
  setNewTaskType: (columnId: TypedColumn) => set({ newTaskType: columnId }),
  image: null,
  setImage: (image: File | null) => set({ image }),
  addTask: async (todo: string, columnId: TypedColumn, image?: File | null) => {
    let file: Image | undefined;

    if (image) {
      const fileUploaded = await uploadImage(image);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
      }
    }

    const { $id } = await database.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        // include image if it exists
        ...(file && { image: JSON.stringify(file) }),
      }
    );

    set({ newTaskInput: "" });

    set((state) => {
      const newColmuns = new Map(state.board.columns);

      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toString(),
        title: todo,
        status: columnId,

        // include image if it exists
        ...(file && { image: file }),
      };

      const column = newColmuns.get(columnId);

      if (!column) {
        newColmuns.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      } else {
        newColmuns.get(columnId)?.todos.push(newTodo);
      }

      return {
        board: {
          columns: newColmuns,
        },
      };
    });
  },
}));
