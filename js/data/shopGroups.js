/**
 * shopGroups.js — Agrupación de alimentos para la lista de la compra.
 *
 * Cada grupo suma en una sola línea los gramos de todos sus alimentos
 * (p. ej. todas las piezas de pollo juntas), mostrando el desglose debajo.
 * Un alimento que no esté aquí forma su propio grupo, salvo que el usuario
 * le asigne un "Grupo de compra" (campo grp) desde Ajustes.
 */
export const SHOP_GROUPS = {
  'Pollo': ['Pechuga de pollo', 'Pollo muslo y contramuslo', 'Pollo en tiras'],
  'Pavo': ['Pechuga de pavo', 'Fiambre de pavo'],
  'Ternera': ['Ternera magra', 'Hamburguesa de ternera'],
  'Cerdo': ['Solomillo de cerdo', 'Salchicha fresca'],
  'Jamón': ['Jamón cocido', 'Jamón serrano'],
  'Pescado fresco': ['Merluza', 'Salmón'],
  'Atún en lata': ['Atún en aceite', 'Atún al natural'],
  'Huevos y claras': ['Huevo', 'Claras de huevo'],
  'Quesos': ['Queso fresco 0%', 'Queso cottage light', 'Mozzarella', 'Queso rallado'],
  'Proteína en polvo': ['Proteína de suero (Whey)', 'Proteína whey isolate'],
  'Pan y masas': ['Pan', 'Picatostes', 'Torta de fajita', 'Pizza base con tomate'],
  'Arroz y quinoa': ['Arroz (seco)', 'Quinoa cocida'],
  'Pasta y gnocchi': ['Pasta (seca)', 'Gnocchi'],
  'Verduras de hoja': ['Lechuga', 'Canónigos'],
  'Pimientos': ['Pimiento rojo', 'Pimiento verde'],
  'Cebolla, puerro y ajo': ['Cebolla', 'Puerro', 'Ajo'],
  'Calabacín y calabaza': ['Calabacín', 'Calabaza'],
  'Legumbre verde': ['Judías verdes', 'Guisantes'],
  'Fruta': ['Pieza de fruta', 'Plátano', 'Manzana', 'Fresas', 'Arándanos congelados'],
  'Frutos secos y cremas': ['Nueces', 'Almendras', 'Crema de cacahuete'],
  'Salsas y conservas': ['Sofrito de tomate', 'Pesto', 'Tápenas']
};

const REVERSE = Object.fromEntries(
  Object.entries(SHOP_GROUPS).flatMap(([g, list]) => list.map(n => [n, g]))
);

/** Grupo de compra de un alimento: el elegido por el usuario, el predefinido o su propio nombre. */
export function shopGroupOf(name, food) {
  return (food && food.grp) || REVERSE[name] || name;
}
