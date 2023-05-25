export interface PostTags {
  id: number;
  pictureId: number;
  tag: AnimalTag;
  tagType: TagType;
}

export enum AnimalTag {
  DUCK = "duck",
  HERON = "heron",
  SWAN = "swan",
  PIDGEON = "pidgeon",
  MAGPIE = "magpie",
  CHAFFINCH = "chaffinch",
  BADGER = "badger",
  STOAK = "stoak",
  SQUIRREL = "squirrel",
  OTHER = "other",
}

export enum TagType {
  ANIMAL = "animal",
  LOCATION = "location",
  CATEGORY = "category",
  OTHER = "other",
}
