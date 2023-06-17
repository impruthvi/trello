import formateTodosAI from "./formateTodosAI";

const fetchSuggesion = async (board: Board) => {
  const todos = formateTodosAI(board);

  const res = await fetch("/api/generateSummery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todos }),
  });

  if (!res.ok) {
    throw new Error("Network response was not ok");
  }

  const GPTdata = await res.json();

  const { content } = GPTdata;

  return content;
};

export default fetchSuggesion;
