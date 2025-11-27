export const addTagToArray = (
  currentTag: string,
  existingTags: string[] | undefined,
  setTags: (tags: string[]) => void,
  clearCurrentTag: () => void,
) => {
  if (
    currentTag.trim() &&
    existingTags &&
    !existingTags.includes(currentTag.trim())
  ) {
    setTags([...(existingTags || []), currentTag.trim()]);
    clearCurrentTag();
  }
};

export const removeTagFromArray = (
  tagToRemove: string,
  existingTags: string[] | undefined,
  setTags: (tags: string[]) => void,
) => {
  setTags(existingTags?.filter((tag) => tag !== tagToRemove) || []);
};
