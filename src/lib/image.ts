// Supabase Storage transformations: append width/quality query params.
// Public URL pattern: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
// Render endpoint:    https://<project>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=...
// For non-Supabase URLs we just return the original.
export const getOptimizedImage = (url: string | undefined, width = 600, quality = 70): string => {
  if (!url) return "";
  if (url.includes("/storage/v1/object/public/")) {
    const transformed = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
    const sep = transformed.includes("?") ? "&" : "?";
    return `${transformed}${sep}width=${width}&quality=${quality}&resize=cover`;
  }
  return url;
};
