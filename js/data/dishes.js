export const DEFAULT_DISHES = [
  // --- DESAYUNOS (6) ---
  { n: "Desayuno clásico: Avena, matcha, aguacate y jamón cocido", t: "desayuno", i: [["Bebida de avena", 200], ["Matcha", 4], ["Pan", 60], ["Aguacate", 50], ["Jamón cocido", 40]] },
  { n: "Tostadas con huevos revueltos, pavo y café", t: "desayuno", i: [["Pan", 70], ["Huevo", 110], ["Fiambre de pavo", 60], ["Aceite de oliva", 5], ["Café (solo o infusión)", 150]] },
  { n: "Tortitas proteicas de avena con yogur y arándanos", t: "desayuno", i: [["Copos de avena", 60], ["Huevo", 110], ["Yogur proteico", 120], ["Arándanos congelados", 80]] },
  { n: "Tostada de atún con tomate fresco, fruta y café", t: "desayuno", i: [["Pan", 70], ["Atún en aceite", 60], ["Tomate", 80], ["Aceite de oliva", 5], ["Pieza de fruta", 150], ["Café (solo o infusión)", 150]] },
  { n: "Tostada de jamón serrano, zumo natural de naranja y café", t: "desayuno", i: [["Pan", 70], ["Jamón serrano", 50], ["Tomate", 60], ["Aceite de oliva", 8], ["Zumo de naranja natural", 200], ["Café (solo o infusión)", 150]] },
  { n: "Porridge bowl de avena templada con nueces y fruta", t: "desayuno", i: [["Copos de avena", 60], ["Bebida de avena", 200], ["Nueces", 20], ["Pieza de fruta", 150]] },

  // --- ALMUERZOS / MEDIA MAÑANA (5) ---
  { n: "Tostada con queso fresco 0% y pavo extra", t: "almuerzo", i: [["Pan", 50], ["Queso fresco 0%", 70], ["Fiambre de pavo", 70]] },
  { n: "Bowl de queso cottage con fruta y almendras", t: "almuerzo", i: [["Queso cottage light", 150], ["Pieza de fruta", 130], ["Almendras", 15]] },
  { n: "Revuelto de claras y jamón con tortita", t: "almuerzo", i: [["Claras de huevo", 150], ["Jamón cocido", 50], ["Tortita de arroz y legumbres", 15], ["Aceite de oliva", 3]] },
  { n: "Batido de proteína whey con bebida vegetal y fruta", t: "almuerzo", i: [["Proteína de suero (Whey)", 30], ["Bebida de avena", 200], ["Pieza de fruta", 130]] },
  { n: "Tosta de atún con tomate fresco y nueces", t: "almuerzo", i: [["Pan", 45], ["Atún en aceite", 60], ["Tomate", 60], ["Nueces", 10]] },

  // --- COMIDAS (10) ---
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

  // --- MERIENDAS / MEDIA TARDE (5) ---
  { n: "Yogur proteico con arándanos y nueces", t: "merienda", i: [["Yogur proteico", 150], ["Arándanos congelados", 80], ["Nueces", 15]] },
  { n: "Batido de proteína whey con crema de cacahuete", t: "merienda", i: [["Proteína de suero (Whey)", 30], ["Bebida de avena", 200], ["Crema de cacahuete", 15]] },
  { n: "Bowl proteico de cottage con arándanos y proteína", t: "merienda", i: [["Queso cottage light", 150], ["Proteína de suero (Whey)", 20], ["Arándanos congelados", 70]] },
  { n: "Tortitas con yogur proteico, fruta y cacahuete", t: "merienda", i: [["Tortita de arroz y legumbres", 15], ["Yogur proteico", 120], ["Pieza de fruta", 100], ["Crema de cacahuete", 10]] },
  { n: "Rollitos de pavo y queso fresco con fruta", t: "merienda", i: [["Fiambre de pavo", 70], ["Queso fresco 0%", 60], ["Pieza de fruta", 120]] },

  // --- CENAS (10) ---
  { n: "Gazpacho + fajita de pollo desmenuzado", t: "cena", i: [["Gazpacho", 250], ["Pollo en tiras", 110], ["Torta de fajita", 70], ["Pimiento verde", 50], ["Pimiento rojo", 50], ["Cebolla", 50], ["Aceite de oliva", 10]] },
  { n: "Ensalada de canónigos + tortilla francesa de 2 huevos", t: "cena", i: [["Tomate", 90], ["Atún en aceite", 60], ["Canónigos", 40], ["Fiambre de pavo", 40], ["Queso fresco 0%", 35], ["Zanahoria", 30], ["Huevo", 110], ["Aceite de oliva", 20]] },
  { n: "Catalana (pan, jamón serrano y tomate)", t: "cena", i: [["Pan", 100], ["Jamón serrano", 60], ["Tomate", 45], ["Aceite de oliva", 5]] },
  { n: "Crema de verduras + pechuga a la plancha", t: "cena", i: [["Calabaza", 75], ["Puerro", 75], ["Zanahoria", 60], ["Patata", 45], ["Cebolla", 25], ["Pechuga de pollo", 220], ["Aceite de oliva", 10]] },
  { n: "Ensalada aliñada con huevo + pizza de jamón serrano", t: "cena", i: [["Huevo", 55], ["Tomate", 45], ["Lechuga", 40], ["Zanahoria", 30], ["Cebolla", 25], ["Aceite de oliva", 10], ["Pizza base con tomate", 150], ["Jamón serrano", 60], ["Mozzarella", 20]] },
  { n: "Huevo frito con jamón serrano + patatas cocidas", t: "cena", i: [["Patata", 90], ["Jamón serrano", 75], ["Huevo", 55], ["Aceite de oliva", 20]] },
  { n: "Lomo de merluza con patata cocida y ensalada mixta", t: "cena", i: [["Merluza", 220], ["Patata", 100], ["Tomate", 70], ["Lechuga", 40], ["Cebolla", 30], ["Aceite de oliva", 10]] },
  { n: "Revuelto de huevos con calabacín y gambas/pavo", t: "cena", i: [["Huevo", 110], ["Fiambre de pavo", 80], ["Calabacín", 120], ["Cebolla", 30], ["Aceite de oliva", 10]] },
  { n: "Ensalada campera ligera con atún y huevo", t: "cena", i: [["Patata", 100], ["Atún en aceite", 60], ["Huevo", 55], ["Tomate", 70], ["Pimiento verde", 40], ["Aceite de oliva", 10]] },
  { n: "Pechuga de pollo a la plancha con verduras salteadas", t: "cena", i: [["Pechuga de pollo", 220], ["Calabacín", 90], ["Pimiento rojo", 60], ["Zanahoria", 40], ["Aceite de oliva", 10]] }
];
