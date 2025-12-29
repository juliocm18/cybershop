import {supabase} from "../supabase";
import {Link} from "./model";
import {manipulateAsync, SaveFormat} from "expo-image-manipulator";
import PhotoPicker from "../utils/PhotoPicker";

export default class LinkFunctions {
  static getAllPaged = async (from: number, to: number): Promise<Link[] | null> => {
    const {data, error} = await supabase.from("link").select("*").order("name").range(from, to);
    if (error) throw new Error(error.message);
    return data as Link[];
  };

  static getAll = async (): Promise<Link[] | null> => {
    const {data, error} = await supabase.from("link").select("*").order("name");
    if (error) throw new Error(error.message);
    return data as Link[];
  };

  static save = async (link: Link): Promise<Link | null> => {
    const {data, error} = await supabase.from("link").insert([link]).select();
    if (error) throw new Error(error.message);
    return data ? (data[0] as Link) : null;
  };

  static update = async (
    linkId: number,
    partialLink: Partial<Link>
  ): Promise<Link | null> => {
    const {data, error} = await supabase
      .from("link")
      .update(partialLink)
      .eq("id", linkId)
      .select();
    if (error) throw new Error(error.message);
    return data ? data[0] : null;
  };

  static remove = async (linkId: number) => {
    const {data, error} = await supabase.from("link").delete().eq("id", linkId);
    if (error) throw new Error(error.message);
    return data;
  };

  static pickImage = async (): Promise<string | null> => {
    const uri = await PhotoPicker.pickSingleImage();

    if (!uri) {
      return null;
    }

    try {
      const manipResult = await manipulateAsync(
        uri,
        [{resize: {width: 128, height: 128}}],
        {compress: 0.7, format: SaveFormat.PNG}
      );
      return manipResult.uri;
    } catch (error) {
      throw new Error("No se pudo comprimir la imagen");
    }
  };

  static uploadImage = async (uri: string): Promise<string> => {
    const formData = await this.uriToFormData(uri); // ✅ Convertir URI a FormData

    const fileExt = uri.split(".").pop() || "png";
    const fileName = `${Date.now()}.${fileExt}`;
    const storageName = "link-logos";
    const filePath = `${storageName}/${fileName}`; // Ruta en Supabase
    const {data, error} = await supabase.storage
      .from(storageName)
      .upload(filePath, formData, {
        contentType: `image/${fileExt}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error("No se pudo comprimir la imagen");

    // ✅ Obtener la URL pública correctamente
    const publicUrl = supabase.storage.from(storageName).getPublicUrl(filePath)
      .data.publicUrl;
    return publicUrl;
  };

  static uriToFormData = async (uri: string): Promise<FormData> => {
    const fileExt = uri.split(".").pop() || "png"; // Extraer la extensión
    const fileName = `${Date.now()}.${fileExt}`; // Nombre único

    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: `image/${fileExt}`, // Tipo MIME correcto
    } as any); // `as any` evita errores de tipado en React Native

    return formData;
  };
}
