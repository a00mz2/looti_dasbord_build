// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: x0 => new Int16Array(x0),
      AC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      AD: x0 => x0.screen,
      AE: x0 => new ResizeObserver(x0),
      AF: x0 => x0.key,
      AG: x0 => x0.v8BreakIterator,
      AH: x0 => x0.selectionDirection,
      AI: x0 => x0.abort(),
      AJ: (x0,x1) => x0.createElement(x1),
      AK: x0 => x0.displayHeight,
      AL: (x0,x1) => { x0.src = x1 },
      AM: x0 => x0.altKey,
      AN: x0 => x0.close(),
      AO: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      B: s => printToConsole(s),
      BB: x0 => new Uint16Array(x0),
      BC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      BD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      BE: (x0,x1) => x0.getPropertyValue(x1),
      BF: x0 => x0.identifier,
      BG: () => globalThis.Intl,
      BH: x0 => x0.selectionStart,
      BI: () => new AbortController(),
      BJ: x0 => x0.play(),
      BK: x0 => x0.displayWidth,
      BL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BM: x0 => x0.ctrlKey,
      BN: (x0,x1) => x0.warn(x1),
      BO: (x0,x1,x2,x3,x4,x5,x6,x7) => ({apiKey: x0,authDomain: x1,databaseURL: x2,projectId: x3,storageBucket: x4,messagingSenderId: x5,measurementId: x6,appId: x7}),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      CC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      CD: x0 => x0.tabIndex,
      CE: x0 => globalThis.parseFloat(x0),
      CF: x0 => x0.touches,
      CG: (x0,x1) => x0.segment(x1),
      CH: x0 => x0.selectionEnd,
      CI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      CJ: (x0,x1) => { x0.currentTime = x1 },
      CK: x0 => x0.duration,
      CL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CM: x0 => x0.isComposing,
      CN: () => globalThis.console,
      CO: (x0,x1) => globalThis.firebase_core.initializeApp(x0,x1),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: x0 => new Int32Array(x0),
      DC: (x0,x1) => x0.querySelector(x1),
      DD: (x0,x1) => x0.contains(x1),
      DE: (x0,x1) => x0.getComputedStyle(x1),
      DF: x0 => x0.pressure,
      DG: x0 => x0.index,
      DH: x0 => x0.keyCode,
      DI: (x0,x1) => globalThis.fetch(x0,x1),
      DJ: x0 => x0.protocol,
      DK: x0 => x0.image,
      DL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      DM: x0 => x0.code,
      DN: x0 => x0.state,
      DO: () => globalThis.firebase_core.SDK_VERSION,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      EC: (x0,x1) => x0.item(x1),
      ED: x0 => x0.activeElement,
      EE: x0 => x0.documentElement,
      EF: x0 => x0.tiltY,
      EG: x0 => x0.next(),
      EH: (x0,x1) => x0.scrollIntoView(x1),
      EI: (x0,x1) => x0.get(x1),
      EJ: (x0,x1,x2) => x0.close(x1,x2),
      EK: () => globalThis.window.ImageDecoder,
      EL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EM: x0 => x0.repeat,
      EN: (x0,x1) => x0.getFloatTimeDomainData(x1),
      EO: (x0,x1,x2) => globalThis.firebase_core.registerVersion(x0,x1,x2),
      F: () => new Error().stack,
      FB: x0 => new Uint32Array(x0),
      FC: x0 => x0.length,
      FD: x0 => x0.parentNode,
      FE: x0 => x0.computedStyleMap(),
      FF: x0 => x0.tiltX,
      FG: x0 => x0.value,
      FH: x0 => x0.multiViewEnabled,
      FI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      FJ: x0 => x0.close(),
      FK: x0 => x0.decode(),
      FL: x0 => x0.innerHeight,
      FM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FN: x0 => x0.fftSize,
      FO: x0 => x0.sessionStorage,
      G: s => JSON.stringify(s),
      GB: x0 => new Float32Array(x0),
      GC: (x0,x1) => x0.querySelectorAll(x1),
      GD: x0 => x0.tagName,
      GE: (x0,x1) => x0.get(x1),
      GF: x0 => x0.pointerType,
      GG: x0 => x0.done,
      GH: (x0,x1) => x0.replaceWith(x1),
      GI: (x0,x1) => x0.forEach(x1),
      GJ: (x0,x1) => x0.send(x1),
      GK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      GL: x0 => x0.innerWidth,
      GM: x0 => x0.userAgent,
      GN: x0 => x0.state,
      GO: (x0,x1) => x0.debug(x1),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      HC: (x0,x1) => x0.getAttribute(x1),
      HD: x0 => x0.target,
      HE: (o, p) => p in o,
      HF: x0 => x0.pointerId,
      HG: (o, m, a) => o[m].apply(o, a),
      HH: (x0,x1) => { x0.type = x1 },
      HI: x0 => x0.name,
      HJ: () => new Array(),
      HK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HL: x0 => x0.clientY,
      HM: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      HN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Float64Array(x0),
      IC: x0 => x0.remove(),
      ID: x0 => x0.clientY,
      IE: (x0,x1) => { x0.textContent = x1 },
      IF: x0 => x0.getCoalescedEvents(),
      IG: x0 => x0.iterator,
      IH: (x0,x1) => { x0.className = x1 },
      II: x0 => x0.statusText,
      IJ: (x0,x1) => new WebSocket(x0,x1),
      IK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      IL: x0 => x0.clientX,
      IM: (x0,x1) => x0.getItem(x1),
      IN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (x0,x1) => x0.appendChild(x1),
      JD: x0 => x0.clientX,
      JE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JF: (x0,x1) => x0.getModifierState(x1),
      JG: () => globalThis.Symbol,
      JH: (x0,x1) => { x0.tabIndex = x1 },
      JI: x0 => x0.url,
      JJ: x0 => x0.reason,
      JK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JL: x0 => x0.preventDefault(),
      JM: x0 => x0.localStorage,
      JN: (x0,x1) => { x0.onmessage = x1 },
      JO: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      K: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      KB: x0 => new ArrayBuffer(x0),
      KC: (x0,x1) => x0.append(x1),
      KD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      KE: x0 => x0.matches,
      KF: s => s.trimLeft(),
      KG: (x0,x1) => new Intl.Segmenter(x0,x1),
      KH: (x0,x1) => { x0.name = x1 },
      KI: x0 => x0.status,
      KJ: x0 => x0.code,
      KK: x0 => x0.send(),
      KL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KM: (x0,x1) => x0.key(x1),
      KN: x0 => x0.port,
      KO: (x0,x1,x2) => x0.createPolicy(x1,x2),
      L: o => o === undefined,
      LB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      LC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      LD: x0 => x0.getBoundingClientRect(),
      LE: (x0,x1) => x0.matchMedia(x1),
      LF: (x0,x1) => x0[x1],
      LG: x0 => x0.Segmenter,
      LH: (x0,x1) => { x0.placeholder = x1 },
      LI: x0 => x0.getReader(),
      LJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      LK: x0 => x0.status,
      LL: (x0,x1) => { x0.onload = x1 },
      LM: x0 => x0.length,
      LN: x0 => new Blob(x0),
      LO: (x0,x1) => x0.createScriptURL(x1),
      M: o => String(o),
      MB: (x0,x1,x2) => new DataView(x0,x1,x2),
      MC: x0 => x0.style,
      MD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      ME: x0 => x0.matches,
      MF: x0 => x0.index,
      MG: x0 => x0.buffer,
      MH: (x0,x1) => { x0.autocomplete = x1 },
      MI: x0 => x0.read(),
      MJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      MK: x0 => x0.response,
      ML: x0 => x0.files,
      MM: (x0,x1,x2) => x0.setItem(x1,x2),
      MN: x0 => x0.destination,
      MO: (x0,x1,x2) => x0.createScript(x1,x2),
      N: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      NB: (o, p) => o[p],
      NC: x0 => x0.debugShowSemanticsNodes,
      ND: s => new Date(s * 1000).getTimezoneOffset() * 60,
      NE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      NF: s => s.toUpperCase(),
      NG: x0 => x0.wasmMemory,
      NH: (x0,x1) => { x0.name = x1 },
      NI: x0 => x0.value,
      NJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NK: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      NL: x0 => x0.dataTransfer,
      NM: (x0,x1) => x0.removeItem(x1),
      NN: (x0,x1) => x0.addModule(x1),
      NO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      O: (x0,x1) => x0.didCreateEngineInitializer(x1),
      OB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      OC: o => o,
      OD: Date.now,
      OE: f => f.dartFunction,
      OF: x0 => x0.pop(),
      OG: () => globalThis.window._flutter_skwasmInstance,
      OH: (x0,x1) => { x0.placeholder = x1 },
      OI: x0 => x0.done,
      OJ: (o, t) => typeof o === t,
      OK: (x0,x1) => { x0.responseType = x1 },
      OL: () => new XMLHttpRequest(),
      OM: x0 => ({name: x0}),
      ON: x0 => ({parameterData: x0}),
      OO: (o, p) => delete o[p],
      P: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      PC: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      PD: (handle) => clearTimeout(handle),
      PE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PF: x0 => x0.flags,
      PG: () => new TextDecoder(),
      PH: (x0,x1) => { x0.action = x1 },
      PI: x0 => x0.cancel(),
      PJ: x0 => x0.data,
      PK: () => new XMLHttpRequest(),
      PL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      PM: (x0,x1) => x0.query(x1),
      PN: (x0,x1,x2) => new AudioWorkletNode(x0,x1,x2),
      PO: (o, p, v) => o[p] = v,
      Q: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QB: o => o.byteOffset,
      QC: (x0,x1) => x0.warn(x1),
      QD: (x0,x1) => x0.closest(x1),
      QE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      QF: (a, s) => a.join(s),
      QG: (d, digits) => d.toFixed(digits),
      QH: (x0,x1) => { x0.method = x1 },
      QI: x0 => x0.body,
      QJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QK: x0 => new WeakRef(x0),
      QL: x0 => x0.send(),
      QM: x0 => ({audio: x0}),
      QN: x0 => x0.audioWorklet,
      QO: (x0,x1) => { x0.text = x1 },
      R: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      RB: o => o.buffer,
      RC: x0 => x0.console,
      RD: x0 => x0.bottom,
      RE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      RF: (x0,x1) => x0.error(x1),
      RG: x0 => x0.maxHeight,
      RH: (x0,x1) => { x0.noValidate = x1 },
      RI: x0 => x0.headers,
      RJ: x0 => x0.readyState,
      RK: x0 => x0.deref(),
      RL: x0 => x0.type,
      RM: (x0,x1) => x0.getUserMedia(x1),
      RN: x0 => x0.message,
      RO: x0 => x0.head,
      S: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SB: Function.prototype.call.bind(DataView.prototype.getUint8),
      SC: () => globalThis.window,
      SD: x0 => x0.top,
      SE: (o, i) => o[i],
      SF: () => globalThis.console,
      SG: x0 => x0.maxWidth,
      SH: (x0,x1) => x0.removeAttribute(x1),
      SI: x0 => x0.signal,
      SJ: (x0,x1) => { x0.binaryType = x1 },
      SK: () => globalThis.WeakRef,
      SL: x0 => x0.response,
      SM: x0 => x0.getAudioTracks(),
      SN: x0 => x0.code,
      SO: (x0,x1) => { x0.text = x1 },
      T: x0 => new Promise(x0),
      TB: (b, o) => new DataView(b, o),
      TC: (o, c) => o instanceof c,
      TD: x0 => x0.right,
      TE: o => o.length,
      TF: s => s.trimRight(),
      TG: x0 => x0.minHeight,
      TH: x0 => x0.isConnected,
      TI: (x0,x1,x2) => x0.insertBefore(x1,x2),
      TJ: x0 => x0.naturalHeight,
      TK: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      TL: (x0,x1) => { x0.responseType = x1 },
      TM: x0 => x0.stop(),
      TN: x0 => globalThis.firebase_messaging.deleteToken(x0),
      TO: x0 => x0.trustedTypes,
      U: (x0,x1,x2) => x0.call(x1,x2),
      UB: (b, o, l) => new DataView(b, o, l),
      UC: (x0,x1) => x0.exec(x1),
      UD: x0 => x0.left,
      UE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      UF: x0 => x0.blur(),
      UG: x0 => x0.minWidth,
      UH: x0 => x0.click(),
      UI: x0 => x0.id,
      UJ: x0 => x0.naturalWidth,
      UK: (a, s, e) => a.slice(s, e),
      UL: x0 => x0.vendor,
      UM: (o,s,v) => o[s] = v,
      UN: x0 => x0.link,
      UO: x0 => x0.trustedTypes,
      V: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      VB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      VC: x0 => x0.length,
      VD: x0 => x0.clientY,
      VE: x0 => x0.language,
      VF: x0 => x0.button,
      VG: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      VH: (x0,x1) => x0.getElementsByClassName(x1),
      VI: x0 => x0.offsetHeight,
      VJ: (x0,x1) => x0.createElement(x1),
      VK: (o, p) => p in o,
      VL: x0 => x0.navigator,
      VM: () => Symbol("jsBoxedDartObjectProperty"),
      VN: x0 => x0.analyticsLabel,
      VO: (x0,x1) => { x0.crossOrigin = x1 },
      W: x0 => new Array(x0),
      WB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      WC: (x0,x1) => { x0.lastIndex = x1 },
      WD: x0 => x0.clientX,
      WE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      WF: x0 => x0.innerHeight,
      WG: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      WH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      WI: x0 => x0.offsetWidth,
      WJ: (x0,x1) => { x0.pointerEvents = x1 },
      WK: x0 => x0.groups,
      WL: (x0,x1) => x0.appendChild(x1),
      WM: x0 => x0.mediaDevices,
      WN: x0 => x0.image,
      WO: (x0,x1) => { x0.type = x1 },
      X: o => [o],
      XB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      XC: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      XD: x0 => x0.changedTouches,
      XE: () => globalThis.window.FinalizationRegistry,
      XF: x0 => x0.innerWidth,
      XG: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      XH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      XI: x0 => x0.stopPropagation(),
      XJ: (x0,x1) => { x0.height = x1 },
      XK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XL: x0 => x0.remove(),
      XM: x0 => x0.state,
      XN: x0 => x0.body,
      XO: (x0,x1) => x0.querySelector(x1),
      Y: (o0, o1) => [o0, o1],
      YB: (t, s) => t.set(s),
      YC: o => o instanceof RegExp,
      YD: x0 => x0.offsetY,
      YE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YF: x0 => x0.height,
      YG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      YH: (x0,x1) => x0.dispatchEvent(x1),
      YI: x0 => x0.disabled,
      YJ: (x0,x1) => { x0.width = x1 },
      YK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      YL: x0 => globalThis.URL.revokeObjectURL(x0),
      YM: x0 => x0.permissions,
      YN: x0 => x0.title,
      YO: (x0,x1) => { x0.id = x1 },
      Z: (o0, o1, o2) => [o0, o1, o2],
      ZB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      ZC: (string, times) => string.repeat(times),
      ZD: x0 => x0.offsetX,
      ZE: x0 => new window.FinalizationRegistry(x0),
      ZF: x0 => x0.width,
      ZG: x0 => x0.history,
      ZH: (x0,x1) => x0.createEvent(x1),
      ZI: (x0,x1) => { x0.min = x1 },
      ZJ: x0 => x0.style,
      ZK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZL: x0 => x0.body,
      ZM: x0 => x0.stop(),
      ZN: x0 => x0.fcmOptions,
      ZO: x0 => x0.currentTime,
      a: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      aB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      aC: x0 => x0.dotAll,
      aD: x0 => x0.type,
      aE: (x0,x1) => x0.unregister(x1),
      aF: x0 => x0.clientHeight,
      aG: x0 => x0.search,
      aH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      aI: (x0,x1) => { x0.max = x1 },
      aJ: (x0,x1) => { x0.src = x1 },
      aK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aL: (x0,x1) => { x0.download = x1 },
      aM: (x0,x1,x2) => ({mimeType: x0,audioBitsPerSecond: x1,bitsPerSecond: x2}),
      aN: x0 => x0.notification,
      aO: x0 => x0.resume(),
      b: (x0,x1,x2) => { x0[x1] = x2 },
      bB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      bC: x0 => x0.unicode,
      bD: x0 => x0.maxTouchPoints,
      bE: (x0,x1) => x0.contains(x1),
      bF: x0 => x0.clientWidth,
      bG: x0 => x0.location,
      bH: x0 => x0.readText(),
      bI: (x0,x1) => { x0.disabled = x1 },
      bJ: () => globalThis.document,
      bK: (x0,x1) => x0.removeChild(x1),
      bL: (x0,x1) => { x0.href = x1 },
      bM: (x0,x1) => new MediaRecorder(x0,x1),
      bN: x0 => x0.messageId,
      bO: (x0,x1) => x0.createMediaElementSource(x1),
      c: o => o,
      cB: Function.prototype.call.bind(DataView.prototype.getUint32),
      cC: x0 => x0.ignoreCase,
      cD: x0 => x0.platform,
      cE: (s) => +s,
      cF: (x0,x1) => { x0.content = x1 },
      cG: x0 => x0.pathname,
      cH: x0 => x0.clipboard,
      cI: (x0,x1) => { x0.scrollLeft = x1 },
      cJ: x0 => x0.src,
      cK: x0 => x0.click(),
      cL: (x0,x1) => { x0.innerHTML = x1 },
      cM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cN: x0 => x0.from,
      cO: x0 => x0.createGain(),
      d: (o, p) => o[p],
      dB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      dC: x0 => x0.multiline,
      dD: x0 => x0.body,
      dE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      dF: (x0,x1) => { x0.name = x1 },
      dG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      dH: (x0,x1) => x0.writeText(x1),
      dI: (x0,x1) => { x0.spellcheck = x1 },
      dJ: (x0,x1) => x0.revokeObjectURL(x1),
      dK: (o, a) => o + a,
      dL: (a, i) => a.splice(i, 1)[0],
      dM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      dN: x0 => x0.collapseKey,
      dO: x0 => x0.createStereoPanner(),
      e: () => globalThis,
      eB: Function.prototype.call.bind(DataView.prototype.getInt32),
      eC: (string, token) => string.split(token),
      eD: () => globalThis.document,
      eE: s => s.trim(),
      eF: x0 => x0.head,
      eG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      eH: x0 => x0.unlock(),
      eI: (x0,x1) => { x0.disabled = x1 },
      eJ: (x0,x1) => { x0.src = x1 },
      eK: x0 => x0.children,
      eL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eM: (x0,x1) => x0.start(x1),
      eN: x0 => x0.data,
      eO: x0 => x0.load(),
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      fC: o => o instanceof Array,
      fD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      fE: x0 => x0.classList,
      fF: (x0,x1) => x0.removeChild(x1),
      fG: o => Object.keys(o),
      fH: (x0,x1) => x0.lock(x1),
      fI: (x0,x1) => x0.getRandomValues(x1),
      fJ: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      fK: x0 => x0.firstChild,
      fL: x0 => ({once: x0}),
      fM: (x0,x1) => x0.createMediaStreamSource(x1),
      fN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fO: (x0,x1) => { x0.value = x1 },
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: o => o instanceof Uint16Array,
      gC: (a, i) => a[i],
      gD: x0 => x0.hasFocus(),
      gE: x0 => x0.preventDefault(),
      gF: x0 => x0.firstChild,
      gG: x0 => x0.state,
      gH: x0 => x0.orientation,
      gI: () => globalThis.crypto,
      gJ: x0 => x0.naturalHeight,
      gK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gL: () => globalThis.Notification.requestPermission(),
      gM: x0 => x0.createAnalyser(),
      gN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gO: x0 => x0.gain,
      h: (x0,x1) => ({addView: x0,removeView: x1}),
      hB: Function.prototype.call.bind(DataView.prototype.getUint16),
      hC: a => a.length,
      hD: x0 => x0.relatedTarget,
      hE: x0 => x0.parent,
      hF: x0 => x0.viewConstraints,
      hG: x0 => x0.hash,
      hH: (x0,x1) => x0.querySelector(x1),
      hI: l => new DataView(new ArrayBuffer(l)),
      hJ: x0 => x0.naturalWidth,
      hK: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      hL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hM: (x0,x1) => x0.connect(x1),
      hN: (x0,x1) => ({next: x0,error: x1}),
      hO: x0 => x0.code,
      i: (l, r) => l === r,
      iB: o => o instanceof Int16Array,
      iC: (x0,x1) => x0.test(x1),
      iD: x0 => x0.shiftKey,
      iE: x0 => x0.timeStamp,
      iF: x0 => x0.hostElement,
      iG: x0 => x0.state,
      iH: (x0,x1) => { x0.title = x1 },
      iI: (a, i) => a.splice(i, 1),
      iJ: x0 => x0.decode(),
      iK: (x0,x1) => x0.item(x1),
      iL: x0 => x0.pause(),
      iM: (x0,x1) => { x0.smoothingTimeConstant = x1 },
      iN: (x0,x1) => globalThis.firebase_messaging.onMessage(x0,x1),
      iO: x0 => x0.message,
      j: x0 => x0.random(),
      jB: Function.prototype.call.bind(DataView.prototype.getInt16),
      jC: x0 => x0.userAgent,
      jD: (decoder, codeUnits) => decoder.decode(codeUnits),
      jE: (x0,x1) => x0.hasAttribute(x1),
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (x0,x1) => x0.go(x1),
      jH: (x0,x1) => x0.vibrate(x1),
      jI: a => a.pop(),
      jJ: (x0,x1) => { x0.decoding = x1 },
      jK: () => new FileReader(),
      jL: (x0,x1) => { x0.muted = x1 },
      jM: (x0,x1) => { x0.fftSize = x1 },
      jN: x0 => globalThis.firebase_messaging.getMessaging(x0),
      jO: x0 => x0.error,
      k: o => o,
      kB: o => o instanceof Uint8ClampedArray,
      kC: x0 => x0.navigator,
      kD: () => new TextDecoder("utf-8", {fatal: true}),
      kE: x0 => x0.buttons,
      kF: x0 => ({runApp: x0}),
      kG: x0 => x0.parentElement,
      kH: x0 => x0.arrayBuffer(),
      kI: (map, o) => map.get(o),
      kJ: (x0,x1) => { x0.crossOrigin = x1 },
      kK: (x0,x1) => x0.readAsArrayBuffer(x1),
      kL: (x0,x1) => x0.transferFromImageBitmap(x1),
      kM: (x0,x1) => { x0.onstop = x1 },
      kN: x0 => globalThis.firebase_core.getApp(x0),
      kO: x0 => x0.duration,
      l: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      lB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      lC: Function.prototype.call.bind(String.prototype.toLowerCase),
      lD: () => new TextDecoder("utf-8", {fatal: false}),
      lE: x0 => x0.ctrlKey,
      lF: () => typeof dartUseDateNowForTicks !== "undefined",
      lG: (x0,x1) => x0.querySelectorAll(x1),
      lH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      lI: (x0,x1,x2,x3,x4) => ({dir: x0,lang: x1,body: x2,tag: x3,icon: x4}),
      lJ: (x0,x1) => x0.createObjectURL(x1),
      lK: x0 => x0.size,
      lL: (x0,x1) => x0.getContext(x1),
      lM: x0 => x0.arrayBuffer(),
      lN: () => globalThis.firebase_core.getApp(),
      lO: (x0,x1) => { x0.playbackRate = x1 },
      m: () => globalThis.Math,
      mB: Function.prototype.call.bind(DataView.prototype.setInt32),
      mC: Object.is,
      mD: (a, i, v) => a[i] = v,
      mE: x0 => x0.y,
      mF: () => Date.now(),
      mG: (x0,x1) => x0.removeProperty(x1),
      mH: x0 => x0.status,
      mI: (x0,x1) => new Notification(x0,x1),
      mJ: x0 => x0.URL,
      mK: x0 => x0.name,
      mL: (x0,x1) => { x0.height = x1 },
      mM: x0 => x0.type,
      mN: (x0,x1) => ({vapidKey: x0,serviceWorkerRegistration: x1}),
      mO: (x0,x1) => { x0.loop = x1 },
      n: (x0,x1) => x0.prepend(x1),
      nB: Function.prototype.call.bind(DataView.prototype.setUint32),
      nC: x0 => x0.vendor,
      nD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      nE: x0 => x0.x,
      nF: () => 1000 * performance.now(),
      nG: (x0,x1) => x0.add(x1),
      nH: (x0,x1) => x0.fetch(x1),
      nI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nJ: x0 => new Blob(x0),
      nK: x0 => x0.result,
      nL: (x0,x1) => { x0.width = x1 },
      nM: x0 => x0.mimeType,
      nN: (x0,x1) => globalThis.firebase_messaging.getToken(x0,x1),
      nO: (x0,x1) => { x0.crossOrigin = x1 },
      o: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      oB: Function.prototype.call.bind(DataView.prototype.setInt16),
      oC: (x0,x1) => x0.createTextNode(x1),
      oD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      oE: x0 => x0.scrollTop,
      oF: (x0,x1) => x0.requestAnimationFrame(x1),
      oG: x0 => x0.data,
      oH: x0 => x0.content,
      oI: (x0,x1) => { x0.onclick = x1 },
      oJ: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      oK: x0 => x0.length,
      oL: x0 => x0.height,
      oM: (x0,x1) => { x0.ondataavailable = x1 },
      oN: x0 => x0.measurementId,
      oO: x0 => x0.length,
      p: b => !!b,
      pB: Function.prototype.call.bind(DataView.prototype.setUint16),
      pC: (x0,x1) => { x0.id = x1 },
      pD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      pE: x0 => x0.offsetTop,
      pF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pG: (x0,x1) => { x0.scrollTop = x1 },
      pH: x0 => x0.document,
      pI: x0 => x0.focus(),
      pJ: x0 => new window.ImageDecoder(x0),
      pK: x0 => x0.files,
      pL: x0 => x0.width,
      pM: x0 => x0.data,
      pN: x0 => x0.appId,
      pO: x0 => x0.getReader(),
      q: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qB: Function.prototype.call.bind(DataView.prototype.setUint8),
      qC: (x0,x1) => { x0.nonce = x1 },
      qD: x0 => x0.visibilityState,
      qE: x0 => x0.scrollLeft,
      qF: x0 => x0.now(),
      qG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      qH: x0 => x0.debugSkipFontRetryDelay,
      qI: x0 => x0.close(),
      qJ: x0 => x0.name,
      qK: (x0,x1) => { x0.display = x1 },
      qL: x0 => x0.rasterEndMilliseconds,
      qM: x0 => globalThis.MediaRecorder.isTypeSupported(x0),
      qN: x0 => x0.messagingSenderId,
      qO: x0 => x0.value,
      r: (x0,x1) => x0.focus(x1),
      rB: Function.prototype.call.bind(DataView.prototype.setInt8),
      rC: x0 => x0.nonce,
      rD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      rE: x0 => x0.offsetLeft,
      rF: x0 => x0.performance,
      rG: (x0,x1) => { x0.value = x1 },
      rH: (x0,x1,x2) => x0.set(x1,x2),
      rI: () => globalThis.window,
      rJ: x0 => x0.repetitionCount,
      rK: x0 => x0.style,
      rL: x0 => x0.rasterStartMilliseconds,
      rM: x0 => x0.channelCount,
      rN: x0 => x0.storageBucket,
      rO: x0 => x0.done,
      s: () => ({}),
      sB: Function.prototype.call.bind(DataView.prototype.getInt8),
      sC: () => globalThis.window.flutterConfiguration,
      sD: x0 => x0.disconnect(),
      sE: x0 => x0.offsetParent,
      sF: x0 => new Uint8Array(x0),
      sG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      sH: x0 => x0.fontFallbackBaseUrl,
      sI: () => globalThis.Notification.permission,
      sJ: x0 => x0.frameCount,
      sK: (x0,x1) => { x0.accept = x1 },
      sL: x0 => x0.imageBitmaps,
      sM: x0 => x0.sampleRate,
      sN: x0 => x0.databaseURL,
      sO: x0 => x0.read(),
      t: (o, p, v) => o[p] = v,
      tB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      tC: (x0,x1) => x0.attachShadow(x1),
      tD: x0 => new Intl.Locale(x0),
      tE: (o, p, r) => o.replace(p, () => r),
      tF: (x0,x1,x2) => x0.slice(x1,x2),
      tG: (x0,x1) => { x0.value = x1 },
      tH: (handle) => clearInterval(handle),
      tI: x0 => x0.hidden,
      tJ: x0 => x0.selectedTrack,
      tK: (x0,x1) => { x0.multiple = x1 },
      tL: x0 => x0.canvasKitMaximumSurfaces,
      tM: x0 => ({sampleRate: x0}),
      tN: x0 => x0.authDomain,
      tO: x0 => x0.body,
      u: () => [],
      uB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      uC: (x0,x1) => x0.createElement(x1),
      uD: x0 => x0.region,
      uE: (o, p, r) => o.replaceAll(p, () => r),
      uF: (x0,x1) => x0.decode(x1),
      uG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      uH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      uI: () => globalThis.document,
      uJ: x0 => x0.completed,
      uK: (x0,x1) => { x0.draggable = x1 },
      uL: x0 => x0.nextSibling,
      uM: x0 => new AudioContext(x0),
      uN: x0 => x0.projectId,
      uO: (x0,x1) => new OffscreenCanvas(x0,x1),
      v: (a, i) => a.push(i),
      vB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      vC: x0 => x0.scale,
      vD: x0 => x0.script,
      vE: x0 => x0.deltaMode,
      vF: (x0,x1) => x0.adoptText(x1),
      vG: x0 => x0.value,
      vH: () => Date.now(),
      vI: x0 => ({type: x0}),
      vJ: x0 => x0.ready,
      vK: (x0,x1) => { x0.type = x1 },
      vL: (x0,x1) => x0.debug(x1),
      vM: () => new AudioContext(),
      vN: x0 => x0.apiKey,
      vO: x0 => x0.assetBase,
      w: x0 => new Int8Array(x0),
      wB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      wC: x0 => x0.visualViewport,
      wD: x0 => x0.language,
      wE: x0 => x0.deltaY,
      wF: x0 => x0.first(),
      wG: x0 => x0.selectionDirection,
      wH: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      wI: (x0,x1) => new Blob(x0,x1),
      wJ: x0 => x0.tracks,
      wK: (x0,x1) => { x0.border = x1 },
      wL: x0 => x0.hostElement,
      wM: x0 => x0.sampleRate,
      wN: x0 => x0.options,
      wO: x0 => x0.loader,
      x: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      xB: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      xC: x0 => x0.devicePixelRatio,
      xD: x0 => x0.languages,
      xE: x0 => x0.deltaX,
      xF: x0 => x0.next(),
      xG: x0 => x0.selectionStart,
      xH: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      xI: x0 => globalThis.URL.createObjectURL(x0),
      xJ: x0 => x0.close(),
      xK: (x0,x1) => { x0.objectFit = x1 },
      xL: x0 => x0.location,
      xM: x0 => x0.getSettings(),
      xN: x0 => x0.name,
      xO: () => globalThis._flutter,
      y: x0 => new Uint8Array(x0),
      yB: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      yC: x0 => x0.height,
      yD: (x0,x1) => x0.observe(x1),
      yE: x0 => x0.wheelDeltaY,
      yF: x0 => x0.current(),
      yG: x0 => x0.selectionEnd,
      yH: (map, o, v) => map.set(o, v),
      yI: (x0,x1) => { x0.preload = x1 },
      yJ: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      yK: (x0,x1) => { x0.height = x1 },
      yL: (x0,x1) => x0.getModifierState(x1),
      yM: x0 => x0.disconnect(),
      yN: () => globalThis.firebase_core.getApps(),
      z: x0 => new Uint8ClampedArray(x0),
      zB: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      zC: x0 => x0.width,
      zD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      zE: x0 => x0.wheelDeltaX,
      zF: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      zG: x0 => x0.value,
      zH: () => new WeakMap(),
      zI: (x0,x1) => { x0.src = x1 },
      zJ: (x0,x1) => x0.decode(x1),
      zK: (x0,x1) => { x0.width = x1 },
      zL: x0 => x0.metaKey,
      zM: (x0,x1) => x0.removeTrack(x1),
      zN: x0 => x0.name,

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
