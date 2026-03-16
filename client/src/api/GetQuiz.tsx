
export const getQuiz = async (quizId: number) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`/api/quizzes/${quizId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quiz");
  }

  return response.json();
};
