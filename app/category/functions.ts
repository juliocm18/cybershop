import {supabase} from "../supabase";
import {Category} from "./types";

export const getCategories = async (): Promise<Category[] | null> => {
  try {
    const {data, error} = await supabase.from("category").select("*").order("priority", {ascending: true});
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching categories:", error.message);
    return null;
  }
};

export const getCategoriesOrderByName = async (): Promise<Category[] | null> => {
  try {
    const {data, error} = await supabase.from("category").select("*").order("name", {ascending: true});
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching categories:", error.message);
    return null;
  }
};


export const getFormattedRoutes = async (
  categoryNames: string[]
): Promise<categoryHashMap[]> => {
  const formattedRoutes = categoryNames.map((obj, i) => ({
    key: `tab${i}`,
    title: `${obj}`,
  }));
  return formattedRoutes;
};

export const getCategoryNames = async (): Promise<string[]> => {
  const {data, error} = await supabase.from("category").select("name").order("priority", {ascending: true});
  if (error) throw new Error(error.message);
  return data.map((category) => category.name);
};

export const createCategory = async (
  name: string,
  priority: number
): Promise<Category | null> => {
  try {
    //const {data, error} = await supabase.from("category").insert([{name}]);
    const {data, error} = await supabase
      .from("category")
      .upsert({name, priority})
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error: any) {
    console.error("Error creating category:", error.message);
    return null;
  }
};

export const updateCategoryInCompanies = async (
  oldCategoryName: string,
  newCategoryName: string
): Promise<boolean> => {
  try {
    console.log(`🔄 Iniciando actualización de categoría: "${oldCategoryName}" → "${newCategoryName}"`);
    
    // Obtener TODAS las compañías (sin filtro)
    const {data: allCompanies, error: fetchError} = await supabase
      .from("company")
      .select("id, name, categories");

    if (fetchError) {
      console.error("❌ Error obteniendo compañías:", fetchError);
      throw fetchError;
    }

    console.log(`📊 Total de compañías en BD: ${allCompanies?.length || 0}`);

    // Filtrar manualmente las que tienen la categoría antigua
    const companiesToUpdate = allCompanies?.filter(company => 
      company.categories && 
      Array.isArray(company.categories) && 
      company.categories.includes(oldCategoryName)
    ) || [];

    console.log(`🎯 Compañías que tienen "${oldCategoryName}": ${companiesToUpdate.length}`);
    
    if (companiesToUpdate.length > 0) {
      console.log("📋 Compañías a actualizar:", companiesToUpdate.map(c => c.name));
    }

    if (companiesToUpdate.length === 0) {
      console.log("ℹ️ No se encontraron compañías con la categoría:", oldCategoryName);
      return true;
    }

    // Actualizar cada compañía
    const updatePromises = companiesToUpdate.map(async (company) => {
      // Reemplazar el nombre antiguo por el nuevo en el array
      const updatedCategories = company.categories.map((cat: string) =>
        cat === oldCategoryName ? newCategoryName : cat
      );

      // console.log(`  ↳ Actualizando "${company.name}":`, company.categories, "→", updatedCategories);

      // Actualizar la compañía
      const {error: updateError} = await supabase
        .from("company")
        .update({categories: updatedCategories})
        .eq("id", company.id);

      if (updateError) {
        console.error(`❌ Error actualizando compañía ${company.name}:`, updateError);
        throw updateError;
      }
    });

    await Promise.all(updatePromises);
    // console.log("✅ Todas las compañías actualizadas exitosamente");
    return true;
  } catch (error: any) {
    console.error("❌ Error updating categories in companies:", error.message);
    return false;
  }
};

export const updateCategory = async (
  id: number,
  name: string,
  priority: number,
  oldName?: string
): Promise<Category | null> => {
  try {
    // Si el nombre cambió, actualizar también en las compañías
    if (oldName && oldName !== name) {
      console.log(`Actualizando categoría de "${oldName}" a "${name}" en compañías...`);
      const companiesUpdated = await updateCategoryInCompanies(oldName, name);
      if (!companiesUpdated) {
        console.warn("Hubo problemas actualizando las compañías");
      }
    }

    const {data, error} = await supabase
      .from("category")
      .update({name, priority})
      .match({id})
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error: any) {
    console.error("Error updating category:", error.message);
    return null;
  }
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const {error} = await supabase.from("category").delete().match({id});

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error("Error deleting category:", error.message);
    return false;
  }
};

export default {
  getCategories,
  getCategoryNames,
  createCategory,
  updateCategory,
  updateCategoryInCompanies,
  deleteCategory,
};
