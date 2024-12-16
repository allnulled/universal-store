# universal-store

Gestor de estado para navegador y node.js.

## Instalación

### Descargar la librería

```
npm install -s @allnulled/universal-store
```

### Importar la librería

#### Modos de importar la librería

Dado que usa otras librerías, y pueden quererse usar desde otros módulos o no, puedes usar el archivo:

  - `store.js`: este fichero tiene todas las APIs necesarias.
  - `store.unbundled.js`: este fichero solo tiene la parte que le es propia, y sobreentiende que cargarás las otras librerías necesarias por tu propia cuenta.

**NOTA:** Por defecto, se usa `store.unbundled.js`.

#### En node.js

Puedes usar `require` o `import` indistintamente para importar el módulo.

#### En browser

```html
<script src="node_modules/@allnulled/universal-store/dist/store.js"></script>
```

O alternativamente:

```html
<script src="node_modules/@allnulled/universal-store/dist/lib/ufs.js"></script>
<script src="node_modules/@allnulled/universal-store/dist/store.unbundled.js"></script>
```

## API

### Crear una store

Para crear una store, desde node.js puedes:

```js
const store = require("@allnulled/universal-store").create();
```

Si estás en browser y no usas módulos, o si estás en node.js y no quieres usar require, puedes:

```js
const store = UniversalStore.create();
```

### Usar una store

Los métodos de la API disponibles por defecto son:

```js
store.get("property/id");
store.set("property/id", 1);
store.watch("property/id", function(event, property_path, value) {});
store.unwatch("property/id", previous_function);
store.delete("property/id");
store.push("property/id/to/array", 1);
store.pop("property/id/to/array");
store.unshift("property/id/to/array", 1);
store.shift("property/id/to/array");
store.add("property/id/to/object", "key", 1);
store.remove("property/id/to/object", "key");
store.splice("property/id/to/array", 5, 10, ...[1, 1, 1]);
store.extend("property/id/to/object", { more: "props" });
store.modify("property/id", function(value) { return "new value"; });
store.hydrate("file_to_read_from.json");
store.dehydrate("file_to_write_to.json");
```

Todos son métodos síncronos y no tienen alternativa.

Los métodos `hydrate` y `dehydrate` están polyfileados con la librería `ufs` o `universal-file-system`, de [allnulled](https://github.com/allnulled/universal-file-system) también. Así que puedes persistir el estado del store tanto en node.js como en el browser.# universal-store
