export default function userAvatar(name: string, single: boolean) {
  let initials = ' ';

  if (name) {
    if (single) {
      return name[0].toUpperCase();
    }
    const nameArray = name.split(' ');

    initials =
      nameArray[0][0].toUpperCase() +
      nameArray[nameArray.length - 1][0].toUpperCase();
  }
  return initials;
}
