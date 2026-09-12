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
  ['shampoo','Shampoo reparación','Savital','cuidado-personal',14500,9,'550 ml','🧴'], ['chocolate','Chocolate con leche','Jet','snacks',4200,35,'50 g','🍫']
].map(([sku,name,brand,category,price,stock,unit,emoji]) => ({ sku, name, brand, category, price, stock, unit, emoji, available: stock > 0, description: `${name} seleccionado para MarkECIA.`, rating: 4.7, reviews: 0, updatedAt: new Date() }));

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
