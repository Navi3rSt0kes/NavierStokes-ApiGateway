const bcrypt = require('bcryptjs');
const { getCollections } = require('./database');

const products = [
  ['aguacate-hass','Aguacate Hass','Campo Vivo','frutas',4800,30,'Unidad','🥑'], ['tomate-chonto','Tomate chonto','Campo Vivo','frutas',4900,12,'500 g','🍅'],
  ['manzana-roja','Manzanas rojas','Campo Vivo','frutas',8900,4,'1 kg','🍎'], ['banano-criollo','Banano criollo','Campo Vivo','frutas',4200,0,'1 kg','🍌'],
  ['pechuga-pollo','Pechuga de pollo','Granja Real','carnes',18900,20,'500 g','🍗'], ['carne-molida','Carne molida premium','La Finca','carnes',22400,6,'500 g','🥩'],
  ['leche-entera','Leche entera','Alpina','lacteos',5900,40,'1 L','🥛'], ['yogurt-griego','Yogurt griego','Alpina','lacteos',9600,8,'500 g','🥣'],
  ['pan-campesino','Pan campesino','Pan del Día','panaderia',8500,15,'500 g','🥖'], ['croissant-mantequilla','Croissant de mantequilla','Pan del Día','panaderia',3900,3,'Unidad','🥐'],
  ['cafe-molido','Café molido','Juan Valdez','bebidas',16800,25,'340 g','☕'], ['jugo-naranja','Jugo de naranja','Del Valle','bebidas',7200,11,'1 L','🧃'],
  ['arroz-premium','Arroz premium','Diana','despensa',7200,50,'1 kg','🍚'], ['pasta-spaghetti','Pasta spaghetti','Doria','despensa',5300,26,'500 g','🍝'],
  ['papas-naturales','Papas naturales','Margarita','snacks',5800,19,'150 g','🥔'], ['galletas-avena','Galletas de avena','Noel','snacks',6400,7,'6 unidades','🍪'],
  ['verduras-mixtas','Verduras mixtas congeladas','La Huerta','congelados',12400,9,'500 g','🫛'], ['helado-vainilla','Helado de vainilla','Crem Helado','congelados',15800,2,'1 L','🍨'],
  ['detergente-liquido','Detergente líquido','Ariel','limpieza',21900,18,'1.8 L','🧼'], ['jabon-manos','Jabón de manos','Dove','cuidado-personal',9900,5,'250 ml','🧴']
  ,['zanahoria','Zanahoria fresca','Campo Vivo','frutas',3800,24,'500 g','🥕'], ['espinaca','Espinaca baby','Campo Vivo','frutas',6900,10,'250 g','🥬'],
  ['queso-campesino','Queso campesino','Alpina','lacteos',12500,14,'400 g','🧀'], ['huevos-aa','Huevos AA','Kikes','despensa',13800,30,'12 unidades','🥚'],
  ['atun-agua','Atún en agua','Van Camps','despensa',7200,21,'160 g','🐟'], ['agua-sin-gas','Agua sin gas','Cristal','bebidas',2800,45,'600 ml','💧'],
  ['pizza-vegetariana','Pizza vegetariana','La Huerta','congelados',18900,6,'450 g','🍕'], ['esponja-cocina','Esponja para cocina','Scotch-Brite','limpieza',4900,16,'3 unidades','🧽'],
  ['shampoo','Shampoo reparación','Savital','cuidado-personal',14500,9,'550 ml','🧴'], ['chocolate','Chocolate con leche','Jet','snacks',4200,35,'50 g','🍫'],
  ['cebolla-cabezona','Cebolla cabezona','Campo Vivo','frutas',4200,28,'1 kg','🧅'], ['ajo','Ajo fresco','Campo Vivo','frutas',3500,20,'250 g','🧄'],
  ['pimenton-rojo','Pimentón rojo','Campo Vivo','frutas',5400,14,'500 g','🫑'], ['cilantro','Cilantro fresco','Campo Vivo','frutas',2200,20,'Manojo','🌿'],
  ['papa-pastusa','Papa pastusa','Campo Vivo','frutas',6200,25,'1 kg','🥔'], ['limon-tahiti','Limón Tahití','Campo Vivo','frutas',4800,18,'1 kg','🍋'],
  ['muslos-pollo','Muslos de pollo','Granja Real','carnes',17200,16,'1 kg','🍗'], ['salmon','Filete de salmón','Ocean Fresh','carnes',38900,9,'400 g','🐟'],
  ['tortillas','Tortillas de maíz','Doña Arepa','despensa',7900,22,'10 unidades','🫓'], ['frijol-rojo','Fríjol rojo','Diana','despensa',8400,19,'500 g','🫘'],
  ['lentejas','Lentejas seleccionadas','Diana','despensa',7600,21,'500 g','🫘'], ['aceite-oliva','Aceite de oliva extra virgen','Carbonell','despensa',26900,12,'500 ml','🫒'],
  ['salsa-tomate','Salsa de tomate italiana','Barilla','despensa',9900,16,'400 g','🍅'], ['crema-leche','Crema de leche','Alpina','lacteos',6800,18,'200 ml','🥛'],
  ['mozzarella','Queso mozzarella','Colanta','lacteos',13900,13,'400 g','🧀'], ['mantequilla','Mantequilla con sal','Alpina','lacteos',10200,15,'250 g','🧈'],
  ['avena','Avena en hojuelas','Quaker','despensa',11800,17,'400 g','🥣'], ['miel','Miel de abejas','Apis','despensa',18500,11,'300 g','🍯'],
  ['granola','Granola frutos rojos','Naturela','snacks',14900,14,'350 g','🥣'], ['nueces','Nueces premium','Naturela','snacks',19800,8,'200 g','🌰'],
  ['harina-trigo','Harina de trigo','Haz de Oros','despensa',6900,30,'1 kg','🌾'], ['azucar','Azúcar refinada','Incauca','despensa',5200,35,'1 kg','🍚'],
  ['cacao','Cacao en polvo premium','Luker','despensa',12400,18,'250 g','🍫'], ['chispas-chocolate','Chispas de chocolate','Luker','snacks',9800,16,'200 g','🍫'],
  ['vainilla','Esencia de vainilla','McCormick','despensa',8200,14,'120 ml','🌼'], ['polvo-hornear','Polvo para hornear','Royal','despensa',4500,22,'100 g','🧁'],
  ['fresas','Fresas frescas','Campo Vivo','frutas',10900,12,'500 g','🍓'], ['arandanos','Arándanos premium','Campo Vivo','frutas',14800,9,'250 g','🫐'],
  ['banano-maduro','Banano maduro','Campo Vivo','frutas',4200,26,'1 kg','🍌'], ['gelatina','Gelatina sin sabor','Royal','despensa',5300,18,'30 g','🍮'],
  ['leche-condensada','Leche condensada','La Lechera','lacteos',8900,15,'395 g','🥛'], ['arequipe','Arequipe tradicional','Alpina','lacteos',7600,17,'250 g','🍮'],
  ['helado-chocolate','Helado de chocolate','Crem Helado','congelados',15800,11,'1 L','🍨'], ['galletas-vainilla','Galletas de vainilla','Noel','snacks',6200,24,'300 g','🍪']
].map(([sku,name,brand,category,price,stock,unit,emoji], index) => ({ sku, name, brand, category, price, stock, unit, emoji, available: stock > 0, description: `${name} seleccionado para MarkECIA.`, rating: Number((4.55 + (index % 5) * 0.1).toFixed(1)), reviews: 80 + index * 17, updatedAt: new Date() }));

