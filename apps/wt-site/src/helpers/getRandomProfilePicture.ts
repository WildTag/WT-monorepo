import { animalIcons } from "../constants/animalImages";

export function getRandomProfilePicture() {
  const animals = Object.keys(animalIcons);
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return animalIcons[randomAnimal];
}
