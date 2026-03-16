import api from "./axios";

export const createQuiz = async (quizData: any) => {
  const response = await api.post("/quizzes", quizData);
  return response.data;
};

export const updateQuiz = async (quizId: number, quizData: any) => {
  const response = await api.patch(`/quizzes/${quizId}`, quizData);
  return response.data;
};
