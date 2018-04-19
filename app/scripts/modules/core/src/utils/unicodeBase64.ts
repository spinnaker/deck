export const decodeUnicodeBase64 = (encodedString: string) =>
  decodeURIComponent(
    atob(encodedString)
      .split('')
      .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