async function seedDatabase() {
  const buyerPassword = process.env.DEMO_BUYER_PASSWORD;
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD;
  if (!buyerPassword || !adminPassword) throw new Error('DEMO_BUYER_PASSWORD y DEMO_ADMIN_PASSWORD son obligatorios para sembrar cuentas demo');
  const { users, products: productCollection, carts, orders } = await getCollections();
  await Promise.all(products.map((product) => productCollection.updateOne({ sku: product.sku }, { $set: product, $setOnInsert: { createdAt: new Date() } }, { upsert: true })));
  for (const [email, name, role, password] of [['buyer@markecia.demo','Comprador Demo','BUYER',buyerPassword], ['admin@markecia.demo','Administrador Demo','ADMIN',adminPassword]]) {
    await users.updateOne({ email }, { $set: { name, email, role, passwordHash: await bcrypt.hash(password, 12), updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
  }
  const buyer = await users.findOne({ email: 'buyer@markecia.demo' });
  await carts.updateOne({ userId: buyer._id }, { $setOnInsert: { userId: buyer._id, items: [], updatedAt: new Date(), createdAt: new Date() } }, { upsert: true });
  const sample = await productCollection.find({ sku: { $in: ['arroz-premium','leche-entera'] } }).toArray();
  await orders.updateOne({ reference: 'MK-DEMO-001' }, { $setOnInsert: { reference: 'MK-DEMO-001', userId: buyer._id, status: 'ENTREGADO', items: sample.map((p) => ({ productId: p._id, name: p.name, quantity: 1, price: p.price })), total: sample.reduce((total, p) => total + p.price, 0), createdAt: new Date() } }, { upsert: true });
}

module.exports = { seedDatabase };
