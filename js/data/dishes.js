export const DEFAULT_DISHES = [
  // --- DESAYUNOS (6) ---
  { n: "Desayuno clásico: Avena, matcha, aguacate y jamón cocido", t: "desayuno", i: [["Bebida de avena", 200], ["Matcha", 4], ["Pan", 60], ["Aguacate", 50], ["Jamón cocido", 40]] },
  { n: "Tostadas con huevos revueltos, pavo y café", t: "desayuno", i: [["Pan", 70], ["Huevo", 110], ["Fiambre de pavo", 60], ["Aceite de oliva", 5], ["Café (solo o infusión)", 150]] },
  { n: "Tortitas proteicas de avena con yogur y arándanos", t: "desayuno", i: [["Copos de avena", 60], ["Huevo", 110], ["Yogur proteico", 120], ["Arándanos congelados", 80]] },
  { n: "Tostada de atún con tomate fresco, fruta y café", t: "desayuno", i: [["Pan", 70], ["Atún en aceite", 60], ["Tomate", 80], ["Aceite de oliva", 5], ["Pieza de fruta", 150], ["Café (solo o infusión)", 150]] },
  { n: "Tostada de jamón serrano, zumo natural de naranja y café", t: "desayuno", i: [["Pan", 70], ["Jamón serrano", 50], ["Tomate", 60], ["Aceite de oliva", 8], ["Zumo de naranja natural", 200], ["Café (solo o infusión)", 150]] },
  { n: "Porridge bowl de avena templada con nueces y fruta", t: "desayuno", i: [["Copos de avena", 60], ["Bebida de avena", 200], ["Nueces", 20], ["Pieza de fruta", 150]] },

  // --- COMIDAS ---
  { n: "Huevo cocido + ensalada de arroz con atún", t: "comida", i: [["Huevo", 55], ["Atún en aceite", 60], ["Tomate", 50], ["Arroz (seco)", 65], ["Maíz cocido", 30], ["Zanahoria", 30], ["Pimiento rojo", 25], ["Guisantes", 20], ["Aceite de oliva", 10]] },
  { n: "Asado de pollo con verduras y patatas", t: "comida", i: [["Pollo muslo y contramuslo", 200], ["Tomate", 90], ["Patata", 90], ["Vino blanco", 60], ["Calabacín", 50], ["Cebolla", 50], ["Aceite de oliva", 15]] },
  { n: "Tortilla de patatas + salchicha a la plancha", t: "comida", i: [["Huevo", 110], ["Patata", 90], ["Aceite de oliva", 33], ["Salchicha fresca", 75]] },
  { n: "Huevo cocido + ensalada de lentejas + quinoa", t: "comida", i: [["Huevo", 55], ["Tomate", 90], ["Lentejas (secas)", 70], ["Atún en aceite", 60], ["Pimiento rojo", 50], ["Cebolla", 25], ["Aceite de oliva", 10], ["Quinoa cocida", 60]] },
  { n: "Gazpacho + pimientos rellenos de carne", t: "comida", i: [["Gazpacho", 250], ["Pimiento rojo", 180], ["Ternera magra", 100], ["Calabacín", 30], ["Sofrito de tomate", 30], ["Zanahoria", 30], ["Cebolla", 25], ["Queso rallado", 15], ["Aceite de oliva", 5], ["Ajo", 5]] },
  { n: "Gazpacho con tropezones + hamburguesa de ternera", t: "comida", i: [["Gazpacho", 250], ["Jamón serrano", 40], ["Picatostes", 15], ["Hamburguesa de ternera", 180], ["Aceite de oliva", 10]] },
  { n: "Ensalada de pasta completa con atún", t: "comida", i: [["Tomate", 90], ["Atún en aceite", 60], ["Pasta (seca)", 60], ["Huevo", 55], ["Queso fresco 0%", 50], ["Lechuga", 40], ["Maíz cocido", 20], ["Zanahoria", 20], ["Tápenas", 15], ["Aceite de oliva", 5]] },
  { n: "Pollo con gnocchi al pesto", t: "comida", i: [["Pechuga de pollo", 220], ["Gnocchi", 150], ["Tomate", 50], ["Mozzarella", 20], ["Aceite de oliva", 10], ["Pesto", 10]] },
  { n: "Arroz meloso con pollo, verduras y azafrán", t: "comida", i: [["Pechuga de pollo", 200], ["Arroz (seco)", 70], ["Tomate", 80], ["Pimiento rojo", 50], ["Judías verdes", 60], ["Aceite de oliva", 10]] },
  { n: "Pasta salteada con ternera picada y sofrito casero", t: "comida", i: [["Pasta (seca)", 65], ["Ternera magra", 170], ["Sofrito de tomate", 60], ["Calabacín", 60], ["Aceite de oliva", 8]] },
  { n: "Lentejas estofadas con verduras, patata y pavo", t: "comida", i: [["Lentejas (secas)", 70], ["Fiambre de pavo", 110], ["Patata", 90], ["Zanahoria", 50], ["Pimiento verde", 40], ["Aceite de oliva", 8]] },
  { n: "Fajitas de pollo marinadas con tiras de verduras", t: "comida", i: [["Pechuga de pollo", 210], ["Torta de fajita", 70], ["Pimiento rojo", 60], ["Pimiento verde", 50], ["Cebolla", 50], ["Aceite de oliva", 10]] },
  { n: "Pizza proteica de masa fina con pavo, champiñón y rúcula", t: "comida", i: [["Pizza base con tomate", 150], ["Fiambre de pavo", 100], ["Mozzarella", 30], ["Tomate", 40], ["Canónigos", 30], ["Aceite de oliva", 5]] },
  { n: "Ensalada tibia de quinoa, atún, maíz y huevo cocido", t: "comida", i: [["Quinoa cocida", 130], ["Atún en aceite", 70], ["Huevo", 55], ["Maíz cocido", 40], ["Tomate", 80], ["Zanahoria", 30], ["Aceite de oliva", 7]] },
  { n: "Pollo rustido al horno con patatas panadera y cebolla", t: "comida", i: [["Pollo muslo y contramuslo", 200], ["Patata", 110], ["Cebolla", 70], ["Pimiento rojo", 50], ["Vino blanco", 50], ["Aceite de oliva", 12]] },
  { n: "Gnocchi salteados con tiras de ternera y calabacín", t: "comida", i: [["Ternera magra", 160], ["Gnocchi", 150], ["Calabacín", 80], ["Cebolla", 40], ["Sofrito de tomate", 40], ["Aceite de oliva", 8]] },
  { n: "Arroz con atún, huevo a la plancha y tomate", t: "comida", i: [["Arroz (seco)", 70], ["Atún en aceite", 60], ["Huevo", 110], ["Sofrito de tomate", 50], ["Aceite de oliva", 8]] },
  { n: "Guiso express de merluza con patatas y guisantes", t: "comida", i: [["Merluza", 220], ["Patata", 110], ["Guisantes", 60], ["Tomate", 60], ["Cebolla", 40], ["Vino blanco", 40], ["Aceite de oliva", 10]] },

  // --- CENAS ---
  { n: "Gazpacho + fajita de pollo desmenuzado", t: "cena", i: [["Gazpacho", 250], ["Pollo en tiras", 110], ["Torta de fajita", 70], ["Pimiento verde", 50], ["Pimiento rojo", 50], ["Cebolla", 50], ["Aceite de oliva", 10]] },
  { n: "Ensalada de canónigos + tortilla francesa de 2 huevos", t: "cena", i: [["Tomate", 90], ["Atún en aceite", 60], ["Canónigos", 40], ["Fiambre de pavo", 40], ["Queso fresco 0%", 35], ["Zanahoria", 30], ["Huevo", 110], ["Aceite de oliva", 20]] },
  { n: "Catalana (pan, jamón serrano y tomate)", t: "cena", i: [["Pan", 100], ["Jamón serrano", 60], ["Tomate", 45], ["Aceite de oliva", 5]] },
  { n: "Crema de verduras + pechuga a la plancha", t: "cena", i: [["Calabaza", 75], ["Puerro", 75], ["Zanahoria", 60], ["Patata", 45], ["Cebolla", 25], ["Pechuga de pollo", 220], ["Aceite de oliva", 10]] },
  { n: "Ensalada aliñada con huevo + pizza de jamón serrano", t: "cena", i: [["Huevo", 55], ["Tomate", 45], ["Lechuga", 40], ["Zanahoria", 30], ["Cebolla", 25], ["Aceite de oliva", 10], ["Pizza base con tomate", 150], ["Jamón serrano", 60], ["Mozzarella", 20]] },
  { n: "Crema de verduras + merluza a la plancha", t: "cena", i: [["Calabaza", 75], ["Puerro", 75], ["Zanahoria", 60], ["Patata", 45], ["Cebolla", 25], ["Merluza", 215], ["Aceite de oliva", 7]] },
  { n: "Ensalada de judías verdes con pavo y queso + huevo", t: "cena", i: [["Judías verdes", 200], ["Tomate", 90], ["Queso fresco 0%", 50], ["Fiambre de pavo", 110], ["Maíz cocido", 40], ["Huevo", 55]] },
  { n: "Salmorejo con jamón + tortilla de atún", t: "cena", i: [["Tomate", 250], ["Pan", 50], ["Jamón serrano", 40], ["Aceite de oliva", 15], ["Ajo", 5], ["Huevo", 110], ["Atún en aceite", 60]] },
  { n: "Fajita mexicana de ternera magra con pimientos y cebolla", t: "cena", i: [["Ternera magra", 160], ["Torta de fajita", 70], ["Pimiento rojo", 50], ["Pimiento verde", 50], ["Cebolla", 50], ["Aceite de oliva", 8]] },
  { n: "Pizza ligera de jamón cocido, queso fresco y orégano", t: "cena", i: [["Pizza base con tomate", 150], ["Jamón cocido", 90], ["Mozzarella", 25], ["Queso fresco 0%", 40], ["Tomate", 40], ["Aceite de oliva", 5]] },
  { n: "Revuelto campesino de 2 huevos con jamón serrano y tomate", t: "cena", i: [["Huevo", 110], ["Jamón serrano", 50], ["Tomate", 80], ["Pan", 40], ["Aceite de oliva", 8]] },
  { n: "Revuelto de pavo, claras y queso con ensalada verde", t: "cena", i: [["Huevo", 110], ["Fiambre de pavo", 80], ["Queso fresco 0%", 50], ["Canónigos", 40], ["Tomate", 60], ["Aceite de oliva", 8]] },
  { n: "Merluza a la plancha con judías verdes y patata cocida", t: "cena", i: [["Merluza", 220], ["Judías verdes", 160], ["Patata", 80], ["Ajo", 5], ["Aceite de oliva", 10]] },
  { n: "Hamburguesa de ternera con crema de calabacín y puerro", t: "cena", i: [["Hamburguesa de ternera", 170], ["Calabacín", 120], ["Puerro", 80], ["Patata", 50], ["Aceite de oliva", 8]] },
  { n: "Tortilla francesa con atún y gazpacho frío", t: "cena", i: [["Huevo", 110], ["Atún en aceite", 60], ["Gazpacho", 250], ["Aceite de oliva", 8]] },
  { n: "Crema de calabaza suave con pechuga de pollo a la plancha", t: "cena", i: [["Pechuga de pollo", 210], ["Calabaza", 100], ["Puerro", 60], ["Patata", 50], ["Zanahoria", 40], ["Aceite de oliva", 8]] },
  { n: "Ensalada templada de canónigos, pavo crujiente, huevo y picatostes", t: "cena", i: [["Fiambre de pavo", 110], ["Huevo", 55], ["Canónigos", 50], ["Picatostes", 20], ["Tomate", 70], ["Queso fresco 0%", 40], ["Aceite de oliva", 10]] },
  { n: "Pechuga de pollo con parrillada de verduras", t: "cena", i: [["Pechuga de pollo", 220], ["Calabacín", 90], ["Pimiento verde", 60], ["Cebolla", 60], ["Tomate", 60], ["Aceite de oliva", 10]] }
];

export const FIXED_SNACKS = {
  almuerzo: [["Pieza de fruta", 150], ["Pan", 60], ["Jamón cocido", 40]],
  meriendaDescanso: [["Pieza de fruta", 150], ["Nueces", 15], ["Tortita de arroz y legumbres", 15]],
  meriendaEntreno: [["Yogur proteico", 120], ["Arándanos congelados", 100], ["Nueces", 15]]
};