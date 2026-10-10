/**
 * Base de alimentos por defecto.
 * Valores por 100 g de producto:
 *   k = kcal · p = proteína · g = grasa · gSat = grasa saturada
 *   h = hidratos · az = azúcares · fib = fibra
 *   u = peso de una unidad en g (0 si se compra a granel) · un = nombre de la unidad
 * El usuario puede añadir o sobrescribir alimentos desde Ajustes (se guardan en state.foods).
 */
export const DEFAULT_FOODS = {
  "Bebida de avena": { cat: "Bebidas", k: 45, p: 1, g: 1.5, gSat: 0.2, h: 7.5, az: 4.5, fib: 0.8, u: 0, un: "" },
  "Vino blanco": { cat: "Bebidas", k: 82, p: 0.1, g: 0, gSat: 0, h: 2.6, az: 0.6, fib: 0, u: 0, un: "" },
  "Café (solo o infusión)": { cat: "Bebidas", k: 2, p: 0.2, g: 0, gSat: 0, h: 0.3, az: 0, fib: 0, u: 0, un: "" },
  "Zumo de naranja natural": { cat: "Bebidas", k: 42, p: 0.7, g: 0.2, gSat: 0, h: 10, az: 8.5, fib: 0.2, u: 0, un: "" },

  "Pechuga de pollo": { cat: "Carnes y embutidos", k: 110, p: 23, g: 1.5, gSat: 0.4, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Pollo muslo y contramuslo": { cat: "Carnes y embutidos", k: 155, p: 19, g: 8.5, gSat: 2.3, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Pollo en tiras": { cat: "Carnes y embutidos", k: 110, p: 23, g: 1.5, gSat: 0.4, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Ternera magra": { cat: "Carnes y embutidos", k: 140, p: 21, g: 6, gSat: 2.5, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Hamburguesa de ternera": { cat: "Carnes y embutidos", k: 170, p: 20, g: 10, gSat: 4, h: 0.5, az: 0.2, fib: 0, u: 180, un: "unidades" },
  "Salchicha fresca": { cat: "Carnes y embutidos", k: 300, p: 14, g: 26, gSat: 9.5, h: 2, az: 0.5, fib: 0, u: 75, un: "unidades" },
  "Jamón cocido": { cat: "Carnes y embutidos", k: 105, p: 18, g: 3, gSat: 1.1, h: 1.5, az: 1, fib: 0, u: 0, un: "" },
  "Jamón serrano": { cat: "Carnes y embutidos", k: 200, p: 30, g: 8, gSat: 3, h: 0.5, az: 0.2, fib: 0, u: 0, un: "" },
  "Pechuga de pavo": { cat: "Carnes y embutidos", k: 105, p: 24, g: 1, gSat: 0.3, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Solomillo de cerdo": { cat: "Carnes y embutidos", k: 125, p: 22, g: 4, gSat: 1.4, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Fiambre de pavo": { cat: "Carnes y embutidos", k: 95, p: 19, g: 1.5, gSat: 0.5, h: 1.5, az: 1, fib: 0, u: 0, un: "" },

  "Merluza": { cat: "Pescado", k: 80, p: 17, g: 1, gSat: 0.2, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Salmón": { cat: "Pescado", k: 200, p: 20, g: 13, gSat: 2.5, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Atún al natural": { cat: "Pescado", k: 105, p: 24, g: 1, gSat: 0.3, h: 0, az: 0, fib: 0, u: 52, un: "latas" },
  "Atún en aceite": { cat: "Pescado", k: 190, p: 26, g: 9, gSat: 1.3, h: 0, az: 0, fib: 0, u: 60, un: "latas" },

  "Huevo": { cat: "Huevos y lácteos", k: 145, p: 12.5, g: 10, gSat: 3, h: 0.7, az: 0.4, fib: 0, u: 55, un: "huevos" },
  "Claras de huevo": { cat: "Huevos y lácteos", k: 50, p: 11, g: 0.2, gSat: 0, h: 0.7, az: 0.7, fib: 0, u: 0, un: "" },
  "Queso fresco 0%": { cat: "Huevos y lácteos", k: 70, p: 12, g: 0.2, gSat: 0.1, h: 4, az: 4, fib: 0, u: 0, un: "" },
  "Queso cottage light": { cat: "Huevos y lácteos", k: 80, p: 13, g: 1.5, gSat: 0.8, h: 3, az: 2.8, fib: 0, u: 0, un: "" },
  "Mozzarella": { cat: "Huevos y lácteos", k: 250, p: 18, g: 19, gSat: 12, h: 1.5, az: 1, fib: 0, u: 0, un: "" },
  "Queso rallado": { cat: "Huevos y lácteos", k: 350, p: 25, g: 27, gSat: 17, h: 1.5, az: 0.5, fib: 0, u: 0, un: "" },
  "Yogur proteico": { cat: "Huevos y lácteos", k: 60, p: 10, g: 0.2, gSat: 0.1, h: 4.5, az: 4.0, fib: 0, u: 120, un: "yogures" },
  "Proteína de suero (Whey)": { cat: "Huevos y lácteos", k: 380, p: 78, g: 4, gSat: 2.5, h: 6, az: 4, fib: 0, u: 30, un: "cacitos" },

  "Pan": { cat: "Cereales, pan y pasta", k: 265, p: 8.5, g: 1.5, gSat: 0.3, h: 52, az: 2.5, fib: 3.5, u: 0, un: "" },
  "Arroz (seco)": { cat: "Cereales, pan y pasta", k: 350, p: 7, g: 1, gSat: 0.3, h: 77, az: 0.3, fib: 1.5, u: 0, un: "" },
  "Pasta (seca)": { cat: "Cereales, pan y pasta", k: 360, p: 12, g: 1.5, gSat: 0.3, h: 72, az: 3, fib: 3, u: 0, un: "" },
  "Gnocchi": { cat: "Cereales, pan y pasta", k: 140, p: 3, g: 0.5, gSat: 0.1, h: 30, az: 1.5, fib: 2, u: 0, un: "" },
  "Copos de avena": { cat: "Cereales, pan y pasta", k: 370, p: 13.5, g: 7, gSat: 1.3, h: 58, az: 1, fib: 10, u: 0, un: "" },
  "Quinoa cocida": { cat: "Cereales, pan y pasta", k: 120, p: 4.4, g: 1.9, gSat: 0.2, h: 21, az: 0.9, fib: 2.8, u: 0, un: "" },
  "Torta de fajita": { cat: "Cereales, pan y pasta", k: 300, p: 8, g: 7, gSat: 3, h: 50, az: 3.5, fib: 3, u: 40, un: "tortas" },
  "Tortita de arroz y legumbres": { cat: "Cereales, pan y pasta", k: 385, p: 12, g: 2.5, gSat: 0.5, h: 75, az: 1.5, fib: 5.5, u: 7.5, un: "tortitas" },
  "Picatostes": { cat: "Cereales, pan y pasta", k: 440, p: 10, g: 15, gSat: 2.2, h: 64, az: 4.5, fib: 4, u: 0, un: "" },
  "Maíz cocido": { cat: "Cereales, pan y pasta", k: 95, p: 3.2, g: 1.5, gSat: 0.3, h: 16.5, az: 4.5, fib: 2.5, u: 0, un: "" },
  "Lentejas (secas)": { cat: "Legumbres", k: 350, p: 24, g: 1.5, gSat: 0.3, h: 55, az: 2, fib: 15, u: 0, un: "" },

  "Tomate": { cat: "Verduras", k: 18, p: 0.9, g: 0.2, gSat: 0, h: 3, az: 2.6, fib: 1.2, u: 0, un: "" },
  "Patata": { cat: "Verduras", k: 77, p: 2, g: 0.1, gSat: 0, h: 17, az: 0.8, fib: 2.1, u: 0, un: "" },
  "Calabacín": { cat: "Verduras", k: 17, p: 1.2, g: 0.3, gSat: 0.1, h: 2.2, az: 1.8, fib: 1, u: 0, un: "" },
  "Cebolla": { cat: "Verduras", k: 40, p: 1.1, g: 0.1, gSat: 0, h: 8.5, az: 4.2, fib: 1.7, u: 0, un: "" },
  "Pimiento rojo": { cat: "Verduras", k: 31, p: 1, g: 0.3, gSat: 0, h: 6, az: 4.2, fib: 2.1, u: 0, un: "" },
  "Pimiento verde": { cat: "Verduras", k: 20, p: 0.9, g: 0.2, gSat: 0, h: 3.5, az: 2.4, fib: 1.4, u: 0, un: "" },
  "Zanahoria": { cat: "Verduras", k: 41, p: 0.9, g: 0.2, gSat: 0, h: 8, az: 4.7, fib: 2.8, u: 0, un: "" },
  "Judías verdes": { cat: "Verduras", k: 31, p: 1.8, g: 0.2, gSat: 0, h: 4.5, az: 1.5, fib: 3, u: 0, un: "" },
  "Guisantes": { cat: "Verduras", k: 80, p: 5, g: 0.4, gSat: 0.1, h: 12, az: 5, fib: 5, u: 0, un: "" },
  "Lechuga": { cat: "Verduras", k: 15, p: 1.4, g: 0.2, gSat: 0, h: 1.5, az: 1.2, fib: 1.5, u: 0, un: "" },
  "Canónigos": { cat: "Verduras", k: 20, p: 2, g: 0.4, gSat: 0.1, h: 1.5, az: 1, fib: 1.5, u: 0, un: "" },
  "Calabaza": { cat: "Verduras", k: 26, p: 1, g: 0.1, gSat: 0, h: 5.5, az: 2.5, fib: 1.2, u: 0, un: "" },
  "Puerro": { cat: "Verduras", k: 61, p: 1.5, g: 0.3, gSat: 0.1, h: 12, az: 3.5, fib: 2.5, u: 0, un: "" },
  "Ajo": { cat: "Verduras", k: 150, p: 6.4, g: 0.5, gSat: 0.1, h: 30, az: 1, fib: 2.1, u: 0, un: "" },
  "Gazpacho": { cat: "Verduras", k: 45, p: 0.8, g: 3, gSat: 0.5, h: 3.5, az: 2.5, fib: 1, u: 0, un: "" },

  "Pieza de fruta": { cat: "Fruta", k: 50, p: 0.6, g: 0.2, gSat: 0, h: 11, az: 10, fib: 2.2, u: 150, un: "piezas" },
  "Plátano": { cat: "Fruta", k: 90, p: 1.1, g: 0.3, gSat: 0.1, h: 20, az: 12, fib: 2.6, u: 120, un: "piezas" },
  "Manzana": { cat: "Fruta", k: 52, p: 0.3, g: 0.2, gSat: 0, h: 12, az: 10, fib: 2.4, u: 180, un: "piezas" },
  "Fresas": { cat: "Fruta", k: 33, p: 0.7, g: 0.3, gSat: 0, h: 6, az: 4.9, fib: 2, u: 0, un: "" },
  "Arándanos congelados": { cat: "Fruta", k: 45, p: 0.6, g: 0.3, gSat: 0, h: 9.5, az: 8, fib: 2.4, u: 0, un: "" },
  "Aguacate": { cat: "Fruta", k: 160, p: 2, g: 15, gSat: 2.1, h: 2, az: 0.5, fib: 7, u: 0, un: "" },

  "Aceite de oliva": { cat: "Aceites y grasas", k: 884, p: 0, g: 100, gSat: 14, h: 0, az: 0, fib: 0, u: 0, un: "" },
  "Nueces": { cat: "Frutos secos", k: 650, p: 15, g: 65, gSat: 6, h: 7, az: 2.6, fib: 7, u: 0, un: "" },
  "Almendras": { cat: "Frutos secos", k: 600, p: 21, g: 52, gSat: 4.5, h: 6, az: 4, fib: 12, u: 0, un: "" },
  "Crema de cacahuete": { cat: "Frutos secos", k: 600, p: 28, g: 48, gSat: 8, h: 12, az: 5, fib: 8, u: 0, un: "" },

  "Sofrito de tomate": { cat: "Salsas y conservas", k: 85, p: 1.5, g: 4.5, gSat: 0.6, h: 9, az: 6, fib: 1.8, u: 0, un: "" },
  "Pesto": { cat: "Salsas y conservas", k: 450, p: 5, g: 45, gSat: 6.5, h: 6, az: 3, fib: 2, u: 0, un: "" },
  "Tápenas": { cat: "Salsas y conservas", k: 150, p: 1, g: 14, gSat: 2, h: 4, az: 1, fib: 2, u: 0, un: "" },
  "Pizza base con tomate": { cat: "Precocinados", k: 240, p: 8, g: 4, gSat: 1.2, h: 42, az: 3.5, fib: 2.5, u: 0, un: "" },
  "Matcha": { cat: "Otros", k: 324, p: 30, g: 5, gSat: 0.7, h: 39, az: 1, fib: 29, u: 0, un: "" }
};
