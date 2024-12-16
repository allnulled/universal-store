(function (factory) {
  const name = "UFS_manager";
  const modulo = factory();
  if (typeof window !== 'undefined') {
    window[name] = modulo;
  }
  if (typeof module !== 'undefined') {
    module.exports = modulo;
  }
  if (typeof global !== 'undefined') {
    global[name] = modulo;
  }
  return modulo;
})(function () {
  const FilesystemError = class extends Error {
      constructor(...args) {
          super(...args);
          this.name = "FilesystemError";
      }
  }
  const UFS_manager_for_node = class {
    constructor() {
      // @OK
    }
    trace(method) {
      console.log("[ufs][" + method + "]");
    }
    resolve_path(...args) {
      this.trace("resolve_path");
      return require("path").resolve(...args);
    }
    get_current_directory() {
      this.trace("get_current_directory");
      return process.cwd();
    }
    change_directory(node) {
      this.trace("change_directory");
      return process.chdir(node);
    }
    rename(node, node2) {
      this.trace("rename");
      return require("fs").renameSync(node, node2);
    }
    read_directory(node) {
      this.trace("read_directory");
      return require("fs").readdirSync(node).reduce((out, item) => {
        const subnode_fullpath = require("path").resolve(node, item);
        out[item] = require("fs").lstatSync(subnode_fullpath).isFile() ? "..." : {};
        return out;
      }, {});
    }
    read_file(node) {
      this.trace("read_file");
      return require("fs").readFileSync(node).toString();
    }
    make_directory(node) {
      this.trace("make_directory");
      return require("fs").mkdirSync(node);
    }
    write_file(node, contents) {
      this.trace("write_file");
      return require("fs").writeFileSync(node, contents);
    }
    exists(node) {
      this.trace("exists");
      return require("fs").existsSync(node);
    }
    is_file(node) {
      this.trace("is_file");
      return require("fs").lstatSync(node).isFile();
    }
    is_directory(node) {
      this.trace("is_directory");
      return require("fs").lstatSync(node).isDirectory();
    }
    delete_file(node) {
      this.trace("delete_file");
      return require("fs").unlinkSync(node);
    }
    delete_directory(node) {
      this.trace("delete_directory");
      return require("fs").rmdirSync(node, { recursive: true });
    }
  }
  const UFS_manager_for_browser = class extends UFS_manager_for_node {
    constructor(storage_id = "ufs_main_storage") {
      super();
      this.storage_id = storage_id;
      this.current_directory = this.environment === "node" ? process.cwd : "/";
    }
    get_persisted_data() {
      this.trace("get_persisted_data");
      if(!(this.storage_id in localStorage)) {
        localStorage[this.storage_id] = '{"files":{}}';
      }
      const data = JSON.parse(localStorage[this.storage_id]);
      return data;
    }
    set_persisted_data(data) {
      this.trace("set_persisted_data");
      localStorage[this.storage_id] = JSON.stringify(data);
    }
    remove_slash_end(txt) {
      // this.trace("remove_slash_end");
      const txt2 = txt.replace(/\/$/g, "");
      if(txt2.length === 0) {
        return "/";
      }
      return txt2;
    }
    remove_repeated_slahes(txt) {
      // this.trace("remove_repeated_slahes");
      return txt.replace(/\/(\/)+/g, "/");
    }
    resolve_path(...args) {
      this.trace("resolve_path");
      Validate_args: {
        if(args.length === 0) {
          throw new Error("Method «resolve_path» requires 1 or more parameters");
        }
        for(let index_parameter=0; index_parameter<args.length; index_parameter++) {
          const arg = args[index_parameter];
          if(typeof arg !== "string") {
            throw new Error("Method «resolve_path» requires only strings as parameters (on index «" + index_parameter + "»)");
          }
        }
      }
      let path_parts = [];
      Format_path: {
        const replace_last_slash_for_nothing = arg => this.remove_slash_end(arg);
        path_parts = args.map(replace_last_slash_for_nothing);
        if(!path_parts[0].startsWith("/")) {
          path_parts.unshift(this.current_directory.replace(/\/$/g, ""));
        }
      }
      let path_text = "";
      Join_path: {
        const replace_fist_slash_for_nothing = arg => arg.replace(/^\//g, "");
        for(let index_part=0; index_part<path_parts.length; index_part++) {
          const path_part = path_parts[index_part];
          if(path_part.startsWith("/")) {
            path_text = path_part;
          } else {
            if(path_text !== "/") {
              path_text += "/";
            }
            path_text += path_part.replace(replace_fist_slash_for_nothing);
          }
        }
      }
      Fix_slash_repetitions: {
        path_text = this.remove_repeated_slahes(path_text);
      }
      Resolve_double_dots: {
        const parts = path_text.split("/");
        const stack = [];
        Iterating_parts:
        for(const part of parts) {
          if(part === "" || part === ".") {
            continue Iterating_parts;
          } else if(part === "..") {
            if(stack.length > 0) {
              stack.pop();
            }
          } else {
            stack.push(part);
          }
        }
        path_text = "/" + stack.join("/");
      }
      return path_text;
    }
    get_current_directory() {
      this.trace("get_current_directory");
      return this.resolve_path(this.current_directory);
    }
    change_directory(node) {
      this.trace("change_directory");
      const is_directory = this.exists(node);
      if(!is_directory) {
        throw new FilesystemError("Cannot «change_directory» because destination does not exist at: «" + this.resolve_path(node) + "»");
      }
      this.current_directory = this.resolve_path(node);
      return this.current_directory;
    }
    operate_on_node(node, callback, should_persist = true) {
      this.trace("operate_on_node");
      const data = this.get_persisted_data();
      const node_solved = this.resolve_path(node);
      const node_parts = node_solved.split("/").filter(p => p !== "");
      const root = data.files;
      const current_index = ["data"];
      let pivot = root;
      let output = undefined;
      if(node_parts.length === 0) {
        output = callback(data, "files", current_index);
      } else {
        for(let index_part=0; index_part<node_parts.length; index_part++) {
          const node_part = node_parts[index_part];
          if(index_part === (node_parts.length-1)) {
            output = callback(pivot, node_part, current_index);
          } else {
            pivot = pivot[node_part];
          }
          current_index.push(node_part);
        }
      }
      if(should_persist) {
        this.set_persisted_data(data);
      }
      return output;
    }
    read_directory(node) {
      this.trace("read_directory");
      return this.operate_on_node(node, (pivot, last_property, index) => {
        if(!(last_property in pivot)) {
          throw new FilesystemError("Cannot «read_directory» because node does not exist at: «" + this.resolve_path(node) + "»");
        }
        if(typeof pivot[last_property] !== "object") {
          throw new FilesystemError("Cannot «read_directory» because node is a file at: «" + this.resolve_path(node) + "»");
        }
        return pivot[last_property];
      });
    }
    read_file(node) {
      this.trace("read_file");
      return this.operate_on_node(node, (pivot, last_property, index) => {
        if(!(last_property in pivot)) {
          throw new FilesystemError("Cannot «read_file» because node does not exist at: «" + this.resolve_path(node) + "»");
        }
        if(typeof pivot[last_property] !== "string") {
          throw new FilesystemError("Cannot «read_file» because node is a directory at: «" + this.resolve_path(node) + "»");
        }
        return pivot[last_property];
      });
    }
    make_directory(node) {
      this.trace("make_directory");
      this.operate_on_node(node, (pivot, last_property, index) => {
        if(last_property in pivot) {
          throw new FilesystemError("Cannot «make_directory» because node already exists at: «" + this.resolve_path(node) + "»");
        }
        pivot[last_property] = {};
      });
    }
    write_file(node, contents) {
      this.trace("write_file");
      this.operate_on_node(node, (pivot, last_property, index) => {
        if(last_property in pivot) {
          if(typeof pivot[last_property] !== "string") {
            throw new FilesystemError("Cannot «write_file» because node is a directory at: «" + this.resolve_path(node) + "»");
          }
        }
        pivot[last_property] = contents;
      });
    }
    exists(node) {
      this.trace("exists");
      return this.operate_on_node(node, (pivot, last_property, index) => {
        if(!(last_property in pivot)) {
          return false;
        }
        return true;
      }, false);
    }
    is_file(node) {
      this.trace("is_file");
      return this.operate_on_node(node, (pivot, last_property, index) => {
        if(!(last_property in pivot)) {
          return false;
        }
        if(typeof pivot[last_property] !== "string") {
          return false;
        }
        return true;
      }, false);
    }
    is_directory(node) {
      this.trace("is_directory");
      return this.operate_on_node(node, (pivot, last_property, index) => {
        if(!(last_property in pivot)) {
          return false;
        }
        if(typeof pivot[last_property] !== "object") {
          return false;
        }
        return true;
      }, false);
    }
    delete_file(node) {
      this.trace("delete_file");
      return this.operate_on_node(node, (pivot, last_property, index) => {
        if(typeof pivot[last_property] === "undefined") {
          throw new FilesystemError("Cannot «delete_file» because node does not exist at: «" + this.resolve_path(node) + "»");
        }
        if(typeof pivot[last_property] !== "string") {
          throw new FilesystemError("Cannot «delete_file» because node is a directory at: «" + this.resolve_path(node) + "»");
        }
        delete pivot[last_property];
        return true;
      }, true);
    }
    delete_directory(node) {
      this.trace("delete_directory");
      return this.operate_on_node(node, (pivot, last_property, index) => {
        if(typeof pivot[last_property] === "undefined") {
          console.log(pivot);
          console.log(last_property);
          throw new FilesystemError("Cannot «delete_directory» because does not exists at: «" + this.resolve_path(node) + "»");
        }
        if(typeof pivot[last_property] !== "object") {
          throw new FilesystemError("Cannot «delete_directory» because node is a file at: «" + this.resolve_path(node) + "»");
        }
        delete pivot[last_property];
        return true;
      }, true);
    }
    rename(node, node2) {
      this.trace("rename");
      const last_name = this.resolve_path(node2).split("/").filter(p => p !== "").pop();
      return this.operate_on_node(node, (pivot, last_property, index) => {
        if(typeof pivot[last_property] === "undefined") {
          throw new FilesystemError("Cannot «rename» because does not exists at: «" + this.resolve_path(node) + "»");
        }
        pivot[last_name] = pivot[last_property];
        pivot[last_property] = undefined;
        delete pivot[last_property];
        return true;
      }, true);
    }
  }
  return {
    node_driver: UFS_manager_for_node,
    browser_driver: UFS_manager_for_browser,
    create(...args) {
      const clazz = typeof global !== "undefined" ? UFS_manager_for_node : UFS_manager_for_browser;
      return new clazz(...args);
    }
  };
});