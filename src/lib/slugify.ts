export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/̀-ͯ/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function productSlug(descripcion: string, codigo: number): string {
  return `${slugify(descripcion)}-${codigo}`;
}
