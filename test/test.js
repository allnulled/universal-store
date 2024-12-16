const Store = require(__dirname + "/../dist/store.js");
const store = new Store({ user: { name: "John", age: 30, hobbies: ["reading"] } });
const storepath = __dirname + "/db1.json";
store.hydrate(storepath);
const hobbies_watcher = function(event, path, state) {
  console.log("event:", event);
  console.log("path:", path);
  console.log("state:", state);
};
store.watch(["user", "hobbies"], hobbies_watcher);
store.push(["user", "hobbies"], "coding");
console.log(store.get(["user", "hobbies"]));
store.pop(["user", "hobbies"]);
console.log(store.get(["user", "hobbies"]));
store.add(["user"], "location", "USA");
console.log(store.get(["user"]));
store.remove(["user"], "location");
console.log(store.get(["user"])); 
store.dehydrate(storepath);