import { animalIcons } from "../constants/animalImages";

export function getRandomProfilePicture() {
  /*
  THIS IS FOR SETTING A RANDOM PROFILE PICTURE IF THERE IS NONE AVAILABLE UPLOADED BY THE USER
  */
  const animals = Object.keys(animalIcons);
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return animalIcons[randomAnimal];
}
