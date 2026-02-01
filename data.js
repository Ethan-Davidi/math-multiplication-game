// Build the multiplication exercises: 1..6 times 1..10
// Total = 6 * 10 = 60 exercises
const EXERCISES = [];

for (let a = 1; a <= 6; a++) {
  for (let b = 1; b <= 10; b++) {
    EXERCISES.push({ a, b, answer: a * b });
  }
}
