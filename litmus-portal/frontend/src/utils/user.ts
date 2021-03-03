export default function userAvatar(name?: string) {
  return name
    ?.match(/(\b\S)?/g)
    ?.join('')
    .match(/(^\S|\S$)?/g)
    ?.join('')
    .toUpperCase();
}
