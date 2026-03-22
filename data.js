// Build the multiplication exercises: 1..10 times 1..10
// Total = 10 * 10 = 100 exercises
const EXERCISES = [];

for (let a = 1; a <= 10; a++) {
  for (let b = 1; b <= 10; b++) {
    EXERCISES.push({ a, b, answer: a * b });
  }
}
