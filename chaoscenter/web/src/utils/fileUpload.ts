// Function to handle File upload
export function fileUpload(
  e: React.ChangeEvent<HTMLInputElement>,
  onUpload: (response: string, filename?: string) => void,
  onError: (err: string) => void
): void {
  e.stopPropagation();
  e.preventDefault();

  const file = e.target.files && e.target.files[0];
  if (file) {
    file
      .text()
      .then(response => {
        onUpload(response, file.name);
      })
      .catch(err => {
        onError(err);
      });
  }
}
