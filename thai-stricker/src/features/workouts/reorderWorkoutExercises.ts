export function reorderWorkoutExercises<T>(
  exercises: T[],
  fromIndex: number,
  toIndex: number,
) {
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    fromIndex >= exercises.length ||
    toIndex < 0 ||
    toIndex >= exercises.length ||
    fromIndex === toIndex
  ) {
    return exercises;
  }

  const reorderedExercises = [...exercises];
  const [movedExercise] = reorderedExercises.splice(fromIndex, 1);
  reorderedExercises.splice(toIndex, 0, movedExercise);

  return reorderedExercises;
}
