var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _currentThenable, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _QueryObserver_instances, executeFetch_fn, updateStaleTimeout_fn, computeRefetchInterval_fn, updateRefetchInterval_fn, updateTimers_fn, clearStaleTimeout_fn, clearRefetchInterval_fn, updateQuery_fn, notify_fn, _a;
import { P as ProtocolError, T as TimeoutWaitingForResponseErrorCode, y as utf8ToBytes, E as ExternalError, M as MissingRootKeyErrorCode, C as Certificate, z as lookupResultToBuffer, A as RequestStatusResponseStatus, U as UnknownError, B as RequestStatusDoneNoReplyErrorCode, D as RejectError, F as CertifiedRejectErrorCode, G as UNREACHABLE_ERROR, I as InputError, H as InvalidReadStateRequestErrorCode, J as ReadRequestType, K as Principal, L as IDL, N as MissingCanisterIdErrorCode, O as HttpAgent, Q as encode, V as QueryResponseStatus, W as UncertifiedRejectErrorCode, X as isV3ResponseBody, Y as isV2ResponseBody, Z as UncertifiedRejectUpdateErrorCode, _ as UnexpectedErrorCode, $ as decode, h as Subscribable, a0 as pendingThenable, a1 as resolveEnabled, s as shallowEqualObjects, a2 as resolveStaleTime, m as noop, a3 as environmentManager, a4 as isValidTimeout, a5 as timeUntilStale, a6 as timeoutManager, a7 as focusManager, a8 as fetchState, a9 as replaceData, n as notifyManager, r as reactExports, o as shouldThrowError, e as useQueryClient, u as useInternetIdentity, aa as createActorWithConfig, ab as Record, ac as Opt, ad as Variant, ae as Vec, af as Service, ag as Func, ah as Nat, ai as Nat8, aj as Text, ak as Null, al as Bool, am as Int, an as Principal$1, ao as Float64 } from "./index-CzAnGejr.js";
const FIVE_MINUTES_IN_MSEC = 5 * 60 * 1e3;
function defaultStrategy() {
  return chain(conditionalDelay(once(), 1e3), backoff(1e3, 1.2), timeout(FIVE_MINUTES_IN_MSEC));
}
function once() {
  let first = true;
  return async () => {
    if (first) {
      first = false;
      return true;
    }
    return false;
  };
}
function conditionalDelay(condition, timeInMsec) {
  return async (canisterId, requestId, status) => {
    if (await condition(canisterId, requestId, status)) {
      return new Promise((resolve) => setTimeout(resolve, timeInMsec));
    }
  };
}
function timeout(timeInMsec) {
  const end = Date.now() + timeInMsec;
  return async (_canisterId, requestId, status) => {
    if (Date.now() > end) {
      throw ProtocolError.fromCode(new TimeoutWaitingForResponseErrorCode(`Request timed out after ${timeInMsec} msec`, requestId, status));
    }
  };
}
function backoff(startingThrottleInMsec, backoffFactor) {
  let currentThrottling = startingThrottleInMsec;
  return () => new Promise((resolve) => setTimeout(() => {
    currentThrottling *= backoffFactor;
    resolve();
  }, currentThrottling));
}
function chain(...strategies) {
  return async (canisterId, requestId, status) => {
    for (const a of strategies) {
      await a(canisterId, requestId, status);
    }
  };
}
const DEFAULT_POLLING_OPTIONS = {
  preSignReadStateRequest: false
};
function hasProperty(value, property) {
  return Object.prototype.hasOwnProperty.call(value, property);
}
function isObjectWithProperty(value, property) {
  return value !== null && typeof value === "object" && hasProperty(value, property);
}
function hasFunction(value, property) {
  return hasProperty(value, property) && typeof value[property] === "function";
}
function isSignedReadStateRequestWithExpiry(value) {
  return isObjectWithProperty(value, "body") && isObjectWithProperty(value.body, "content") && value.body.content.request_type === ReadRequestType.ReadState && isObjectWithProperty(value.body.content, "ingress_expiry") && typeof value.body.content.ingress_expiry === "object" && value.body.content.ingress_expiry !== null && hasFunction(value.body.content.ingress_expiry, "toHash");
}
async function pollForResponse(agent, canisterId, requestId, options = {}) {
  const path = [utf8ToBytes("request_status"), requestId];
  let state;
  let currentRequest;
  const preSignReadStateRequest = options.preSignReadStateRequest ?? false;
  if (preSignReadStateRequest) {
    currentRequest = await constructRequest({
      paths: [path],
      agent,
      pollingOptions: options
    });
    state = await agent.readState(canisterId, { paths: [path] }, void 0, currentRequest);
  } else {
    state = await agent.readState(canisterId, { paths: [path] });
  }
  if (agent.rootKey == null) {
    throw ExternalError.fromCode(new MissingRootKeyErrorCode());
  }
  const cert = await Certificate.create({
    certificate: state.certificate,
    rootKey: agent.rootKey,
    canisterId,
    blsVerify: options.blsVerify,
    agent
  });
  const maybeBuf = lookupResultToBuffer(cert.lookup_path([...path, utf8ToBytes("status")]));
  let status;
  if (typeof maybeBuf === "undefined") {
    status = RequestStatusResponseStatus.Unknown;
  } else {
    status = new TextDecoder().decode(maybeBuf);
  }
  switch (status) {
    case RequestStatusResponseStatus.Replied: {
      return {
        reply: lookupResultToBuffer(cert.lookup_path([...path, "reply"])),
        certificate: cert
      };
    }
    case RequestStatusResponseStatus.Received:
    case RequestStatusResponseStatus.Unknown:
    case RequestStatusResponseStatus.Processing: {
      const strategy = options.strategy ?? defaultStrategy();
      await strategy(canisterId, requestId, status);
      return pollForResponse(agent, canisterId, requestId, {
        ...options,
        // Pass over either the strategy already provided or the new one created above
        strategy,
        request: currentRequest
      });
    }
    case RequestStatusResponseStatus.Rejected: {
      const rejectCode = new Uint8Array(lookupResultToBuffer(cert.lookup_path([...path, "reject_code"])))[0];
      const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(cert.lookup_path([...path, "reject_message"])));
      const errorCodeBuf = lookupResultToBuffer(cert.lookup_path([...path, "error_code"]));
      const errorCode = errorCodeBuf ? new TextDecoder().decode(errorCodeBuf) : void 0;
      throw RejectError.fromCode(new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, errorCode));
    }
    case RequestStatusResponseStatus.Done:
      throw UnknownError.fromCode(new RequestStatusDoneNoReplyErrorCode(requestId));
  }
  throw UNREACHABLE_ERROR;
}
async function constructRequest(options) {
  var _a2;
  const { paths, agent, pollingOptions } = options;
  if (pollingOptions.request && isSignedReadStateRequestWithExpiry(pollingOptions.request)) {
    return pollingOptions.request;
  }
  const request = await ((_a2 = agent.createReadStateRequest) == null ? void 0 : _a2.call(agent, {
    paths
  }, void 0));
  if (!isSignedReadStateRequestWithExpiry(request)) {
    throw InputError.fromCode(new InvalidReadStateRequestErrorCode(request));
  }
  return request;
}
const metadataSymbol = Symbol.for("ic-agent-metadata");
class Actor {
  /**
   * Get the Agent class this Actor would call, or undefined if the Actor would use
   * the default agent (global.ic.agent).
   * @param actor The actor to get the agent of.
   */
  static agentOf(actor) {
    return actor[metadataSymbol].config.agent;
  }
  /**
   * Get the interface of an actor, in the form of an instance of a Service.
   * @param actor The actor to get the interface of.
   */
  static interfaceOf(actor) {
    return actor[metadataSymbol].service;
  }
  static canisterIdOf(actor) {
    return Principal.from(actor[metadataSymbol].config.canisterId);
  }
  static createActorClass(interfaceFactory, options) {
    const service = interfaceFactory({ IDL });
    class CanisterActor extends Actor {
      constructor(config) {
        if (!config.canisterId) {
          throw InputError.fromCode(new MissingCanisterIdErrorCode(config.canisterId));
        }
        const canisterId = typeof config.canisterId === "string" ? Principal.fromText(config.canisterId) : config.canisterId;
        super({
          config: {
            ...DEFAULT_ACTOR_CONFIG,
            ...config,
            canisterId
          },
          service
        });
        for (const [methodName, func] of service._fields) {
          if (options == null ? void 0 : options.httpDetails) {
            func.annotations.push(ACTOR_METHOD_WITH_HTTP_DETAILS);
          }
          if (options == null ? void 0 : options.certificate) {
            func.annotations.push(ACTOR_METHOD_WITH_CERTIFICATE);
          }
          this[methodName] = _createActorMethod(this, methodName, func, config.blsVerify);
        }
      }
    }
    return CanisterActor;
  }
  /**
   * Creates an actor with the given interface factory and configuration.
   *
   * The [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package can be used to generate the interface factory for your canister.
   * @param interfaceFactory - the interface factory for the actor, typically generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package
   * @param configuration - the configuration for the actor
   * @returns an actor with the given interface factory and configuration
   * @example
   * Using the interface factory generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package:
   * ```ts
   * import { Actor, HttpAgent } from '@icp-sdk/core/agent';
   * import { Principal } from '@icp-sdk/core/principal';
   * import { idlFactory } from './api/declarations/hello-world.did';
   *
   * const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
   *
   * const agent = await HttpAgent.create({
   *   host: 'https://icp-api.io',
   * });
   *
   * const actor = Actor.createActor(idlFactory, {
   *   agent,
   *   canisterId,
   * });
   *
   * const response = await actor.greet('world');
   * console.log(response);
   * ```
   * @example
   * Using the `createActor` wrapper function generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package:
   * ```ts
   * import { HttpAgent } from '@icp-sdk/core/agent';
   * import { Principal } from '@icp-sdk/core/principal';
   * import { createActor } from './api/hello-world';
   *
   * const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
   *
   * const agent = await HttpAgent.create({
   *   host: 'https://icp-api.io',
   * });
   *
   * const actor = createActor(canisterId, {
   *   agent,
   * });
   *
   * const response = await actor.greet('world');
   * console.log(response);
   * ```
   */
  static createActor(interfaceFactory, configuration) {
    if (!configuration.canisterId) {
      throw InputError.fromCode(new MissingCanisterIdErrorCode(configuration.canisterId));
    }
    return new (this.createActorClass(interfaceFactory))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @deprecated - use createActor with actorClassOptions instead
   */
  static createActorWithHttpDetails(interfaceFactory, configuration) {
    return new (this.createActorClass(interfaceFactory, { httpDetails: true }))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @param actorClassOptions - options for the actor class extended details to return with the result
   */
  static createActorWithExtendedDetails(interfaceFactory, configuration, actorClassOptions = {
    httpDetails: true,
    certificate: true
  }) {
    return new (this.createActorClass(interfaceFactory, actorClassOptions))(configuration);
  }
  constructor(metadata) {
    this[metadataSymbol] = Object.freeze(metadata);
  }
}
function decodeReturnValue(types, msg) {
  const returnValues = decode(types, msg);
  switch (returnValues.length) {
    case 0:
      return void 0;
    case 1:
      return returnValues[0];
    default:
      return returnValues;
  }
}
const DEFAULT_ACTOR_CONFIG = {
  pollingOptions: DEFAULT_POLLING_OPTIONS
};
const ACTOR_METHOD_WITH_HTTP_DETAILS = "http-details";
const ACTOR_METHOD_WITH_CERTIFICATE = "certificate";
function _createActorMethod(actor, methodName, func, blsVerify) {
  let caller;
  if (func.annotations.includes("query") || func.annotations.includes("composite_query")) {
    caller = async (options, ...args) => {
      var _a2, _b;
      options = {
        ...options,
        ...(_b = (_a2 = actor[metadataSymbol].config).queryTransform) == null ? void 0 : _b.call(_a2, methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || new HttpAgent();
      const cid = Principal.from(options.canisterId || actor[metadataSymbol].config.canisterId);
      const arg = encode(func.argTypes, args);
      const result = await agent.query(cid, {
        methodName,
        arg,
        effectiveCanisterId: options.effectiveCanisterId
      });
      const httpDetails = {
        ...result.httpDetails,
        requestDetails: result.requestDetails
      };
      switch (result.status) {
        case QueryResponseStatus.Rejected: {
          const uncertifiedRejectErrorCode = new UncertifiedRejectErrorCode(result.requestId, result.reject_code, result.reject_message, result.error_code, result.signatures);
          uncertifiedRejectErrorCode.callContext = {
            canisterId: cid,
            methodName,
            httpDetails
          };
          throw RejectError.fromCode(uncertifiedRejectErrorCode);
        }
        case QueryResponseStatus.Replied:
          return func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS) ? {
            httpDetails,
            result: decodeReturnValue(func.retTypes, result.reply.arg)
          } : decodeReturnValue(func.retTypes, result.reply.arg);
      }
    };
  } else {
    caller = async (options, ...args) => {
      var _a2, _b;
      options = {
        ...options,
        ...(_b = (_a2 = actor[metadataSymbol].config).callTransform) == null ? void 0 : _b.call(_a2, methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || HttpAgent.createSync();
      const { canisterId, effectiveCanisterId, pollingOptions } = {
        ...DEFAULT_ACTOR_CONFIG,
        ...actor[metadataSymbol].config,
        ...options
      };
      const cid = Principal.from(canisterId);
      const ecid = effectiveCanisterId !== void 0 ? Principal.from(effectiveCanisterId) : cid;
      const arg = encode(func.argTypes, args);
      const { requestId, response, requestDetails } = await agent.call(cid, {
        methodName,
        arg,
        effectiveCanisterId: ecid,
        nonce: options.nonce
      });
      let reply;
      let certificate;
      if (isV3ResponseBody(response.body)) {
        if (agent.rootKey == null) {
          throw ExternalError.fromCode(new MissingRootKeyErrorCode());
        }
        const cert = response.body.certificate;
        certificate = await Certificate.create({
          certificate: cert,
          rootKey: agent.rootKey,
          canisterId: ecid,
          blsVerify,
          agent
        });
        const path = [utf8ToBytes("request_status"), requestId];
        const status = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "status"])));
        switch (status) {
          case "replied":
            reply = lookupResultToBuffer(certificate.lookup_path([...path, "reply"]));
            break;
          case "rejected": {
            const rejectCode = new Uint8Array(lookupResultToBuffer(certificate.lookup_path([...path, "reject_code"])))[0];
            const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "reject_message"])));
            const error_code_buf = lookupResultToBuffer(certificate.lookup_path([...path, "error_code"]));
            const error_code = error_code_buf ? new TextDecoder().decode(error_code_buf) : void 0;
            const certifiedRejectErrorCode = new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, error_code);
            certifiedRejectErrorCode.callContext = {
              canisterId: cid,
              methodName,
              httpDetails: response
            };
            throw RejectError.fromCode(certifiedRejectErrorCode);
          }
        }
      } else if (isV2ResponseBody(response.body)) {
        const { reject_code, reject_message, error_code } = response.body;
        const errorCode = new UncertifiedRejectUpdateErrorCode(requestId, reject_code, reject_message, error_code);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails: response
        };
        throw RejectError.fromCode(errorCode);
      }
      if (response.status === 202) {
        const pollOptions = {
          ...pollingOptions,
          blsVerify
        };
        const response2 = await pollForResponse(agent, ecid, requestId, pollOptions);
        certificate = response2.certificate;
        reply = response2.reply;
      }
      const shouldIncludeHttpDetails = func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS);
      const shouldIncludeCertificate = func.annotations.includes(ACTOR_METHOD_WITH_CERTIFICATE);
      const httpDetails = { ...response, requestDetails };
      if (reply !== void 0) {
        if (shouldIncludeHttpDetails && shouldIncludeCertificate) {
          return {
            httpDetails,
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeCertificate) {
          return {
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeHttpDetails) {
          return {
            httpDetails,
            result: decodeReturnValue(func.retTypes, reply)
          };
        }
        return decodeReturnValue(func.retTypes, reply);
      } else {
        const errorCode = new UnexpectedErrorCode(`Call was returned undefined. We cannot determine if the call was successful or not. Return types: [${func.retTypes.map((t) => t.display()).join(",")}].`);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails
        };
        throw UnknownError.fromCode(errorCode);
      }
    };
  }
  const handler = (...args) => caller({}, ...args);
  handler.withOptions = (options) => (...args) => caller(options, ...args);
  return handler;
}
var QueryObserver = (_a = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _QueryObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _currentQuery);
    __privateAdd(this, _currentQueryInitialState);
    __privateAdd(this, _currentResult);
    __privateAdd(this, _currentResultState);
    __privateAdd(this, _currentResultOptions);
    __privateAdd(this, _currentThenable);
    __privateAdd(this, _selectError);
    __privateAdd(this, _selectFn);
    __privateAdd(this, _selectResult);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    __privateAdd(this, _lastQueryWithDefinedData);
    __privateAdd(this, _staleTimeoutId);
    __privateAdd(this, _refetchIntervalId);
    __privateAdd(this, _currentRefetchInterval);
    __privateAdd(this, _trackedProps, /* @__PURE__ */ new Set());
    this.options = options;
    __privateSet(this, _client, client);
    __privateSet(this, _selectError, null);
    __privateSet(this, _currentThenable, pendingThenable());
    this.bindMethods();
    this.setOptions(options);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      __privateGet(this, _currentQuery).addObserver(this);
      if (shouldFetchOnMount(__privateGet(this, _currentQuery), this.options)) {
        __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
      } else {
        this.updateResult();
      }
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
    __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
    __privateGet(this, _currentQuery).removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = __privateGet(this, _currentQuery);
    this.options = __privateGet(this, _client).defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
    __privateGet(this, _currentQuery).setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: __privateGet(this, _currentQuery),
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      __privateGet(this, _currentQuery),
      prevQuery,
      this.options,
      prevOptions
    )) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
    this.updateResult();
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || resolveStaleTime(this.options.staleTime, __privateGet(this, _currentQuery)) !== resolveStaleTime(prevOptions.staleTime, __privateGet(this, _currentQuery)))) {
      __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
    }
    const nextRefetchInterval = __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this);
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || nextRefetchInterval !== __privateGet(this, _currentRefetchInterval))) {
      __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      __privateSet(this, _currentResult, result);
      __privateSet(this, _currentResultOptions, this.options);
      __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    }
    return result;
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked == null ? void 0 : onPropTracked(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && __privateGet(this, _currentThenable).status === "pending") {
            __privateGet(this, _currentThenable).reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    __privateGet(this, _trackedProps).add(key);
  }
  getCurrentQuery() {
    return __privateGet(this, _currentQuery);
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = __privateGet(this, _client).defaultQueryOptions(options);
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this, {
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return __privateGet(this, _currentResult);
    });
  }
  createResult(query, options) {
    var _a2;
    const prevQuery = __privateGet(this, _currentQuery);
    const prevOptions = this.options;
    const prevResult = __privateGet(this, _currentResult);
    const prevResultState = __privateGet(this, _currentResultState);
    const prevResultOptions = __privateGet(this, _currentResultOptions);
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : __privateGet(this, _currentQueryInitialState);
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          (_a2 = __privateGet(this, _lastQueryWithDefinedData)) == null ? void 0 : _a2.state.data,
          __privateGet(this, _lastQueryWithDefinedData)
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult == null ? void 0 : prevResult.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === __privateGet(this, _selectFn)) {
        data = __privateGet(this, _selectResult);
      } else {
        try {
          __privateSet(this, _selectFn, options.select);
          data = options.select(data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          __privateSet(this, _selectResult, data);
          __privateSet(this, _selectError, null);
        } catch (selectError) {
          __privateSet(this, _selectError, selectError);
        }
      }
    }
    if (__privateGet(this, _selectError)) {
      error = __privateGet(this, _selectError);
      data = __privateGet(this, _selectResult);
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: __privateGet(this, _currentThenable),
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = __privateSet(this, _currentThenable, nextResult.promise = pendingThenable());
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = __privateGet(this, _currentThenable);
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = __privateGet(this, _currentResult);
    const nextResult = this.createResult(__privateGet(this, _currentQuery), this.options);
    __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    __privateSet(this, _currentResultOptions, this.options);
    if (__privateGet(this, _currentResultState).data !== void 0) {
      __privateSet(this, _lastQueryWithDefinedData, __privateGet(this, _currentQuery));
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    __privateSet(this, _currentResult, nextResult);
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !__privateGet(this, _trackedProps).size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? __privateGet(this, _trackedProps)
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(__privateGet(this, _currentResult)).some((key) => {
        const typedKey = key;
        const changed = __privateGet(this, _currentResult)[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    __privateMethod(this, _QueryObserver_instances, notify_fn).call(this, { listeners: shouldNotifyListeners() });
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
}, _client = new WeakMap(), _currentQuery = new WeakMap(), _currentQueryInitialState = new WeakMap(), _currentResult = new WeakMap(), _currentResultState = new WeakMap(), _currentResultOptions = new WeakMap(), _currentThenable = new WeakMap(), _selectError = new WeakMap(), _selectFn = new WeakMap(), _selectResult = new WeakMap(), _lastQueryWithDefinedData = new WeakMap(), _staleTimeoutId = new WeakMap(), _refetchIntervalId = new WeakMap(), _currentRefetchInterval = new WeakMap(), _trackedProps = new WeakMap(), _QueryObserver_instances = new WeakSet(), executeFetch_fn = function(fetchOptions) {
  __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
  let promise = __privateGet(this, _currentQuery).fetch(
    this.options,
    fetchOptions
  );
  if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
    promise = promise.catch(noop);
  }
  return promise;
}, updateStaleTimeout_fn = function() {
  __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
  const staleTime = resolveStaleTime(
    this.options.staleTime,
    __privateGet(this, _currentQuery)
  );
  if (environmentManager.isServer() || __privateGet(this, _currentResult).isStale || !isValidTimeout(staleTime)) {
    return;
  }
  const time = timeUntilStale(__privateGet(this, _currentResult).dataUpdatedAt, staleTime);
  const timeout2 = time + 1;
  __privateSet(this, _staleTimeoutId, timeoutManager.setTimeout(() => {
    if (!__privateGet(this, _currentResult).isStale) {
      this.updateResult();
    }
  }, timeout2));
}, computeRefetchInterval_fn = function() {
  return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(__privateGet(this, _currentQuery)) : this.options.refetchInterval) ?? false;
}, updateRefetchInterval_fn = function(nextInterval) {
  __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
  __privateSet(this, _currentRefetchInterval, nextInterval);
  if (environmentManager.isServer() || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) === false || !isValidTimeout(__privateGet(this, _currentRefetchInterval)) || __privateGet(this, _currentRefetchInterval) === 0) {
    return;
  }
  __privateSet(this, _refetchIntervalId, timeoutManager.setInterval(() => {
    if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
  }, __privateGet(this, _currentRefetchInterval)));
}, updateTimers_fn = function() {
  __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
  __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this));
}, clearStaleTimeout_fn = function() {
  if (__privateGet(this, _staleTimeoutId)) {
    timeoutManager.clearTimeout(__privateGet(this, _staleTimeoutId));
    __privateSet(this, _staleTimeoutId, void 0);
  }
}, clearRefetchInterval_fn = function() {
  if (__privateGet(this, _refetchIntervalId)) {
    timeoutManager.clearInterval(__privateGet(this, _refetchIntervalId));
    __privateSet(this, _refetchIntervalId, void 0);
  }
}, updateQuery_fn = function() {
  const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), this.options);
  if (query === __privateGet(this, _currentQuery)) {
    return;
  }
  const prevQuery = __privateGet(this, _currentQuery);
  __privateSet(this, _currentQuery, query);
  __privateSet(this, _currentQueryInitialState, query.state);
  if (this.hasListeners()) {
    prevQuery == null ? void 0 : prevQuery.removeObserver(this);
    query.addObserver(this);
  }
}, notify_fn = function(notifyOptions) {
  notifyManager.batch(() => {
    if (notifyOptions.listeners) {
      this.listeners.forEach((listener) => {
        listener(__privateGet(this, _currentResult));
      });
    }
    __privateGet(this, _client).getQueryCache().notify({
      query: __privateGet(this, _currentQuery),
      type: "observerResultsUpdated"
    });
  });
}, _a);
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = (query == null ? void 0 : query.state.error) && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  var _a2, _b, _c, _d;
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  (_b = (_a2 = client.getDefaultOptions().queries) == null ? void 0 : _a2._experimental_beforeQuery) == null ? void 0 : _b.call(
    _a2,
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  (_d = (_c = client.getDefaultOptions().queries) == null ? void 0 : _c._experimental_afterQuery) == null ? void 0 : _d.call(
    _c,
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query == null ? void 0 : query.promise
    );
    promise == null ? void 0 : promise.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
function hasAccessControl(actor) {
  return typeof actor === "object" && actor !== null && "_initializeAccessControl" in actor;
}
const ACTOR_QUERY_KEY = "actor";
function useActor(createActor2) {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;
      if (!isAuthenticated) {
        return await createActorWithConfig(createActor2);
      }
      const actorOptions = {
        agentOptions: {
          identity
        }
      };
      const actor = await createActorWithConfig(createActor2, actorOptions);
      if (hasAccessControl(actor)) {
        await actor._initializeAccessControl();
      }
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
const _ImmutableObjectStorageCreateCertificateResult = Record({
  "method": Text,
  "blob_hash": Text
});
const _ImmutableObjectStorageRefillInformation = Record({
  "proposed_top_up_amount": Opt(Nat)
});
const _ImmutableObjectStorageRefillResult = Record({
  "success": Opt(Bool),
  "topped_up_amount": Opt(Nat)
});
const AbsenceId = Nat;
const AbsenceStatus = Variant({
  "submitted": Null,
  "approved": Null,
  "rejected": Null
});
const AbsenceTypeId = Nat;
const Timestamp = Int;
const EmployeeId = Nat;
const CompanyId = Nat;
const Absence = Record({
  "id": AbsenceId,
  "status": AbsenceStatus,
  "absenceTypeId": AbsenceTypeId,
  "dateTo": Text,
  "ganztaetig": Bool,
  "approvedBy": Opt(Principal$1),
  "createdAt": Timestamp,
  "description": Opt(Text),
  "employeeId": EmployeeId,
  "resetReason": Opt(Text),
  "rejectionComment": Opt(Text),
  "dateFrom": Text,
  "dauer": Nat,
  "companyId": CompanyId
});
const Result_15 = Variant({ "ok": Absence, "err": Text });
const ExpenseId = Nat;
const ExpenseStatus = Variant({
  "pending": Null,
  "approved": Null,
  "rejected": Null
});
const ExpenseTypeId = Nat;
const Expense = Record({
  "id": ExpenseId,
  "status": ExpenseStatus,
  "date": Text,
  "description": Text,
  "employeeId": EmployeeId,
  "resetReason": Opt(Text),
  "billableCHF": Float64,
  "reimbursementCHF": Float64,
  "expenseTypeId": ExpenseTypeId,
  "receiptBlobId": Opt(Text),
  "companyId": CompanyId
});
const Result_8 = Variant({ "ok": Expense, "err": Text });
const UserRole = Variant({
  "admin": Null,
  "user": Null,
  "guest": Null
});
const ProjectId = Nat;
const ProjectAssignment = Record({
  "employeeId": EmployeeId,
  "projectId": ProjectId,
  "companyId": CompanyId
});
const Result_26 = Variant({
  "ok": ProjectAssignment,
  "err": Text
});
const CreateAbsenceInput = Record({
  "absenceTypeId": AbsenceTypeId,
  "dateTo": Text,
  "ganztaetig": Bool,
  "description": Opt(Text),
  "dateFrom": Text,
  "dauer": Nat
});
const CreateAbsenceTypeInput = Record({
  "aktiv": Opt(Bool),
  "name": Text,
  "requiresApproval": Bool,
  "compensated": Bool
});
const AbsenceType = Record({
  "id": AbsenceTypeId,
  "aktiv": Bool,
  "name": Text,
  "requiresApproval": Bool,
  "compensated": Bool,
  "companyId": CompanyId
});
const Result_14 = Variant({ "ok": AbsenceType, "err": Text });
const Rechnungsadresse = Record({
  "ort": Opt(Text),
  "plz": Opt(Text),
  "zusatz1": Opt(Text),
  "zusatz2": Opt(Text),
  "postfach": Opt(Text),
  "land": Text,
  "strasse": Opt(Text)
});
const KundeZeiterfassungsart = Variant({
  "stuendlich": Null,
  "block": Null
});
const CreateCustomerInput = Record({
  "rechnungsadresse": Opt(Rechnungsadresse),
  "contact": Opt(Text),
  "aktiv": Opt(Bool),
  "name": Text,
  "zeiterfassungsart": Opt(KundeZeiterfassungsart),
  "kundennummer": Opt(Text),
  "notes": Opt(Text),
  "beschreibung": Opt(Text),
  "waehrung": Opt(Text)
});
const CustomerId = Nat;
const Customer = Record({
  "id": CustomerId,
  "rechnungsadresse": Opt(Rechnungsadresse),
  "contact": Opt(Text),
  "aktiv": Bool,
  "name": Text,
  "zeiterfassungsart": KundeZeiterfassungsart,
  "kundennummer": Opt(Text),
  "notes": Opt(Text),
  "beschreibung": Opt(Text),
  "waehrung": Text,
  "companyId": CompanyId
});
const Result_11 = Variant({ "ok": Customer, "err": Text });
const Role = Variant({
  "manager": Null,
  "admin": Null,
  "employee": Null
});
const EmploymentType = Variant({
  "partTime": Null,
  "fullTime": Null,
  "contractor": Null
});
const CreateEmployeeInput = Record({
  "ort": Opt(Text),
  "plz": Opt(Text),
  "weeklyHoursTarget": Float64,
  "postfach": Opt(Text),
  "land": Opt(Text),
  "role": Role,
  "email": Text,
  "geburtsdatum": Opt(Int),
  "employmentType": EmploymentType,
  "adresseZusatz1": Opt(Text),
  "adresseZusatz2": Opt(Text),
  "lastName": Text,
  "strasse": Opt(Text),
  "startDate": Text,
  "firstName": Text
});
const Employee = Record({
  "id": EmployeeId,
  "ort": Opt(Text),
  "plz": Opt(Text),
  "weeklyHoursTarget": Float64,
  "active": Bool,
  "postfach": Opt(Text),
  "land": Opt(Text),
  "role": Role,
  "email": Text,
  "geburtsdatum": Opt(Int),
  "employmentType": EmploymentType,
  "adresseZusatz1": Opt(Text),
  "adresseZusatz2": Opt(Text),
  "lastName": Text,
  "principalId": Opt(Principal$1),
  "strasse": Opt(Text),
  "startDate": Text,
  "companyId": CompanyId,
  "firstName": Text
});
const Result_10 = Variant({ "ok": Employee, "err": Text });
const FeiertagsberechnungsartType = Variant({
  "exaktWochentag": Null,
  "entschaedigt": Null,
  "exakt": Null,
  "prozentual": Null
});
const CreateEmploymentInput = Record({
  "bis": Opt(Int),
  "von": Int,
  "pensum": Float64,
  "feiertagsberechnungsart": FeiertagsberechnungsartType,
  "stundenDi": Nat,
  "stundenDo": Nat,
  "stundenFr": Nat,
  "stundenMi": Nat,
  "stundenMo": Nat,
  "stundenSa": Nat,
  "stundenSo": Nat,
  "funktion": Text
});
const Employment = Record({
  "id": Text,
  "bis": Opt(Int),
  "von": Int,
  "pensum": Float64,
  "feiertagsberechnungsart": FeiertagsberechnungsartType,
  "stundenDi": Nat,
  "stundenDo": Nat,
  "stundenFr": Nat,
  "stundenMi": Nat,
  "stundenMo": Nat,
  "stundenSa": Nat,
  "stundenSo": Nat,
  "employeeId": EmployeeId,
  "funktion": Text,
  "companyId": CompanyId
});
const Result_9 = Variant({ "ok": Employment, "err": Text });
const CreateExpenseInput = Record({
  "date": Text,
  "description": Text,
  "billableCHF": Float64,
  "reimbursementCHF": Float64,
  "expenseTypeId": ExpenseTypeId,
  "receiptBlobId": Opt(Text)
});
const CreateExpenseTypeInput = Record({
  "aktiv": Opt(Bool),
  "name": Text,
  "billable": Bool,
  "reimbursable": Bool
});
const ExpenseType = Record({
  "id": ExpenseTypeId,
  "aktiv": Bool,
  "name": Text,
  "billable": Bool,
  "reimbursable": Bool,
  "companyId": CompanyId
});
const Result_7 = Variant({ "ok": ExpenseType, "err": Text });
const CreateHolidayInput = Record({
  "ganztaegig": Opt(Bool),
  "date": Text,
  "name": Text
});
const HolidayId = Nat;
const Holiday = Record({
  "id": HolidayId,
  "ganztaegig": Bool,
  "date": Text,
  "name": Text,
  "companyId": CompanyId
});
const Result_6 = Variant({ "ok": Holiday, "err": Text });
const ProjectStatus = Variant({
  "aktiv": Null,
  "inaktiv": Null,
  "abgeschlossen": Null
});
const Erfassungsart = Variant({
  "zeitBlock": Null,
  "dauer": Null
});
const CreateProjectInput = Record({
  "status": Opt(ProjectStatus),
  "erfassungsart": Opt(Erfassungsart),
  "code": Text,
  "billableRate": Float64,
  "name": Text,
  "customerId": CustomerId,
  "kurzbezeichnung": Text,
  "projektleiter": Opt(EmployeeId)
});
const Project = Record({
  "id": ProjectId,
  "status": ProjectStatus,
  "erfassungsart": Opt(Erfassungsart),
  "active": Bool,
  "code": Text,
  "billableRate": Float64,
  "name": Text,
  "customerId": CustomerId,
  "kurzbezeichnung": Text,
  "projektleiter": Opt(EmployeeId),
  "companyId": CompanyId
});
const Result_5 = Variant({ "ok": Project, "err": Text });
const CreateServiceTypeInput = Record({
  "defaultRate": Float64,
  "aktiv": Opt(Bool),
  "name": Text,
  "billable": Bool
});
const ServiceTypeId = Nat;
const ServiceType = Record({
  "id": ServiceTypeId,
  "defaultRate": Float64,
  "aktiv": Bool,
  "name": Text,
  "billable": Bool,
  "companyId": CompanyId
});
const Result_4 = Variant({ "ok": ServiceType, "err": Text });
const CreateTimeBalanceCorrectionInput = Record({
  "typ": Variant({ "gutschrift": Null, "reduktion": Null }),
  "ueberzeit": Int,
  "bemerkung": Text,
  "wirkungsdatum": Int,
  "dauer": Int
});
const TimeBalanceCorrection = Record({
  "id": Text,
  "typ": Variant({ "gutschrift": Null, "reduktion": Null }),
  "ueberzeit": Int,
  "bemerkung": Text,
  "employeeId": EmployeeId,
  "wirkungsdatum": Int,
  "dauer": Int,
  "companyId": CompanyId
});
const Result_3 = Variant({
  "ok": TimeBalanceCorrection,
  "err": Text
});
const CreateTimeEntryInput = Record({
  "bis": Opt(Text),
  "von": Opt(Text),
  "hours": Float64,
  "date": Text,
  "description": Text,
  "billable": Bool,
  "projectId": ProjectId,
  "serviceTypeId": ServiceTypeId
});
const TimeEntryId = Nat;
const TimeEntry = Record({
  "id": TimeEntryId,
  "bis": Opt(Text),
  "von": Opt(Text),
  "hours": Float64,
  "date": Text,
  "createdAt": Timestamp,
  "description": Text,
  "employeeId": EmployeeId,
  "billable": Bool,
  "projectId": ProjectId,
  "serviceTypeId": ServiceTypeId,
  "companyId": CompanyId
});
const Result_2 = Variant({ "ok": TimeEntry, "err": Text });
const CreateVacationBalanceInput = Record({
  "verfallsdatum": Opt(Int),
  "kalenderjahr": Int,
  "dauer": Int
});
const VacationBalance = Record({
  "id": Text,
  "verfallsdatum": Opt(Int),
  "employeeId": EmployeeId,
  "kalenderjahr": Int,
  "dauer": Int,
  "companyId": CompanyId
});
const Result = Variant({ "ok": VacationBalance, "err": Text });
const Result_16 = Variant({ "ok": Null, "err": Text });
const Result_25 = Variant({ "ok": Text, "err": Text });
const CalendarData = Record({
  "absences": Vec(Absence),
  "expenses": Vec(Expense),
  "timeEntries": Vec(TimeEntry)
});
const CompanySettings = Record({
  "timezone": Text,
  "approvalRequired": Bool,
  "allowExpiredVacationBalance": Bool,
  "emailNewVacationRequest": Bool,
  "emailOnApproval": Bool,
  "vacationCarryoverDays": Nat,
  "maxVacationDays": Nat,
  "companyId": CompanyId
});
const Result_12 = Variant({
  "ok": CompanySettings,
  "err": Text
});
const DashboardStats = Record({
  "hoursTarget": Float64,
  "pendingExpenses": Nat,
  "hoursThisWeek": Float64,
  "remainingVacationMinutes": Int,
  "approvedVacationDays": Nat,
  "pendingVacations": Nat
});
const WorkTimeBalance = Record({
  "istStunden": Int,
  "ueberzeit": Int,
  "saldo": Int,
  "periodEnd": Text,
  "periodStart": Text,
  "sollStunden": Int,
  "korrektionen": Int
});
const Result_24 = Variant({
  "ok": WorkTimeBalance,
  "err": Text
});
const Result_23 = Variant({
  "ok": Opt(Employment),
  "err": Text
});
const Company = Record({
  "id": CompanyId,
  "taxId": Opt(Text),
  "name": Text,
  "createdAt": Timestamp,
  "logoUrl": Opt(Text),
  "address": Opt(Text)
});
const Result_13 = Variant({ "ok": Company, "err": Text });
const StandardTimeBlock = Record({
  "bis": Text,
  "von": Text
});
const Standardarbeitszeiten = Record({
  "tuesday": Vec(StandardTimeBlock),
  "wednesday": Vec(StandardTimeBlock),
  "saturday": Vec(StandardTimeBlock),
  "thursday": Vec(StandardTimeBlock),
  "sunday": Vec(StandardTimeBlock),
  "friday": Vec(StandardTimeBlock),
  "monday": Vec(StandardTimeBlock)
});
const Result_21 = Variant({
  "ok": Standardarbeitszeiten,
  "err": Text
});
const ProjectMemberAssignment = Record({
  "stundensatz": Float64,
  "employeeId": EmployeeId,
  "serviceTypeId": ServiceTypeId
});
const Result_22 = Variant({
  "ok": Vec(ProjectMemberAssignment),
  "err": Text
});
const ReportFilter = Record({
  "dateTo": Text,
  "employeeId": Opt(EmployeeId),
  "projectId": Opt(ProjectId),
  "customerId": Opt(CompanyId),
  "dateFrom": Text
});
const ReportData = Record({
  "expenses": Float64,
  "entries": Vec(TimeEntry),
  "billableHours": Float64,
  "expenseItems": Vec(Expense)
});
const Result_20 = Variant({ "ok": Int, "err": Text });
const UserNotificationSettings = Record({
  "emailNewVacationRequest": Bool,
  "emailOnApproval": Bool,
  "principalId": Principal$1,
  "companyId": CompanyId
});
const Result_1 = Variant({
  "ok": UserNotificationSettings,
  "err": Text
});
const AbsenceFilter = Record({
  "status": Opt(AbsenceStatus),
  "absenceTypeId": Opt(AbsenceTypeId),
  "dateTo": Opt(Text),
  "employeeId": Opt(EmployeeId),
  "dateFrom": Opt(Text)
});
const Time = Int;
const AuditEntry = Record({
  "id": Nat,
  "oldStatus": Text,
  "action": Text,
  "changedBy": Principal$1,
  "timestamp": Time,
  "targetType": Text,
  "newStatus": Text,
  "targetId": Nat,
  "previousApprovedBy": Opt(Principal$1),
  "reason": Opt(Text)
});
const Result_19 = Variant({
  "ok": Vec(Employment),
  "err": Text
});
const ExpenseFilter = Record({
  "status": Opt(ExpenseStatus),
  "dateTo": Opt(Text),
  "employeeId": Opt(EmployeeId),
  "dateFrom": Opt(Text)
});
const Result_18 = Variant({
  "ok": Vec(TimeBalanceCorrection),
  "err": Text
});
const TimeEntryFilter = Record({
  "dateTo": Opt(Text),
  "employeeId": Opt(EmployeeId),
  "projectId": Opt(ProjectId),
  "dateFrom": Opt(Text)
});
const Result_17 = Variant({
  "ok": Vec(VacationBalance),
  "err": Text
});
const UpdateAbsenceInput = Record({
  "dateTo": Opt(Text),
  "ganztaetig": Opt(Bool),
  "description": Opt(Text),
  "dateFrom": Opt(Text),
  "dauer": Opt(Nat)
});
const UpdateAbsenceTypeInput = Record({
  "aktiv": Opt(Bool),
  "name": Opt(Text),
  "requiresApproval": Opt(Bool),
  "compensated": Opt(Bool)
});
const UpdateCompanyInput = Record({
  "taxId": Opt(Text),
  "name": Opt(Text),
  "logoUrl": Opt(Text),
  "address": Opt(Text)
});
const UpdateCustomerInput = Record({
  "rechnungsadresse": Opt(Rechnungsadresse),
  "contact": Opt(Text),
  "aktiv": Opt(Bool),
  "name": Opt(Text),
  "zeiterfassungsart": Opt(KundeZeiterfassungsart),
  "kundennummer": Opt(Text),
  "notes": Opt(Text),
  "beschreibung": Opt(Text),
  "waehrung": Opt(Text)
});
const UpdateEmployeeInput = Record({
  "ort": Opt(Text),
  "plz": Opt(Text),
  "weeklyHoursTarget": Opt(Float64),
  "active": Opt(Bool),
  "postfach": Opt(Text),
  "land": Opt(Text),
  "role": Opt(Role),
  "email": Opt(Text),
  "geburtsdatum": Opt(Int),
  "employmentType": Opt(EmploymentType),
  "adresseZusatz1": Opt(Text),
  "adresseZusatz2": Opt(Text),
  "lastName": Opt(Text),
  "strasse": Opt(Text),
  "startDate": Opt(Text),
  "firstName": Opt(Text)
});
const UpdateEmploymentInput = Record({
  "bis": Opt(Int),
  "von": Opt(Int),
  "pensum": Float64,
  "feiertagsberechnungsart": Opt(FeiertagsberechnungsartType),
  "stundenDi": Nat,
  "stundenDo": Nat,
  "stundenFr": Nat,
  "stundenMi": Nat,
  "stundenMo": Nat,
  "stundenSa": Nat,
  "stundenSo": Nat,
  "funktion": Opt(Text)
});
const UpdateExpenseInput = Record({
  "date": Opt(Text),
  "description": Opt(Text),
  "billableCHF": Opt(Float64),
  "reimbursementCHF": Opt(Float64),
  "expenseTypeId": Opt(ExpenseTypeId),
  "receiptBlobId": Opt(Text)
});
const UpdateExpenseTypeInput = Record({
  "aktiv": Opt(Bool),
  "name": Opt(Text),
  "billable": Opt(Bool),
  "reimbursable": Opt(Bool)
});
const UpdateHolidayInput = Record({
  "ganztaegig": Opt(Bool),
  "date": Opt(Text),
  "name": Opt(Text)
});
const UpdateProjectInput = Record({
  "status": Opt(ProjectStatus),
  "erfassungsart": Opt(Erfassungsart),
  "active": Opt(Bool),
  "code": Opt(Text),
  "billableRate": Opt(Float64),
  "name": Opt(Text),
  "customerId": Opt(CustomerId),
  "kurzbezeichnung": Opt(Text),
  "projektleiter": Opt(EmployeeId)
});
const UpdateServiceTypeInput = Record({
  "defaultRate": Opt(Float64),
  "aktiv": Opt(Bool),
  "name": Opt(Text),
  "billable": Opt(Bool)
});
const UpdateTimeBalanceCorrectionInput = Record({
  "typ": Opt(
    Variant({ "gutschrift": Null, "reduktion": Null })
  ),
  "ueberzeit": Opt(Int),
  "bemerkung": Opt(Text),
  "wirkungsdatum": Opt(Int),
  "dauer": Opt(Int)
});
const UpdateTimeEntryInput = Record({
  "bis": Opt(Text),
  "von": Opt(Text),
  "hours": Opt(Float64),
  "date": Opt(Text),
  "description": Opt(Text),
  "billable": Opt(Bool),
  "projectId": Opt(ProjectId),
  "serviceTypeId": Opt(ServiceTypeId)
});
const UpdateVacationBalanceInput = Record({
  "verfallsdatum": Opt(Int),
  "kalenderjahr": Opt(Int),
  "dauer": Opt(Int)
});
Service({
  "_immutableObjectStorageBlobsAreLive": Func(
    [Vec(Vec(Nat8))],
    [Vec(Bool)],
    ["query"]
  ),
  "_immutableObjectStorageBlobsToDelete": Func(
    [],
    [Vec(Vec(Nat8))],
    ["query"]
  ),
  "_immutableObjectStorageConfirmBlobDeletion": Func(
    [Vec(Vec(Nat8))],
    [],
    []
  ),
  "_immutableObjectStorageCreateCertificate": Func(
    [Text],
    [_ImmutableObjectStorageCreateCertificateResult],
    []
  ),
  "_immutableObjectStorageRefillCashier": Func(
    [Opt(_ImmutableObjectStorageRefillInformation)],
    [_ImmutableObjectStorageRefillResult],
    []
  ),
  "_immutableObjectStorageUpdateGatewayPrincipals": Func([], [], []),
  "_initializeAccessControl": Func([], [], []),
  "approveAbsence": Func([AbsenceId], [Result_15], []),
  "approveExpense": Func([ExpenseId], [Result_8], []),
  "assignCallerUserRole": Func([Principal$1, UserRole], [], []),
  "assignEmployeeToProject": Func(
    [EmployeeId, ProjectId],
    [Result_26],
    []
  ),
  "createAbsence": Func([CreateAbsenceInput], [Result_15], []),
  "createAbsenceType": Func([CreateAbsenceTypeInput], [Result_14], []),
  "createCustomer": Func([CreateCustomerInput], [Result_11], []),
  "createEmployee": Func([CreateEmployeeInput], [Result_10], []),
  "createEmployment": Func(
    [EmployeeId, CreateEmploymentInput],
    [Result_9],
    []
  ),
  "createExpense": Func([CreateExpenseInput], [Result_8], []),
  "createExpenseType": Func([CreateExpenseTypeInput], [Result_7], []),
  "createHoliday": Func([CreateHolidayInput], [Result_6], []),
  "createProject": Func([CreateProjectInput], [Result_5], []),
  "createServiceType": Func([CreateServiceTypeInput], [Result_4], []),
  "createTimeBalanceCorrection": Func(
    [EmployeeId, CreateTimeBalanceCorrectionInput],
    [Result_3],
    []
  ),
  "createTimeEntry": Func([CreateTimeEntryInput], [Result_2], []),
  "createVacationBalance": Func(
    [EmployeeId, CreateVacationBalanceInput],
    [Result],
    []
  ),
  "deleteAbsence": Func([AbsenceId], [Result_16], []),
  "deleteAbsenceType": Func([AbsenceTypeId], [Result_16], []),
  "deleteCustomer": Func([CustomerId], [Result_16], []),
  "deleteEmployee": Func([EmployeeId], [Result_16], []),
  "deleteEmployment": Func([EmployeeId, Text], [Result_16], []),
  "deleteExpense": Func([ExpenseId], [Result_16], []),
  "deleteExpenseType": Func([ExpenseTypeId], [Result_16], []),
  "deleteHoliday": Func([HolidayId], [Result_16], []),
  "deleteProject": Func([ProjectId], [Result_16], []),
  "deleteServiceType": Func([ServiceTypeId], [Result_16], []),
  "deleteTimeBalanceCorrection": Func(
    [EmployeeId, Text],
    [Result_16],
    []
  ),
  "deleteTimeEntry": Func([TimeEntryId], [Result_16], []),
  "deleteVacationBalance": Func([EmployeeId, Text], [Result_16], []),
  "generateInviteCode": Func([EmployeeId], [Result_25], []),
  "getCalendarEntries": Func(
    [Text, Nat],
    [CalendarData],
    ["query"]
  ),
  "getCallerUserRole": Func([], [UserRole], ["query"]),
  "getCompanySettings": Func([], [Result_12], ["query"]),
  "getDashboardStats": Func([], [DashboardStats], ["query"]),
  "getEmployeeWorkTimeBalance": Func(
    [EmployeeId, Text, Text],
    [Result_24],
    ["query"]
  ),
  "getEmployeeWorkTimeBalanceFromStart": Func(
    [EmployeeId],
    [Result_24],
    ["query"]
  ),
  "getEmploymentForDate": Func(
    [EmployeeId, Text],
    [Result_23],
    ["query"]
  ),
  "getMyCompany": Func([], [Result_13], ["query"]),
  "getMyEmployee": Func([], [Result_10], ["query"]),
  "getMyStandardarbeitszeiten": Func([], [Result_21], ["query"]),
  "getProjectMembers": Func([ProjectId], [Result_22], ["query"]),
  "getReportData": Func([ReportFilter], [ReportData], ["query"]),
  "getStandardarbeitszeitenForEmployee": Func(
    [EmployeeId],
    [Result_21],
    ["query"]
  ),
  "getTimeBalance": Func([EmployeeId], [Result_20], ["query"]),
  "getUserNotificationSettings": Func([], [Result_1], ["query"]),
  "isCallerAdmin": Func([], [Bool], ["query"]),
  "isRegistered": Func([], [Bool], ["query"]),
  "listAbsenceTypes": Func([], [Vec(AbsenceType)], ["query"]),
  "listAbsences": Func([AbsenceFilter], [Vec(Absence)], ["query"]),
  "listAuditLog": Func(
    [Opt(Text), Opt(Nat)],
    [Vec(AuditEntry)],
    ["query"]
  ),
  "listCustomers": Func([], [Vec(Customer)], ["query"]),
  "listEmployees": Func([], [Vec(Employee)], ["query"]),
  "listEmployments": Func([EmployeeId], [Result_19], ["query"]),
  "listExpenseTypes": Func([], [Vec(ExpenseType)], ["query"]),
  "listExpenses": Func([ExpenseFilter], [Vec(Expense)], ["query"]),
  "listHolidays": Func([], [Vec(Holiday)], ["query"]),
  "listProjectAssignments": Func(
    [],
    [Vec(ProjectAssignment)],
    ["query"]
  ),
  "listProjects": Func([], [Vec(Project)], ["query"]),
  "listServiceTypes": Func([], [Vec(ServiceType)], ["query"]),
  "listTimeBalanceCorrections": Func([EmployeeId], [Result_18], ["query"]),
  "listTimeEntries": Func(
    [TimeEntryFilter],
    [Vec(TimeEntry)],
    ["query"]
  ),
  "listVacationBalances": Func([EmployeeId], [Result_17], ["query"]),
  "redeemInviteCode": Func([Text], [Result_10], []),
  "registerCompany": Func(
    [Text, Text, Text, Text],
    [Result_13],
    []
  ),
  "rejectAbsence": Func([AbsenceId, Text], [Result_15], []),
  "rejectExpense": Func([ExpenseId, Opt(Text)], [Result_8], []),
  "removeEmployeeFromProject": Func(
    [EmployeeId, ProjectId],
    [Result_16],
    []
  ),
  "resetAbsenceToAusstehend": Func([AbsenceId, Text], [Result_15], []),
  "resetExpenseToAusstehend": Func([ExpenseId, Text], [Result_8], []),
  "revokeInviteCode": Func([Text], [Result_16], []),
  "setMyStandardarbeitszeiten": Func(
    [Standardarbeitszeiten],
    [Result_16],
    []
  ),
  "setProjectMembers": Func(
    [ProjectId, Vec(ProjectMemberAssignment)],
    [Result_16],
    []
  ),
  "setStandardarbeitszeitenForEmployee": Func(
    [EmployeeId, Standardarbeitszeiten],
    [Result_16],
    []
  ),
  "updateAbsence": Func([AbsenceId, UpdateAbsenceInput], [Result_15], []),
  "updateAbsenceType": Func(
    [AbsenceTypeId, UpdateAbsenceTypeInput],
    [Result_14],
    []
  ),
  "updateCompany": Func([UpdateCompanyInput], [Result_13], []),
  "updateCompanySettings": Func([CompanySettings], [Result_12], []),
  "updateCustomer": Func(
    [CustomerId, UpdateCustomerInput],
    [Result_11],
    []
  ),
  "updateEmployee": Func(
    [EmployeeId, UpdateEmployeeInput],
    [Result_10],
    []
  ),
  "updateEmployment": Func(
    [EmployeeId, Text, UpdateEmploymentInput],
    [Result_9],
    []
  ),
  "updateExpense": Func([ExpenseId, UpdateExpenseInput], [Result_8], []),
  "updateExpenseType": Func(
    [ExpenseTypeId, UpdateExpenseTypeInput],
    [Result_7],
    []
  ),
  "updateHoliday": Func([HolidayId, UpdateHolidayInput], [Result_6], []),
  "updateProject": Func([ProjectId, UpdateProjectInput], [Result_5], []),
  "updateServiceType": Func(
    [ServiceTypeId, UpdateServiceTypeInput],
    [Result_4],
    []
  ),
  "updateTimeBalanceCorrection": Func(
    [EmployeeId, Text, UpdateTimeBalanceCorrectionInput],
    [Result_3],
    []
  ),
  "updateTimeEntry": Func(
    [TimeEntryId, UpdateTimeEntryInput],
    [Result_2],
    []
  ),
  "updateUserNotificationSettings": Func(
    [UserNotificationSettings],
    [Result_1],
    []
  ),
  "updateVacationBalance": Func(
    [EmployeeId, Text, UpdateVacationBalanceInput],
    [Result],
    []
  )
});
const idlFactory = ({ IDL: IDL2 }) => {
  const _ImmutableObjectStorageCreateCertificateResult2 = IDL2.Record({
    "method": IDL2.Text,
    "blob_hash": IDL2.Text
  });
  const _ImmutableObjectStorageRefillInformation2 = IDL2.Record({
    "proposed_top_up_amount": IDL2.Opt(IDL2.Nat)
  });
  const _ImmutableObjectStorageRefillResult2 = IDL2.Record({
    "success": IDL2.Opt(IDL2.Bool),
    "topped_up_amount": IDL2.Opt(IDL2.Nat)
  });
  const AbsenceId2 = IDL2.Nat;
  const AbsenceStatus2 = IDL2.Variant({
    "submitted": IDL2.Null,
    "approved": IDL2.Null,
    "rejected": IDL2.Null
  });
  const AbsenceTypeId2 = IDL2.Nat;
  const Timestamp2 = IDL2.Int;
  const EmployeeId2 = IDL2.Nat;
  const CompanyId2 = IDL2.Nat;
  const Absence2 = IDL2.Record({
    "id": AbsenceId2,
    "status": AbsenceStatus2,
    "absenceTypeId": AbsenceTypeId2,
    "dateTo": IDL2.Text,
    "ganztaetig": IDL2.Bool,
    "approvedBy": IDL2.Opt(IDL2.Principal),
    "createdAt": Timestamp2,
    "description": IDL2.Opt(IDL2.Text),
    "employeeId": EmployeeId2,
    "resetReason": IDL2.Opt(IDL2.Text),
    "rejectionComment": IDL2.Opt(IDL2.Text),
    "dateFrom": IDL2.Text,
    "dauer": IDL2.Nat,
    "companyId": CompanyId2
  });
  const Result_152 = IDL2.Variant({ "ok": Absence2, "err": IDL2.Text });
  const ExpenseId2 = IDL2.Nat;
  const ExpenseStatus2 = IDL2.Variant({
    "pending": IDL2.Null,
    "approved": IDL2.Null,
    "rejected": IDL2.Null
  });
  const ExpenseTypeId2 = IDL2.Nat;
  const Expense2 = IDL2.Record({
    "id": ExpenseId2,
    "status": ExpenseStatus2,
    "date": IDL2.Text,
    "description": IDL2.Text,
    "employeeId": EmployeeId2,
    "resetReason": IDL2.Opt(IDL2.Text),
    "billableCHF": IDL2.Float64,
    "reimbursementCHF": IDL2.Float64,
    "expenseTypeId": ExpenseTypeId2,
    "receiptBlobId": IDL2.Opt(IDL2.Text),
    "companyId": CompanyId2
  });
  const Result_82 = IDL2.Variant({ "ok": Expense2, "err": IDL2.Text });
  const UserRole2 = IDL2.Variant({
    "admin": IDL2.Null,
    "user": IDL2.Null,
    "guest": IDL2.Null
  });
  const ProjectId2 = IDL2.Nat;
  const ProjectAssignment2 = IDL2.Record({
    "employeeId": EmployeeId2,
    "projectId": ProjectId2,
    "companyId": CompanyId2
  });
  const Result_262 = IDL2.Variant({ "ok": ProjectAssignment2, "err": IDL2.Text });
  const CreateAbsenceInput2 = IDL2.Record({
    "absenceTypeId": AbsenceTypeId2,
    "dateTo": IDL2.Text,
    "ganztaetig": IDL2.Bool,
    "description": IDL2.Opt(IDL2.Text),
    "dateFrom": IDL2.Text,
    "dauer": IDL2.Nat
  });
  const CreateAbsenceTypeInput2 = IDL2.Record({
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Text,
    "requiresApproval": IDL2.Bool,
    "compensated": IDL2.Bool
  });
  const AbsenceType2 = IDL2.Record({
    "id": AbsenceTypeId2,
    "aktiv": IDL2.Bool,
    "name": IDL2.Text,
    "requiresApproval": IDL2.Bool,
    "compensated": IDL2.Bool,
    "companyId": CompanyId2
  });
  const Result_142 = IDL2.Variant({ "ok": AbsenceType2, "err": IDL2.Text });
  const Rechnungsadresse2 = IDL2.Record({
    "ort": IDL2.Opt(IDL2.Text),
    "plz": IDL2.Opt(IDL2.Text),
    "zusatz1": IDL2.Opt(IDL2.Text),
    "zusatz2": IDL2.Opt(IDL2.Text),
    "postfach": IDL2.Opt(IDL2.Text),
    "land": IDL2.Text,
    "strasse": IDL2.Opt(IDL2.Text)
  });
  const KundeZeiterfassungsart2 = IDL2.Variant({
    "stuendlich": IDL2.Null,
    "block": IDL2.Null
  });
  const CreateCustomerInput2 = IDL2.Record({
    "rechnungsadresse": IDL2.Opt(Rechnungsadresse2),
    "contact": IDL2.Opt(IDL2.Text),
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Text,
    "zeiterfassungsart": IDL2.Opt(KundeZeiterfassungsart2),
    "kundennummer": IDL2.Opt(IDL2.Text),
    "notes": IDL2.Opt(IDL2.Text),
    "beschreibung": IDL2.Opt(IDL2.Text),
    "waehrung": IDL2.Opt(IDL2.Text)
  });
  const CustomerId2 = IDL2.Nat;
  const Customer2 = IDL2.Record({
    "id": CustomerId2,
    "rechnungsadresse": IDL2.Opt(Rechnungsadresse2),
    "contact": IDL2.Opt(IDL2.Text),
    "aktiv": IDL2.Bool,
    "name": IDL2.Text,
    "zeiterfassungsart": KundeZeiterfassungsart2,
    "kundennummer": IDL2.Opt(IDL2.Text),
    "notes": IDL2.Opt(IDL2.Text),
    "beschreibung": IDL2.Opt(IDL2.Text),
    "waehrung": IDL2.Text,
    "companyId": CompanyId2
  });
  const Result_112 = IDL2.Variant({ "ok": Customer2, "err": IDL2.Text });
  const Role2 = IDL2.Variant({
    "manager": IDL2.Null,
    "admin": IDL2.Null,
    "employee": IDL2.Null
  });
  const EmploymentType2 = IDL2.Variant({
    "partTime": IDL2.Null,
    "fullTime": IDL2.Null,
    "contractor": IDL2.Null
  });
  const CreateEmployeeInput2 = IDL2.Record({
    "ort": IDL2.Opt(IDL2.Text),
    "plz": IDL2.Opt(IDL2.Text),
    "weeklyHoursTarget": IDL2.Float64,
    "postfach": IDL2.Opt(IDL2.Text),
    "land": IDL2.Opt(IDL2.Text),
    "role": Role2,
    "email": IDL2.Text,
    "geburtsdatum": IDL2.Opt(IDL2.Int),
    "employmentType": EmploymentType2,
    "adresseZusatz1": IDL2.Opt(IDL2.Text),
    "adresseZusatz2": IDL2.Opt(IDL2.Text),
    "lastName": IDL2.Text,
    "strasse": IDL2.Opt(IDL2.Text),
    "startDate": IDL2.Text,
    "firstName": IDL2.Text
  });
  const Employee2 = IDL2.Record({
    "id": EmployeeId2,
    "ort": IDL2.Opt(IDL2.Text),
    "plz": IDL2.Opt(IDL2.Text),
    "weeklyHoursTarget": IDL2.Float64,
    "active": IDL2.Bool,
    "postfach": IDL2.Opt(IDL2.Text),
    "land": IDL2.Opt(IDL2.Text),
    "role": Role2,
    "email": IDL2.Text,
    "geburtsdatum": IDL2.Opt(IDL2.Int),
    "employmentType": EmploymentType2,
    "adresseZusatz1": IDL2.Opt(IDL2.Text),
    "adresseZusatz2": IDL2.Opt(IDL2.Text),
    "lastName": IDL2.Text,
    "principalId": IDL2.Opt(IDL2.Principal),
    "strasse": IDL2.Opt(IDL2.Text),
    "startDate": IDL2.Text,
    "companyId": CompanyId2,
    "firstName": IDL2.Text
  });
  const Result_102 = IDL2.Variant({ "ok": Employee2, "err": IDL2.Text });
  const FeiertagsberechnungsartType2 = IDL2.Variant({
    "exaktWochentag": IDL2.Null,
    "entschaedigt": IDL2.Null,
    "exakt": IDL2.Null,
    "prozentual": IDL2.Null
  });
  const CreateEmploymentInput2 = IDL2.Record({
    "bis": IDL2.Opt(IDL2.Int),
    "von": IDL2.Int,
    "pensum": IDL2.Float64,
    "feiertagsberechnungsart": FeiertagsberechnungsartType2,
    "stundenDi": IDL2.Nat,
    "stundenDo": IDL2.Nat,
    "stundenFr": IDL2.Nat,
    "stundenMi": IDL2.Nat,
    "stundenMo": IDL2.Nat,
    "stundenSa": IDL2.Nat,
    "stundenSo": IDL2.Nat,
    "funktion": IDL2.Text
  });
  const Employment2 = IDL2.Record({
    "id": IDL2.Text,
    "bis": IDL2.Opt(IDL2.Int),
    "von": IDL2.Int,
    "pensum": IDL2.Float64,
    "feiertagsberechnungsart": FeiertagsberechnungsartType2,
    "stundenDi": IDL2.Nat,
    "stundenDo": IDL2.Nat,
    "stundenFr": IDL2.Nat,
    "stundenMi": IDL2.Nat,
    "stundenMo": IDL2.Nat,
    "stundenSa": IDL2.Nat,
    "stundenSo": IDL2.Nat,
    "employeeId": EmployeeId2,
    "funktion": IDL2.Text,
    "companyId": CompanyId2
  });
  const Result_92 = IDL2.Variant({ "ok": Employment2, "err": IDL2.Text });
  const CreateExpenseInput2 = IDL2.Record({
    "date": IDL2.Text,
    "description": IDL2.Text,
    "billableCHF": IDL2.Float64,
    "reimbursementCHF": IDL2.Float64,
    "expenseTypeId": ExpenseTypeId2,
    "receiptBlobId": IDL2.Opt(IDL2.Text)
  });
  const CreateExpenseTypeInput2 = IDL2.Record({
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Text,
    "billable": IDL2.Bool,
    "reimbursable": IDL2.Bool
  });
  const ExpenseType2 = IDL2.Record({
    "id": ExpenseTypeId2,
    "aktiv": IDL2.Bool,
    "name": IDL2.Text,
    "billable": IDL2.Bool,
    "reimbursable": IDL2.Bool,
    "companyId": CompanyId2
  });
  const Result_72 = IDL2.Variant({ "ok": ExpenseType2, "err": IDL2.Text });
  const CreateHolidayInput2 = IDL2.Record({
    "ganztaegig": IDL2.Opt(IDL2.Bool),
    "date": IDL2.Text,
    "name": IDL2.Text
  });
  const HolidayId2 = IDL2.Nat;
  const Holiday2 = IDL2.Record({
    "id": HolidayId2,
    "ganztaegig": IDL2.Bool,
    "date": IDL2.Text,
    "name": IDL2.Text,
    "companyId": CompanyId2
  });
  const Result_62 = IDL2.Variant({ "ok": Holiday2, "err": IDL2.Text });
  const ProjectStatus2 = IDL2.Variant({
    "aktiv": IDL2.Null,
    "inaktiv": IDL2.Null,
    "abgeschlossen": IDL2.Null
  });
  const Erfassungsart2 = IDL2.Variant({
    "zeitBlock": IDL2.Null,
    "dauer": IDL2.Null
  });
  const CreateProjectInput2 = IDL2.Record({
    "status": IDL2.Opt(ProjectStatus2),
    "erfassungsart": IDL2.Opt(Erfassungsart2),
    "code": IDL2.Text,
    "billableRate": IDL2.Float64,
    "name": IDL2.Text,
    "customerId": CustomerId2,
    "kurzbezeichnung": IDL2.Text,
    "projektleiter": IDL2.Opt(EmployeeId2)
  });
  const Project2 = IDL2.Record({
    "id": ProjectId2,
    "status": ProjectStatus2,
    "erfassungsart": IDL2.Opt(Erfassungsart2),
    "active": IDL2.Bool,
    "code": IDL2.Text,
    "billableRate": IDL2.Float64,
    "name": IDL2.Text,
    "customerId": CustomerId2,
    "kurzbezeichnung": IDL2.Text,
    "projektleiter": IDL2.Opt(EmployeeId2),
    "companyId": CompanyId2
  });
  const Result_52 = IDL2.Variant({ "ok": Project2, "err": IDL2.Text });
  const CreateServiceTypeInput2 = IDL2.Record({
    "defaultRate": IDL2.Float64,
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Text,
    "billable": IDL2.Bool
  });
  const ServiceTypeId2 = IDL2.Nat;
  const ServiceType2 = IDL2.Record({
    "id": ServiceTypeId2,
    "defaultRate": IDL2.Float64,
    "aktiv": IDL2.Bool,
    "name": IDL2.Text,
    "billable": IDL2.Bool,
    "companyId": CompanyId2
  });
  const Result_42 = IDL2.Variant({ "ok": ServiceType2, "err": IDL2.Text });
  const CreateTimeBalanceCorrectionInput2 = IDL2.Record({
    "typ": IDL2.Variant({ "gutschrift": IDL2.Null, "reduktion": IDL2.Null }),
    "ueberzeit": IDL2.Int,
    "bemerkung": IDL2.Text,
    "wirkungsdatum": IDL2.Int,
    "dauer": IDL2.Int
  });
  const TimeBalanceCorrection2 = IDL2.Record({
    "id": IDL2.Text,
    "typ": IDL2.Variant({ "gutschrift": IDL2.Null, "reduktion": IDL2.Null }),
    "ueberzeit": IDL2.Int,
    "bemerkung": IDL2.Text,
    "employeeId": EmployeeId2,
    "wirkungsdatum": IDL2.Int,
    "dauer": IDL2.Int,
    "companyId": CompanyId2
  });
  const Result_32 = IDL2.Variant({
    "ok": TimeBalanceCorrection2,
    "err": IDL2.Text
  });
  const CreateTimeEntryInput2 = IDL2.Record({
    "bis": IDL2.Opt(IDL2.Text),
    "von": IDL2.Opt(IDL2.Text),
    "hours": IDL2.Float64,
    "date": IDL2.Text,
    "description": IDL2.Text,
    "billable": IDL2.Bool,
    "projectId": ProjectId2,
    "serviceTypeId": ServiceTypeId2
  });
  const TimeEntryId2 = IDL2.Nat;
  const TimeEntry2 = IDL2.Record({
    "id": TimeEntryId2,
    "bis": IDL2.Opt(IDL2.Text),
    "von": IDL2.Opt(IDL2.Text),
    "hours": IDL2.Float64,
    "date": IDL2.Text,
    "createdAt": Timestamp2,
    "description": IDL2.Text,
    "employeeId": EmployeeId2,
    "billable": IDL2.Bool,
    "projectId": ProjectId2,
    "serviceTypeId": ServiceTypeId2,
    "companyId": CompanyId2
  });
  const Result_27 = IDL2.Variant({ "ok": TimeEntry2, "err": IDL2.Text });
  const CreateVacationBalanceInput2 = IDL2.Record({
    "verfallsdatum": IDL2.Opt(IDL2.Int),
    "kalenderjahr": IDL2.Int,
    "dauer": IDL2.Int
  });
  const VacationBalance2 = IDL2.Record({
    "id": IDL2.Text,
    "verfallsdatum": IDL2.Opt(IDL2.Int),
    "employeeId": EmployeeId2,
    "kalenderjahr": IDL2.Int,
    "dauer": IDL2.Int,
    "companyId": CompanyId2
  });
  const Result2 = IDL2.Variant({ "ok": VacationBalance2, "err": IDL2.Text });
  const Result_162 = IDL2.Variant({ "ok": IDL2.Null, "err": IDL2.Text });
  const Result_252 = IDL2.Variant({ "ok": IDL2.Text, "err": IDL2.Text });
  const CalendarData2 = IDL2.Record({
    "absences": IDL2.Vec(Absence2),
    "expenses": IDL2.Vec(Expense2),
    "timeEntries": IDL2.Vec(TimeEntry2)
  });
  const CompanySettings2 = IDL2.Record({
    "timezone": IDL2.Text,
    "approvalRequired": IDL2.Bool,
    "allowExpiredVacationBalance": IDL2.Bool,
    "emailNewVacationRequest": IDL2.Bool,
    "emailOnApproval": IDL2.Bool,
    "vacationCarryoverDays": IDL2.Nat,
    "maxVacationDays": IDL2.Nat,
    "companyId": CompanyId2
  });
  const Result_122 = IDL2.Variant({ "ok": CompanySettings2, "err": IDL2.Text });
  const DashboardStats2 = IDL2.Record({
    "hoursTarget": IDL2.Float64,
    "pendingExpenses": IDL2.Nat,
    "hoursThisWeek": IDL2.Float64,
    "remainingVacationMinutes": IDL2.Int,
    "approvedVacationDays": IDL2.Nat,
    "pendingVacations": IDL2.Nat
  });
  const WorkTimeBalance2 = IDL2.Record({
    "istStunden": IDL2.Int,
    "ueberzeit": IDL2.Int,
    "saldo": IDL2.Int,
    "periodEnd": IDL2.Text,
    "periodStart": IDL2.Text,
    "sollStunden": IDL2.Int,
    "korrektionen": IDL2.Int
  });
  const Result_242 = IDL2.Variant({ "ok": WorkTimeBalance2, "err": IDL2.Text });
  const Result_232 = IDL2.Variant({
    "ok": IDL2.Opt(Employment2),
    "err": IDL2.Text
  });
  const Company2 = IDL2.Record({
    "id": CompanyId2,
    "taxId": IDL2.Opt(IDL2.Text),
    "name": IDL2.Text,
    "createdAt": Timestamp2,
    "logoUrl": IDL2.Opt(IDL2.Text),
    "address": IDL2.Opt(IDL2.Text)
  });
  const Result_132 = IDL2.Variant({ "ok": Company2, "err": IDL2.Text });
  const StandardTimeBlock2 = IDL2.Record({ "bis": IDL2.Text, "von": IDL2.Text });
  const Standardarbeitszeiten2 = IDL2.Record({
    "tuesday": IDL2.Vec(StandardTimeBlock2),
    "wednesday": IDL2.Vec(StandardTimeBlock2),
    "saturday": IDL2.Vec(StandardTimeBlock2),
    "thursday": IDL2.Vec(StandardTimeBlock2),
    "sunday": IDL2.Vec(StandardTimeBlock2),
    "friday": IDL2.Vec(StandardTimeBlock2),
    "monday": IDL2.Vec(StandardTimeBlock2)
  });
  const Result_212 = IDL2.Variant({
    "ok": Standardarbeitszeiten2,
    "err": IDL2.Text
  });
  const ProjectMemberAssignment2 = IDL2.Record({
    "stundensatz": IDL2.Float64,
    "employeeId": EmployeeId2,
    "serviceTypeId": ServiceTypeId2
  });
  const Result_222 = IDL2.Variant({
    "ok": IDL2.Vec(ProjectMemberAssignment2),
    "err": IDL2.Text
  });
  const ReportFilter2 = IDL2.Record({
    "dateTo": IDL2.Text,
    "employeeId": IDL2.Opt(EmployeeId2),
    "projectId": IDL2.Opt(ProjectId2),
    "customerId": IDL2.Opt(CompanyId2),
    "dateFrom": IDL2.Text
  });
  const ReportData2 = IDL2.Record({
    "expenses": IDL2.Float64,
    "entries": IDL2.Vec(TimeEntry2),
    "billableHours": IDL2.Float64,
    "expenseItems": IDL2.Vec(Expense2)
  });
  const Result_202 = IDL2.Variant({ "ok": IDL2.Int, "err": IDL2.Text });
  const UserNotificationSettings2 = IDL2.Record({
    "emailNewVacationRequest": IDL2.Bool,
    "emailOnApproval": IDL2.Bool,
    "principalId": IDL2.Principal,
    "companyId": CompanyId2
  });
  const Result_110 = IDL2.Variant({
    "ok": UserNotificationSettings2,
    "err": IDL2.Text
  });
  const AbsenceFilter2 = IDL2.Record({
    "status": IDL2.Opt(AbsenceStatus2),
    "absenceTypeId": IDL2.Opt(AbsenceTypeId2),
    "dateTo": IDL2.Opt(IDL2.Text),
    "employeeId": IDL2.Opt(EmployeeId2),
    "dateFrom": IDL2.Opt(IDL2.Text)
  });
  const Time2 = IDL2.Int;
  const AuditEntry2 = IDL2.Record({
    "id": IDL2.Nat,
    "oldStatus": IDL2.Text,
    "action": IDL2.Text,
    "changedBy": IDL2.Principal,
    "timestamp": Time2,
    "targetType": IDL2.Text,
    "newStatus": IDL2.Text,
    "targetId": IDL2.Nat,
    "previousApprovedBy": IDL2.Opt(IDL2.Principal),
    "reason": IDL2.Opt(IDL2.Text)
  });
  const Result_192 = IDL2.Variant({
    "ok": IDL2.Vec(Employment2),
    "err": IDL2.Text
  });
  const ExpenseFilter2 = IDL2.Record({
    "status": IDL2.Opt(ExpenseStatus2),
    "dateTo": IDL2.Opt(IDL2.Text),
    "employeeId": IDL2.Opt(EmployeeId2),
    "dateFrom": IDL2.Opt(IDL2.Text)
  });
  const Result_182 = IDL2.Variant({
    "ok": IDL2.Vec(TimeBalanceCorrection2),
    "err": IDL2.Text
  });
  const TimeEntryFilter2 = IDL2.Record({
    "dateTo": IDL2.Opt(IDL2.Text),
    "employeeId": IDL2.Opt(EmployeeId2),
    "projectId": IDL2.Opt(ProjectId2),
    "dateFrom": IDL2.Opt(IDL2.Text)
  });
  const Result_172 = IDL2.Variant({
    "ok": IDL2.Vec(VacationBalance2),
    "err": IDL2.Text
  });
  const UpdateAbsenceInput2 = IDL2.Record({
    "dateTo": IDL2.Opt(IDL2.Text),
    "ganztaetig": IDL2.Opt(IDL2.Bool),
    "description": IDL2.Opt(IDL2.Text),
    "dateFrom": IDL2.Opt(IDL2.Text),
    "dauer": IDL2.Opt(IDL2.Nat)
  });
  const UpdateAbsenceTypeInput2 = IDL2.Record({
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Opt(IDL2.Text),
    "requiresApproval": IDL2.Opt(IDL2.Bool),
    "compensated": IDL2.Opt(IDL2.Bool)
  });
  const UpdateCompanyInput2 = IDL2.Record({
    "taxId": IDL2.Opt(IDL2.Text),
    "name": IDL2.Opt(IDL2.Text),
    "logoUrl": IDL2.Opt(IDL2.Text),
    "address": IDL2.Opt(IDL2.Text)
  });
  const UpdateCustomerInput2 = IDL2.Record({
    "rechnungsadresse": IDL2.Opt(Rechnungsadresse2),
    "contact": IDL2.Opt(IDL2.Text),
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Opt(IDL2.Text),
    "zeiterfassungsart": IDL2.Opt(KundeZeiterfassungsart2),
    "kundennummer": IDL2.Opt(IDL2.Text),
    "notes": IDL2.Opt(IDL2.Text),
    "beschreibung": IDL2.Opt(IDL2.Text),
    "waehrung": IDL2.Opt(IDL2.Text)
  });
  const UpdateEmployeeInput2 = IDL2.Record({
    "ort": IDL2.Opt(IDL2.Text),
    "plz": IDL2.Opt(IDL2.Text),
    "weeklyHoursTarget": IDL2.Opt(IDL2.Float64),
    "active": IDL2.Opt(IDL2.Bool),
    "postfach": IDL2.Opt(IDL2.Text),
    "land": IDL2.Opt(IDL2.Text),
    "role": IDL2.Opt(Role2),
    "email": IDL2.Opt(IDL2.Text),
    "geburtsdatum": IDL2.Opt(IDL2.Int),
    "employmentType": IDL2.Opt(EmploymentType2),
    "adresseZusatz1": IDL2.Opt(IDL2.Text),
    "adresseZusatz2": IDL2.Opt(IDL2.Text),
    "lastName": IDL2.Opt(IDL2.Text),
    "strasse": IDL2.Opt(IDL2.Text),
    "startDate": IDL2.Opt(IDL2.Text),
    "firstName": IDL2.Opt(IDL2.Text)
  });
  const UpdateEmploymentInput2 = IDL2.Record({
    "bis": IDL2.Opt(IDL2.Int),
    "von": IDL2.Opt(IDL2.Int),
    "pensum": IDL2.Float64,
    "feiertagsberechnungsart": IDL2.Opt(FeiertagsberechnungsartType2),
    "stundenDi": IDL2.Nat,
    "stundenDo": IDL2.Nat,
    "stundenFr": IDL2.Nat,
    "stundenMi": IDL2.Nat,
    "stundenMo": IDL2.Nat,
    "stundenSa": IDL2.Nat,
    "stundenSo": IDL2.Nat,
    "funktion": IDL2.Opt(IDL2.Text)
  });
  const UpdateExpenseInput2 = IDL2.Record({
    "date": IDL2.Opt(IDL2.Text),
    "description": IDL2.Opt(IDL2.Text),
    "billableCHF": IDL2.Opt(IDL2.Float64),
    "reimbursementCHF": IDL2.Opt(IDL2.Float64),
    "expenseTypeId": IDL2.Opt(ExpenseTypeId2),
    "receiptBlobId": IDL2.Opt(IDL2.Text)
  });
  const UpdateExpenseTypeInput2 = IDL2.Record({
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Opt(IDL2.Text),
    "billable": IDL2.Opt(IDL2.Bool),
    "reimbursable": IDL2.Opt(IDL2.Bool)
  });
  const UpdateHolidayInput2 = IDL2.Record({
    "ganztaegig": IDL2.Opt(IDL2.Bool),
    "date": IDL2.Opt(IDL2.Text),
    "name": IDL2.Opt(IDL2.Text)
  });
  const UpdateProjectInput2 = IDL2.Record({
    "status": IDL2.Opt(ProjectStatus2),
    "erfassungsart": IDL2.Opt(Erfassungsart2),
    "active": IDL2.Opt(IDL2.Bool),
    "code": IDL2.Opt(IDL2.Text),
    "billableRate": IDL2.Opt(IDL2.Float64),
    "name": IDL2.Opt(IDL2.Text),
    "customerId": IDL2.Opt(CustomerId2),
    "kurzbezeichnung": IDL2.Opt(IDL2.Text),
    "projektleiter": IDL2.Opt(EmployeeId2)
  });
  const UpdateServiceTypeInput2 = IDL2.Record({
    "defaultRate": IDL2.Opt(IDL2.Float64),
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Opt(IDL2.Text),
    "billable": IDL2.Opt(IDL2.Bool)
  });
  const UpdateTimeBalanceCorrectionInput2 = IDL2.Record({
    "typ": IDL2.Opt(
      IDL2.Variant({ "gutschrift": IDL2.Null, "reduktion": IDL2.Null })
    ),
    "ueberzeit": IDL2.Opt(IDL2.Int),
    "bemerkung": IDL2.Opt(IDL2.Text),
    "wirkungsdatum": IDL2.Opt(IDL2.Int),
    "dauer": IDL2.Opt(IDL2.Int)
  });
  const UpdateTimeEntryInput2 = IDL2.Record({
    "bis": IDL2.Opt(IDL2.Text),
    "von": IDL2.Opt(IDL2.Text),
    "hours": IDL2.Opt(IDL2.Float64),
    "date": IDL2.Opt(IDL2.Text),
    "description": IDL2.Opt(IDL2.Text),
    "billable": IDL2.Opt(IDL2.Bool),
    "projectId": IDL2.Opt(ProjectId2),
    "serviceTypeId": IDL2.Opt(ServiceTypeId2)
  });
  const UpdateVacationBalanceInput2 = IDL2.Record({
    "verfallsdatum": IDL2.Opt(IDL2.Int),
    "kalenderjahr": IDL2.Opt(IDL2.Int),
    "dauer": IDL2.Opt(IDL2.Int)
  });
  return IDL2.Service({
    "_immutableObjectStorageBlobsAreLive": IDL2.Func(
      [IDL2.Vec(IDL2.Vec(IDL2.Nat8))],
      [IDL2.Vec(IDL2.Bool)],
      ["query"]
    ),
    "_immutableObjectStorageBlobsToDelete": IDL2.Func(
      [],
      [IDL2.Vec(IDL2.Vec(IDL2.Nat8))],
      ["query"]
    ),
    "_immutableObjectStorageConfirmBlobDeletion": IDL2.Func(
      [IDL2.Vec(IDL2.Vec(IDL2.Nat8))],
      [],
      []
    ),
    "_immutableObjectStorageCreateCertificate": IDL2.Func(
      [IDL2.Text],
      [_ImmutableObjectStorageCreateCertificateResult2],
      []
    ),
    "_immutableObjectStorageRefillCashier": IDL2.Func(
      [IDL2.Opt(_ImmutableObjectStorageRefillInformation2)],
      [_ImmutableObjectStorageRefillResult2],
      []
    ),
    "_immutableObjectStorageUpdateGatewayPrincipals": IDL2.Func([], [], []),
    "_initializeAccessControl": IDL2.Func([], [], []),
    "approveAbsence": IDL2.Func([AbsenceId2], [Result_152], []),
    "approveExpense": IDL2.Func([ExpenseId2], [Result_82], []),
    "assignCallerUserRole": IDL2.Func([IDL2.Principal, UserRole2], [], []),
    "assignEmployeeToProject": IDL2.Func(
      [EmployeeId2, ProjectId2],
      [Result_262],
      []
    ),
    "createAbsence": IDL2.Func([CreateAbsenceInput2], [Result_152], []),
    "createAbsenceType": IDL2.Func([CreateAbsenceTypeInput2], [Result_142], []),
    "createCustomer": IDL2.Func([CreateCustomerInput2], [Result_112], []),
    "createEmployee": IDL2.Func([CreateEmployeeInput2], [Result_102], []),
    "createEmployment": IDL2.Func(
      [EmployeeId2, CreateEmploymentInput2],
      [Result_92],
      []
    ),
    "createExpense": IDL2.Func([CreateExpenseInput2], [Result_82], []),
    "createExpenseType": IDL2.Func([CreateExpenseTypeInput2], [Result_72], []),
    "createHoliday": IDL2.Func([CreateHolidayInput2], [Result_62], []),
    "createProject": IDL2.Func([CreateProjectInput2], [Result_52], []),
    "createServiceType": IDL2.Func([CreateServiceTypeInput2], [Result_42], []),
    "createTimeBalanceCorrection": IDL2.Func(
      [EmployeeId2, CreateTimeBalanceCorrectionInput2],
      [Result_32],
      []
    ),
    "createTimeEntry": IDL2.Func([CreateTimeEntryInput2], [Result_27], []),
    "createVacationBalance": IDL2.Func(
      [EmployeeId2, CreateVacationBalanceInput2],
      [Result2],
      []
    ),
    "deleteAbsence": IDL2.Func([AbsenceId2], [Result_162], []),
    "deleteAbsenceType": IDL2.Func([AbsenceTypeId2], [Result_162], []),
    "deleteCustomer": IDL2.Func([CustomerId2], [Result_162], []),
    "deleteEmployee": IDL2.Func([EmployeeId2], [Result_162], []),
    "deleteEmployment": IDL2.Func([EmployeeId2, IDL2.Text], [Result_162], []),
    "deleteExpense": IDL2.Func([ExpenseId2], [Result_162], []),
    "deleteExpenseType": IDL2.Func([ExpenseTypeId2], [Result_162], []),
    "deleteHoliday": IDL2.Func([HolidayId2], [Result_162], []),
    "deleteProject": IDL2.Func([ProjectId2], [Result_162], []),
    "deleteServiceType": IDL2.Func([ServiceTypeId2], [Result_162], []),
    "deleteTimeBalanceCorrection": IDL2.Func(
      [EmployeeId2, IDL2.Text],
      [Result_162],
      []
    ),
    "deleteTimeEntry": IDL2.Func([TimeEntryId2], [Result_162], []),
    "deleteVacationBalance": IDL2.Func([EmployeeId2, IDL2.Text], [Result_162], []),
    "generateInviteCode": IDL2.Func([EmployeeId2], [Result_252], []),
    "getCalendarEntries": IDL2.Func(
      [IDL2.Text, IDL2.Nat],
      [CalendarData2],
      ["query"]
    ),
    "getCallerUserRole": IDL2.Func([], [UserRole2], ["query"]),
    "getCompanySettings": IDL2.Func([], [Result_122], ["query"]),
    "getDashboardStats": IDL2.Func([], [DashboardStats2], ["query"]),
    "getEmployeeWorkTimeBalance": IDL2.Func(
      [EmployeeId2, IDL2.Text, IDL2.Text],
      [Result_242],
      ["query"]
    ),
    "getEmployeeWorkTimeBalanceFromStart": IDL2.Func(
      [EmployeeId2],
      [Result_242],
      ["query"]
    ),
    "getEmploymentForDate": IDL2.Func(
      [EmployeeId2, IDL2.Text],
      [Result_232],
      ["query"]
    ),
    "getMyCompany": IDL2.Func([], [Result_132], ["query"]),
    "getMyEmployee": IDL2.Func([], [Result_102], ["query"]),
    "getMyStandardarbeitszeiten": IDL2.Func([], [Result_212], ["query"]),
    "getProjectMembers": IDL2.Func([ProjectId2], [Result_222], ["query"]),
    "getReportData": IDL2.Func([ReportFilter2], [ReportData2], ["query"]),
    "getStandardarbeitszeitenForEmployee": IDL2.Func(
      [EmployeeId2],
      [Result_212],
      ["query"]
    ),
    "getTimeBalance": IDL2.Func([EmployeeId2], [Result_202], ["query"]),
    "getUserNotificationSettings": IDL2.Func([], [Result_110], ["query"]),
    "isCallerAdmin": IDL2.Func([], [IDL2.Bool], ["query"]),
    "isRegistered": IDL2.Func([], [IDL2.Bool], ["query"]),
    "listAbsenceTypes": IDL2.Func([], [IDL2.Vec(AbsenceType2)], ["query"]),
    "listAbsences": IDL2.Func([AbsenceFilter2], [IDL2.Vec(Absence2)], ["query"]),
    "listAuditLog": IDL2.Func(
      [IDL2.Opt(IDL2.Text), IDL2.Opt(IDL2.Nat)],
      [IDL2.Vec(AuditEntry2)],
      ["query"]
    ),
    "listCustomers": IDL2.Func([], [IDL2.Vec(Customer2)], ["query"]),
    "listEmployees": IDL2.Func([], [IDL2.Vec(Employee2)], ["query"]),
    "listEmployments": IDL2.Func([EmployeeId2], [Result_192], ["query"]),
    "listExpenseTypes": IDL2.Func([], [IDL2.Vec(ExpenseType2)], ["query"]),
    "listExpenses": IDL2.Func([ExpenseFilter2], [IDL2.Vec(Expense2)], ["query"]),
    "listHolidays": IDL2.Func([], [IDL2.Vec(Holiday2)], ["query"]),
    "listProjectAssignments": IDL2.Func(
      [],
      [IDL2.Vec(ProjectAssignment2)],
      ["query"]
    ),
    "listProjects": IDL2.Func([], [IDL2.Vec(Project2)], ["query"]),
    "listServiceTypes": IDL2.Func([], [IDL2.Vec(ServiceType2)], ["query"]),
    "listTimeBalanceCorrections": IDL2.Func(
      [EmployeeId2],
      [Result_182],
      ["query"]
    ),
    "listTimeEntries": IDL2.Func(
      [TimeEntryFilter2],
      [IDL2.Vec(TimeEntry2)],
      ["query"]
    ),
    "listVacationBalances": IDL2.Func([EmployeeId2], [Result_172], ["query"]),
    "redeemInviteCode": IDL2.Func([IDL2.Text], [Result_102], []),
    "registerCompany": IDL2.Func(
      [IDL2.Text, IDL2.Text, IDL2.Text, IDL2.Text],
      [Result_132],
      []
    ),
    "rejectAbsence": IDL2.Func([AbsenceId2, IDL2.Text], [Result_152], []),
    "rejectExpense": IDL2.Func([ExpenseId2, IDL2.Opt(IDL2.Text)], [Result_82], []),
    "removeEmployeeFromProject": IDL2.Func(
      [EmployeeId2, ProjectId2],
      [Result_162],
      []
    ),
    "resetAbsenceToAusstehend": IDL2.Func(
      [AbsenceId2, IDL2.Text],
      [Result_152],
      []
    ),
    "resetExpenseToAusstehend": IDL2.Func(
      [ExpenseId2, IDL2.Text],
      [Result_82],
      []
    ),
    "revokeInviteCode": IDL2.Func([IDL2.Text], [Result_162], []),
    "setMyStandardarbeitszeiten": IDL2.Func(
      [Standardarbeitszeiten2],
      [Result_162],
      []
    ),
    "setProjectMembers": IDL2.Func(
      [ProjectId2, IDL2.Vec(ProjectMemberAssignment2)],
      [Result_162],
      []
    ),
    "setStandardarbeitszeitenForEmployee": IDL2.Func(
      [EmployeeId2, Standardarbeitszeiten2],
      [Result_162],
      []
    ),
    "updateAbsence": IDL2.Func(
      [AbsenceId2, UpdateAbsenceInput2],
      [Result_152],
      []
    ),
    "updateAbsenceType": IDL2.Func(
      [AbsenceTypeId2, UpdateAbsenceTypeInput2],
      [Result_142],
      []
    ),
    "updateCompany": IDL2.Func([UpdateCompanyInput2], [Result_132], []),
    "updateCompanySettings": IDL2.Func([CompanySettings2], [Result_122], []),
    "updateCustomer": IDL2.Func(
      [CustomerId2, UpdateCustomerInput2],
      [Result_112],
      []
    ),
    "updateEmployee": IDL2.Func(
      [EmployeeId2, UpdateEmployeeInput2],
      [Result_102],
      []
    ),
    "updateEmployment": IDL2.Func(
      [EmployeeId2, IDL2.Text, UpdateEmploymentInput2],
      [Result_92],
      []
    ),
    "updateExpense": IDL2.Func([ExpenseId2, UpdateExpenseInput2], [Result_82], []),
    "updateExpenseType": IDL2.Func(
      [ExpenseTypeId2, UpdateExpenseTypeInput2],
      [Result_72],
      []
    ),
    "updateHoliday": IDL2.Func([HolidayId2, UpdateHolidayInput2], [Result_62], []),
    "updateProject": IDL2.Func([ProjectId2, UpdateProjectInput2], [Result_52], []),
    "updateServiceType": IDL2.Func(
      [ServiceTypeId2, UpdateServiceTypeInput2],
      [Result_42],
      []
    ),
    "updateTimeBalanceCorrection": IDL2.Func(
      [EmployeeId2, IDL2.Text, UpdateTimeBalanceCorrectionInput2],
      [Result_32],
      []
    ),
    "updateTimeEntry": IDL2.Func(
      [TimeEntryId2, UpdateTimeEntryInput2],
      [Result_27],
      []
    ),
    "updateUserNotificationSettings": IDL2.Func(
      [UserNotificationSettings2],
      [Result_110],
      []
    ),
    "updateVacationBalance": IDL2.Func(
      [EmployeeId2, IDL2.Text, UpdateVacationBalanceInput2],
      [Result2],
      []
    )
  });
};
function candid_some(value) {
  return [
    value
  ];
}
function candid_none() {
  return [];
}
function record_opt_to_undefined(arg) {
  return arg == null ? void 0 : arg;
}
class Backend {
  constructor(actor, _uploadFile, _downloadFile, processError) {
    this.actor = actor;
    this._uploadFile = _uploadFile;
    this._downloadFile = _downloadFile;
    this.processError = processError;
  }
  async _immutableObjectStorageBlobsAreLive(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageBlobsAreLive(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageBlobsAreLive(arg0);
      return result;
    }
  }
  async _immutableObjectStorageBlobsToDelete() {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageBlobsToDelete();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageBlobsToDelete();
      return result;
    }
  }
  async _immutableObjectStorageConfirmBlobDeletion(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageConfirmBlobDeletion(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageConfirmBlobDeletion(arg0);
      return result;
    }
  }
  async _immutableObjectStorageCreateCertificate(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageCreateCertificate(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageCreateCertificate(arg0);
      return result;
    }
  }
  async _immutableObjectStorageRefillCashier(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageRefillCashier(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
        return from_candid__ImmutableObjectStorageRefillResult_n4(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageRefillCashier(to_candid_opt_n1(this._uploadFile, this._downloadFile, arg0));
      return from_candid__ImmutableObjectStorageRefillResult_n4(this._uploadFile, this._downloadFile, result);
    }
  }
  async _immutableObjectStorageUpdateGatewayPrincipals() {
    if (this.processError) {
      try {
        const result = await this.actor._immutableObjectStorageUpdateGatewayPrincipals();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._immutableObjectStorageUpdateGatewayPrincipals();
      return result;
    }
  }
  async _initializeAccessControl() {
    if (this.processError) {
      try {
        const result = await this.actor._initializeAccessControl();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._initializeAccessControl();
      return result;
    }
  }
  async approveAbsence(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.approveAbsence(arg0);
        return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.approveAbsence(arg0);
      return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async approveExpense(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.approveExpense(arg0);
        return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.approveExpense(arg0);
      return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
    }
  }
  async assignCallerUserRole(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n22(this._uploadFile, this._downloadFile, arg1));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n22(this._uploadFile, this._downloadFile, arg1));
      return result;
    }
  }
  async assignEmployeeToProject(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.assignEmployeeToProject(arg0, arg1);
        return from_candid_Result_26_n24(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assignEmployeeToProject(arg0, arg1);
      return from_candid_Result_26_n24(this._uploadFile, this._downloadFile, result);
    }
  }
  async createAbsence(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createAbsence(to_candid_CreateAbsenceInput_n26(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createAbsence(to_candid_CreateAbsenceInput_n26(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async createAbsenceType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createAbsenceType(to_candid_CreateAbsenceTypeInput_n28(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_14_n30(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createAbsenceType(to_candid_CreateAbsenceTypeInput_n28(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_14_n30(this._uploadFile, this._downloadFile, result);
    }
  }
  async createCustomer(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createCustomer(to_candid_CreateCustomerInput_n32(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_11_n38(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createCustomer(to_candid_CreateCustomerInput_n32(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_11_n38(this._uploadFile, this._downloadFile, result);
    }
  }
  async createEmployee(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createEmployee(to_candid_CreateEmployeeInput_n47(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_10_n53(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createEmployee(to_candid_CreateEmployeeInput_n47(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_10_n53(this._uploadFile, this._downloadFile, result);
    }
  }
  async createEmployment(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createEmployment(arg0, to_candid_CreateEmploymentInput_n62(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_9_n66(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createEmployment(arg0, to_candid_CreateEmploymentInput_n62(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_9_n66(this._uploadFile, this._downloadFile, result);
    }
  }
  async createExpense(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createExpense(to_candid_CreateExpenseInput_n72(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createExpense(to_candid_CreateExpenseInput_n72(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
    }
  }
  async createExpenseType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createExpenseType(to_candid_CreateExpenseTypeInput_n74(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_7_n76(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createExpenseType(to_candid_CreateExpenseTypeInput_n74(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_7_n76(this._uploadFile, this._downloadFile, result);
    }
  }
  async createHoliday(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createHoliday(to_candid_CreateHolidayInput_n78(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_6_n80(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createHoliday(to_candid_CreateHolidayInput_n78(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_6_n80(this._uploadFile, this._downloadFile, result);
    }
  }
  async createProject(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createProject(to_candid_CreateProjectInput_n82(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_5_n88(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createProject(to_candid_CreateProjectInput_n82(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_5_n88(this._uploadFile, this._downloadFile, result);
    }
  }
  async createServiceType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createServiceType(to_candid_CreateServiceTypeInput_n98(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_4_n100(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createServiceType(to_candid_CreateServiceTypeInput_n98(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_4_n100(this._uploadFile, this._downloadFile, result);
    }
  }
  async createTimeBalanceCorrection(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createTimeBalanceCorrection(arg0, to_candid_CreateTimeBalanceCorrectionInput_n102(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_3_n105(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createTimeBalanceCorrection(arg0, to_candid_CreateTimeBalanceCorrectionInput_n102(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_3_n105(this._uploadFile, this._downloadFile, result);
    }
  }
  async createTimeEntry(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createTimeEntry(to_candid_CreateTimeEntryInput_n110(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_2_n112(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createTimeEntry(to_candid_CreateTimeEntryInput_n110(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_2_n112(this._uploadFile, this._downloadFile, result);
    }
  }
  async createVacationBalance(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createVacationBalance(arg0, to_candid_CreateVacationBalanceInput_n116(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_n118(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createVacationBalance(arg0, to_candid_CreateVacationBalanceInput_n116(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_n118(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteAbsence(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteAbsence(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteAbsence(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteAbsenceType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteAbsenceType(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteAbsenceType(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteCustomer(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteCustomer(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteCustomer(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteEmployee(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteEmployee(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteEmployee(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteEmployment(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteEmployment(arg0, arg1);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteEmployment(arg0, arg1);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteExpense(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteExpense(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteExpense(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteExpenseType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteExpenseType(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteExpenseType(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteHoliday(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteHoliday(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteHoliday(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteProject(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteProject(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteProject(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteServiceType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteServiceType(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteServiceType(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteTimeBalanceCorrection(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteTimeBalanceCorrection(arg0, arg1);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteTimeBalanceCorrection(arg0, arg1);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteTimeEntry(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteTimeEntry(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteTimeEntry(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteVacationBalance(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteVacationBalance(arg0, arg1);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteVacationBalance(arg0, arg1);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async generateInviteCode(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.generateInviteCode(arg0);
        return from_candid_Result_25_n124(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.generateInviteCode(arg0);
      return from_candid_Result_25_n124(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCalendarEntries(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getCalendarEntries(arg0, arg1);
        return from_candid_CalendarData_n126(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCalendarEntries(arg0, arg1);
      return from_candid_CalendarData_n126(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCallerUserRole() {
    if (this.processError) {
      try {
        const result = await this.actor.getCallerUserRole();
        return from_candid_UserRole_n131(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCallerUserRole();
      return from_candid_UserRole_n131(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCompanySettings() {
    if (this.processError) {
      try {
        const result = await this.actor.getCompanySettings();
        return from_candid_Result_12_n133(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCompanySettings();
      return from_candid_Result_12_n133(this._uploadFile, this._downloadFile, result);
    }
  }
  async getDashboardStats() {
    if (this.processError) {
      try {
        const result = await this.actor.getDashboardStats();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getDashboardStats();
      return result;
    }
  }
  async getEmployeeWorkTimeBalance(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.getEmployeeWorkTimeBalance(arg0, arg1, arg2);
        return from_candid_Result_24_n135(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getEmployeeWorkTimeBalance(arg0, arg1, arg2);
      return from_candid_Result_24_n135(this._uploadFile, this._downloadFile, result);
    }
  }
  async getEmployeeWorkTimeBalanceFromStart(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getEmployeeWorkTimeBalanceFromStart(arg0);
        return from_candid_Result_24_n135(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getEmployeeWorkTimeBalanceFromStart(arg0);
      return from_candid_Result_24_n135(this._uploadFile, this._downloadFile, result);
    }
  }
  async getEmploymentForDate(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getEmploymentForDate(arg0, arg1);
        return from_candid_Result_23_n137(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getEmploymentForDate(arg0, arg1);
      return from_candid_Result_23_n137(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyCompany() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyCompany();
        return from_candid_Result_13_n140(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyCompany();
      return from_candid_Result_13_n140(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyEmployee() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyEmployee();
        return from_candid_Result_10_n53(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyEmployee();
      return from_candid_Result_10_n53(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyStandardarbeitszeiten() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyStandardarbeitszeiten();
        return from_candid_Result_21_n144(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyStandardarbeitszeiten();
      return from_candid_Result_21_n144(this._uploadFile, this._downloadFile, result);
    }
  }
  async getProjectMembers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProjectMembers(arg0);
        return from_candid_Result_22_n146(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProjectMembers(arg0);
      return from_candid_Result_22_n146(this._uploadFile, this._downloadFile, result);
    }
  }
  async getReportData(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getReportData(to_candid_ReportFilter_n148(this._uploadFile, this._downloadFile, arg0));
        return from_candid_ReportData_n150(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getReportData(to_candid_ReportFilter_n148(this._uploadFile, this._downloadFile, arg0));
      return from_candid_ReportData_n150(this._uploadFile, this._downloadFile, result);
    }
  }
  async getStandardarbeitszeitenForEmployee(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getStandardarbeitszeitenForEmployee(arg0);
        return from_candid_Result_21_n144(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getStandardarbeitszeitenForEmployee(arg0);
      return from_candid_Result_21_n144(this._uploadFile, this._downloadFile, result);
    }
  }
  async getTimeBalance(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getTimeBalance(arg0);
        return from_candid_Result_20_n152(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getTimeBalance(arg0);
      return from_candid_Result_20_n152(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUserNotificationSettings() {
    if (this.processError) {
      try {
        const result = await this.actor.getUserNotificationSettings();
        return from_candid_Result_1_n154(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserNotificationSettings();
      return from_candid_Result_1_n154(this._uploadFile, this._downloadFile, result);
    }
  }
  async isCallerAdmin() {
    if (this.processError) {
      try {
        const result = await this.actor.isCallerAdmin();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isCallerAdmin();
      return result;
    }
  }
  async isRegistered() {
    if (this.processError) {
      try {
        const result = await this.actor.isRegistered();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isRegistered();
      return result;
    }
  }
  async listAbsenceTypes() {
    if (this.processError) {
      try {
        const result = await this.actor.listAbsenceTypes();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAbsenceTypes();
      return result;
    }
  }
  async listAbsences(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listAbsences(to_candid_AbsenceFilter_n156(this._uploadFile, this._downloadFile, arg0));
        return from_candid_vec_n128(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAbsences(to_candid_AbsenceFilter_n156(this._uploadFile, this._downloadFile, arg0));
      return from_candid_vec_n128(this._uploadFile, this._downloadFile, result);
    }
  }
  async listAuditLog(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.listAuditLog(to_candid_opt_n160(this._uploadFile, this._downloadFile, arg0), to_candid_opt_n161(this._uploadFile, this._downloadFile, arg1));
        return from_candid_vec_n162(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAuditLog(to_candid_opt_n160(this._uploadFile, this._downloadFile, arg0), to_candid_opt_n161(this._uploadFile, this._downloadFile, arg1));
      return from_candid_vec_n162(this._uploadFile, this._downloadFile, result);
    }
  }
  async listCustomers() {
    if (this.processError) {
      try {
        const result = await this.actor.listCustomers();
        return from_candid_vec_n165(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listCustomers();
      return from_candid_vec_n165(this._uploadFile, this._downloadFile, result);
    }
  }
  async listEmployees() {
    if (this.processError) {
      try {
        const result = await this.actor.listEmployees();
        return from_candid_vec_n166(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listEmployees();
      return from_candid_vec_n166(this._uploadFile, this._downloadFile, result);
    }
  }
  async listEmployments(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listEmployments(arg0);
        return from_candid_Result_19_n167(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listEmployments(arg0);
      return from_candid_Result_19_n167(this._uploadFile, this._downloadFile, result);
    }
  }
  async listExpenseTypes() {
    if (this.processError) {
      try {
        const result = await this.actor.listExpenseTypes();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listExpenseTypes();
      return result;
    }
  }
  async listExpenses(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listExpenses(to_candid_ExpenseFilter_n170(this._uploadFile, this._downloadFile, arg0));
        return from_candid_vec_n129(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listExpenses(to_candid_ExpenseFilter_n170(this._uploadFile, this._downloadFile, arg0));
      return from_candid_vec_n129(this._uploadFile, this._downloadFile, result);
    }
  }
  async listHolidays() {
    if (this.processError) {
      try {
        const result = await this.actor.listHolidays();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listHolidays();
      return result;
    }
  }
  async listProjectAssignments() {
    if (this.processError) {
      try {
        const result = await this.actor.listProjectAssignments();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listProjectAssignments();
      return result;
    }
  }
  async listProjects() {
    if (this.processError) {
      try {
        const result = await this.actor.listProjects();
        return from_candid_vec_n174(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listProjects();
      return from_candid_vec_n174(this._uploadFile, this._downloadFile, result);
    }
  }
  async listServiceTypes() {
    if (this.processError) {
      try {
        const result = await this.actor.listServiceTypes();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listServiceTypes();
      return result;
    }
  }
  async listTimeBalanceCorrections(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listTimeBalanceCorrections(arg0);
        return from_candid_Result_18_n175(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listTimeBalanceCorrections(arg0);
      return from_candid_Result_18_n175(this._uploadFile, this._downloadFile, result);
    }
  }
  async listTimeEntries(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listTimeEntries(to_candid_TimeEntryFilter_n178(this._uploadFile, this._downloadFile, arg0));
        return from_candid_vec_n130(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listTimeEntries(to_candid_TimeEntryFilter_n178(this._uploadFile, this._downloadFile, arg0));
      return from_candid_vec_n130(this._uploadFile, this._downloadFile, result);
    }
  }
  async listVacationBalances(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listVacationBalances(arg0);
        return from_candid_Result_17_n180(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listVacationBalances(arg0);
      return from_candid_Result_17_n180(this._uploadFile, this._downloadFile, result);
    }
  }
  async redeemInviteCode(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.redeemInviteCode(arg0);
        return from_candid_Result_10_n53(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.redeemInviteCode(arg0);
      return from_candid_Result_10_n53(this._uploadFile, this._downloadFile, result);
    }
  }
  async registerCompany(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.registerCompany(arg0, arg1, arg2, arg3);
        return from_candid_Result_13_n140(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.registerCompany(arg0, arg1, arg2, arg3);
      return from_candid_Result_13_n140(this._uploadFile, this._downloadFile, result);
    }
  }
  async rejectAbsence(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.rejectAbsence(arg0, arg1);
        return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.rejectAbsence(arg0, arg1);
      return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async rejectExpense(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.rejectExpense(arg0, to_candid_opt_n160(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.rejectExpense(arg0, to_candid_opt_n160(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
    }
  }
  async removeEmployeeFromProject(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.removeEmployeeFromProject(arg0, arg1);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.removeEmployeeFromProject(arg0, arg1);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async resetAbsenceToAusstehend(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.resetAbsenceToAusstehend(arg0, arg1);
        return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.resetAbsenceToAusstehend(arg0, arg1);
      return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async resetExpenseToAusstehend(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.resetExpenseToAusstehend(arg0, arg1);
        return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.resetExpenseToAusstehend(arg0, arg1);
      return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
    }
  }
  async revokeInviteCode(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.revokeInviteCode(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.revokeInviteCode(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async setMyStandardarbeitszeiten(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.setMyStandardarbeitszeiten(arg0);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setMyStandardarbeitszeiten(arg0);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async setProjectMembers(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setProjectMembers(arg0, arg1);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setProjectMembers(arg0, arg1);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async setStandardarbeitszeitenForEmployee(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setStandardarbeitszeitenForEmployee(arg0, arg1);
        return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setStandardarbeitszeitenForEmployee(arg0, arg1);
      return from_candid_Result_16_n122(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateAbsence(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateAbsence(arg0, to_candid_UpdateAbsenceInput_n183(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateAbsence(arg0, to_candid_UpdateAbsenceInput_n183(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_15_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateAbsenceType(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateAbsenceType(arg0, to_candid_UpdateAbsenceTypeInput_n185(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_14_n30(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateAbsenceType(arg0, to_candid_UpdateAbsenceTypeInput_n185(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_14_n30(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateCompany(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCompany(to_candid_UpdateCompanyInput_n187(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_13_n140(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCompany(to_candid_UpdateCompanyInput_n187(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_13_n140(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateCompanySettings(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCompanySettings(arg0);
        return from_candid_Result_12_n133(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCompanySettings(arg0);
      return from_candid_Result_12_n133(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateCustomer(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCustomer(arg0, to_candid_UpdateCustomerInput_n189(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_11_n38(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCustomer(arg0, to_candid_UpdateCustomerInput_n189(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_11_n38(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateEmployee(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateEmployee(arg0, to_candid_UpdateEmployeeInput_n191(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_10_n53(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateEmployee(arg0, to_candid_UpdateEmployeeInput_n191(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_10_n53(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateEmployment(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateEmployment(arg0, arg1, to_candid_UpdateEmploymentInput_n193(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_9_n66(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateEmployment(arg0, arg1, to_candid_UpdateEmploymentInput_n193(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_9_n66(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateExpense(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateExpense(arg0, to_candid_UpdateExpenseInput_n195(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateExpense(arg0, to_candid_UpdateExpenseInput_n195(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_8_n16(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateExpenseType(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateExpenseType(arg0, to_candid_UpdateExpenseTypeInput_n197(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_7_n76(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateExpenseType(arg0, to_candid_UpdateExpenseTypeInput_n197(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_7_n76(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateHoliday(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateHoliday(arg0, to_candid_UpdateHolidayInput_n199(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_6_n80(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateHoliday(arg0, to_candid_UpdateHolidayInput_n199(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_6_n80(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateProject(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateProject(arg0, to_candid_UpdateProjectInput_n201(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_5_n88(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateProject(arg0, to_candid_UpdateProjectInput_n201(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_5_n88(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateServiceType(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateServiceType(arg0, to_candid_UpdateServiceTypeInput_n203(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_4_n100(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateServiceType(arg0, to_candid_UpdateServiceTypeInput_n203(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_4_n100(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateTimeBalanceCorrection(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateTimeBalanceCorrection(arg0, arg1, to_candid_UpdateTimeBalanceCorrectionInput_n205(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_3_n105(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateTimeBalanceCorrection(arg0, arg1, to_candid_UpdateTimeBalanceCorrectionInput_n205(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_3_n105(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateTimeEntry(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateTimeEntry(arg0, to_candid_UpdateTimeEntryInput_n207(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_2_n112(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateTimeEntry(arg0, to_candid_UpdateTimeEntryInput_n207(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_2_n112(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateUserNotificationSettings(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateUserNotificationSettings(arg0);
        return from_candid_Result_1_n154(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateUserNotificationSettings(arg0);
      return from_candid_Result_1_n154(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateVacationBalance(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateVacationBalance(arg0, arg1, to_candid_UpdateVacationBalanceInput_n209(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_n118(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateVacationBalance(arg0, arg1, to_candid_UpdateVacationBalanceInput_n209(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_n118(this._uploadFile, this._downloadFile, result);
    }
  }
}
function from_candid_AbsenceStatus_n12(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n13(_uploadFile, _downloadFile, value);
}
function from_candid_Absence_n10(_uploadFile, _downloadFile, value) {
  return from_candid_record_n11(_uploadFile, _downloadFile, value);
}
function from_candid_AuditEntry_n163(_uploadFile, _downloadFile, value) {
  return from_candid_record_n164(_uploadFile, _downloadFile, value);
}
function from_candid_CalendarData_n126(_uploadFile, _downloadFile, value) {
  return from_candid_record_n127(_uploadFile, _downloadFile, value);
}
function from_candid_Company_n142(_uploadFile, _downloadFile, value) {
  return from_candid_record_n143(_uploadFile, _downloadFile, value);
}
function from_candid_Customer_n40(_uploadFile, _downloadFile, value) {
  return from_candid_record_n41(_uploadFile, _downloadFile, value);
}
function from_candid_Employee_n55(_uploadFile, _downloadFile, value) {
  return from_candid_record_n56(_uploadFile, _downloadFile, value);
}
function from_candid_EmploymentType_n60(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n61(_uploadFile, _downloadFile, value);
}
function from_candid_Employment_n68(_uploadFile, _downloadFile, value) {
  return from_candid_record_n69(_uploadFile, _downloadFile, value);
}
function from_candid_Erfassungsart_n95(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n96(_uploadFile, _downloadFile, value);
}
function from_candid_ExpenseStatus_n20(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n21(_uploadFile, _downloadFile, value);
}
function from_candid_Expense_n18(_uploadFile, _downloadFile, value) {
  return from_candid_record_n19(_uploadFile, _downloadFile, value);
}
function from_candid_FeiertagsberechnungsartType_n70(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n71(_uploadFile, _downloadFile, value);
}
function from_candid_KundeZeiterfassungsart_n45(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n46(_uploadFile, _downloadFile, value);
}
function from_candid_ProjectStatus_n92(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n93(_uploadFile, _downloadFile, value);
}
function from_candid_Project_n90(_uploadFile, _downloadFile, value) {
  return from_candid_record_n91(_uploadFile, _downloadFile, value);
}
function from_candid_Rechnungsadresse_n43(_uploadFile, _downloadFile, value) {
  return from_candid_record_n44(_uploadFile, _downloadFile, value);
}
function from_candid_ReportData_n150(_uploadFile, _downloadFile, value) {
  return from_candid_record_n151(_uploadFile, _downloadFile, value);
}
function from_candid_Result_10_n53(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n54(_uploadFile, _downloadFile, value);
}
function from_candid_Result_11_n38(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n39(_uploadFile, _downloadFile, value);
}
function from_candid_Result_12_n133(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n134(_uploadFile, _downloadFile, value);
}
function from_candid_Result_13_n140(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n141(_uploadFile, _downloadFile, value);
}
function from_candid_Result_14_n30(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n31(_uploadFile, _downloadFile, value);
}
function from_candid_Result_15_n8(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n9(_uploadFile, _downloadFile, value);
}
function from_candid_Result_16_n122(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n123(_uploadFile, _downloadFile, value);
}
function from_candid_Result_17_n180(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n181(_uploadFile, _downloadFile, value);
}
function from_candid_Result_18_n175(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n176(_uploadFile, _downloadFile, value);
}
function from_candid_Result_19_n167(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n168(_uploadFile, _downloadFile, value);
}
function from_candid_Result_1_n154(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n155(_uploadFile, _downloadFile, value);
}
function from_candid_Result_20_n152(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n153(_uploadFile, _downloadFile, value);
}
function from_candid_Result_21_n144(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n145(_uploadFile, _downloadFile, value);
}
function from_candid_Result_22_n146(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n147(_uploadFile, _downloadFile, value);
}
function from_candid_Result_23_n137(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n138(_uploadFile, _downloadFile, value);
}
function from_candid_Result_24_n135(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n136(_uploadFile, _downloadFile, value);
}
function from_candid_Result_25_n124(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n125(_uploadFile, _downloadFile, value);
}
function from_candid_Result_26_n24(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n25(_uploadFile, _downloadFile, value);
}
function from_candid_Result_2_n112(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n113(_uploadFile, _downloadFile, value);
}
function from_candid_Result_3_n105(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n106(_uploadFile, _downloadFile, value);
}
function from_candid_Result_4_n100(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n101(_uploadFile, _downloadFile, value);
}
function from_candid_Result_5_n88(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n89(_uploadFile, _downloadFile, value);
}
function from_candid_Result_6_n80(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n81(_uploadFile, _downloadFile, value);
}
function from_candid_Result_7_n76(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n77(_uploadFile, _downloadFile, value);
}
function from_candid_Result_8_n16(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n17(_uploadFile, _downloadFile, value);
}
function from_candid_Result_9_n66(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n67(_uploadFile, _downloadFile, value);
}
function from_candid_Result_n118(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n119(_uploadFile, _downloadFile, value);
}
function from_candid_Role_n57(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n58(_uploadFile, _downloadFile, value);
}
function from_candid_TimeBalanceCorrection_n107(_uploadFile, _downloadFile, value) {
  return from_candid_record_n108(_uploadFile, _downloadFile, value);
}
function from_candid_TimeEntry_n114(_uploadFile, _downloadFile, value) {
  return from_candid_record_n115(_uploadFile, _downloadFile, value);
}
function from_candid_UserRole_n131(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n132(_uploadFile, _downloadFile, value);
}
function from_candid_VacationBalance_n120(_uploadFile, _downloadFile, value) {
  return from_candid_record_n121(_uploadFile, _downloadFile, value);
}
function from_candid__ImmutableObjectStorageRefillResult_n4(_uploadFile, _downloadFile, value) {
  return from_candid_record_n5(_uploadFile, _downloadFile, value);
}
function from_candid_opt_n139(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_Employment_n68(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n14(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n15(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n42(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_Rechnungsadresse_n43(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n59(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n6(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n7(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n94(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_Erfassungsart_n95(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n97(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_record_n108(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    typ: from_candid_variant_n109(_uploadFile, _downloadFile, value.typ),
    ueberzeit: value.ueberzeit,
    bemerkung: value.bemerkung,
    employeeId: value.employeeId,
    wirkungsdatum: value.wirkungsdatum,
    dauer: value.dauer,
    companyId: value.companyId
  };
}
function from_candid_record_n11(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_AbsenceStatus_n12(_uploadFile, _downloadFile, value.status),
    absenceTypeId: value.absenceTypeId,
    dateTo: value.dateTo,
    ganztaetig: value.ganztaetig,
    approvedBy: record_opt_to_undefined(from_candid_opt_n14(_uploadFile, _downloadFile, value.approvedBy)),
    createdAt: value.createdAt,
    description: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.description)),
    employeeId: value.employeeId,
    resetReason: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.resetReason)),
    rejectionComment: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.rejectionComment)),
    dateFrom: value.dateFrom,
    dauer: value.dauer,
    companyId: value.companyId
  };
}
function from_candid_record_n115(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    bis: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.bis)),
    von: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.von)),
    hours: value.hours,
    date: value.date,
    createdAt: value.createdAt,
    description: value.description,
    employeeId: value.employeeId,
    billable: value.billable,
    projectId: value.projectId,
    serviceTypeId: value.serviceTypeId,
    companyId: value.companyId
  };
}
function from_candid_record_n121(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    verfallsdatum: record_opt_to_undefined(from_candid_opt_n59(_uploadFile, _downloadFile, value.verfallsdatum)),
    employeeId: value.employeeId,
    kalenderjahr: value.kalenderjahr,
    dauer: value.dauer,
    companyId: value.companyId
  };
}
function from_candid_record_n127(_uploadFile, _downloadFile, value) {
  return {
    absences: from_candid_vec_n128(_uploadFile, _downloadFile, value.absences),
    expenses: from_candid_vec_n129(_uploadFile, _downloadFile, value.expenses),
    timeEntries: from_candid_vec_n130(_uploadFile, _downloadFile, value.timeEntries)
  };
}
function from_candid_record_n143(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    taxId: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.taxId)),
    name: value.name,
    createdAt: value.createdAt,
    logoUrl: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.logoUrl)),
    address: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.address))
  };
}
function from_candid_record_n151(_uploadFile, _downloadFile, value) {
  return {
    expenses: value.expenses,
    entries: from_candid_vec_n130(_uploadFile, _downloadFile, value.entries),
    billableHours: value.billableHours,
    expenseItems: from_candid_vec_n129(_uploadFile, _downloadFile, value.expenseItems)
  };
}
function from_candid_record_n164(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    oldStatus: value.oldStatus,
    action: value.action,
    changedBy: value.changedBy,
    timestamp: value.timestamp,
    targetType: value.targetType,
    newStatus: value.newStatus,
    targetId: value.targetId,
    previousApprovedBy: record_opt_to_undefined(from_candid_opt_n14(_uploadFile, _downloadFile, value.previousApprovedBy)),
    reason: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.reason))
  };
}
function from_candid_record_n19(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_ExpenseStatus_n20(_uploadFile, _downloadFile, value.status),
    date: value.date,
    description: value.description,
    employeeId: value.employeeId,
    resetReason: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.resetReason)),
    billableCHF: value.billableCHF,
    reimbursementCHF: value.reimbursementCHF,
    expenseTypeId: value.expenseTypeId,
    receiptBlobId: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.receiptBlobId)),
    companyId: value.companyId
  };
}
function from_candid_record_n41(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    rechnungsadresse: record_opt_to_undefined(from_candid_opt_n42(_uploadFile, _downloadFile, value.rechnungsadresse)),
    contact: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.contact)),
    aktiv: value.aktiv,
    name: value.name,
    zeiterfassungsart: from_candid_KundeZeiterfassungsart_n45(_uploadFile, _downloadFile, value.zeiterfassungsart),
    kundennummer: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.kundennummer)),
    notes: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.notes)),
    beschreibung: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.beschreibung)),
    waehrung: value.waehrung,
    companyId: value.companyId
  };
}
function from_candid_record_n44(_uploadFile, _downloadFile, value) {
  return {
    ort: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.ort)),
    plz: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.plz)),
    zusatz1: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.zusatz1)),
    zusatz2: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.zusatz2)),
    postfach: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.postfach)),
    land: value.land,
    strasse: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.strasse))
  };
}
function from_candid_record_n5(_uploadFile, _downloadFile, value) {
  return {
    success: record_opt_to_undefined(from_candid_opt_n6(_uploadFile, _downloadFile, value.success)),
    topped_up_amount: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.topped_up_amount))
  };
}
function from_candid_record_n56(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    ort: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.ort)),
    plz: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.plz)),
    weeklyHoursTarget: value.weeklyHoursTarget,
    active: value.active,
    postfach: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.postfach)),
    land: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.land)),
    role: from_candid_Role_n57(_uploadFile, _downloadFile, value.role),
    email: value.email,
    geburtsdatum: record_opt_to_undefined(from_candid_opt_n59(_uploadFile, _downloadFile, value.geburtsdatum)),
    employmentType: from_candid_EmploymentType_n60(_uploadFile, _downloadFile, value.employmentType),
    adresseZusatz1: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.adresseZusatz1)),
    adresseZusatz2: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.adresseZusatz2)),
    lastName: value.lastName,
    principalId: record_opt_to_undefined(from_candid_opt_n14(_uploadFile, _downloadFile, value.principalId)),
    strasse: record_opt_to_undefined(from_candid_opt_n15(_uploadFile, _downloadFile, value.strasse)),
    startDate: value.startDate,
    companyId: value.companyId,
    firstName: value.firstName
  };
}
function from_candid_record_n69(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    bis: record_opt_to_undefined(from_candid_opt_n59(_uploadFile, _downloadFile, value.bis)),
    von: value.von,
    pensum: value.pensum,
    feiertagsberechnungsart: from_candid_FeiertagsberechnungsartType_n70(_uploadFile, _downloadFile, value.feiertagsberechnungsart),
    stundenDi: value.stundenDi,
    stundenDo: value.stundenDo,
    stundenFr: value.stundenFr,
    stundenMi: value.stundenMi,
    stundenMo: value.stundenMo,
    stundenSa: value.stundenSa,
    stundenSo: value.stundenSo,
    employeeId: value.employeeId,
    funktion: value.funktion,
    companyId: value.companyId
  };
}
function from_candid_record_n91(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_ProjectStatus_n92(_uploadFile, _downloadFile, value.status),
    erfassungsart: record_opt_to_undefined(from_candid_opt_n94(_uploadFile, _downloadFile, value.erfassungsart)),
    active: value.active,
    code: value.code,
    billableRate: value.billableRate,
    name: value.name,
    customerId: value.customerId,
    kurzbezeichnung: value.kurzbezeichnung,
    projektleiter: record_opt_to_undefined(from_candid_opt_n97(_uploadFile, _downloadFile, value.projektleiter)),
    companyId: value.companyId
  };
}
function from_candid_variant_n101(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n106(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_TimeBalanceCorrection_n107(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n109(_uploadFile, _downloadFile, value) {
  return "gutschrift" in value ? "gutschrift" : "reduktion" in value ? "reduktion" : value;
}
function from_candid_variant_n113(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_TimeEntry_n114(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n119(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_VacationBalance_n120(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n123(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n125(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n13(_uploadFile, _downloadFile, value) {
  return "submitted" in value ? "submitted" : "approved" in value ? "approved" : "rejected" in value ? "rejected" : value;
}
function from_candid_variant_n132(_uploadFile, _downloadFile, value) {
  return "admin" in value ? "admin" : "user" in value ? "user" : "guest" in value ? "guest" : value;
}
function from_candid_variant_n134(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n136(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n138(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_opt_n139(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n141(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Company_n142(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n145(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n147(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n153(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n155(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n168(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_vec_n169(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n17(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Expense_n18(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n176(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_vec_n177(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n181(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_vec_n182(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n21(_uploadFile, _downloadFile, value) {
  return "pending" in value ? "pending" : "approved" in value ? "approved" : "rejected" in value ? "rejected" : value;
}
function from_candid_variant_n25(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n31(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n39(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Customer_n40(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n46(_uploadFile, _downloadFile, value) {
  return "stuendlich" in value ? "stuendlich" : "block" in value ? "block" : value;
}
function from_candid_variant_n54(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Employee_n55(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n58(_uploadFile, _downloadFile, value) {
  return "manager" in value ? "manager" : "admin" in value ? "admin" : "employee" in value ? "employee" : value;
}
function from_candid_variant_n61(_uploadFile, _downloadFile, value) {
  return "partTime" in value ? "partTime" : "fullTime" in value ? "fullTime" : "contractor" in value ? "contractor" : value;
}
function from_candid_variant_n67(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Employment_n68(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n71(_uploadFile, _downloadFile, value) {
  return "exaktWochentag" in value ? "exaktWochentag" : "entschaedigt" in value ? "entschaedigt" : "exakt" in value ? "exakt" : "prozentual" in value ? "prozentual" : value;
}
function from_candid_variant_n77(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n81(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n89(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Project_n90(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n9(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Absence_n10(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n93(_uploadFile, _downloadFile, value) {
  return "aktiv" in value ? "aktiv" : "inaktiv" in value ? "inaktiv" : "abgeschlossen" in value ? "abgeschlossen" : value;
}
function from_candid_variant_n96(_uploadFile, _downloadFile, value) {
  return "zeitBlock" in value ? "zeitBlock" : "dauer" in value ? "dauer" : value;
}
function from_candid_vec_n128(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Absence_n10(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n129(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Expense_n18(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n130(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_TimeEntry_n114(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n162(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_AuditEntry_n163(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n165(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Customer_n40(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n166(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Employee_n55(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n169(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Employment_n68(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n174(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Project_n90(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n177(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_TimeBalanceCorrection_n107(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n182(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_VacationBalance_n120(_uploadFile, _downloadFile, x));
}
function to_candid_AbsenceFilter_n156(_uploadFile, _downloadFile, value) {
  return to_candid_record_n157(_uploadFile, _downloadFile, value);
}
function to_candid_AbsenceStatus_n158(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n159(_uploadFile, _downloadFile, value);
}
function to_candid_CreateAbsenceInput_n26(_uploadFile, _downloadFile, value) {
  return to_candid_record_n27(_uploadFile, _downloadFile, value);
}
function to_candid_CreateAbsenceTypeInput_n28(_uploadFile, _downloadFile, value) {
  return to_candid_record_n29(_uploadFile, _downloadFile, value);
}
function to_candid_CreateCustomerInput_n32(_uploadFile, _downloadFile, value) {
  return to_candid_record_n33(_uploadFile, _downloadFile, value);
}
function to_candid_CreateEmployeeInput_n47(_uploadFile, _downloadFile, value) {
  return to_candid_record_n48(_uploadFile, _downloadFile, value);
}
function to_candid_CreateEmploymentInput_n62(_uploadFile, _downloadFile, value) {
  return to_candid_record_n63(_uploadFile, _downloadFile, value);
}
function to_candid_CreateExpenseInput_n72(_uploadFile, _downloadFile, value) {
  return to_candid_record_n73(_uploadFile, _downloadFile, value);
}
function to_candid_CreateExpenseTypeInput_n74(_uploadFile, _downloadFile, value) {
  return to_candid_record_n75(_uploadFile, _downloadFile, value);
}
function to_candid_CreateHolidayInput_n78(_uploadFile, _downloadFile, value) {
  return to_candid_record_n79(_uploadFile, _downloadFile, value);
}
function to_candid_CreateProjectInput_n82(_uploadFile, _downloadFile, value) {
  return to_candid_record_n83(_uploadFile, _downloadFile, value);
}
function to_candid_CreateServiceTypeInput_n98(_uploadFile, _downloadFile, value) {
  return to_candid_record_n99(_uploadFile, _downloadFile, value);
}
function to_candid_CreateTimeBalanceCorrectionInput_n102(_uploadFile, _downloadFile, value) {
  return to_candid_record_n103(_uploadFile, _downloadFile, value);
}
function to_candid_CreateTimeEntryInput_n110(_uploadFile, _downloadFile, value) {
  return to_candid_record_n111(_uploadFile, _downloadFile, value);
}
function to_candid_CreateVacationBalanceInput_n116(_uploadFile, _downloadFile, value) {
  return to_candid_record_n117(_uploadFile, _downloadFile, value);
}
function to_candid_EmploymentType_n51(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n52(_uploadFile, _downloadFile, value);
}
function to_candid_Erfassungsart_n86(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n87(_uploadFile, _downloadFile, value);
}
function to_candid_ExpenseFilter_n170(_uploadFile, _downloadFile, value) {
  return to_candid_record_n171(_uploadFile, _downloadFile, value);
}
function to_candid_ExpenseStatus_n172(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n173(_uploadFile, _downloadFile, value);
}
function to_candid_FeiertagsberechnungsartType_n64(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n65(_uploadFile, _downloadFile, value);
}
function to_candid_KundeZeiterfassungsart_n36(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n37(_uploadFile, _downloadFile, value);
}
function to_candid_ProjectStatus_n84(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n85(_uploadFile, _downloadFile, value);
}
function to_candid_Rechnungsadresse_n34(_uploadFile, _downloadFile, value) {
  return to_candid_record_n35(_uploadFile, _downloadFile, value);
}
function to_candid_ReportFilter_n148(_uploadFile, _downloadFile, value) {
  return to_candid_record_n149(_uploadFile, _downloadFile, value);
}
function to_candid_Role_n49(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n50(_uploadFile, _downloadFile, value);
}
function to_candid_TimeEntryFilter_n178(_uploadFile, _downloadFile, value) {
  return to_candid_record_n179(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateAbsenceInput_n183(_uploadFile, _downloadFile, value) {
  return to_candid_record_n184(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateAbsenceTypeInput_n185(_uploadFile, _downloadFile, value) {
  return to_candid_record_n186(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateCompanyInput_n187(_uploadFile, _downloadFile, value) {
  return to_candid_record_n188(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateCustomerInput_n189(_uploadFile, _downloadFile, value) {
  return to_candid_record_n190(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateEmployeeInput_n191(_uploadFile, _downloadFile, value) {
  return to_candid_record_n192(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateEmploymentInput_n193(_uploadFile, _downloadFile, value) {
  return to_candid_record_n194(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateExpenseInput_n195(_uploadFile, _downloadFile, value) {
  return to_candid_record_n196(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateExpenseTypeInput_n197(_uploadFile, _downloadFile, value) {
  return to_candid_record_n198(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateHolidayInput_n199(_uploadFile, _downloadFile, value) {
  return to_candid_record_n200(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateProjectInput_n201(_uploadFile, _downloadFile, value) {
  return to_candid_record_n202(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateServiceTypeInput_n203(_uploadFile, _downloadFile, value) {
  return to_candid_record_n204(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateTimeBalanceCorrectionInput_n205(_uploadFile, _downloadFile, value) {
  return to_candid_record_n206(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateTimeEntryInput_n207(_uploadFile, _downloadFile, value) {
  return to_candid_record_n208(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateVacationBalanceInput_n209(_uploadFile, _downloadFile, value) {
  return to_candid_record_n210(_uploadFile, _downloadFile, value);
}
function to_candid_UserRole_n22(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n23(_uploadFile, _downloadFile, value);
}
function to_candid__ImmutableObjectStorageRefillInformation_n2(_uploadFile, _downloadFile, value) {
  return to_candid_record_n3(_uploadFile, _downloadFile, value);
}
function to_candid_opt_n1(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(to_candid__ImmutableObjectStorageRefillInformation_n2(_uploadFile, _downloadFile, value));
}
function to_candid_opt_n160(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_opt_n161(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_record_n103(_uploadFile, _downloadFile, value) {
  return {
    typ: to_candid_variant_n104(_uploadFile, _downloadFile, value.typ),
    ueberzeit: value.ueberzeit,
    bemerkung: value.bemerkung,
    wirkungsdatum: value.wirkungsdatum,
    dauer: value.dauer
  };
}
function to_candid_record_n111(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis ? candid_some(value.bis) : candid_none(),
    von: value.von ? candid_some(value.von) : candid_none(),
    hours: value.hours,
    date: value.date,
    description: value.description,
    billable: value.billable,
    projectId: value.projectId,
    serviceTypeId: value.serviceTypeId
  };
}
function to_candid_record_n117(_uploadFile, _downloadFile, value) {
  return {
    verfallsdatum: value.verfallsdatum ? candid_some(value.verfallsdatum) : candid_none(),
    kalenderjahr: value.kalenderjahr,
    dauer: value.dauer
  };
}
function to_candid_record_n149(_uploadFile, _downloadFile, value) {
  return {
    dateTo: value.dateTo,
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    projectId: value.projectId ? candid_some(value.projectId) : candid_none(),
    customerId: value.customerId ? candid_some(value.customerId) : candid_none(),
    dateFrom: value.dateFrom
  };
}
function to_candid_record_n157(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_AbsenceStatus_n158(_uploadFile, _downloadFile, value.status)) : candid_none(),
    absenceTypeId: value.absenceTypeId ? candid_some(value.absenceTypeId) : candid_none(),
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none()
  };
}
function to_candid_record_n171(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_ExpenseStatus_n172(_uploadFile, _downloadFile, value.status)) : candid_none(),
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none()
  };
}
function to_candid_record_n179(_uploadFile, _downloadFile, value) {
  return {
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    projectId: value.projectId ? candid_some(value.projectId) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none()
  };
}
function to_candid_record_n184(_uploadFile, _downloadFile, value) {
  return {
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    ganztaetig: value.ganztaetig ? candid_some(value.ganztaetig) : candid_none(),
    description: value.description ? candid_some(value.description) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none(),
    dauer: value.dauer ? candid_some(value.dauer) : candid_none()
  };
}
function to_candid_record_n186(_uploadFile, _downloadFile, value) {
  return {
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    requiresApproval: value.requiresApproval ? candid_some(value.requiresApproval) : candid_none(),
    compensated: value.compensated ? candid_some(value.compensated) : candid_none()
  };
}
function to_candid_record_n188(_uploadFile, _downloadFile, value) {
  return {
    taxId: value.taxId ? candid_some(value.taxId) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    logoUrl: value.logoUrl ? candid_some(value.logoUrl) : candid_none(),
    address: value.address ? candid_some(value.address) : candid_none()
  };
}
function to_candid_record_n190(_uploadFile, _downloadFile, value) {
  return {
    rechnungsadresse: value.rechnungsadresse ? candid_some(to_candid_Rechnungsadresse_n34(_uploadFile, _downloadFile, value.rechnungsadresse)) : candid_none(),
    contact: value.contact ? candid_some(value.contact) : candid_none(),
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    zeiterfassungsart: value.zeiterfassungsart ? candid_some(to_candid_KundeZeiterfassungsart_n36(_uploadFile, _downloadFile, value.zeiterfassungsart)) : candid_none(),
    kundennummer: value.kundennummer ? candid_some(value.kundennummer) : candid_none(),
    notes: value.notes ? candid_some(value.notes) : candid_none(),
    beschreibung: value.beschreibung ? candid_some(value.beschreibung) : candid_none(),
    waehrung: value.waehrung ? candid_some(value.waehrung) : candid_none()
  };
}
function to_candid_record_n192(_uploadFile, _downloadFile, value) {
  return {
    ort: value.ort ? candid_some(value.ort) : candid_none(),
    plz: value.plz ? candid_some(value.plz) : candid_none(),
    weeklyHoursTarget: value.weeklyHoursTarget ? candid_some(value.weeklyHoursTarget) : candid_none(),
    active: value.active ? candid_some(value.active) : candid_none(),
    postfach: value.postfach ? candid_some(value.postfach) : candid_none(),
    land: value.land ? candid_some(value.land) : candid_none(),
    role: value.role ? candid_some(to_candid_Role_n49(_uploadFile, _downloadFile, value.role)) : candid_none(),
    email: value.email ? candid_some(value.email) : candid_none(),
    geburtsdatum: value.geburtsdatum ? candid_some(value.geburtsdatum) : candid_none(),
    employmentType: value.employmentType ? candid_some(to_candid_EmploymentType_n51(_uploadFile, _downloadFile, value.employmentType)) : candid_none(),
    adresseZusatz1: value.adresseZusatz1 ? candid_some(value.adresseZusatz1) : candid_none(),
    adresseZusatz2: value.adresseZusatz2 ? candid_some(value.adresseZusatz2) : candid_none(),
    lastName: value.lastName ? candid_some(value.lastName) : candid_none(),
    strasse: value.strasse ? candid_some(value.strasse) : candid_none(),
    startDate: value.startDate ? candid_some(value.startDate) : candid_none(),
    firstName: value.firstName ? candid_some(value.firstName) : candid_none()
  };
}
function to_candid_record_n194(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis ? candid_some(value.bis) : candid_none(),
    von: value.von ? candid_some(value.von) : candid_none(),
    pensum: value.pensum,
    feiertagsberechnungsart: value.feiertagsberechnungsart ? candid_some(to_candid_FeiertagsberechnungsartType_n64(_uploadFile, _downloadFile, value.feiertagsberechnungsart)) : candid_none(),
    stundenDi: value.stundenDi,
    stundenDo: value.stundenDo,
    stundenFr: value.stundenFr,
    stundenMi: value.stundenMi,
    stundenMo: value.stundenMo,
    stundenSa: value.stundenSa,
    stundenSo: value.stundenSo,
    funktion: value.funktion ? candid_some(value.funktion) : candid_none()
  };
}
function to_candid_record_n196(_uploadFile, _downloadFile, value) {
  return {
    date: value.date ? candid_some(value.date) : candid_none(),
    description: value.description ? candid_some(value.description) : candid_none(),
    billableCHF: value.billableCHF ? candid_some(value.billableCHF) : candid_none(),
    reimbursementCHF: value.reimbursementCHF ? candid_some(value.reimbursementCHF) : candid_none(),
    expenseTypeId: value.expenseTypeId ? candid_some(value.expenseTypeId) : candid_none(),
    receiptBlobId: value.receiptBlobId ? candid_some(value.receiptBlobId) : candid_none()
  };
}
function to_candid_record_n198(_uploadFile, _downloadFile, value) {
  return {
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    billable: value.billable ? candid_some(value.billable) : candid_none(),
    reimbursable: value.reimbursable ? candid_some(value.reimbursable) : candid_none()
  };
}
function to_candid_record_n200(_uploadFile, _downloadFile, value) {
  return {
    ganztaegig: value.ganztaegig ? candid_some(value.ganztaegig) : candid_none(),
    date: value.date ? candid_some(value.date) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none()
  };
}
function to_candid_record_n202(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_ProjectStatus_n84(_uploadFile, _downloadFile, value.status)) : candid_none(),
    erfassungsart: value.erfassungsart ? candid_some(to_candid_Erfassungsart_n86(_uploadFile, _downloadFile, value.erfassungsart)) : candid_none(),
    active: value.active ? candid_some(value.active) : candid_none(),
    code: value.code ? candid_some(value.code) : candid_none(),
    billableRate: value.billableRate ? candid_some(value.billableRate) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    customerId: value.customerId ? candid_some(value.customerId) : candid_none(),
    kurzbezeichnung: value.kurzbezeichnung ? candid_some(value.kurzbezeichnung) : candid_none(),
    projektleiter: value.projektleiter ? candid_some(value.projektleiter) : candid_none()
  };
}
function to_candid_record_n204(_uploadFile, _downloadFile, value) {
  return {
    defaultRate: value.defaultRate ? candid_some(value.defaultRate) : candid_none(),
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    billable: value.billable ? candid_some(value.billable) : candid_none()
  };
}
function to_candid_record_n206(_uploadFile, _downloadFile, value) {
  return {
    typ: value.typ ? candid_some(to_candid_variant_n104(_uploadFile, _downloadFile, value.typ)) : candid_none(),
    ueberzeit: value.ueberzeit ? candid_some(value.ueberzeit) : candid_none(),
    bemerkung: value.bemerkung ? candid_some(value.bemerkung) : candid_none(),
    wirkungsdatum: value.wirkungsdatum ? candid_some(value.wirkungsdatum) : candid_none(),
    dauer: value.dauer ? candid_some(value.dauer) : candid_none()
  };
}
function to_candid_record_n208(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis ? candid_some(value.bis) : candid_none(),
    von: value.von ? candid_some(value.von) : candid_none(),
    hours: value.hours ? candid_some(value.hours) : candid_none(),
    date: value.date ? candid_some(value.date) : candid_none(),
    description: value.description ? candid_some(value.description) : candid_none(),
    billable: value.billable ? candid_some(value.billable) : candid_none(),
    projectId: value.projectId ? candid_some(value.projectId) : candid_none(),
    serviceTypeId: value.serviceTypeId ? candid_some(value.serviceTypeId) : candid_none()
  };
}
function to_candid_record_n210(_uploadFile, _downloadFile, value) {
  return {
    verfallsdatum: value.verfallsdatum ? candid_some(value.verfallsdatum) : candid_none(),
    kalenderjahr: value.kalenderjahr ? candid_some(value.kalenderjahr) : candid_none(),
    dauer: value.dauer ? candid_some(value.dauer) : candid_none()
  };
}
function to_candid_record_n27(_uploadFile, _downloadFile, value) {
  return {
    absenceTypeId: value.absenceTypeId,
    dateTo: value.dateTo,
    ganztaetig: value.ganztaetig,
    description: value.description ? candid_some(value.description) : candid_none(),
    dateFrom: value.dateFrom,
    dauer: value.dauer
  };
}
function to_candid_record_n29(_uploadFile, _downloadFile, value) {
  return {
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name,
    requiresApproval: value.requiresApproval,
    compensated: value.compensated
  };
}
function to_candid_record_n3(_uploadFile, _downloadFile, value) {
  return {
    proposed_top_up_amount: value.proposed_top_up_amount ? candid_some(value.proposed_top_up_amount) : candid_none()
  };
}
function to_candid_record_n33(_uploadFile, _downloadFile, value) {
  return {
    rechnungsadresse: value.rechnungsadresse ? candid_some(to_candid_Rechnungsadresse_n34(_uploadFile, _downloadFile, value.rechnungsadresse)) : candid_none(),
    contact: value.contact ? candid_some(value.contact) : candid_none(),
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name,
    zeiterfassungsart: value.zeiterfassungsart ? candid_some(to_candid_KundeZeiterfassungsart_n36(_uploadFile, _downloadFile, value.zeiterfassungsart)) : candid_none(),
    kundennummer: value.kundennummer ? candid_some(value.kundennummer) : candid_none(),
    notes: value.notes ? candid_some(value.notes) : candid_none(),
    beschreibung: value.beschreibung ? candid_some(value.beschreibung) : candid_none(),
    waehrung: value.waehrung ? candid_some(value.waehrung) : candid_none()
  };
}
function to_candid_record_n35(_uploadFile, _downloadFile, value) {
  return {
    ort: value.ort ? candid_some(value.ort) : candid_none(),
    plz: value.plz ? candid_some(value.plz) : candid_none(),
    zusatz1: value.zusatz1 ? candid_some(value.zusatz1) : candid_none(),
    zusatz2: value.zusatz2 ? candid_some(value.zusatz2) : candid_none(),
    postfach: value.postfach ? candid_some(value.postfach) : candid_none(),
    land: value.land,
    strasse: value.strasse ? candid_some(value.strasse) : candid_none()
  };
}
function to_candid_record_n48(_uploadFile, _downloadFile, value) {
  return {
    ort: value.ort ? candid_some(value.ort) : candid_none(),
    plz: value.plz ? candid_some(value.plz) : candid_none(),
    weeklyHoursTarget: value.weeklyHoursTarget,
    postfach: value.postfach ? candid_some(value.postfach) : candid_none(),
    land: value.land ? candid_some(value.land) : candid_none(),
    role: to_candid_Role_n49(_uploadFile, _downloadFile, value.role),
    email: value.email,
    geburtsdatum: value.geburtsdatum ? candid_some(value.geburtsdatum) : candid_none(),
    employmentType: to_candid_EmploymentType_n51(_uploadFile, _downloadFile, value.employmentType),
    adresseZusatz1: value.adresseZusatz1 ? candid_some(value.adresseZusatz1) : candid_none(),
    adresseZusatz2: value.adresseZusatz2 ? candid_some(value.adresseZusatz2) : candid_none(),
    lastName: value.lastName,
    strasse: value.strasse ? candid_some(value.strasse) : candid_none(),
    startDate: value.startDate,
    firstName: value.firstName
  };
}
function to_candid_record_n63(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis ? candid_some(value.bis) : candid_none(),
    von: value.von,
    pensum: value.pensum,
    feiertagsberechnungsart: to_candid_FeiertagsberechnungsartType_n64(_uploadFile, _downloadFile, value.feiertagsberechnungsart),
    stundenDi: value.stundenDi,
    stundenDo: value.stundenDo,
    stundenFr: value.stundenFr,
    stundenMi: value.stundenMi,
    stundenMo: value.stundenMo,
    stundenSa: value.stundenSa,
    stundenSo: value.stundenSo,
    funktion: value.funktion
  };
}
function to_candid_record_n73(_uploadFile, _downloadFile, value) {
  return {
    date: value.date,
    description: value.description,
    billableCHF: value.billableCHF,
    reimbursementCHF: value.reimbursementCHF,
    expenseTypeId: value.expenseTypeId,
    receiptBlobId: value.receiptBlobId ? candid_some(value.receiptBlobId) : candid_none()
  };
}
function to_candid_record_n75(_uploadFile, _downloadFile, value) {
  return {
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name,
    billable: value.billable,
    reimbursable: value.reimbursable
  };
}
function to_candid_record_n79(_uploadFile, _downloadFile, value) {
  return {
    ganztaegig: value.ganztaegig ? candid_some(value.ganztaegig) : candid_none(),
    date: value.date,
    name: value.name
  };
}
function to_candid_record_n83(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_ProjectStatus_n84(_uploadFile, _downloadFile, value.status)) : candid_none(),
    erfassungsart: value.erfassungsart ? candid_some(to_candid_Erfassungsart_n86(_uploadFile, _downloadFile, value.erfassungsart)) : candid_none(),
    code: value.code,
    billableRate: value.billableRate,
    name: value.name,
    customerId: value.customerId,
    kurzbezeichnung: value.kurzbezeichnung,
    projektleiter: value.projektleiter ? candid_some(value.projektleiter) : candid_none()
  };
}
function to_candid_record_n99(_uploadFile, _downloadFile, value) {
  return {
    defaultRate: value.defaultRate,
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name,
    billable: value.billable
  };
}
function to_candid_variant_n104(_uploadFile, _downloadFile, value) {
  return value == "gutschrift" ? {
    gutschrift: null
  } : value == "reduktion" ? {
    reduktion: null
  } : value;
}
function to_candid_variant_n159(_uploadFile, _downloadFile, value) {
  return value == "submitted" ? {
    submitted: null
  } : value == "approved" ? {
    approved: null
  } : value == "rejected" ? {
    rejected: null
  } : value;
}
function to_candid_variant_n173(_uploadFile, _downloadFile, value) {
  return value == "pending" ? {
    pending: null
  } : value == "approved" ? {
    approved: null
  } : value == "rejected" ? {
    rejected: null
  } : value;
}
function to_candid_variant_n23(_uploadFile, _downloadFile, value) {
  return value == "admin" ? {
    admin: null
  } : value == "user" ? {
    user: null
  } : value == "guest" ? {
    guest: null
  } : value;
}
function to_candid_variant_n37(_uploadFile, _downloadFile, value) {
  return value == "stuendlich" ? {
    stuendlich: null
  } : value == "block" ? {
    block: null
  } : value;
}
function to_candid_variant_n50(_uploadFile, _downloadFile, value) {
  return value == "manager" ? {
    manager: null
  } : value == "admin" ? {
    admin: null
  } : value == "employee" ? {
    employee: null
  } : value;
}
function to_candid_variant_n52(_uploadFile, _downloadFile, value) {
  return value == "partTime" ? {
    partTime: null
  } : value == "fullTime" ? {
    fullTime: null
  } : value == "contractor" ? {
    contractor: null
  } : value;
}
function to_candid_variant_n65(_uploadFile, _downloadFile, value) {
  return value == "exaktWochentag" ? {
    exaktWochentag: null
  } : value == "entschaedigt" ? {
    entschaedigt: null
  } : value == "exakt" ? {
    exakt: null
  } : value == "prozentual" ? {
    prozentual: null
  } : value;
}
function to_candid_variant_n85(_uploadFile, _downloadFile, value) {
  return value == "aktiv" ? {
    aktiv: null
  } : value == "inaktiv" ? {
    inaktiv: null
  } : value == "abgeschlossen" ? {
    abgeschlossen: null
  } : value;
}
function to_candid_variant_n87(_uploadFile, _downloadFile, value) {
  return value == "zeitBlock" ? {
    zeitBlock: null
  } : value == "dauer" ? {
    dauer: null
  } : value;
}
function createActor(canisterId, _uploadFile, _downloadFile, options = {}) {
  const agent = options.agent || HttpAgent.createSync({
    ...options.agentOptions
  });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
  }
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
export {
  useActor as a,
  useQuery as b,
  createActor as c,
  composeRefs as d,
  useComposedRefs as u
};
