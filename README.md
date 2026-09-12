# NavierStokes API Gateway

Gateway HTTP en Node.js y tres microservicios mínimos, sin dependencias externas.

## Inicio

Requiere Node.js 18 o superior.

```bash
npm start
```

Puertos: gateway `3000`, users `3001`, warehouse `3002`, IA `3003`.
Todo el acceso público se hace a través del gateway:

```bash
# Estado del gateway
curl http://localhost:3000/health

# Users
curl -X POST http://localhost:3000/api/users/users -H "content-type: application/json" -d "{\"name\":\"Ana\",\"email\":\"ana@example.com\"}"
curl http://localhost:3000/api/users/users

# Warehouse
curl -X POST http://localhost:3000/api/warehouse/items -H "content-type: application/json" -d "{\"name\":\"Teclado\",\"quantity\":5}"
curl http://localhost:3000/api/warehouse/items

# IA (respuesta simulada local; no necesita clave)
curl -X POST http://localhost:3000/api/ia/generate -H "content-type: application/json" -d "{\"prompt\":\"Resume el inventario\"}"
```

Los datos de users y warehouse se mantienen en memoria y se reinician al detener los servicios. Para integrar un proveedor de IA real, sustituye la respuesta de `services/ia/server.js` por su llamada autenticada.
