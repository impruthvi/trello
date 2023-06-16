import { database } from "@/appwrite";

export const getTodosGroupedByColumn = async () => {
  const data = await database.listDocuments(
    process.env.NEXT_PUBLIC_DATABASE_ID!,
    process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!
  );

  const todos = data.documents;

  const columns = todos.reduce((acc, todo) => {
    if (!acc.get(todo.status)) {
      acc.set(todo.status, {
        id: todo.status,
        todos: [],
      });
    }

    acc.get(todo.status)!.todos.push({
      $id: todo.$id,
      $createdAt: todo.$createdAt,
      title: todo.title,
      status: todo.status,

      //   get the image if it exists and return it
      ...(todo.image && { image: todo.image }),
    });

    return acc;
  }, new Map<TypedColumn, Column>());

  // if columns does not have a inprogress, todo, or done column, add then with empty todos

  const columnTypes: TypedColumn[] = ["inprogress", "todo", "done"];

  columnTypes.forEach((columnType) => {
    if (!columns.get(columnType)) {
      columns.set(columnType, {
        id: columnType,
        todos: [],
      });
    }
  });

  // sort the columns by column type
  const sortedColumns = new Map(
    Array.from(columns.entries()).sort(
      (a, b) => columnTypes.indexOf(a[0]) - columnTypes.indexOf(b[0])
    )
  );

  const board = {
    columns: sortedColumns,
  };

  return board;
};
