export const getAvatarUrl = (name) => {
  if (!name) return '';
  const sanitizedName = name.replace(' ', '+');
  return `https://ui-avatars.com/api/?name=${sanitizedName}&background=6d28d9&color=fff&bold=true`;
};