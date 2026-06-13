var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _currentThenable, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _QueryObserver_instances, executeFetch_fn, updateStaleTimeout_fn, computeRefetchInterval_fn, updateRefetchInterval_fn, updateTimers_fn, clearStaleTimeout_fn, clearRefetchInterval_fn, updateQuery_fn, notify_fn, _a;
import { P as ProtocolError, T as TimeoutWaitingForResponseErrorCode, z as utf8ToBytes, E as ExternalError, M as MissingRootKeyErrorCode, C as Certificate, A as lookupResultToBuffer, B as RequestStatusResponseStatus, U as UnknownError, D as RequestStatusDoneNoReplyErrorCode, F as RejectError, G as CertifiedRejectErrorCode, H as UNREACHABLE_ERROR, I as InputError, J as InvalidReadStateRequestErrorCode, K as ReadRequestType, L as Principal, N as IDL, O as MissingCanisterIdErrorCode, Q as HttpAgent, V as encode, W as QueryResponseStatus, X as UncertifiedRejectErrorCode, Y as isV3ResponseBody, Z as isV2ResponseBody, $ as UncertifiedRejectUpdateErrorCode, a0 as UnexpectedErrorCode, a1 as decode, k as Subscribable, a2 as pendingThenable, a3 as resolveEnabled, s as shallowEqualObjects, a4 as resolveStaleTime, o as noop, a5 as environmentManager, a6 as isValidTimeout, a7 as timeUntilStale, a8 as timeoutManager, a9 as focusManager, aa as fetchState, ab as replaceData, n as notifyManager, r as reactExports, p as shouldThrowError, e as useQueryClient, u as useInternetIdentity, ac as createActorWithConfig, R as React, ad as Record, ae as Opt, af as Variant, ag as Vec, ah as Text, ai as Nat, aj as Service, ak as Func, al as Bool, am as Int, an as Tuple, ao as Nat8, ap as Float64, aq as Null, ar as Principal$1 } from "./index-D_yjRFGt.js";
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
  const { identity: identity2 } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity2 == null ? void 0 : identity2.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity2;
      if (!isAuthenticated) {
        return await createActorWithConfig(createActor2);
      }
      const actorOptions = {
        agentOptions: {
          identity: identity2
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
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
const identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = React.useSyncExternalStore(
    api.subscribe,
    React.useCallback(() => selector(api.getState()), [api, selector]),
    React.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  React.useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = (createState) => createState ? createImpl(createState) : createImpl;
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a2;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, void 0);
      };
      const str = (_a2 = storage.getItem(name)) != null ? _a2 : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(name, JSON.stringify(newValue, void 0)),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
const toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
const persistImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => window.localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  let hydrationVersion = 0;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    return setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      return setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a2, _b;
    if (!storage) return;
    const currentVersion = ++hydrationVersion;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a22;
      return cb((_a22 = get()) != null ? _a22 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a2 = get()) != null ? _a2 : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            const migration = options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
            if (migration instanceof Promise) {
              return migration.then((result) => [true, result]);
            }
            return [true, migration];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a22;
      if (currentVersion !== hydrationVersion) {
        return;
      }
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a22 = get()) != null ? _a22 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      if (currentVersion !== hydrationVersion) {
        return;
      }
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(get(), void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      if (currentVersion !== hydrationVersion) {
        return;
      }
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
const persist = persistImpl;
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
const KnowledgeEntry = Record({
  "id": Text,
  "title": Text,
  "content": Text,
  "createdAt": Int,
  "role": Text,
  "isActive": Bool,
  "language": Text,
  "updatedAt": Int,
  "category": Text
});
const Result_8 = Variant({
  "ok": KnowledgeEntry,
  "err": Text
});
const BillingModel = Variant({
  "monthly": Null,
  "yearly": Null
});
const Result_21 = Variant({ "ok": Text, "err": Text });
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
const Result_20 = Variant({ "ok": Absence, "err": Text });
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
  "fakturiertInRechnungId": Opt(Nat),
  "date": Text,
  "description": Text,
  "employeeId": EmployeeId,
  "projektId": Opt(Nat),
  "resetReason": Opt(Text),
  "billableCHF": Float64,
  "kundeId": Opt(Nat),
  "reimbursementCHF": Float64,
  "expenseTypeId": ExpenseTypeId,
  "receiptBlobId": Opt(Text),
  "companyId": CompanyId
});
const Result_12 = Variant({ "ok": Expense, "err": Text });
const Result_5 = Variant({ "ok": Null, "err": Text });
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
const Result_49 = Variant({
  "ok": ProjectAssignment,
  "err": Text
});
const MonthlyBillingEntry = Record({
  "month": Text,
  "activeUserCount": Nat,
  "planId": Text,
  "billableUserCount": Nat,
  "billingModel": Opt(Text),
  "year": Nat,
  "creditAmount": Opt(Float64),
  "totalCHF": Float64,
  "companyName": Text,
  "nextDueDateTimestamp": Opt(Int),
  "planName": Text,
  "proRataAmount": Opt(Float64),
  "proRataNote": Opt(Text),
  "companyId": Nat
});
const Result_48 = Variant({
  "ok": Record({
    "note": Text,
    "remainingDays": Nat,
    "isUpgrade": Bool,
    "proRataAmount": Float64
  }),
  "err": Text
});
const InvoiceStatus$1 = Variant({
  "entwurf": Null,
  "versendet": Null,
  "bezahlt": Null,
  "storniert": Null,
  "ueberfaellig": Null
});
const InvoicePositionTyp$1 = Variant({
  "leistung": Null,
  "freitext": Null,
  "spese": Null
});
const InvoicePosition = Record({
  "id": Nat,
  "typ": InvoicePositionTyp$1,
  "menge": Float64,
  "referenzId": Opt(Nat),
  "total": Float64,
  "bezeichnung": Text,
  "invoiceId": Nat,
  "preis": Float64,
  "einheit": Text
});
const CustomerId = Nat;
const Invoice = Record({
  "id": Nat,
  "status": InvoiceStatus$1,
  "rechnungsnummer": Text,
  "total": Float64,
  "createdAt": Timestamp,
  "createdBy": Principal$1,
  "fusstext": Text,
  "mwstBetrag": Float64,
  "positionen": Vec(InvoicePosition),
  "faelligkeitsdatum": Text,
  "qrAktiv": Bool,
  "mwstSatz": Float64,
  "rabatt": Float64,
  "kopftext": Text,
  "kundeId": CustomerId,
  "zwischensumme": Float64,
  "datum": Text,
  "skonto": Float64,
  "waehrung": Text,
  "companyId": CompanyId
});
const Result_9 = Variant({ "ok": Invoice, "err": Text });
const CompanySubscription = Record({
  "stripeCurrentPeriodEnd": Opt(Int),
  "latestStripePaymentStatus": Opt(Text),
  "latestStripeInvoiceId": Opt(Text),
  "nextDueDate": Opt(Int),
  "planId": Text,
  "stripeSubscriptionId": Opt(Text),
  "billingModel": BillingModel,
  "proRataCalculatedAt": Opt(Int),
  "scheduledPlanChangePriceId": Opt(Text),
  "stripeCancelAtPeriodEnd": Bool,
  "stripeProductId": Opt(Text),
  "stripeCustomerId": Opt(Text),
  "subscriptionStartDate": Opt(Int),
  "scheduledPlanChangeEffectiveAt": Opt(Int),
  "stripeStatus": Opt(Text),
  "proRataAmount": Opt(Float64),
  "stripeCurrentPeriodStart": Opt(Int),
  "lastStripeSyncAt": Opt(Int),
  "scheduledPlanChangeId": Opt(Text),
  "proRataNote": Opt(Text),
  "companyId": Nat
});
const Result_22 = Variant({
  "ok": CompanySubscription,
  "err": Text
});
const Result_47 = Variant({
  "ok": Record({
    "estimatedMonthlyCost": Float64,
    "currentPlanId": Opt(Text),
    "activeUserCount": Nat,
    "changeNeeded": Bool,
    "suggestedPlanId": Opt(Text),
    "suggestedPlanName": Text,
    "currentPlanName": Text
  }),
  "err": Text
});
const ClosePeriodInput = Record({
  "month": Nat,
  "year": Nat,
  "tenantId": CompanyId,
  "employeeId": Opt(EmployeeId),
  "closeComment": Opt(Text)
});
const PeriodCloseStatus$1 = Variant({
  "reopened": Null,
  "closed": Null,
  "ready_for_close": Null,
  "open": Null
});
const PeriodType = Variant({ "month": Null });
const PeriodCloseId = Text;
const AffectedRecordCounts = Record({
  "absences": Nat,
  "expenses": Nat,
  "timeEntries": Nat
});
const PeriodClose = Record({
  "status": PeriodCloseStatus$1,
  "month": Nat,
  "periodType": PeriodType,
  "closedByUserId": Opt(EmployeeId),
  "createdAt": Timestamp,
  "year": Nat,
  "reopenReason": Opt(Text),
  "tenantId": CompanyId,
  "closeId": PeriodCloseId,
  "updatedAt": Timestamp,
  "closedAt": Opt(Timestamp),
  "periodEnd": Int,
  "employeeId": Opt(EmployeeId),
  "periodStart": Int,
  "closeComment": Opt(Text),
  "reopenedAt": Opt(Timestamp),
  "affectedRecordCounts": Opt(AffectedRecordCounts),
  "reopenedByUserId": Opt(EmployeeId)
});
const Result_23 = Variant({ "ok": PeriodClose, "err": Text });
const Result_46 = Variant({
  "ok": Record({
    "internalStatus": Text,
    "inSync": Bool,
    "stripeStatus": Text
  }),
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
const CalendarVisibilityMode = Variant({
  "full": Null,
  "hidden": Null,
  "anonymized": Null,
  "masked_reason": Null
});
const AbsenceTypeVisibility = Record({
  "visibleForRoles": Vec(Text),
  "showAbsenceTypeName": Bool,
  "visibilityMode": CalendarVisibilityMode,
  "showComment": Bool,
  "companyCalendarDisplayName": Opt(Text),
  "showEmployeeName": Bool,
  "visibleInCompanyCalendar": Bool,
  "companyCalendarColor": Opt(Text)
});
const CreateAbsenceTypeInput = Record({
  "aktiv": Opt(Bool),
  "name": Text,
  "requiresApproval": Bool,
  "visibility": Opt(AbsenceTypeVisibility),
  "compensated": Bool
});
const AbsenceType = Record({
  "id": AbsenceTypeId,
  "aktiv": Bool,
  "name": Text,
  "requiresApproval": Bool,
  "visibility": Opt(AbsenceTypeVisibility),
  "compensated": Bool,
  "companyId": CompanyId
});
const Result_19 = Variant({ "ok": AbsenceType, "err": Text });
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
const Result_16 = Variant({ "ok": Customer, "err": Text });
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
  "activatedAt": Opt(Int),
  "land": Opt(Text),
  "role": Role,
  "deactivatedAt": Opt(Int),
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
const Result_14 = Variant({ "ok": Employee, "err": Text });
const FeiertagsberechnungsartType = Variant({
  "wochentag_sollzeit": Null,
  "durchschnittssoll": Null,
  "keineGutschrift": Null
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
const Result_13 = Variant({ "ok": Employment, "err": Text });
const CreateExpenseInput = Record({
  "date": Text,
  "description": Text,
  "projektId": Opt(Nat),
  "billableCHF": Float64,
  "kundeId": Opt(Nat),
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
const Result_11 = Variant({ "ok": ExpenseType, "err": Text });
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
const Result_10 = Variant({ "ok": Holiday, "err": Text });
const InvoicePositionInput = Record({
  "typ": InvoicePositionTyp$1,
  "menge": Float64,
  "referenzId": Opt(Nat),
  "bezeichnung": Text,
  "preis": Float64,
  "einheit": Text
});
const CreateInvoiceInput = Record({
  "fusstext": Text,
  "positionen": Vec(InvoicePositionInput),
  "qrAktiv": Opt(Bool),
  "mwstSatz": Float64,
  "rabatt": Float64,
  "kopftext": Text,
  "kundeId": CustomerId,
  "skonto": Float64
});
const NotificationFormat = Variant({
  "html": Null,
  "markdown": Null
});
const NotificationPriority = Variant({
  "normal": Null,
  "important": Null,
  "critical": Null
});
const NotificationTargetType = Variant({
  "mixed": Null,
  "role": Null,
  "user": Null,
  "tenant": Null
});
const NotificationStatus = Variant({
  "sent": Null,
  "draft": Null,
  "archived": Null
});
const Notification = Record({
  "id": Text,
  "status": NotificationStatus,
  "title": Text,
  "validFrom": Int,
  "createdAt": Int,
  "senderDisplayName": Text,
  "messageFormat": NotificationFormat,
  "messageBody": Text,
  "targetRoleIds": Vec(Text),
  "targetUserIds": Vec(Text),
  "targetType": NotificationTargetType,
  "priority": NotificationPriority,
  "targetTenantIds": Vec(Text),
  "senderUserId": Text,
  "validUntil": Opt(Int)
});
const InvoiceTemplateInput = Record({
  "qrIban": Opt(Text),
  "fusszeileLayout": Opt(Text),
  "qrKontoinhaberAdresse": Opt(Text),
  "bank": Text,
  "iban": Text,
  "kopfzeileLayout": Opt(Text),
  "fusstext": Text,
  "mwstNummer": Text,
  "qrKontoinhaber": Opt(Text),
  "kopfzeileLogoQuelle": Opt(Text),
  "qrReferenztyp": Opt(Text),
  "kopfzeileBildPosition": Opt(Text),
  "kopfzeileAdressePosition": Opt(Text),
  "zahlungszielTage": Nat,
  "kopfzeileBildUrl": Opt(Text),
  "qrWaehrung": Opt(Text),
  "spalten": Vec(Text),
  "qrReferenzPraefix": Opt(Text),
  "fusszeilePosition": Opt(Text),
  "mwstSatz": Opt(Float64),
  "kopfzeileLogoGroesse": Opt(Text),
  "kopftext": Text,
  "kundenadresseAbstandNach": Opt(Nat),
  "kundenadresseAbstandOben": Opt(Float64),
  "kundenadresseEinrueckungZeichen": Opt(Nat),
  "fusszeileBildPosition": Opt(Text),
  "kopfzeileAdresse": Opt(Text),
  "kopfzeilePosition": Opt(Text),
  "praefix": Text,
  "naechsteNummer": Nat,
  "qrAktivStandard": Opt(Bool),
  "farbe": Text,
  "fusszeileBildUrl": Opt(Text),
  "kundenadresseLinks": Opt(Bool)
});
const InvoiceTemplate = Record({
  "id": Nat,
  "qrIban": Opt(Text),
  "fusszeileLayout": Opt(Text),
  "qrKontoinhaberAdresse": Opt(Text),
  "bank": Text,
  "iban": Text,
  "kopfzeileLayout": Opt(Text),
  "createdAt": Timestamp,
  "fusstext": Text,
  "mwstNummer": Text,
  "qrKontoinhaber": Opt(Text),
  "kopfzeileLogoQuelle": Opt(Text),
  "qrReferenztyp": Opt(Text),
  "kopfzeileBildPosition": Opt(Text),
  "kopfzeileAdressePosition": Opt(Text),
  "zahlungszielTage": Nat,
  "kopfzeileBildUrl": Opt(Text),
  "qrWaehrung": Opt(Text),
  "spalten": Vec(Text),
  "qrReferenzPraefix": Opt(Text),
  "fusszeilePosition": Opt(Text),
  "mwstSatz": Float64,
  "kopfzeileLogoGroesse": Opt(Text),
  "kopftext": Text,
  "kundenadresseAbstandNach": Opt(Nat),
  "kundenadresseAbstandOben": Opt(Float64),
  "kundenadresseEinrueckungZeichen": Opt(Nat),
  "fusszeileBildPosition": Opt(Text),
  "kopfzeileAdresse": Opt(Text),
  "kopfzeilePosition": Opt(Text),
  "praefix": Text,
  "naechsteNummer": Nat,
  "qrAktivStandard": Bool,
  "farbe": Text,
  "fusszeileBildUrl": Opt(Text),
  "kundenadresseLinks": Opt(Bool),
  "companyId": CompanyId
});
const Result_45 = Variant({
  "ok": InvoiceTemplate,
  "err": Text
});
const CreatePauseOverrideInput = Record({
  "action": Text,
  "userId": Nat,
  "date": Text,
  "gapEnd": Int,
  "gapStart": Int,
  "reason": Opt(Text),
  "companyId": Nat
});
const PauseOverride = Record({
  "id": Nat,
  "action": Text,
  "userId": Nat,
  "date": Text,
  "createdByUserId": Nat,
  "createdAt": Int,
  "gapEnd": Int,
  "updatedAt": Int,
  "gapStart": Int,
  "reason": Opt(Text),
  "companyId": Nat
});
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
  "kostendachCHF": Opt(Float64),
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
  "kostendachCHF": Opt(Float64),
  "projektleiter": Opt(EmployeeId),
  "companyId": CompanyId
});
const Result_7 = Variant({ "ok": Project, "err": Text });
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
const Result_6 = Variant({ "ok": ServiceType, "err": Text });
const Result_41 = Variant({
  "ok": Record({ "url": Text, "sessionId": Text }),
  "err": Text
});
const Result_40 = Variant({
  "ok": Record({ "url": Text }),
  "err": Text
});
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
const Result_4 = Variant({
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
  "requiresApproval": Opt(Bool),
  "serviceTypeId": ServiceTypeId
});
const TimeEntryId = Nat;
const TimeEntry = Record({
  "id": TimeEntryId,
  "bis": Opt(Text),
  "von": Opt(Text),
  "hours": Float64,
  "fakturiertInRechnungId": Opt(Nat),
  "date": Text,
  "createdAt": Timestamp,
  "description": Text,
  "employeeId": EmployeeId,
  "billable": Bool,
  "projectId": ProjectId,
  "serviceTypeId": ServiceTypeId,
  "companyId": CompanyId
});
const Result_3 = Variant({ "ok": TimeEntry, "err": Text });
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
const Result_1 = Variant({
  "ok": VacationBalance,
  "err": Text
});
const Result_39 = Variant({ "ok": Bool, "err": Text });
const PaymentProvider = Variant({
  "stripe": Null,
  "none": Null,
  "manual": Null
});
const SubscriptionPlan = Record({
  "id": Text,
  "features": Vec(Text),
  "requiresPayment": Bool,
  "sortOrder": Nat,
  "name": Text,
  "stripeLookupKey": Opt(Text),
  "description": Text,
  "isRecommended": Bool,
  "isActive": Bool,
  "stripeProductId": Opt(Text),
  "updatedAt": Int,
  "additionalFeatures": Vec(Text),
  "pricePerYearCHF": Float64,
  "stripePriceId": Opt(Text),
  "pricePerMonthCHF": Float64,
  "stripeMode": Opt(Text),
  "stripePriceIdYearly": Opt(Text),
  "minActiveDaysPerMonth": Nat,
  "maxEmployees": Opt(Nat),
  "paymentProvider": PaymentProvider
});
const CalendarData = Record({
  "absences": Vec(Absence),
  "expenses": Vec(Expense),
  "timeEntries": Vec(TimeEntry)
});
const CanisterStatusInfo = Record({
  "backendStatus": Text,
  "dataSource": Text,
  "frontendCanisterId": Text,
  "backendCycles": Nat,
  "backendMemorySize": Nat,
  "backendCanisterId": Text,
  "timestamp": Int
});
const Result_38 = Variant({
  "ok": Record({
    "nextDueDate": Opt(Int),
    "billingModel": BillingModel,
    "subscriptionStartDate": Opt(Int)
  }),
  "err": Text
});
const MaskedCalendarAbsence = Record({
  "id": Text,
  "status": Text,
  "displayTitle": Text,
  "employeeName": Opt(Text),
  "visibilityMode": Text,
  "displayColor": Opt(Text),
  "toDate": Text,
  "employeeId": Opt(Text),
  "isOwnEntry": Bool,
  "fromDate": Text
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
const Result_17 = Variant({
  "ok": CompanySettings,
  "err": Text
});
const ComplianceCockpitKPI = Record({
  "mitarbeiterMitGesetzlicherUeberzeit": Nat,
  "ferienRisiken": Nat,
  "pausenVerstoesse": Nat,
  "ruhezeitVerstoesse": Nat,
  "mitarbeiterMitVerstoessen": Nat
});
const ComplianceStatus = Variant({
  "CRITICAL": Null,
  "FREIGEGEBEN": Null,
  "INFO": Null,
  "COMPLIANT": Null,
  "WARNING": Null,
  "BREACH": Null
});
const ComplianceCockpitRow = Record({
  "vertraglicheUeberstundenH": Float64,
  "offeneMassnahmen": Nat,
  "employee": Record({
    "id": Nat,
    "lastName": Text,
    "firstName": Text
  }),
  "ferienstatus": Text,
  "pausenVerstoesse": Nat,
  "gesamtstatus": ComplianceStatus,
  "gesetzlicheUeberzeitH": Float64,
  "ruhezeitVerstoesse": Nat
});
const CompliancePeriodeTyp = Variant({
  "DAY": Null,
  "SERVICE_YEAR": Null,
  "WEEK": Null
});
const ComplianceResolutionType = Variant({
  "FREIGEGEBEN": Null,
  "IGNORED": Null,
  "CORRECTED": Null
});
const ComplianceFinding = Record({
  "id": Nat,
  "status": ComplianceStatus,
  "istWert": Float64,
  "resolutionType": Opt(ComplianceResolutionType),
  "periodeKey": Text,
  "periodeTyp": CompliancePeriodeTyp,
  "rechtlicheReferenz": Opt(Text),
  "auditHash": Opt(Text),
  "createdAt": Int,
  "sollWert": Float64,
  "resolutionReason": Opt(Text),
  "sourceEntryIds": Vec(Nat),
  "meldung": Text,
  "employeeId": Nat,
  "resolvedAt": Opt(Int),
  "resolvedBy": Opt(Nat),
  "ruleCode": Text,
  "einheit": Text,
  "companyId": Nat
});
const EmployeeComplianceProfile = Record({
  "id": Nat,
  "aktiv": Bool,
  "createdAt": Int,
  "updatedAt": Int,
  "employeeId": Nat,
  "ausnahmeprofil": Opt(Text),
  "erfassungsModus": Text,
  "vertraglicheZusatzferienTage": Float64,
  "gesetzlicheWochenhochstarbeitszeit": Float64,
  "gesetzlicherFerienanspruchWochen": Float64,
  "companyId": Nat
});
const CycleSnapshot = Record({
  "frontendCycles": Nat,
  "backendCycles": Nat,
  "timestamp": Int
});
const CostSettings = Record({
  "backendAlertThreshold": Nat,
  "icpPriceUsd": Float64,
  "alertEnabled": Bool,
  "usdChfRate": Float64,
  "frontendAlertThreshold": Nat
});
const CostDashboardData = Record({
  "dataSource": Text,
  "frontendCanisterId": Text,
  "snapshots": Vec(CycleSnapshot),
  "settings": CostSettings,
  "backendCanisterId": Text,
  "backendCyclesBalance": Opt(Nat)
});
const CycleStatus = Record({
  "dataSource": Text,
  "frontendCycles": Opt(Nat),
  "backendCycles": Nat
});
const DashboardStats = Record({
  "hoursTarget": Float64,
  "pendingExpenses": Nat,
  "hoursThisWeek": Float64,
  "remainingVacationMinutes": Int,
  "approvedVacationDays": Nat,
  "pendingVacations": Nat
});
const DefaultWorkHours = Record({
  "stundenDi": Nat,
  "stundenDo": Nat,
  "stundenFr": Nat,
  "stundenMi": Nat,
  "stundenMo": Nat,
  "stundenSa": Nat,
  "stundenSo": Nat,
  "companyId": CompanyId
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
const Result_37 = Variant({
  "ok": WorkTimeBalance,
  "err": Text
});
const Result_36 = Variant({
  "ok": Opt(Employment),
  "err": Text
});
const Result_35 = Variant({
  "ok": Opt(InvoiceTemplate),
  "err": Text
});
const Result_34 = Variant({
  "ok": Vec(Invoice),
  "err": Text
});
const MonthlyCloseRow = Record({
  "status": PeriodCloseStatus$1,
  "month": Nat,
  "expenseCount": Nat,
  "vacationDays": Nat,
  "year": Nat,
  "actualMinutes": Int,
  "openEntryCount": Nat,
  "closeId": Opt(PeriodCloseId),
  "targetMinutes": Int,
  "employeeId": EmployeeId,
  "absenceCount": Nat,
  "lastName": Text,
  "complianceStatus": Text,
  "firstName": Text
});
const Company = Record({
  "id": CompanyId,
  "taxId": Opt(Text),
  "name": Text,
  "createdAt": Timestamp,
  "mwstNummer": Opt(Text),
  "kontoInhaber": Opt(Text),
  "isActive": Bool,
  "logoUrl": Opt(Text),
  "address": Opt(Text),
  "kontoAdresse": Opt(Text)
});
const Result_18 = Variant({ "ok": Company, "err": Text });
const StandardTimeBlock = Record({
  "bis": Text,
  "von": Text,
  "leistungsartId": Opt(Nat),
  "projektId": Opt(Nat)
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
const Result_30 = Variant({
  "ok": Standardarbeitszeiten,
  "err": Text
});
const VacationLedger = Record({
  "id": Nat,
  "serviceYearStart": Int,
  "verbleibendeFerientage": Float64,
  "laengsterZusammenhangenderBlock": Int,
  "lastUpdatedAt": Int,
  "bezogeneFerientage": Float64,
  "employeeId": Nat,
  "calendarYearKey": Text,
  "serviceYearEnd": Int,
  "serviceYearKey": Text,
  "gesetzlicheFerientage": Float64,
  "twoWeekBlockSatisfied": Bool,
  "geplanteFerientage": Float64,
  "vertraglicheZusatzferienTage": Float64,
  "companyId": Nat
});
const DetectedPause = Record({
  "pauseEnd": Int,
  "source": Text,
  "date": Text,
  "pauseStart": Int,
  "durationMinutes": Int,
  "complianceRelevant": Bool,
  "ignored": Bool
});
const DayPauseComplianceResult = Record({
  "status": Text,
  "isCompliant": Bool,
  "date": Text,
  "detectedPauseMinutes": Int,
  "requiredPauseMinutes": Int,
  "meldung": Text,
  "employeeId": Nat,
  "workDurationMinutes": Int,
  "pausen": Vec(DetectedPause),
  "companyId": Nat
});
const PeriodCloseConfig = Record({
  "allowCloseWithOpenTimeEntries": Bool,
  "allowCloseWithOpenAbsences": Bool,
  "enabled": Bool,
  "allowCloseWithOpenExpenses": Bool,
  "allowCloseWithComplianceWarnings": Bool,
  "onlyAdminCanReopen": Bool,
  "requireReopenReason": Bool
});
const Result_33 = Variant({ "ok": Float64, "err": Text });
const ServiceTypeBudgetReport = Record({
  "serviceTypeName": Text,
  "aufgewendetCHF": Float64,
  "aufgewendeteStunden": Float64,
  "kostendachCHF": Float64,
  "serviceTypeId": ServiceTypeId
});
const EmployeeBudgetReport = Record({
  "employeeName": Text,
  "aufgewendetCHF": Float64,
  "aufgewendeteStunden": Float64,
  "employeeId": EmployeeId,
  "serviceTypeReports": Vec(ServiceTypeBudgetReport),
  "kostendachCHF": Float64
});
const ProjectBudgetReport = Record({
  "totalKostendachCHF": Float64,
  "customerName": Text,
  "totalAufgewendetCHF": Float64,
  "projectName": Text,
  "totalStunden": Float64,
  "projectId": ProjectId,
  "employeeReports": Vec(EmployeeBudgetReport)
});
const Result_32 = Variant({
  "ok": ProjectBudgetReport,
  "err": Text
});
const ProjectMemberAssignment = Record({
  "stundensatz": Float64,
  "employeeId": EmployeeId,
  "kostendachCHF": Opt(Float64),
  "serviceTypeId": ServiceTypeId
});
const Result_31 = Variant({
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
const StripeEventStatus = Variant({
  "processed": Null,
  "ignored": Null,
  "received": Null,
  "failed": Null
});
const StripeEvent = Record({
  "id": Text,
  "stripeEventId": Text,
  "processingStatus": StripeEventStatus,
  "stripeSubscriptionId": Opt(Text),
  "errorMessage": Opt(Text),
  "tenantId": Opt(Nat),
  "processedAt": Opt(Int),
  "subscriptionId": Opt(Text),
  "receivedAt": Int,
  "stripeCustomerId": Opt(Text),
  "rawPayload": Opt(Text),
  "eventType": Text
});
const StripeInvoice = Record({
  "id": Text,
  "status": Text,
  "stripeSubscriptionId": Opt(Text),
  "dueDate": Opt(Int),
  "stripeInvoiceId": Text,
  "amountPaid": Float64,
  "invoicePdfUrl": Opt(Text),
  "invoiceNumber": Opt(Text),
  "periodEnd": Opt(Int),
  "stripeCustomerId": Text,
  "currency": Text,
  "amountDue": Float64,
  "periodStart": Opt(Int),
  "issuedAt": Int,
  "paidAt": Opt(Int),
  "hostedInvoiceUrl": Opt(Text),
  "companyId": Nat
});
const TenantComplianceRule = Record({
  "modifiedAt": Int,
  "modifiedBy": Text,
  "isActive": Bool,
  "tenantId": Text,
  "isCustomized": Bool,
  "customValue": Opt(Float64),
  "ruleCode": Text
});
const TenantCostEntry = Record({
  "employeeCount": Nat,
  "estimatedCycles": Nat,
  "companyName": Text,
  "companyId": Nat
});
const Result_29 = Variant({ "ok": Int, "err": Text });
const Result_28 = Variant({
  "ok": Record({
    "spesen": Vec(Expense),
    "zeiteintraege": Vec(TimeEntry)
  }),
  "err": Text
});
const UnbilledTimeEntry = Record({
  "id": Nat,
  "bis": Opt(Text),
  "von": Opt(Text),
  "hours": Float64,
  "date": Text,
  "stundensatz": Float64,
  "createdAt": Int,
  "description": Text,
  "totalCHF": Float64,
  "employeeId": Nat,
  "billable": Bool,
  "projectId": Nat,
  "serviceTypeId": Nat,
  "companyId": Nat
});
const Result_27 = Variant({
  "ok": Record({
    "spesen": Vec(Expense),
    "zeiteintraege": Vec(UnbilledTimeEntry)
  }),
  "err": Text
});
const UserNotificationSettings = Record({
  "emailNewVacationRequest": Bool,
  "emailOnApproval": Bool,
  "principalId": Principal$1,
  "companyId": CompanyId
});
const Result_2 = Variant({
  "ok": UserNotificationSettings,
  "err": Text
});
const PlatformAdminUserEntry = Record({
  "id": EmployeeId,
  "activatedAt": Opt(Int),
  "role": Role,
  "deactivatedAt": Opt(Int),
  "isActive": Bool,
  "email": Text,
  "lastName": Text,
  "firstName": Text
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
const AuditOperation$1 = Variant({
  "reject": Null,
  "remove": Null,
  "approve": Null,
  "delete": Null,
  "create": Null,
  "update": Null
});
const AuditEntityType$1 = Variant({
  "expenseType": Null,
  "serviceType": Null,
  "expense": Null,
  "timeEntry": Null,
  "customer": Null,
  "ferien": Null,
  "invoiceTemplate": Null,
  "absence": Null,
  "company": Null,
  "employee": Null,
  "approval": Null,
  "absenceType": Null,
  "holiday": Null,
  "project": Null
});
const AuditLogFilter = Record({
  "dateTo": Opt(Int),
  "actorPrincipalFilter": Opt(Text),
  "operation": Opt(AuditOperation$1),
  "entityType": Opt(AuditEntityType$1),
  "dateFrom": Opt(Int)
});
const AuditFieldChange = Record({
  "after": Text,
  "before": Text,
  "fieldName": Text
});
const AuditLogEntry = Record({
  "id": Text,
  "beforeState": Opt(Text),
  "actorName": Text,
  "entityId": Text,
  "operation": AuditOperation$1,
  "timestamp": Int,
  "actorPrincipal": Text,
  "entityType": AuditEntityType$1,
  "fieldChanges": Opt(Vec(AuditFieldChange)),
  "afterState": Opt(Text),
  "companyId": CompanyId
});
const Result_26 = Variant({
  "ok": Vec(Employment),
  "err": Text
});
const ExpenseFilter = Record({
  "status": Opt(ExpenseStatus),
  "dateTo": Opt(Text),
  "employeeId": Opt(EmployeeId),
  "dateFrom": Opt(Text)
});
const UserNotification = Record({
  "isDeleted": Bool,
  "notification": Notification,
  "isRead": Bool,
  "readAt": Opt(Int)
});
const PeriodCloseAction = Variant({
  "reopen": Null,
  "close": Null,
  "force_close": Null,
  "close_failed": Null
});
const PeriodCloseAuditEntry = Record({
  "oldStatus": PeriodCloseStatus$1,
  "action": PeriodCloseAction,
  "performedByUserId": EmployeeId,
  "auditId": Text,
  "tenantId": CompanyId,
  "periodEnd": Int,
  "warnings": Opt(Vec(Text)),
  "employeeId": Opt(EmployeeId),
  "performedAt": Timestamp,
  "periodStart": Int,
  "newStatus": PeriodCloseStatus$1,
  "affectedRecordCounts": Opt(AffectedRecordCounts),
  "reason": Opt(Text)
});
const Result_25 = Variant({
  "ok": Vec(TimeBalanceCorrection),
  "err": Text
});
const TimeEntryFilter = Record({
  "dateTo": Opt(Text),
  "employeeId": Opt(EmployeeId),
  "projectId": Opt(ProjectId),
  "dateFrom": Opt(Text)
});
const Result_24 = Variant({
  "ok": Vec(VacationBalance),
  "err": Text
});
const PrecheckVerdict = Variant({
  "ok": Null,
  "blocked": Null,
  "ok_with_warnings": Null
});
const PrecheckResult = Record({
  "hasOpenEntries": Bool,
  "blockers": Vec(Text),
  "verdict": PrecheckVerdict,
  "warnings": Vec(Text),
  "hasOpenAbsences": Bool,
  "missingDays": Nat,
  "canClose": Bool,
  "hasComplianceViolations": Bool,
  "hasOpenExpenses": Bool
});
const ReopenPeriodInput = Record({
  "reopenReason": Opt(Text),
  "closeId": PeriodCloseId
});
const ResolveFindingInput = Record({
  "resolutionType": ComplianceResolutionType,
  "findingId": Nat,
  "resolutionReason": Text
});
const http_header = Record({
  "value": Text,
  "name": Text
});
const http_request_result = Record({
  "status": Nat,
  "body": Vec(Nat8),
  "headers": Vec(http_header)
});
const TransformationInput = Record({
  "context": Vec(Nat8),
  "response": http_request_result
});
const TransformationOutput = Record({
  "status": Nat,
  "body": Vec(Nat8),
  "headers": Vec(http_header)
});
const HttpHeader = Record({ "value": Text, "name": Text });
const HttpRequestResult = Record({
  "status": Nat,
  "body": Vec(Nat8),
  "headers": Vec(HttpHeader)
});
const HttpTransformArgs = Record({
  "context": Vec(Nat8),
  "response": HttpRequestResult
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
  "visibility": Opt(AbsenceTypeVisibility),
  "compensated": Opt(Bool)
});
const UpdateCompanyInput = Record({
  "taxId": Opt(Text),
  "name": Opt(Text),
  "mwstNummer": Opt(Text),
  "kontoInhaber": Opt(Text),
  "logoUrl": Opt(Text),
  "address": Opt(Text),
  "kontoAdresse": Opt(Text)
});
const UpdateComplianceProfileInput = Record({
  "id": Nat,
  "aktiv": Bool,
  "employeeId": Nat,
  "ausnahmeprofil": Opt(Text),
  "erfassungsModus": Text,
  "vertraglicheZusatzferienTage": Float64,
  "gesetzlicheWochenhochstarbeitszeit": Float64,
  "gesetzlicherFerienanspruchWochen": Float64
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
const Result_15 = Variant({
  "ok": DefaultWorkHours,
  "err": Text
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
  "projektId": Opt(Nat),
  "billableCHF": Opt(Float64),
  "kundeId": Opt(Nat),
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
const UpdateInvoiceInput = Record({
  "status": Opt(InvoiceStatus$1),
  "fusstext": Opt(Text),
  "positionen": Opt(Vec(InvoicePositionInput)),
  "faelligkeitsdatum": Opt(Text),
  "qrAktiv": Opt(Bool),
  "mwstSatz": Opt(Float64),
  "rabatt": Opt(Float64),
  "kopftext": Opt(Text),
  "kundeId": Opt(CustomerId),
  "datum": Opt(Text),
  "skonto": Opt(Float64)
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
  "kostendachCHF": Opt(Float64),
  "projektleiter": Opt(EmployeeId)
});
const UpdateServiceTypeInput = Record({
  "defaultRate": Opt(Float64),
  "aktiv": Opt(Bool),
  "name": Opt(Text),
  "billable": Opt(Bool)
});
const UpdateTenantComplianceRuleInput = Record({
  "newValue": Opt(Float64),
  "isActive": Bool,
  "ruleCode": Text,
  "companyId": Nat
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
const Result = Variant({
  "ok": SubscriptionPlan,
  "err": Text
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
  "addKnowledgeEntry": Func(
    [
      Record({
        "title": Text,
        "content": Text,
        "role": Text,
        "isActive": Bool,
        "language": Text,
        "category": Text
      })
    ],
    [Result_8],
    []
  ),
  "applyPlanChange": Func(
    [Nat, Text, BillingModel],
    [Result_21],
    []
  ),
  "approveAbsence": Func([AbsenceId], [Result_20], []),
  "approveExpense": Func([ExpenseId], [Result_12], []),
  "archiveNotification": Func(
    [Text],
    [Variant({ "ok": Null, "err": Text })],
    []
  ),
  "assertPeriodIsEditable": Func(
    [CompanyId, EmployeeId, Int, Text],
    [Result_5],
    []
  ),
  "assignCallerUserRole": Func([Principal$1, UserRole], [], []),
  "assignEmployeeToProject": Func(
    [EmployeeId, ProjectId],
    [Result_49],
    []
  ),
  "assignSubscriptionPlan": Func([Text, Text], [Result_5], []),
  "calculateMonthlyBilling": Func(
    [Nat, Nat],
    [Vec(MonthlyBillingEntry)],
    ["query"]
  ),
  "calculateProRataAdjustment": Func(
    [Nat, Text],
    [Result_48],
    ["query"]
  ),
  "cancelInvoice": Func([Nat], [Result_9], []),
  "cancelStripeSubscription": Func([Nat], [Result_22], []),
  "checkPlanChangeNeeded": Func([Nat], [Result_47], ["query"]),
  "closePeriod": Func([ClosePeriodInput], [Result_23], []),
  "closePeriodBulk": Func(
    [CompanyId, Nat, Nat, Opt(Text)],
    [Vec(Result_23)],
    []
  ),
  "compareStripeSubscriptionStatus": Func([Nat], [Result_46], []),
  "createAbsence": Func([CreateAbsenceInput], [Result_20], []),
  "createAbsenceType": Func([CreateAbsenceTypeInput], [Result_19], []),
  "createCustomer": Func([CreateCustomerInput], [Result_16], []),
  "createEmployee": Func([CreateEmployeeInput], [Result_14], []),
  "createEmployment": Func(
    [EmployeeId, CreateEmploymentInput],
    [Result_13],
    []
  ),
  "createExpense": Func([CreateExpenseInput], [Result_12], []),
  "createExpenseType": Func([CreateExpenseTypeInput], [Result_11], []),
  "createHoliday": Func([CreateHolidayInput], [Result_10], []),
  "createInvoice": Func([CreateInvoiceInput], [Result_9], []),
  "createNotificationDraft": Func(
    [
      Text,
      Text,
      NotificationFormat,
      NotificationPriority,
      Int,
      Opt(Int),
      NotificationTargetType,
      Vec(Text),
      Vec(Text),
      Vec(Text)
    ],
    [Variant({ "ok": Notification, "err": Text })],
    []
  ),
  "createOrUpdateInvoiceTemplate": Func(
    [InvoiceTemplateInput],
    [Result_45],
    []
  ),
  "createPauseOverride": Func(
    [CreatePauseOverrideInput],
    [Variant({ "ok": PauseOverride, "err": Text })],
    []
  ),
  "createProject": Func([CreateProjectInput], [Result_7], []),
  "createServiceType": Func([CreateServiceTypeInput], [Result_6], []),
  "createStripeCheckoutLinkForCompany": Func(
    [Nat, Text, BillingModel],
    [Result_41],
    []
  ),
  "createStripeCheckoutLinkForCompanyWithPrice": Func(
    [Nat, Text, BillingModel, Text],
    [Result_41],
    []
  ),
  "createStripeCheckoutSession": Func(
    [Nat, Text, BillingModel],
    [Result_41],
    []
  ),
  "createStripeCheckoutSessionWithPrice": Func(
    [Nat, Text, BillingModel, Text],
    [Result_41],
    []
  ),
  "createStripeCustomerPortalSession": Func([Nat], [Result_40], []),
  "createTimeBalanceCorrection": Func(
    [EmployeeId, CreateTimeBalanceCorrectionInput],
    [Result_4],
    []
  ),
  "createTimeEntry": Func([CreateTimeEntryInput], [Result_3], []),
  "createVacationBalance": Func(
    [EmployeeId, CreateVacationBalanceInput],
    [Result_1],
    []
  ),
  "deleteAbsence": Func([AbsenceId], [Result_5], []),
  "deleteAbsenceType": Func([AbsenceTypeId], [Result_5], []),
  "deleteCustomer": Func([CustomerId], [Result_5], []),
  "deleteEmployee": Func([EmployeeId], [Result_5], []),
  "deleteEmployment": Func([EmployeeId, Text], [Result_5], []),
  "deleteExpense": Func([ExpenseId], [Result_5], []),
  "deleteExpenseType": Func([ExpenseTypeId], [Result_5], []),
  "deleteHoliday": Func([HolidayId], [Result_5], []),
  "deleteInvoice": Func([Nat], [Result_5], []),
  "deleteKnowledgeEntry": Func([Text], [Result_39], []),
  "deleteMyNotification": Func(
    [Text],
    [Variant({ "ok": Null, "err": Text })],
    []
  ),
  "deletePauseOverride": Func(
    [Nat],
    [Variant({ "ok": Null, "err": Text })],
    []
  ),
  "deleteProject": Func([ProjectId], [Result_5], []),
  "deleteServiceType": Func([ServiceTypeId], [Result_5], []),
  "deleteSubscriptionPlan": Func([Text], [Result_5], []),
  "deleteTimeBalanceCorrection": Func(
    [EmployeeId, Text],
    [Result_5],
    []
  ),
  "deleteTimeEntry": Func([TimeEntryId], [Result_5], []),
  "deleteVacationBalance": Func([EmployeeId, Text], [Result_5], []),
  "duplicateNotification": Func(
    [Text],
    [Variant({ "ok": Notification, "err": Text })],
    []
  ),
  "generateInviteCode": Func([EmployeeId], [Result_21], []),
  "getAllCompanySubscriptions": Func(
    [],
    [Vec(Tuple(Text, Text))],
    ["query"]
  ),
  "getAllSubscriptionPlans": Func(
    [],
    [Vec(SubscriptionPlan)],
    ["query"]
  ),
  "getBackendCanisterId": Func([], [Text], []),
  "getCalendarEntries": Func(
    [Text, Nat],
    [CalendarData],
    ["query"]
  ),
  "getCallerUserRole": Func([], [UserRole], ["query"]),
  "getCanisterStatusInfo": Func([], [CanisterStatusInfo], ["query"]),
  "getCompanyBillingModel": Func([Nat], [Result_38], ["query"]),
  "getCompanyCalendarAbsences": Func(
    [CompanyId, Int, Int],
    [Vec(MaskedCalendarAbsence)],
    ["query"]
  ),
  "getCompanyEmployeesForBilling": Func(
    [CompanyId],
    [Vec(Employee)],
    ["query"]
  ),
  "getCompanySettings": Func([], [Result_17], ["query"]),
  "getCompanySubscription": Func(
    [Text],
    [Opt(Text)],
    ["query"]
  ),
  "getCompanySubscriptionPlan": Func(
    [Nat],
    [Opt(SubscriptionPlan)],
    ["query"]
  ),
  "getComplianceCockpitKPI": Func(
    [Nat],
    [ComplianceCockpitKPI],
    ["query"]
  ),
  "getComplianceCockpitRows": Func(
    [Nat],
    [Vec(ComplianceCockpitRow)],
    ["query"]
  ),
  "getComplianceFindings": Func(
    [
      Nat,
      Opt(CompliancePeriodeTyp),
      Opt(Vec(ComplianceStatus))
    ],
    [Vec(ComplianceFinding)],
    ["query"]
  ),
  "getComplianceProfile": Func(
    [Nat],
    [Opt(EmployeeComplianceProfile)],
    ["query"]
  ),
  "getContractualHoursForEmployee": Func(
    [Nat, Text],
    [Opt(Float64)],
    ["query"]
  ),
  "getCostDashboardData": Func(
    [Opt(Int), Opt(Int)],
    [CostDashboardData],
    ["query"]
  ),
  "getCostSettings": Func([], [CostSettings], ["query"]),
  "getCycleSnapshots": Func(
    [Opt(Int), Opt(Int)],
    [Vec(CycleSnapshot)],
    ["query"]
  ),
  "getCycleStatus": Func([], [CycleStatus], ["query"]),
  "getDashboardStats": Func([], [DashboardStats], ["query"]),
  "getDefaultWorkHours": Func([], [DefaultWorkHours], ["query"]),
  "getEmployeeWorkTimeBalance": Func(
    [EmployeeId, Text, Text],
    [Result_37],
    ["query"]
  ),
  "getEmployeeWorkTimeBalanceFromStart": Func(
    [EmployeeId],
    [Result_37],
    ["query"]
  ),
  "getEmploymentForDate": Func(
    [EmployeeId, Text],
    [Result_36],
    ["query"]
  ),
  "getFrontendCyclesManual": Func([], [Nat], ["query"]),
  "getInvoiceById": Func([Nat], [Result_9], ["query"]),
  "getInvoiceTemplate": Func([], [Result_35], ["query"]),
  "getInvoices": Func([], [Result_34], []),
  "getKnowledgeEntries": Func([], [Vec(KnowledgeEntry)], ["query"]),
  "getKnowledgeEntriesAdmin": Func(
    [],
    [Vec(KnowledgeEntry)],
    ["query"]
  ),
  "getMonthlyBillingOverview": Func(
    [Nat, Nat],
    [Vec(MonthlyBillingEntry)],
    ["query"]
  ),
  "getMonthlyCloseOverview": Func(
    [CompanyId, Nat, Nat],
    [Vec(MonthlyCloseRow)],
    []
  ),
  "getMyCompany": Func([], [Result_18], ["query"]),
  "getMyComplianceFindings": Func(
    [Opt(CompliancePeriodeTyp)],
    [Vec(ComplianceFinding)],
    ["query"]
  ),
  "getMyComplianceProfile": Func(
    [],
    [Opt(EmployeeComplianceProfile)],
    ["query"]
  ),
  "getMyEmployee": Func([], [Result_14], ["query"]),
  "getMyStandardarbeitszeiten": Func([], [Result_30], ["query"]),
  "getMyVacationLedger": Func(
    [Text],
    [Opt(VacationLedger)],
    ["query"]
  ),
  "getOpenAIConfigStatus": Func(
    [],
    [Record({ "isConfigured": Bool })],
    ["query"]
  ),
  "getOpenAIEnabled": Func(
    [],
    [Record({ "isConfigured": Bool })],
    ["query"]
  ),
  "getPauseComplianceForDay": Func(
    [Nat, Text],
    [DayPauseComplianceResult],
    ["query"]
  ),
  "getPauseOverridesForDay": Func(
    [Nat, Text],
    [Vec(PauseOverride)],
    ["query"]
  ),
  "getPausesForDay": Func(
    [Nat, Text],
    [Vec(DetectedPause)],
    ["query"]
  ),
  "getPeriodCloseConfig": Func([CompanyId], [PeriodCloseConfig], []),
  "getPeriodCloseStatus": Func(
    [CompanyId, EmployeeId, Nat, Nat],
    [Opt(PeriodClose)],
    []
  ),
  "getPlatformAdminConfig": Func(
    [],
    [
      Record({
        "frontendCanisterId": Text,
        "stripeWebhookEndpointUrl": Text,
        "stripePublishableKey": Text
      })
    ],
    ["query"]
  ),
  "getPlatformAdminInfo": Func(
    [],
    [Opt(Record({ "principal": Text, "createdAt": Int }))],
    ["query"]
  ),
  "getProjectAufwendungen": Func([ProjectId], [Result_33], ["query"]),
  "getProjectBudgetReport": Func(
    [ProjectId, Text, Text],
    [Result_32],
    ["query"]
  ),
  "getProjectMembers": Func([ProjectId], [Result_31], ["query"]),
  "getRelevantKnowledgeContext": Func(
    [Text, Nat],
    [Text],
    ["query"]
  ),
  "getReportData": Func([ReportFilter], [ReportData], ["query"]),
  "getServiceYears": Func([Nat], [Vec(Text)], ["query"]),
  "getSnapshotInterval": Func([], [Nat], ["query"]),
  "getStandardarbeitszeitenForEmployee": Func(
    [EmployeeId],
    [Result_30],
    ["query"]
  ),
  "getStripeConfigStatus": Func(
    [],
    [
      Record({
        "hasPublishableKey": Bool,
        "testMode": Bool,
        "configured": Bool
      })
    ],
    ["query"]
  ),
  "getStripeEvents": Func(
    [Opt(Nat), Nat],
    [Vec(StripeEvent)],
    ["query"]
  ),
  "getStripeInvoicesForCompany": Func(
    [Nat],
    [Vec(StripeInvoice)],
    ["query"]
  ),
  "getStripePublishableKey": Func([], [Opt(Text)], ["query"]),
  "getSubscriptionPlans": Func([], [Vec(SubscriptionPlan)], ["query"]),
  "getSystemStats": Func(
    [],
    [Record({ "totalEmployees": Nat, "totalCompanies": Nat })],
    ["query"]
  ),
  "getTenantComplianceRules": Func(
    [Nat],
    [Vec(TenantComplianceRule)],
    ["query"]
  ),
  "getTenantCostBreakdown": Func(
    [],
    [Vec(TenantCostEntry)],
    ["query"]
  ),
  "getTimeBalance": Func([EmployeeId], [Result_29], ["query"]),
  "getUnbilledEntries": Func([Opt(Nat)], [Result_28], ["query"]),
  "getUnbilledEntriesWithRates": Func(
    [Opt(Nat)],
    [Result_27],
    ["query"]
  ),
  "getUnreadCount": Func([], [Nat], ["query"]),
  "getUserNotificationSettings": Func([], [Result_2], ["query"]),
  "getUsersForCompany": Func(
    [CompanyId],
    [Vec(PlatformAdminUserEntry)],
    ["query"]
  ),
  "getVacationLedger": Func(
    [Nat, Text],
    [Opt(VacationLedger)],
    ["query"]
  ),
  "getVacationLedgerAll": Func(
    [Nat],
    [Vec(VacationLedger)],
    ["query"]
  ),
  "handleStripeWebhook": Func([Text, Text], [Result_21], []),
  "initAllVacationLedgers": Func(
    [Nat],
    [Variant({ "ok": Nat, "err": Text })],
    []
  ),
  "isCallerAdmin": Func([], [Bool], ["query"]),
  "isPlatformAdmin": Func([], [Bool], ["query"]),
  "isRegistered": Func([], [Bool], ["query"]),
  "listAbsenceTypes": Func([], [Vec(AbsenceType)], ["query"]),
  "listAbsences": Func([AbsenceFilter], [Vec(Absence)], ["query"]),
  "listAllCompaniesForPlatformAdmin": Func(
    [],
    [
      Vec(
        Record({
          "id": Text,
          "name": Text,
          "createdAt": Int,
          "inactiveEmployeeCount": Nat,
          "isActive": Bool,
          "address": Opt(Text),
          "activeEmployeeCount": Nat
        })
      )
    ],
    ["query"]
  ),
  "listAllNotifications": Func([], [Vec(Notification)], []),
  "listAuditLog": Func(
    [Opt(Text), Opt(Nat)],
    [Vec(AuditEntry)],
    ["query"]
  ),
  "listAuditLogs": Func(
    [AuditLogFilter],
    [Vec(AuditLogEntry)],
    ["query"]
  ),
  "listCustomers": Func([], [Vec(Customer)], ["query"]),
  "listEmployees": Func([], [Vec(Employee)], ["query"]),
  "listEmployments": Func([EmployeeId], [Result_26], ["query"]),
  "listExpenseTypes": Func([], [Vec(ExpenseType)], ["query"]),
  "listExpenses": Func([ExpenseFilter], [Vec(Expense)], ["query"]),
  "listHolidays": Func([], [Vec(Holiday)], ["query"]),
  "listMyNotifications": Func([], [Vec(UserNotification)], []),
  "listPeriodCloseAudit": Func(
    [CompanyId],
    [Vec(PeriodCloseAuditEntry)],
    []
  ),
  "listPeriodCloses": Func(
    [CompanyId, Nat, Nat],
    [Vec(PeriodClose)],
    []
  ),
  "listProjectAssignments": Func(
    [],
    [Vec(ProjectAssignment)],
    ["query"]
  ),
  "listProjects": Func([], [Vec(Project)], ["query"]),
  "listServiceTypes": Func([], [Vec(ServiceType)], ["query"]),
  "listTimeBalanceCorrections": Func([EmployeeId], [Result_25], ["query"]),
  "listTimeEntries": Func(
    [TimeEntryFilter],
    [Vec(TimeEntry)],
    ["query"]
  ),
  "listVacationBalances": Func([EmployeeId], [Result_24], ["query"]),
  "manuallyTriggerStripeSync": Func([Nat], [Result_21], []),
  "markAllNotificationsRead": Func(
    [],
    [Variant({ "ok": Nat, "err": Text })],
    []
  ),
  "markFakturiert": Func(
    [Nat, Vec(Nat), Vec(Nat)],
    [Result_5],
    []
  ),
  "markNotificationRead": Func(
    [Text],
    [Variant({ "ok": Null, "err": Text })],
    []
  ),
  "precheckPeriodClose": Func(
    [CompanyId, EmployeeId, Nat, Nat],
    [PrecheckResult],
    []
  ),
  "purgeEmployee": Func([EmployeeId], [Result_5], []),
  "reactivateStripeSubscription": Func([Nat], [Result_22], []),
  "recordCycleSnapshot": Func([Nat, Nat], [], []),
  "recoverSubscriptionPlans": Func([], [Result_21], []),
  "redeemInviteCode": Func([Text], [Result_14], []),
  "registerCompany": Func(
    [
      Text,
      Text,
      Text,
      Text,
      Opt(Text),
      Opt(Text)
    ],
    [Result_18],
    []
  ),
  "rejectAbsence": Func([AbsenceId, Text], [Result_20], []),
  "rejectExpense": Func([ExpenseId, Opt(Text)], [Result_12], []),
  "relinkStripeCustomer": Func([Nat, Text], [Result_21], []),
  "removeEmployeeFromProject": Func(
    [EmployeeId, ProjectId],
    [Result_5],
    []
  ),
  "reopenPeriod": Func([ReopenPeriodInput], [Result_23], []),
  "reprocessStripeEvent": Func([Text], [Result_21], []),
  "resetAbsenceToAusstehend": Func([AbsenceId, Text], [Result_20], []),
  "resetExpenseToAusstehend": Func([ExpenseId, Text], [Result_12], []),
  "resetTenantComplianceRule": Func(
    [Nat, Text],
    [Variant({ "ok": TenantComplianceRule, "err": Text })],
    []
  ),
  "resolveFinding": Func(
    [ResolveFindingInput],
    [Variant({ "ok": ComplianceFinding, "err": Text })],
    []
  ),
  "restoreDefaultPlansIfMissing": Func([], [Result_21], []),
  "revokeInviteCode": Func([Text], [Result_5], []),
  "runWeeklyComplianceCheck": Func(
    [Nat, Text],
    [
      Variant({
        "ok": Record({
          "existingFindings": Nat,
          "newFindings": Nat
        }),
        "err": Text
      })
    ],
    []
  ),
  "saveAndSendNotification": Func(
    [
      Text,
      Text,
      NotificationFormat,
      NotificationPriority,
      Int,
      Opt(Int),
      NotificationTargetType,
      Vec(Text),
      Vec(Text),
      Vec(Text)
    ],
    [Variant({ "ok": Notification, "err": Text })],
    []
  ),
  "sendChatMessage": Func(
    [
      Text,
      Vec(Record({ "content": Text, "role": Text }))
    ],
    [Result_21],
    []
  ),
  "sendNotification": Func(
    [Text],
    [Variant({ "ok": Null, "err": Text })],
    []
  ),
  "setCompanyActive": Func(
    [Nat, Bool],
    [Variant({ "ok": Null, "err": Text })],
    []
  ),
  "setCompanyBillingModel": Func([Nat, BillingModel], [Result_5], []),
  "setEmployeeActive": Func([EmployeeId, Bool], [Result_14], []),
  "setFrontendCanisterId": Func([Text], [], []),
  "setFrontendCyclesManual": Func([Nat], [], []),
  "setMyStandardarbeitszeiten": Func(
    [Standardarbeitszeiten],
    [Result_5],
    []
  ),
  "setOpenAIConfig": Func([Text], [Result_5], []),
  "setPlatformAdminConfig": Func(
    [
      Record({
        "frontendCanisterId": Text,
        "stripeWebhookEndpointUrl": Text,
        "stripeSecretKey": Text,
        "stripePublishableKey": Text,
        "stripeWebhookSecret": Text
      })
    ],
    [Result_5],
    []
  ),
  "setProjectMembers": Func(
    [ProjectId, Vec(ProjectMemberAssignment)],
    [Result_5],
    []
  ),
  "setSnapshotInterval": Func([Nat], [], []),
  "setStandardarbeitszeitenForEmployee": Func(
    [EmployeeId, Standardarbeitszeiten],
    [Result_5],
    []
  ),
  "setStripeConfig": Func([Text, Text, Text], [Result_21], []),
  "setUserActiveForCompany": Func(
    [CompanyId, EmployeeId, Bool],
    [Result_5],
    []
  ),
  "setUserRoleForCompany": Func(
    [CompanyId, EmployeeId, Role],
    [Result_5],
    []
  ),
  "startSnapshotTimer": Func([], [], []),
  "syncStripeSubscription": Func([Nat], [Result_22], []),
  "testOpenAIConnection": Func([], [Result_21], []),
  "testStripeConnection": Func(
    [],
    [
      Record({
        "apiConnectionOk": Bool,
        "apiConnectionMessage": Text,
        "customerPortalOk": Bool,
        "customerPortalMessage": Text
      })
    ],
    []
  ),
  "transformOpenAI": Func(
    [TransformationInput],
    [TransformationOutput],
    ["query"]
  ),
  "transformStripeResponse": Func(
    [HttpTransformArgs],
    [HttpRequestResult],
    ["query"]
  ),
  "updateAbsence": Func([AbsenceId, UpdateAbsenceInput], [Result_20], []),
  "updateAbsenceType": Func(
    [AbsenceTypeId, UpdateAbsenceTypeInput],
    [Result_19],
    []
  ),
  "updateCompany": Func([UpdateCompanyInput], [Result_18], []),
  "updateCompanySettings": Func([CompanySettings], [Result_17], []),
  "updateComplianceProfile": Func(
    [UpdateComplianceProfileInput],
    [Variant({ "ok": EmployeeComplianceProfile, "err": Text })],
    []
  ),
  "updateCostSettings": Func([CostSettings], [], []),
  "updateCustomer": Func(
    [CustomerId, UpdateCustomerInput],
    [Result_16],
    []
  ),
  "updateDefaultWorkHours": Func([DefaultWorkHours], [Result_15], []),
  "updateEmployee": Func(
    [EmployeeId, UpdateEmployeeInput],
    [Result_14],
    []
  ),
  "updateEmployment": Func(
    [EmployeeId, Text, UpdateEmploymentInput],
    [Result_13],
    []
  ),
  "updateExpense": Func([ExpenseId, UpdateExpenseInput], [Result_12], []),
  "updateExpenseType": Func(
    [ExpenseTypeId, UpdateExpenseTypeInput],
    [Result_11],
    []
  ),
  "updateHoliday": Func([HolidayId, UpdateHolidayInput], [Result_10], []),
  "updateInvoice": Func([Nat, UpdateInvoiceInput], [Result_9], []),
  "updateKnowledgeEntry": Func(
    [
      Text,
      Record({
        "title": Text,
        "content": Text,
        "role": Text,
        "isActive": Bool,
        "language": Text,
        "category": Text
      })
    ],
    [Result_8],
    []
  ),
  "updatePeriodCloseConfig": Func(
    [CompanyId, PeriodCloseConfig],
    [Result_5],
    []
  ),
  "updateProject": Func([ProjectId, UpdateProjectInput], [Result_7], []),
  "updateServiceType": Func(
    [ServiceTypeId, UpdateServiceTypeInput],
    [Result_6],
    []
  ),
  "updateStripeSubscriptionQuantity": Func(
    [Nat, Nat],
    [Result_5],
    []
  ),
  "updateTenantComplianceRule": Func(
    [UpdateTenantComplianceRuleInput],
    [Variant({ "ok": TenantComplianceRule, "err": Text })],
    []
  ),
  "updateTimeBalanceCorrection": Func(
    [EmployeeId, Text, UpdateTimeBalanceCorrectionInput],
    [Result_4],
    []
  ),
  "updateTimeEntry": Func(
    [TimeEntryId, UpdateTimeEntryInput],
    [Result_3],
    []
  ),
  "updateUserNotificationSettings": Func(
    [UserNotificationSettings],
    [Result_2],
    []
  ),
  "updateVacationBalance": Func(
    [EmployeeId, Text, UpdateVacationBalanceInput],
    [Result_1],
    []
  ),
  "upsertSubscriptionPlan": Func([SubscriptionPlan], [Result], [])
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
  const KnowledgeEntry2 = IDL2.Record({
    "id": IDL2.Text,
    "title": IDL2.Text,
    "content": IDL2.Text,
    "createdAt": IDL2.Int,
    "role": IDL2.Text,
    "isActive": IDL2.Bool,
    "language": IDL2.Text,
    "updatedAt": IDL2.Int,
    "category": IDL2.Text
  });
  const Result_82 = IDL2.Variant({ "ok": KnowledgeEntry2, "err": IDL2.Text });
  const BillingModel2 = IDL2.Variant({
    "monthly": IDL2.Null,
    "yearly": IDL2.Null
  });
  const Result_212 = IDL2.Variant({ "ok": IDL2.Text, "err": IDL2.Text });
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
  const Result_202 = IDL2.Variant({ "ok": Absence2, "err": IDL2.Text });
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
    "fakturiertInRechnungId": IDL2.Opt(IDL2.Nat),
    "date": IDL2.Text,
    "description": IDL2.Text,
    "employeeId": EmployeeId2,
    "projektId": IDL2.Opt(IDL2.Nat),
    "resetReason": IDL2.Opt(IDL2.Text),
    "billableCHF": IDL2.Float64,
    "kundeId": IDL2.Opt(IDL2.Nat),
    "reimbursementCHF": IDL2.Float64,
    "expenseTypeId": ExpenseTypeId2,
    "receiptBlobId": IDL2.Opt(IDL2.Text),
    "companyId": CompanyId2
  });
  const Result_122 = IDL2.Variant({ "ok": Expense2, "err": IDL2.Text });
  const Result_52 = IDL2.Variant({ "ok": IDL2.Null, "err": IDL2.Text });
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
  const Result_492 = IDL2.Variant({ "ok": ProjectAssignment2, "err": IDL2.Text });
  const MonthlyBillingEntry2 = IDL2.Record({
    "month": IDL2.Text,
    "activeUserCount": IDL2.Nat,
    "planId": IDL2.Text,
    "billableUserCount": IDL2.Nat,
    "billingModel": IDL2.Opt(IDL2.Text),
    "year": IDL2.Nat,
    "creditAmount": IDL2.Opt(IDL2.Float64),
    "totalCHF": IDL2.Float64,
    "companyName": IDL2.Text,
    "nextDueDateTimestamp": IDL2.Opt(IDL2.Int),
    "planName": IDL2.Text,
    "proRataAmount": IDL2.Opt(IDL2.Float64),
    "proRataNote": IDL2.Opt(IDL2.Text),
    "companyId": IDL2.Nat
  });
  const Result_482 = IDL2.Variant({
    "ok": IDL2.Record({
      "note": IDL2.Text,
      "remainingDays": IDL2.Nat,
      "isUpgrade": IDL2.Bool,
      "proRataAmount": IDL2.Float64
    }),
    "err": IDL2.Text
  });
  const InvoiceStatus2 = IDL2.Variant({
    "entwurf": IDL2.Null,
    "versendet": IDL2.Null,
    "bezahlt": IDL2.Null,
    "storniert": IDL2.Null,
    "ueberfaellig": IDL2.Null
  });
  const InvoicePositionTyp2 = IDL2.Variant({
    "leistung": IDL2.Null,
    "freitext": IDL2.Null,
    "spese": IDL2.Null
  });
  const InvoicePosition2 = IDL2.Record({
    "id": IDL2.Nat,
    "typ": InvoicePositionTyp2,
    "menge": IDL2.Float64,
    "referenzId": IDL2.Opt(IDL2.Nat),
    "total": IDL2.Float64,
    "bezeichnung": IDL2.Text,
    "invoiceId": IDL2.Nat,
    "preis": IDL2.Float64,
    "einheit": IDL2.Text
  });
  const CustomerId2 = IDL2.Nat;
  const Invoice2 = IDL2.Record({
    "id": IDL2.Nat,
    "status": InvoiceStatus2,
    "rechnungsnummer": IDL2.Text,
    "total": IDL2.Float64,
    "createdAt": Timestamp2,
    "createdBy": IDL2.Principal,
    "fusstext": IDL2.Text,
    "mwstBetrag": IDL2.Float64,
    "positionen": IDL2.Vec(InvoicePosition2),
    "faelligkeitsdatum": IDL2.Text,
    "qrAktiv": IDL2.Bool,
    "mwstSatz": IDL2.Float64,
    "rabatt": IDL2.Float64,
    "kopftext": IDL2.Text,
    "kundeId": CustomerId2,
    "zwischensumme": IDL2.Float64,
    "datum": IDL2.Text,
    "skonto": IDL2.Float64,
    "waehrung": IDL2.Text,
    "companyId": CompanyId2
  });
  const Result_92 = IDL2.Variant({ "ok": Invoice2, "err": IDL2.Text });
  const CompanySubscription2 = IDL2.Record({
    "stripeCurrentPeriodEnd": IDL2.Opt(IDL2.Int),
    "latestStripePaymentStatus": IDL2.Opt(IDL2.Text),
    "latestStripeInvoiceId": IDL2.Opt(IDL2.Text),
    "nextDueDate": IDL2.Opt(IDL2.Int),
    "planId": IDL2.Text,
    "stripeSubscriptionId": IDL2.Opt(IDL2.Text),
    "billingModel": BillingModel2,
    "proRataCalculatedAt": IDL2.Opt(IDL2.Int),
    "scheduledPlanChangePriceId": IDL2.Opt(IDL2.Text),
    "stripeCancelAtPeriodEnd": IDL2.Bool,
    "stripeProductId": IDL2.Opt(IDL2.Text),
    "stripeCustomerId": IDL2.Opt(IDL2.Text),
    "subscriptionStartDate": IDL2.Opt(IDL2.Int),
    "scheduledPlanChangeEffectiveAt": IDL2.Opt(IDL2.Int),
    "stripeStatus": IDL2.Opt(IDL2.Text),
    "proRataAmount": IDL2.Opt(IDL2.Float64),
    "stripeCurrentPeriodStart": IDL2.Opt(IDL2.Int),
    "lastStripeSyncAt": IDL2.Opt(IDL2.Int),
    "scheduledPlanChangeId": IDL2.Opt(IDL2.Text),
    "proRataNote": IDL2.Opt(IDL2.Text),
    "companyId": IDL2.Nat
  });
  const Result_222 = IDL2.Variant({
    "ok": CompanySubscription2,
    "err": IDL2.Text
  });
  const Result_472 = IDL2.Variant({
    "ok": IDL2.Record({
      "estimatedMonthlyCost": IDL2.Float64,
      "currentPlanId": IDL2.Opt(IDL2.Text),
      "activeUserCount": IDL2.Nat,
      "changeNeeded": IDL2.Bool,
      "suggestedPlanId": IDL2.Opt(IDL2.Text),
      "suggestedPlanName": IDL2.Text,
      "currentPlanName": IDL2.Text
    }),
    "err": IDL2.Text
  });
  const ClosePeriodInput2 = IDL2.Record({
    "month": IDL2.Nat,
    "year": IDL2.Nat,
    "tenantId": CompanyId2,
    "employeeId": IDL2.Opt(EmployeeId2),
    "closeComment": IDL2.Opt(IDL2.Text)
  });
  const PeriodCloseStatus2 = IDL2.Variant({
    "reopened": IDL2.Null,
    "closed": IDL2.Null,
    "ready_for_close": IDL2.Null,
    "open": IDL2.Null
  });
  const PeriodType2 = IDL2.Variant({ "month": IDL2.Null });
  const PeriodCloseId2 = IDL2.Text;
  const AffectedRecordCounts2 = IDL2.Record({
    "absences": IDL2.Nat,
    "expenses": IDL2.Nat,
    "timeEntries": IDL2.Nat
  });
  const PeriodClose2 = IDL2.Record({
    "status": PeriodCloseStatus2,
    "month": IDL2.Nat,
    "periodType": PeriodType2,
    "closedByUserId": IDL2.Opt(EmployeeId2),
    "createdAt": Timestamp2,
    "year": IDL2.Nat,
    "reopenReason": IDL2.Opt(IDL2.Text),
    "tenantId": CompanyId2,
    "closeId": PeriodCloseId2,
    "updatedAt": Timestamp2,
    "closedAt": IDL2.Opt(Timestamp2),
    "periodEnd": IDL2.Int,
    "employeeId": IDL2.Opt(EmployeeId2),
    "periodStart": IDL2.Int,
    "closeComment": IDL2.Opt(IDL2.Text),
    "reopenedAt": IDL2.Opt(Timestamp2),
    "affectedRecordCounts": IDL2.Opt(AffectedRecordCounts2),
    "reopenedByUserId": IDL2.Opt(EmployeeId2)
  });
  const Result_232 = IDL2.Variant({ "ok": PeriodClose2, "err": IDL2.Text });
  const Result_462 = IDL2.Variant({
    "ok": IDL2.Record({
      "internalStatus": IDL2.Text,
      "inSync": IDL2.Bool,
      "stripeStatus": IDL2.Text
    }),
    "err": IDL2.Text
  });
  const CreateAbsenceInput2 = IDL2.Record({
    "absenceTypeId": AbsenceTypeId2,
    "dateTo": IDL2.Text,
    "ganztaetig": IDL2.Bool,
    "description": IDL2.Opt(IDL2.Text),
    "dateFrom": IDL2.Text,
    "dauer": IDL2.Nat
  });
  const CalendarVisibilityMode2 = IDL2.Variant({
    "full": IDL2.Null,
    "hidden": IDL2.Null,
    "anonymized": IDL2.Null,
    "masked_reason": IDL2.Null
  });
  const AbsenceTypeVisibility2 = IDL2.Record({
    "visibleForRoles": IDL2.Vec(IDL2.Text),
    "showAbsenceTypeName": IDL2.Bool,
    "visibilityMode": CalendarVisibilityMode2,
    "showComment": IDL2.Bool,
    "companyCalendarDisplayName": IDL2.Opt(IDL2.Text),
    "showEmployeeName": IDL2.Bool,
    "visibleInCompanyCalendar": IDL2.Bool,
    "companyCalendarColor": IDL2.Opt(IDL2.Text)
  });
  const CreateAbsenceTypeInput2 = IDL2.Record({
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Text,
    "requiresApproval": IDL2.Bool,
    "visibility": IDL2.Opt(AbsenceTypeVisibility2),
    "compensated": IDL2.Bool
  });
  const AbsenceType2 = IDL2.Record({
    "id": AbsenceTypeId2,
    "aktiv": IDL2.Bool,
    "name": IDL2.Text,
    "requiresApproval": IDL2.Bool,
    "visibility": IDL2.Opt(AbsenceTypeVisibility2),
    "compensated": IDL2.Bool,
    "companyId": CompanyId2
  });
  const Result_192 = IDL2.Variant({ "ok": AbsenceType2, "err": IDL2.Text });
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
  const Result_162 = IDL2.Variant({ "ok": Customer2, "err": IDL2.Text });
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
    "activatedAt": IDL2.Opt(IDL2.Int),
    "land": IDL2.Opt(IDL2.Text),
    "role": Role2,
    "deactivatedAt": IDL2.Opt(IDL2.Int),
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
  const Result_142 = IDL2.Variant({ "ok": Employee2, "err": IDL2.Text });
  const FeiertagsberechnungsartType2 = IDL2.Variant({
    "wochentag_sollzeit": IDL2.Null,
    "durchschnittssoll": IDL2.Null,
    "keineGutschrift": IDL2.Null
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
  const Result_132 = IDL2.Variant({ "ok": Employment2, "err": IDL2.Text });
  const CreateExpenseInput2 = IDL2.Record({
    "date": IDL2.Text,
    "description": IDL2.Text,
    "projektId": IDL2.Opt(IDL2.Nat),
    "billableCHF": IDL2.Float64,
    "kundeId": IDL2.Opt(IDL2.Nat),
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
  const Result_112 = IDL2.Variant({ "ok": ExpenseType2, "err": IDL2.Text });
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
  const Result_102 = IDL2.Variant({ "ok": Holiday2, "err": IDL2.Text });
  const InvoicePositionInput2 = IDL2.Record({
    "typ": InvoicePositionTyp2,
    "menge": IDL2.Float64,
    "referenzId": IDL2.Opt(IDL2.Nat),
    "bezeichnung": IDL2.Text,
    "preis": IDL2.Float64,
    "einheit": IDL2.Text
  });
  const CreateInvoiceInput2 = IDL2.Record({
    "fusstext": IDL2.Text,
    "positionen": IDL2.Vec(InvoicePositionInput2),
    "qrAktiv": IDL2.Opt(IDL2.Bool),
    "mwstSatz": IDL2.Float64,
    "rabatt": IDL2.Float64,
    "kopftext": IDL2.Text,
    "kundeId": CustomerId2,
    "skonto": IDL2.Float64
  });
  const NotificationFormat2 = IDL2.Variant({
    "html": IDL2.Null,
    "markdown": IDL2.Null
  });
  const NotificationPriority2 = IDL2.Variant({
    "normal": IDL2.Null,
    "important": IDL2.Null,
    "critical": IDL2.Null
  });
  const NotificationTargetType2 = IDL2.Variant({
    "mixed": IDL2.Null,
    "role": IDL2.Null,
    "user": IDL2.Null,
    "tenant": IDL2.Null
  });
  const NotificationStatus2 = IDL2.Variant({
    "sent": IDL2.Null,
    "draft": IDL2.Null,
    "archived": IDL2.Null
  });
  const Notification2 = IDL2.Record({
    "id": IDL2.Text,
    "status": NotificationStatus2,
    "title": IDL2.Text,
    "validFrom": IDL2.Int,
    "createdAt": IDL2.Int,
    "senderDisplayName": IDL2.Text,
    "messageFormat": NotificationFormat2,
    "messageBody": IDL2.Text,
    "targetRoleIds": IDL2.Vec(IDL2.Text),
    "targetUserIds": IDL2.Vec(IDL2.Text),
    "targetType": NotificationTargetType2,
    "priority": NotificationPriority2,
    "targetTenantIds": IDL2.Vec(IDL2.Text),
    "senderUserId": IDL2.Text,
    "validUntil": IDL2.Opt(IDL2.Int)
  });
  const InvoiceTemplateInput2 = IDL2.Record({
    "qrIban": IDL2.Opt(IDL2.Text),
    "fusszeileLayout": IDL2.Opt(IDL2.Text),
    "qrKontoinhaberAdresse": IDL2.Opt(IDL2.Text),
    "bank": IDL2.Text,
    "iban": IDL2.Text,
    "kopfzeileLayout": IDL2.Opt(IDL2.Text),
    "fusstext": IDL2.Text,
    "mwstNummer": IDL2.Text,
    "qrKontoinhaber": IDL2.Opt(IDL2.Text),
    "kopfzeileLogoQuelle": IDL2.Opt(IDL2.Text),
    "qrReferenztyp": IDL2.Opt(IDL2.Text),
    "kopfzeileBildPosition": IDL2.Opt(IDL2.Text),
    "kopfzeileAdressePosition": IDL2.Opt(IDL2.Text),
    "zahlungszielTage": IDL2.Nat,
    "kopfzeileBildUrl": IDL2.Opt(IDL2.Text),
    "qrWaehrung": IDL2.Opt(IDL2.Text),
    "spalten": IDL2.Vec(IDL2.Text),
    "qrReferenzPraefix": IDL2.Opt(IDL2.Text),
    "fusszeilePosition": IDL2.Opt(IDL2.Text),
    "mwstSatz": IDL2.Opt(IDL2.Float64),
    "kopfzeileLogoGroesse": IDL2.Opt(IDL2.Text),
    "kopftext": IDL2.Text,
    "kundenadresseAbstandNach": IDL2.Opt(IDL2.Nat),
    "kundenadresseAbstandOben": IDL2.Opt(IDL2.Float64),
    "kundenadresseEinrueckungZeichen": IDL2.Opt(IDL2.Nat),
    "fusszeileBildPosition": IDL2.Opt(IDL2.Text),
    "kopfzeileAdresse": IDL2.Opt(IDL2.Text),
    "kopfzeilePosition": IDL2.Opt(IDL2.Text),
    "praefix": IDL2.Text,
    "naechsteNummer": IDL2.Nat,
    "qrAktivStandard": IDL2.Opt(IDL2.Bool),
    "farbe": IDL2.Text,
    "fusszeileBildUrl": IDL2.Opt(IDL2.Text),
    "kundenadresseLinks": IDL2.Opt(IDL2.Bool)
  });
  const InvoiceTemplate2 = IDL2.Record({
    "id": IDL2.Nat,
    "qrIban": IDL2.Opt(IDL2.Text),
    "fusszeileLayout": IDL2.Opt(IDL2.Text),
    "qrKontoinhaberAdresse": IDL2.Opt(IDL2.Text),
    "bank": IDL2.Text,
    "iban": IDL2.Text,
    "kopfzeileLayout": IDL2.Opt(IDL2.Text),
    "createdAt": Timestamp2,
    "fusstext": IDL2.Text,
    "mwstNummer": IDL2.Text,
    "qrKontoinhaber": IDL2.Opt(IDL2.Text),
    "kopfzeileLogoQuelle": IDL2.Opt(IDL2.Text),
    "qrReferenztyp": IDL2.Opt(IDL2.Text),
    "kopfzeileBildPosition": IDL2.Opt(IDL2.Text),
    "kopfzeileAdressePosition": IDL2.Opt(IDL2.Text),
    "zahlungszielTage": IDL2.Nat,
    "kopfzeileBildUrl": IDL2.Opt(IDL2.Text),
    "qrWaehrung": IDL2.Opt(IDL2.Text),
    "spalten": IDL2.Vec(IDL2.Text),
    "qrReferenzPraefix": IDL2.Opt(IDL2.Text),
    "fusszeilePosition": IDL2.Opt(IDL2.Text),
    "mwstSatz": IDL2.Float64,
    "kopfzeileLogoGroesse": IDL2.Opt(IDL2.Text),
    "kopftext": IDL2.Text,
    "kundenadresseAbstandNach": IDL2.Opt(IDL2.Nat),
    "kundenadresseAbstandOben": IDL2.Opt(IDL2.Float64),
    "kundenadresseEinrueckungZeichen": IDL2.Opt(IDL2.Nat),
    "fusszeileBildPosition": IDL2.Opt(IDL2.Text),
    "kopfzeileAdresse": IDL2.Opt(IDL2.Text),
    "kopfzeilePosition": IDL2.Opt(IDL2.Text),
    "praefix": IDL2.Text,
    "naechsteNummer": IDL2.Nat,
    "qrAktivStandard": IDL2.Bool,
    "farbe": IDL2.Text,
    "fusszeileBildUrl": IDL2.Opt(IDL2.Text),
    "kundenadresseLinks": IDL2.Opt(IDL2.Bool),
    "companyId": CompanyId2
  });
  const Result_452 = IDL2.Variant({ "ok": InvoiceTemplate2, "err": IDL2.Text });
  const CreatePauseOverrideInput2 = IDL2.Record({
    "action": IDL2.Text,
    "userId": IDL2.Nat,
    "date": IDL2.Text,
    "gapEnd": IDL2.Int,
    "gapStart": IDL2.Int,
    "reason": IDL2.Opt(IDL2.Text),
    "companyId": IDL2.Nat
  });
  const PauseOverride2 = IDL2.Record({
    "id": IDL2.Nat,
    "action": IDL2.Text,
    "userId": IDL2.Nat,
    "date": IDL2.Text,
    "createdByUserId": IDL2.Nat,
    "createdAt": IDL2.Int,
    "gapEnd": IDL2.Int,
    "updatedAt": IDL2.Int,
    "gapStart": IDL2.Int,
    "reason": IDL2.Opt(IDL2.Text),
    "companyId": IDL2.Nat
  });
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
    "kostendachCHF": IDL2.Opt(IDL2.Float64),
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
    "kostendachCHF": IDL2.Opt(IDL2.Float64),
    "projektleiter": IDL2.Opt(EmployeeId2),
    "companyId": CompanyId2
  });
  const Result_72 = IDL2.Variant({ "ok": Project2, "err": IDL2.Text });
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
  const Result_62 = IDL2.Variant({ "ok": ServiceType2, "err": IDL2.Text });
  const Result_412 = IDL2.Variant({
    "ok": IDL2.Record({ "url": IDL2.Text, "sessionId": IDL2.Text }),
    "err": IDL2.Text
  });
  const Result_402 = IDL2.Variant({
    "ok": IDL2.Record({ "url": IDL2.Text }),
    "err": IDL2.Text
  });
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
  const Result_42 = IDL2.Variant({
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
    "requiresApproval": IDL2.Opt(IDL2.Bool),
    "serviceTypeId": ServiceTypeId2
  });
  const TimeEntryId2 = IDL2.Nat;
  const TimeEntry2 = IDL2.Record({
    "id": TimeEntryId2,
    "bis": IDL2.Opt(IDL2.Text),
    "von": IDL2.Opt(IDL2.Text),
    "hours": IDL2.Float64,
    "fakturiertInRechnungId": IDL2.Opt(IDL2.Nat),
    "date": IDL2.Text,
    "createdAt": Timestamp2,
    "description": IDL2.Text,
    "employeeId": EmployeeId2,
    "billable": IDL2.Bool,
    "projectId": ProjectId2,
    "serviceTypeId": ServiceTypeId2,
    "companyId": CompanyId2
  });
  const Result_310 = IDL2.Variant({ "ok": TimeEntry2, "err": IDL2.Text });
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
  const Result_110 = IDL2.Variant({ "ok": VacationBalance2, "err": IDL2.Text });
  const Result_392 = IDL2.Variant({ "ok": IDL2.Bool, "err": IDL2.Text });
  const PaymentProvider2 = IDL2.Variant({
    "stripe": IDL2.Null,
    "none": IDL2.Null,
    "manual": IDL2.Null
  });
  const SubscriptionPlan2 = IDL2.Record({
    "id": IDL2.Text,
    "features": IDL2.Vec(IDL2.Text),
    "requiresPayment": IDL2.Bool,
    "sortOrder": IDL2.Nat,
    "name": IDL2.Text,
    "stripeLookupKey": IDL2.Opt(IDL2.Text),
    "description": IDL2.Text,
    "isRecommended": IDL2.Bool,
    "isActive": IDL2.Bool,
    "stripeProductId": IDL2.Opt(IDL2.Text),
    "updatedAt": IDL2.Int,
    "additionalFeatures": IDL2.Vec(IDL2.Text),
    "pricePerYearCHF": IDL2.Float64,
    "stripePriceId": IDL2.Opt(IDL2.Text),
    "pricePerMonthCHF": IDL2.Float64,
    "stripeMode": IDL2.Opt(IDL2.Text),
    "stripePriceIdYearly": IDL2.Opt(IDL2.Text),
    "minActiveDaysPerMonth": IDL2.Nat,
    "maxEmployees": IDL2.Opt(IDL2.Nat),
    "paymentProvider": PaymentProvider2
  });
  const CalendarData2 = IDL2.Record({
    "absences": IDL2.Vec(Absence2),
    "expenses": IDL2.Vec(Expense2),
    "timeEntries": IDL2.Vec(TimeEntry2)
  });
  const CanisterStatusInfo2 = IDL2.Record({
    "backendStatus": IDL2.Text,
    "dataSource": IDL2.Text,
    "frontendCanisterId": IDL2.Text,
    "backendCycles": IDL2.Nat,
    "backendMemorySize": IDL2.Nat,
    "backendCanisterId": IDL2.Text,
    "timestamp": IDL2.Int
  });
  const Result_382 = IDL2.Variant({
    "ok": IDL2.Record({
      "nextDueDate": IDL2.Opt(IDL2.Int),
      "billingModel": BillingModel2,
      "subscriptionStartDate": IDL2.Opt(IDL2.Int)
    }),
    "err": IDL2.Text
  });
  const MaskedCalendarAbsence2 = IDL2.Record({
    "id": IDL2.Text,
    "status": IDL2.Text,
    "displayTitle": IDL2.Text,
    "employeeName": IDL2.Opt(IDL2.Text),
    "visibilityMode": IDL2.Text,
    "displayColor": IDL2.Opt(IDL2.Text),
    "toDate": IDL2.Text,
    "employeeId": IDL2.Opt(IDL2.Text),
    "isOwnEntry": IDL2.Bool,
    "fromDate": IDL2.Text
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
  const Result_172 = IDL2.Variant({ "ok": CompanySettings2, "err": IDL2.Text });
  const ComplianceCockpitKPI2 = IDL2.Record({
    "mitarbeiterMitGesetzlicherUeberzeit": IDL2.Nat,
    "ferienRisiken": IDL2.Nat,
    "pausenVerstoesse": IDL2.Nat,
    "ruhezeitVerstoesse": IDL2.Nat,
    "mitarbeiterMitVerstoessen": IDL2.Nat
  });
  const ComplianceStatus2 = IDL2.Variant({
    "CRITICAL": IDL2.Null,
    "FREIGEGEBEN": IDL2.Null,
    "INFO": IDL2.Null,
    "COMPLIANT": IDL2.Null,
    "WARNING": IDL2.Null,
    "BREACH": IDL2.Null
  });
  const ComplianceCockpitRow2 = IDL2.Record({
    "vertraglicheUeberstundenH": IDL2.Float64,
    "offeneMassnahmen": IDL2.Nat,
    "employee": IDL2.Record({
      "id": IDL2.Nat,
      "lastName": IDL2.Text,
      "firstName": IDL2.Text
    }),
    "ferienstatus": IDL2.Text,
    "pausenVerstoesse": IDL2.Nat,
    "gesamtstatus": ComplianceStatus2,
    "gesetzlicheUeberzeitH": IDL2.Float64,
    "ruhezeitVerstoesse": IDL2.Nat
  });
  const CompliancePeriodeTyp2 = IDL2.Variant({
    "DAY": IDL2.Null,
    "SERVICE_YEAR": IDL2.Null,
    "WEEK": IDL2.Null
  });
  const ComplianceResolutionType2 = IDL2.Variant({
    "FREIGEGEBEN": IDL2.Null,
    "IGNORED": IDL2.Null,
    "CORRECTED": IDL2.Null
  });
  const ComplianceFinding2 = IDL2.Record({
    "id": IDL2.Nat,
    "status": ComplianceStatus2,
    "istWert": IDL2.Float64,
    "resolutionType": IDL2.Opt(ComplianceResolutionType2),
    "periodeKey": IDL2.Text,
    "periodeTyp": CompliancePeriodeTyp2,
    "rechtlicheReferenz": IDL2.Opt(IDL2.Text),
    "auditHash": IDL2.Opt(IDL2.Text),
    "createdAt": IDL2.Int,
    "sollWert": IDL2.Float64,
    "resolutionReason": IDL2.Opt(IDL2.Text),
    "sourceEntryIds": IDL2.Vec(IDL2.Nat),
    "meldung": IDL2.Text,
    "employeeId": IDL2.Nat,
    "resolvedAt": IDL2.Opt(IDL2.Int),
    "resolvedBy": IDL2.Opt(IDL2.Nat),
    "ruleCode": IDL2.Text,
    "einheit": IDL2.Text,
    "companyId": IDL2.Nat
  });
  const EmployeeComplianceProfile2 = IDL2.Record({
    "id": IDL2.Nat,
    "aktiv": IDL2.Bool,
    "createdAt": IDL2.Int,
    "updatedAt": IDL2.Int,
    "employeeId": IDL2.Nat,
    "ausnahmeprofil": IDL2.Opt(IDL2.Text),
    "erfassungsModus": IDL2.Text,
    "vertraglicheZusatzferienTage": IDL2.Float64,
    "gesetzlicheWochenhochstarbeitszeit": IDL2.Float64,
    "gesetzlicherFerienanspruchWochen": IDL2.Float64,
    "companyId": IDL2.Nat
  });
  const CycleSnapshot2 = IDL2.Record({
    "frontendCycles": IDL2.Nat,
    "backendCycles": IDL2.Nat,
    "timestamp": IDL2.Int
  });
  const CostSettings2 = IDL2.Record({
    "backendAlertThreshold": IDL2.Nat,
    "icpPriceUsd": IDL2.Float64,
    "alertEnabled": IDL2.Bool,
    "usdChfRate": IDL2.Float64,
    "frontendAlertThreshold": IDL2.Nat
  });
  const CostDashboardData2 = IDL2.Record({
    "dataSource": IDL2.Text,
    "frontendCanisterId": IDL2.Text,
    "snapshots": IDL2.Vec(CycleSnapshot2),
    "settings": CostSettings2,
    "backendCanisterId": IDL2.Text,
    "backendCyclesBalance": IDL2.Opt(IDL2.Nat)
  });
  const CycleStatus2 = IDL2.Record({
    "dataSource": IDL2.Text,
    "frontendCycles": IDL2.Opt(IDL2.Nat),
    "backendCycles": IDL2.Nat
  });
  const DashboardStats2 = IDL2.Record({
    "hoursTarget": IDL2.Float64,
    "pendingExpenses": IDL2.Nat,
    "hoursThisWeek": IDL2.Float64,
    "remainingVacationMinutes": IDL2.Int,
    "approvedVacationDays": IDL2.Nat,
    "pendingVacations": IDL2.Nat
  });
  const DefaultWorkHours2 = IDL2.Record({
    "stundenDi": IDL2.Nat,
    "stundenDo": IDL2.Nat,
    "stundenFr": IDL2.Nat,
    "stundenMi": IDL2.Nat,
    "stundenMo": IDL2.Nat,
    "stundenSa": IDL2.Nat,
    "stundenSo": IDL2.Nat,
    "companyId": CompanyId2
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
  const Result_372 = IDL2.Variant({ "ok": WorkTimeBalance2, "err": IDL2.Text });
  const Result_362 = IDL2.Variant({
    "ok": IDL2.Opt(Employment2),
    "err": IDL2.Text
  });
  const Result_352 = IDL2.Variant({
    "ok": IDL2.Opt(InvoiceTemplate2),
    "err": IDL2.Text
  });
  const Result_342 = IDL2.Variant({ "ok": IDL2.Vec(Invoice2), "err": IDL2.Text });
  const MonthlyCloseRow2 = IDL2.Record({
    "status": PeriodCloseStatus2,
    "month": IDL2.Nat,
    "expenseCount": IDL2.Nat,
    "vacationDays": IDL2.Nat,
    "year": IDL2.Nat,
    "actualMinutes": IDL2.Int,
    "openEntryCount": IDL2.Nat,
    "closeId": IDL2.Opt(PeriodCloseId2),
    "targetMinutes": IDL2.Int,
    "employeeId": EmployeeId2,
    "absenceCount": IDL2.Nat,
    "lastName": IDL2.Text,
    "complianceStatus": IDL2.Text,
    "firstName": IDL2.Text
  });
  const Company2 = IDL2.Record({
    "id": CompanyId2,
    "taxId": IDL2.Opt(IDL2.Text),
    "name": IDL2.Text,
    "createdAt": Timestamp2,
    "mwstNummer": IDL2.Opt(IDL2.Text),
    "kontoInhaber": IDL2.Opt(IDL2.Text),
    "isActive": IDL2.Bool,
    "logoUrl": IDL2.Opt(IDL2.Text),
    "address": IDL2.Opt(IDL2.Text),
    "kontoAdresse": IDL2.Opt(IDL2.Text)
  });
  const Result_182 = IDL2.Variant({ "ok": Company2, "err": IDL2.Text });
  const StandardTimeBlock2 = IDL2.Record({
    "bis": IDL2.Text,
    "von": IDL2.Text,
    "leistungsartId": IDL2.Opt(IDL2.Nat),
    "projektId": IDL2.Opt(IDL2.Nat)
  });
  const Standardarbeitszeiten2 = IDL2.Record({
    "tuesday": IDL2.Vec(StandardTimeBlock2),
    "wednesday": IDL2.Vec(StandardTimeBlock2),
    "saturday": IDL2.Vec(StandardTimeBlock2),
    "thursday": IDL2.Vec(StandardTimeBlock2),
    "sunday": IDL2.Vec(StandardTimeBlock2),
    "friday": IDL2.Vec(StandardTimeBlock2),
    "monday": IDL2.Vec(StandardTimeBlock2)
  });
  const Result_302 = IDL2.Variant({
    "ok": Standardarbeitszeiten2,
    "err": IDL2.Text
  });
  const VacationLedger2 = IDL2.Record({
    "id": IDL2.Nat,
    "serviceYearStart": IDL2.Int,
    "verbleibendeFerientage": IDL2.Float64,
    "laengsterZusammenhangenderBlock": IDL2.Int,
    "lastUpdatedAt": IDL2.Int,
    "bezogeneFerientage": IDL2.Float64,
    "employeeId": IDL2.Nat,
    "calendarYearKey": IDL2.Text,
    "serviceYearEnd": IDL2.Int,
    "serviceYearKey": IDL2.Text,
    "gesetzlicheFerientage": IDL2.Float64,
    "twoWeekBlockSatisfied": IDL2.Bool,
    "geplanteFerientage": IDL2.Float64,
    "vertraglicheZusatzferienTage": IDL2.Float64,
    "companyId": IDL2.Nat
  });
  const DetectedPause2 = IDL2.Record({
    "pauseEnd": IDL2.Int,
    "source": IDL2.Text,
    "date": IDL2.Text,
    "pauseStart": IDL2.Int,
    "durationMinutes": IDL2.Int,
    "complianceRelevant": IDL2.Bool,
    "ignored": IDL2.Bool
  });
  const DayPauseComplianceResult2 = IDL2.Record({
    "status": IDL2.Text,
    "isCompliant": IDL2.Bool,
    "date": IDL2.Text,
    "detectedPauseMinutes": IDL2.Int,
    "requiredPauseMinutes": IDL2.Int,
    "meldung": IDL2.Text,
    "employeeId": IDL2.Nat,
    "workDurationMinutes": IDL2.Int,
    "pausen": IDL2.Vec(DetectedPause2),
    "companyId": IDL2.Nat
  });
  const PeriodCloseConfig2 = IDL2.Record({
    "allowCloseWithOpenTimeEntries": IDL2.Bool,
    "allowCloseWithOpenAbsences": IDL2.Bool,
    "enabled": IDL2.Bool,
    "allowCloseWithOpenExpenses": IDL2.Bool,
    "allowCloseWithComplianceWarnings": IDL2.Bool,
    "onlyAdminCanReopen": IDL2.Bool,
    "requireReopenReason": IDL2.Bool
  });
  const Result_332 = IDL2.Variant({ "ok": IDL2.Float64, "err": IDL2.Text });
  const ServiceTypeBudgetReport2 = IDL2.Record({
    "serviceTypeName": IDL2.Text,
    "aufgewendetCHF": IDL2.Float64,
    "aufgewendeteStunden": IDL2.Float64,
    "kostendachCHF": IDL2.Float64,
    "serviceTypeId": ServiceTypeId2
  });
  const EmployeeBudgetReport2 = IDL2.Record({
    "employeeName": IDL2.Text,
    "aufgewendetCHF": IDL2.Float64,
    "aufgewendeteStunden": IDL2.Float64,
    "employeeId": EmployeeId2,
    "serviceTypeReports": IDL2.Vec(ServiceTypeBudgetReport2),
    "kostendachCHF": IDL2.Float64
  });
  const ProjectBudgetReport2 = IDL2.Record({
    "totalKostendachCHF": IDL2.Float64,
    "customerName": IDL2.Text,
    "totalAufgewendetCHF": IDL2.Float64,
    "projectName": IDL2.Text,
    "totalStunden": IDL2.Float64,
    "projectId": ProjectId2,
    "employeeReports": IDL2.Vec(EmployeeBudgetReport2)
  });
  const Result_322 = IDL2.Variant({
    "ok": ProjectBudgetReport2,
    "err": IDL2.Text
  });
  const ProjectMemberAssignment2 = IDL2.Record({
    "stundensatz": IDL2.Float64,
    "employeeId": EmployeeId2,
    "kostendachCHF": IDL2.Opt(IDL2.Float64),
    "serviceTypeId": ServiceTypeId2
  });
  const Result_312 = IDL2.Variant({
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
  const StripeEventStatus2 = IDL2.Variant({
    "processed": IDL2.Null,
    "ignored": IDL2.Null,
    "received": IDL2.Null,
    "failed": IDL2.Null
  });
  const StripeEvent2 = IDL2.Record({
    "id": IDL2.Text,
    "stripeEventId": IDL2.Text,
    "processingStatus": StripeEventStatus2,
    "stripeSubscriptionId": IDL2.Opt(IDL2.Text),
    "errorMessage": IDL2.Opt(IDL2.Text),
    "tenantId": IDL2.Opt(IDL2.Nat),
    "processedAt": IDL2.Opt(IDL2.Int),
    "subscriptionId": IDL2.Opt(IDL2.Text),
    "receivedAt": IDL2.Int,
    "stripeCustomerId": IDL2.Opt(IDL2.Text),
    "rawPayload": IDL2.Opt(IDL2.Text),
    "eventType": IDL2.Text
  });
  const StripeInvoice2 = IDL2.Record({
    "id": IDL2.Text,
    "status": IDL2.Text,
    "stripeSubscriptionId": IDL2.Opt(IDL2.Text),
    "dueDate": IDL2.Opt(IDL2.Int),
    "stripeInvoiceId": IDL2.Text,
    "amountPaid": IDL2.Float64,
    "invoicePdfUrl": IDL2.Opt(IDL2.Text),
    "invoiceNumber": IDL2.Opt(IDL2.Text),
    "periodEnd": IDL2.Opt(IDL2.Int),
    "stripeCustomerId": IDL2.Text,
    "currency": IDL2.Text,
    "amountDue": IDL2.Float64,
    "periodStart": IDL2.Opt(IDL2.Int),
    "issuedAt": IDL2.Int,
    "paidAt": IDL2.Opt(IDL2.Int),
    "hostedInvoiceUrl": IDL2.Opt(IDL2.Text),
    "companyId": IDL2.Nat
  });
  const TenantComplianceRule2 = IDL2.Record({
    "modifiedAt": IDL2.Int,
    "modifiedBy": IDL2.Text,
    "isActive": IDL2.Bool,
    "tenantId": IDL2.Text,
    "isCustomized": IDL2.Bool,
    "customValue": IDL2.Opt(IDL2.Float64),
    "ruleCode": IDL2.Text
  });
  const TenantCostEntry2 = IDL2.Record({
    "employeeCount": IDL2.Nat,
    "estimatedCycles": IDL2.Nat,
    "companyName": IDL2.Text,
    "companyId": IDL2.Nat
  });
  const Result_292 = IDL2.Variant({ "ok": IDL2.Int, "err": IDL2.Text });
  const Result_282 = IDL2.Variant({
    "ok": IDL2.Record({
      "spesen": IDL2.Vec(Expense2),
      "zeiteintraege": IDL2.Vec(TimeEntry2)
    }),
    "err": IDL2.Text
  });
  const UnbilledTimeEntry2 = IDL2.Record({
    "id": IDL2.Nat,
    "bis": IDL2.Opt(IDL2.Text),
    "von": IDL2.Opt(IDL2.Text),
    "hours": IDL2.Float64,
    "date": IDL2.Text,
    "stundensatz": IDL2.Float64,
    "createdAt": IDL2.Int,
    "description": IDL2.Text,
    "totalCHF": IDL2.Float64,
    "employeeId": IDL2.Nat,
    "billable": IDL2.Bool,
    "projectId": IDL2.Nat,
    "serviceTypeId": IDL2.Nat,
    "companyId": IDL2.Nat
  });
  const Result_272 = IDL2.Variant({
    "ok": IDL2.Record({
      "spesen": IDL2.Vec(Expense2),
      "zeiteintraege": IDL2.Vec(UnbilledTimeEntry2)
    }),
    "err": IDL2.Text
  });
  const UserNotificationSettings2 = IDL2.Record({
    "emailNewVacationRequest": IDL2.Bool,
    "emailOnApproval": IDL2.Bool,
    "principalId": IDL2.Principal,
    "companyId": CompanyId2
  });
  const Result_210 = IDL2.Variant({
    "ok": UserNotificationSettings2,
    "err": IDL2.Text
  });
  const PlatformAdminUserEntry2 = IDL2.Record({
    "id": EmployeeId2,
    "activatedAt": IDL2.Opt(IDL2.Int),
    "role": Role2,
    "deactivatedAt": IDL2.Opt(IDL2.Int),
    "isActive": IDL2.Bool,
    "email": IDL2.Text,
    "lastName": IDL2.Text,
    "firstName": IDL2.Text
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
  const AuditOperation2 = IDL2.Variant({
    "reject": IDL2.Null,
    "remove": IDL2.Null,
    "approve": IDL2.Null,
    "delete": IDL2.Null,
    "create": IDL2.Null,
    "update": IDL2.Null
  });
  const AuditEntityType2 = IDL2.Variant({
    "expenseType": IDL2.Null,
    "serviceType": IDL2.Null,
    "expense": IDL2.Null,
    "timeEntry": IDL2.Null,
    "customer": IDL2.Null,
    "ferien": IDL2.Null,
    "invoiceTemplate": IDL2.Null,
    "absence": IDL2.Null,
    "company": IDL2.Null,
    "employee": IDL2.Null,
    "approval": IDL2.Null,
    "absenceType": IDL2.Null,
    "holiday": IDL2.Null,
    "project": IDL2.Null
  });
  const AuditLogFilter2 = IDL2.Record({
    "dateTo": IDL2.Opt(IDL2.Int),
    "actorPrincipalFilter": IDL2.Opt(IDL2.Text),
    "operation": IDL2.Opt(AuditOperation2),
    "entityType": IDL2.Opt(AuditEntityType2),
    "dateFrom": IDL2.Opt(IDL2.Int)
  });
  const AuditFieldChange2 = IDL2.Record({
    "after": IDL2.Text,
    "before": IDL2.Text,
    "fieldName": IDL2.Text
  });
  const AuditLogEntry2 = IDL2.Record({
    "id": IDL2.Text,
    "beforeState": IDL2.Opt(IDL2.Text),
    "actorName": IDL2.Text,
    "entityId": IDL2.Text,
    "operation": AuditOperation2,
    "timestamp": IDL2.Int,
    "actorPrincipal": IDL2.Text,
    "entityType": AuditEntityType2,
    "fieldChanges": IDL2.Opt(IDL2.Vec(AuditFieldChange2)),
    "afterState": IDL2.Opt(IDL2.Text),
    "companyId": CompanyId2
  });
  const Result_262 = IDL2.Variant({
    "ok": IDL2.Vec(Employment2),
    "err": IDL2.Text
  });
  const ExpenseFilter2 = IDL2.Record({
    "status": IDL2.Opt(ExpenseStatus2),
    "dateTo": IDL2.Opt(IDL2.Text),
    "employeeId": IDL2.Opt(EmployeeId2),
    "dateFrom": IDL2.Opt(IDL2.Text)
  });
  const UserNotification2 = IDL2.Record({
    "isDeleted": IDL2.Bool,
    "notification": Notification2,
    "isRead": IDL2.Bool,
    "readAt": IDL2.Opt(IDL2.Int)
  });
  const PeriodCloseAction2 = IDL2.Variant({
    "reopen": IDL2.Null,
    "close": IDL2.Null,
    "force_close": IDL2.Null,
    "close_failed": IDL2.Null
  });
  const PeriodCloseAuditEntry2 = IDL2.Record({
    "oldStatus": PeriodCloseStatus2,
    "action": PeriodCloseAction2,
    "performedByUserId": EmployeeId2,
    "auditId": IDL2.Text,
    "tenantId": CompanyId2,
    "periodEnd": IDL2.Int,
    "warnings": IDL2.Opt(IDL2.Vec(IDL2.Text)),
    "employeeId": IDL2.Opt(EmployeeId2),
    "performedAt": Timestamp2,
    "periodStart": IDL2.Int,
    "newStatus": PeriodCloseStatus2,
    "affectedRecordCounts": IDL2.Opt(AffectedRecordCounts2),
    "reason": IDL2.Opt(IDL2.Text)
  });
  const Result_252 = IDL2.Variant({
    "ok": IDL2.Vec(TimeBalanceCorrection2),
    "err": IDL2.Text
  });
  const TimeEntryFilter2 = IDL2.Record({
    "dateTo": IDL2.Opt(IDL2.Text),
    "employeeId": IDL2.Opt(EmployeeId2),
    "projectId": IDL2.Opt(ProjectId2),
    "dateFrom": IDL2.Opt(IDL2.Text)
  });
  const Result_242 = IDL2.Variant({
    "ok": IDL2.Vec(VacationBalance2),
    "err": IDL2.Text
  });
  const PrecheckVerdict2 = IDL2.Variant({
    "ok": IDL2.Null,
    "blocked": IDL2.Null,
    "ok_with_warnings": IDL2.Null
  });
  const PrecheckResult2 = IDL2.Record({
    "hasOpenEntries": IDL2.Bool,
    "blockers": IDL2.Vec(IDL2.Text),
    "verdict": PrecheckVerdict2,
    "warnings": IDL2.Vec(IDL2.Text),
    "hasOpenAbsences": IDL2.Bool,
    "missingDays": IDL2.Nat,
    "canClose": IDL2.Bool,
    "hasComplianceViolations": IDL2.Bool,
    "hasOpenExpenses": IDL2.Bool
  });
  const ReopenPeriodInput2 = IDL2.Record({
    "reopenReason": IDL2.Opt(IDL2.Text),
    "closeId": PeriodCloseId2
  });
  const ResolveFindingInput2 = IDL2.Record({
    "resolutionType": ComplianceResolutionType2,
    "findingId": IDL2.Nat,
    "resolutionReason": IDL2.Text
  });
  const http_header2 = IDL2.Record({ "value": IDL2.Text, "name": IDL2.Text });
  const http_request_result2 = IDL2.Record({
    "status": IDL2.Nat,
    "body": IDL2.Vec(IDL2.Nat8),
    "headers": IDL2.Vec(http_header2)
  });
  const TransformationInput2 = IDL2.Record({
    "context": IDL2.Vec(IDL2.Nat8),
    "response": http_request_result2
  });
  const TransformationOutput2 = IDL2.Record({
    "status": IDL2.Nat,
    "body": IDL2.Vec(IDL2.Nat8),
    "headers": IDL2.Vec(http_header2)
  });
  const HttpHeader2 = IDL2.Record({ "value": IDL2.Text, "name": IDL2.Text });
  const HttpRequestResult2 = IDL2.Record({
    "status": IDL2.Nat,
    "body": IDL2.Vec(IDL2.Nat8),
    "headers": IDL2.Vec(HttpHeader2)
  });
  const HttpTransformArgs2 = IDL2.Record({
    "context": IDL2.Vec(IDL2.Nat8),
    "response": HttpRequestResult2
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
    "visibility": IDL2.Opt(AbsenceTypeVisibility2),
    "compensated": IDL2.Opt(IDL2.Bool)
  });
  const UpdateCompanyInput2 = IDL2.Record({
    "taxId": IDL2.Opt(IDL2.Text),
    "name": IDL2.Opt(IDL2.Text),
    "mwstNummer": IDL2.Opt(IDL2.Text),
    "kontoInhaber": IDL2.Opt(IDL2.Text),
    "logoUrl": IDL2.Opt(IDL2.Text),
    "address": IDL2.Opt(IDL2.Text),
    "kontoAdresse": IDL2.Opt(IDL2.Text)
  });
  const UpdateComplianceProfileInput2 = IDL2.Record({
    "id": IDL2.Nat,
    "aktiv": IDL2.Bool,
    "employeeId": IDL2.Nat,
    "ausnahmeprofil": IDL2.Opt(IDL2.Text),
    "erfassungsModus": IDL2.Text,
    "vertraglicheZusatzferienTage": IDL2.Float64,
    "gesetzlicheWochenhochstarbeitszeit": IDL2.Float64,
    "gesetzlicherFerienanspruchWochen": IDL2.Float64
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
  const Result_152 = IDL2.Variant({ "ok": DefaultWorkHours2, "err": IDL2.Text });
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
    "projektId": IDL2.Opt(IDL2.Nat),
    "billableCHF": IDL2.Opt(IDL2.Float64),
    "kundeId": IDL2.Opt(IDL2.Nat),
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
  const UpdateInvoiceInput2 = IDL2.Record({
    "status": IDL2.Opt(InvoiceStatus2),
    "fusstext": IDL2.Opt(IDL2.Text),
    "positionen": IDL2.Opt(IDL2.Vec(InvoicePositionInput2)),
    "faelligkeitsdatum": IDL2.Opt(IDL2.Text),
    "qrAktiv": IDL2.Opt(IDL2.Bool),
    "mwstSatz": IDL2.Opt(IDL2.Float64),
    "rabatt": IDL2.Opt(IDL2.Float64),
    "kopftext": IDL2.Opt(IDL2.Text),
    "kundeId": IDL2.Opt(CustomerId2),
    "datum": IDL2.Opt(IDL2.Text),
    "skonto": IDL2.Opt(IDL2.Float64)
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
    "kostendachCHF": IDL2.Opt(IDL2.Float64),
    "projektleiter": IDL2.Opt(EmployeeId2)
  });
  const UpdateServiceTypeInput2 = IDL2.Record({
    "defaultRate": IDL2.Opt(IDL2.Float64),
    "aktiv": IDL2.Opt(IDL2.Bool),
    "name": IDL2.Opt(IDL2.Text),
    "billable": IDL2.Opt(IDL2.Bool)
  });
  const UpdateTenantComplianceRuleInput2 = IDL2.Record({
    "newValue": IDL2.Opt(IDL2.Float64),
    "isActive": IDL2.Bool,
    "ruleCode": IDL2.Text,
    "companyId": IDL2.Nat
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
  const Result2 = IDL2.Variant({ "ok": SubscriptionPlan2, "err": IDL2.Text });
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
    "addKnowledgeEntry": IDL2.Func(
      [
        IDL2.Record({
          "title": IDL2.Text,
          "content": IDL2.Text,
          "role": IDL2.Text,
          "isActive": IDL2.Bool,
          "language": IDL2.Text,
          "category": IDL2.Text
        })
      ],
      [Result_82],
      []
    ),
    "applyPlanChange": IDL2.Func(
      [IDL2.Nat, IDL2.Text, BillingModel2],
      [Result_212],
      []
    ),
    "approveAbsence": IDL2.Func([AbsenceId2], [Result_202], []),
    "approveExpense": IDL2.Func([ExpenseId2], [Result_122], []),
    "archiveNotification": IDL2.Func(
      [IDL2.Text],
      [IDL2.Variant({ "ok": IDL2.Null, "err": IDL2.Text })],
      []
    ),
    "assertPeriodIsEditable": IDL2.Func(
      [CompanyId2, EmployeeId2, IDL2.Int, IDL2.Text],
      [Result_52],
      []
    ),
    "assignCallerUserRole": IDL2.Func([IDL2.Principal, UserRole2], [], []),
    "assignEmployeeToProject": IDL2.Func(
      [EmployeeId2, ProjectId2],
      [Result_492],
      []
    ),
    "assignSubscriptionPlan": IDL2.Func([IDL2.Text, IDL2.Text], [Result_52], []),
    "calculateMonthlyBilling": IDL2.Func(
      [IDL2.Nat, IDL2.Nat],
      [IDL2.Vec(MonthlyBillingEntry2)],
      ["query"]
    ),
    "calculateProRataAdjustment": IDL2.Func(
      [IDL2.Nat, IDL2.Text],
      [Result_482],
      ["query"]
    ),
    "cancelInvoice": IDL2.Func([IDL2.Nat], [Result_92], []),
    "cancelStripeSubscription": IDL2.Func([IDL2.Nat], [Result_222], []),
    "checkPlanChangeNeeded": IDL2.Func([IDL2.Nat], [Result_472], ["query"]),
    "closePeriod": IDL2.Func([ClosePeriodInput2], [Result_232], []),
    "closePeriodBulk": IDL2.Func(
      [CompanyId2, IDL2.Nat, IDL2.Nat, IDL2.Opt(IDL2.Text)],
      [IDL2.Vec(Result_232)],
      []
    ),
    "compareStripeSubscriptionStatus": IDL2.Func([IDL2.Nat], [Result_462], []),
    "createAbsence": IDL2.Func([CreateAbsenceInput2], [Result_202], []),
    "createAbsenceType": IDL2.Func([CreateAbsenceTypeInput2], [Result_192], []),
    "createCustomer": IDL2.Func([CreateCustomerInput2], [Result_162], []),
    "createEmployee": IDL2.Func([CreateEmployeeInput2], [Result_142], []),
    "createEmployment": IDL2.Func(
      [EmployeeId2, CreateEmploymentInput2],
      [Result_132],
      []
    ),
    "createExpense": IDL2.Func([CreateExpenseInput2], [Result_122], []),
    "createExpenseType": IDL2.Func([CreateExpenseTypeInput2], [Result_112], []),
    "createHoliday": IDL2.Func([CreateHolidayInput2], [Result_102], []),
    "createInvoice": IDL2.Func([CreateInvoiceInput2], [Result_92], []),
    "createNotificationDraft": IDL2.Func(
      [
        IDL2.Text,
        IDL2.Text,
        NotificationFormat2,
        NotificationPriority2,
        IDL2.Int,
        IDL2.Opt(IDL2.Int),
        NotificationTargetType2,
        IDL2.Vec(IDL2.Text),
        IDL2.Vec(IDL2.Text),
        IDL2.Vec(IDL2.Text)
      ],
      [IDL2.Variant({ "ok": Notification2, "err": IDL2.Text })],
      []
    ),
    "createOrUpdateInvoiceTemplate": IDL2.Func(
      [InvoiceTemplateInput2],
      [Result_452],
      []
    ),
    "createPauseOverride": IDL2.Func(
      [CreatePauseOverrideInput2],
      [IDL2.Variant({ "ok": PauseOverride2, "err": IDL2.Text })],
      []
    ),
    "createProject": IDL2.Func([CreateProjectInput2], [Result_72], []),
    "createServiceType": IDL2.Func([CreateServiceTypeInput2], [Result_62], []),
    "createStripeCheckoutLinkForCompany": IDL2.Func(
      [IDL2.Nat, IDL2.Text, BillingModel2],
      [Result_412],
      []
    ),
    "createStripeCheckoutLinkForCompanyWithPrice": IDL2.Func(
      [IDL2.Nat, IDL2.Text, BillingModel2, IDL2.Text],
      [Result_412],
      []
    ),
    "createStripeCheckoutSession": IDL2.Func(
      [IDL2.Nat, IDL2.Text, BillingModel2],
      [Result_412],
      []
    ),
    "createStripeCheckoutSessionWithPrice": IDL2.Func(
      [IDL2.Nat, IDL2.Text, BillingModel2, IDL2.Text],
      [Result_412],
      []
    ),
    "createStripeCustomerPortalSession": IDL2.Func([IDL2.Nat], [Result_402], []),
    "createTimeBalanceCorrection": IDL2.Func(
      [EmployeeId2, CreateTimeBalanceCorrectionInput2],
      [Result_42],
      []
    ),
    "createTimeEntry": IDL2.Func([CreateTimeEntryInput2], [Result_310], []),
    "createVacationBalance": IDL2.Func(
      [EmployeeId2, CreateVacationBalanceInput2],
      [Result_110],
      []
    ),
    "deleteAbsence": IDL2.Func([AbsenceId2], [Result_52], []),
    "deleteAbsenceType": IDL2.Func([AbsenceTypeId2], [Result_52], []),
    "deleteCustomer": IDL2.Func([CustomerId2], [Result_52], []),
    "deleteEmployee": IDL2.Func([EmployeeId2], [Result_52], []),
    "deleteEmployment": IDL2.Func([EmployeeId2, IDL2.Text], [Result_52], []),
    "deleteExpense": IDL2.Func([ExpenseId2], [Result_52], []),
    "deleteExpenseType": IDL2.Func([ExpenseTypeId2], [Result_52], []),
    "deleteHoliday": IDL2.Func([HolidayId2], [Result_52], []),
    "deleteInvoice": IDL2.Func([IDL2.Nat], [Result_52], []),
    "deleteKnowledgeEntry": IDL2.Func([IDL2.Text], [Result_392], []),
    "deleteMyNotification": IDL2.Func(
      [IDL2.Text],
      [IDL2.Variant({ "ok": IDL2.Null, "err": IDL2.Text })],
      []
    ),
    "deletePauseOverride": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Variant({ "ok": IDL2.Null, "err": IDL2.Text })],
      []
    ),
    "deleteProject": IDL2.Func([ProjectId2], [Result_52], []),
    "deleteServiceType": IDL2.Func([ServiceTypeId2], [Result_52], []),
    "deleteSubscriptionPlan": IDL2.Func([IDL2.Text], [Result_52], []),
    "deleteTimeBalanceCorrection": IDL2.Func(
      [EmployeeId2, IDL2.Text],
      [Result_52],
      []
    ),
    "deleteTimeEntry": IDL2.Func([TimeEntryId2], [Result_52], []),
    "deleteVacationBalance": IDL2.Func([EmployeeId2, IDL2.Text], [Result_52], []),
    "duplicateNotification": IDL2.Func(
      [IDL2.Text],
      [IDL2.Variant({ "ok": Notification2, "err": IDL2.Text })],
      []
    ),
    "generateInviteCode": IDL2.Func([EmployeeId2], [Result_212], []),
    "getAllCompanySubscriptions": IDL2.Func(
      [],
      [IDL2.Vec(IDL2.Tuple(IDL2.Text, IDL2.Text))],
      ["query"]
    ),
    "getAllSubscriptionPlans": IDL2.Func(
      [],
      [IDL2.Vec(SubscriptionPlan2)],
      ["query"]
    ),
    "getBackendCanisterId": IDL2.Func([], [IDL2.Text], []),
    "getCalendarEntries": IDL2.Func(
      [IDL2.Text, IDL2.Nat],
      [CalendarData2],
      ["query"]
    ),
    "getCallerUserRole": IDL2.Func([], [UserRole2], ["query"]),
    "getCanisterStatusInfo": IDL2.Func([], [CanisterStatusInfo2], ["query"]),
    "getCompanyBillingModel": IDL2.Func([IDL2.Nat], [Result_382], ["query"]),
    "getCompanyCalendarAbsences": IDL2.Func(
      [CompanyId2, IDL2.Int, IDL2.Int],
      [IDL2.Vec(MaskedCalendarAbsence2)],
      ["query"]
    ),
    "getCompanyEmployeesForBilling": IDL2.Func(
      [CompanyId2],
      [IDL2.Vec(Employee2)],
      ["query"]
    ),
    "getCompanySettings": IDL2.Func([], [Result_172], ["query"]),
    "getCompanySubscription": IDL2.Func(
      [IDL2.Text],
      [IDL2.Opt(IDL2.Text)],
      ["query"]
    ),
    "getCompanySubscriptionPlan": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Opt(SubscriptionPlan2)],
      ["query"]
    ),
    "getComplianceCockpitKPI": IDL2.Func(
      [IDL2.Nat],
      [ComplianceCockpitKPI2],
      ["query"]
    ),
    "getComplianceCockpitRows": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Vec(ComplianceCockpitRow2)],
      ["query"]
    ),
    "getComplianceFindings": IDL2.Func(
      [
        IDL2.Nat,
        IDL2.Opt(CompliancePeriodeTyp2),
        IDL2.Opt(IDL2.Vec(ComplianceStatus2))
      ],
      [IDL2.Vec(ComplianceFinding2)],
      ["query"]
    ),
    "getComplianceProfile": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Opt(EmployeeComplianceProfile2)],
      ["query"]
    ),
    "getContractualHoursForEmployee": IDL2.Func(
      [IDL2.Nat, IDL2.Text],
      [IDL2.Opt(IDL2.Float64)],
      ["query"]
    ),
    "getCostDashboardData": IDL2.Func(
      [IDL2.Opt(IDL2.Int), IDL2.Opt(IDL2.Int)],
      [CostDashboardData2],
      ["query"]
    ),
    "getCostSettings": IDL2.Func([], [CostSettings2], ["query"]),
    "getCycleSnapshots": IDL2.Func(
      [IDL2.Opt(IDL2.Int), IDL2.Opt(IDL2.Int)],
      [IDL2.Vec(CycleSnapshot2)],
      ["query"]
    ),
    "getCycleStatus": IDL2.Func([], [CycleStatus2], ["query"]),
    "getDashboardStats": IDL2.Func([], [DashboardStats2], ["query"]),
    "getDefaultWorkHours": IDL2.Func([], [DefaultWorkHours2], ["query"]),
    "getEmployeeWorkTimeBalance": IDL2.Func(
      [EmployeeId2, IDL2.Text, IDL2.Text],
      [Result_372],
      ["query"]
    ),
    "getEmployeeWorkTimeBalanceFromStart": IDL2.Func(
      [EmployeeId2],
      [Result_372],
      ["query"]
    ),
    "getEmploymentForDate": IDL2.Func(
      [EmployeeId2, IDL2.Text],
      [Result_362],
      ["query"]
    ),
    "getFrontendCyclesManual": IDL2.Func([], [IDL2.Nat], ["query"]),
    "getInvoiceById": IDL2.Func([IDL2.Nat], [Result_92], ["query"]),
    "getInvoiceTemplate": IDL2.Func([], [Result_352], ["query"]),
    "getInvoices": IDL2.Func([], [Result_342], []),
    "getKnowledgeEntries": IDL2.Func([], [IDL2.Vec(KnowledgeEntry2)], ["query"]),
    "getKnowledgeEntriesAdmin": IDL2.Func(
      [],
      [IDL2.Vec(KnowledgeEntry2)],
      ["query"]
    ),
    "getMonthlyBillingOverview": IDL2.Func(
      [IDL2.Nat, IDL2.Nat],
      [IDL2.Vec(MonthlyBillingEntry2)],
      ["query"]
    ),
    "getMonthlyCloseOverview": IDL2.Func(
      [CompanyId2, IDL2.Nat, IDL2.Nat],
      [IDL2.Vec(MonthlyCloseRow2)],
      []
    ),
    "getMyCompany": IDL2.Func([], [Result_182], ["query"]),
    "getMyComplianceFindings": IDL2.Func(
      [IDL2.Opt(CompliancePeriodeTyp2)],
      [IDL2.Vec(ComplianceFinding2)],
      ["query"]
    ),
    "getMyComplianceProfile": IDL2.Func(
      [],
      [IDL2.Opt(EmployeeComplianceProfile2)],
      ["query"]
    ),
    "getMyEmployee": IDL2.Func([], [Result_142], ["query"]),
    "getMyStandardarbeitszeiten": IDL2.Func([], [Result_302], ["query"]),
    "getMyVacationLedger": IDL2.Func(
      [IDL2.Text],
      [IDL2.Opt(VacationLedger2)],
      ["query"]
    ),
    "getOpenAIConfigStatus": IDL2.Func(
      [],
      [IDL2.Record({ "isConfigured": IDL2.Bool })],
      ["query"]
    ),
    "getOpenAIEnabled": IDL2.Func(
      [],
      [IDL2.Record({ "isConfigured": IDL2.Bool })],
      ["query"]
    ),
    "getPauseComplianceForDay": IDL2.Func(
      [IDL2.Nat, IDL2.Text],
      [DayPauseComplianceResult2],
      ["query"]
    ),
    "getPauseOverridesForDay": IDL2.Func(
      [IDL2.Nat, IDL2.Text],
      [IDL2.Vec(PauseOverride2)],
      ["query"]
    ),
    "getPausesForDay": IDL2.Func(
      [IDL2.Nat, IDL2.Text],
      [IDL2.Vec(DetectedPause2)],
      ["query"]
    ),
    "getPeriodCloseConfig": IDL2.Func([CompanyId2], [PeriodCloseConfig2], []),
    "getPeriodCloseStatus": IDL2.Func(
      [CompanyId2, EmployeeId2, IDL2.Nat, IDL2.Nat],
      [IDL2.Opt(PeriodClose2)],
      []
    ),
    "getPlatformAdminConfig": IDL2.Func(
      [],
      [
        IDL2.Record({
          "frontendCanisterId": IDL2.Text,
          "stripeWebhookEndpointUrl": IDL2.Text,
          "stripePublishableKey": IDL2.Text
        })
      ],
      ["query"]
    ),
    "getPlatformAdminInfo": IDL2.Func(
      [],
      [
        IDL2.Opt(
          IDL2.Record({ "principal": IDL2.Text, "createdAt": IDL2.Int })
        )
      ],
      ["query"]
    ),
    "getProjectAufwendungen": IDL2.Func([ProjectId2], [Result_332], ["query"]),
    "getProjectBudgetReport": IDL2.Func(
      [ProjectId2, IDL2.Text, IDL2.Text],
      [Result_322],
      ["query"]
    ),
    "getProjectMembers": IDL2.Func([ProjectId2], [Result_312], ["query"]),
    "getRelevantKnowledgeContext": IDL2.Func(
      [IDL2.Text, IDL2.Nat],
      [IDL2.Text],
      ["query"]
    ),
    "getReportData": IDL2.Func([ReportFilter2], [ReportData2], ["query"]),
    "getServiceYears": IDL2.Func([IDL2.Nat], [IDL2.Vec(IDL2.Text)], ["query"]),
    "getSnapshotInterval": IDL2.Func([], [IDL2.Nat], ["query"]),
    "getStandardarbeitszeitenForEmployee": IDL2.Func(
      [EmployeeId2],
      [Result_302],
      ["query"]
    ),
    "getStripeConfigStatus": IDL2.Func(
      [],
      [
        IDL2.Record({
          "hasPublishableKey": IDL2.Bool,
          "testMode": IDL2.Bool,
          "configured": IDL2.Bool
        })
      ],
      ["query"]
    ),
    "getStripeEvents": IDL2.Func(
      [IDL2.Opt(IDL2.Nat), IDL2.Nat],
      [IDL2.Vec(StripeEvent2)],
      ["query"]
    ),
    "getStripeInvoicesForCompany": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Vec(StripeInvoice2)],
      ["query"]
    ),
    "getStripePublishableKey": IDL2.Func([], [IDL2.Opt(IDL2.Text)], ["query"]),
    "getSubscriptionPlans": IDL2.Func(
      [],
      [IDL2.Vec(SubscriptionPlan2)],
      ["query"]
    ),
    "getSystemStats": IDL2.Func(
      [],
      [
        IDL2.Record({
          "totalEmployees": IDL2.Nat,
          "totalCompanies": IDL2.Nat
        })
      ],
      ["query"]
    ),
    "getTenantComplianceRules": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Vec(TenantComplianceRule2)],
      ["query"]
    ),
    "getTenantCostBreakdown": IDL2.Func(
      [],
      [IDL2.Vec(TenantCostEntry2)],
      ["query"]
    ),
    "getTimeBalance": IDL2.Func([EmployeeId2], [Result_292], ["query"]),
    "getUnbilledEntries": IDL2.Func([IDL2.Opt(IDL2.Nat)], [Result_282], ["query"]),
    "getUnbilledEntriesWithRates": IDL2.Func(
      [IDL2.Opt(IDL2.Nat)],
      [Result_272],
      ["query"]
    ),
    "getUnreadCount": IDL2.Func([], [IDL2.Nat], ["query"]),
    "getUserNotificationSettings": IDL2.Func([], [Result_210], ["query"]),
    "getUsersForCompany": IDL2.Func(
      [CompanyId2],
      [IDL2.Vec(PlatformAdminUserEntry2)],
      ["query"]
    ),
    "getVacationLedger": IDL2.Func(
      [IDL2.Nat, IDL2.Text],
      [IDL2.Opt(VacationLedger2)],
      ["query"]
    ),
    "getVacationLedgerAll": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Vec(VacationLedger2)],
      ["query"]
    ),
    "handleStripeWebhook": IDL2.Func([IDL2.Text, IDL2.Text], [Result_212], []),
    "initAllVacationLedgers": IDL2.Func(
      [IDL2.Nat],
      [IDL2.Variant({ "ok": IDL2.Nat, "err": IDL2.Text })],
      []
    ),
    "isCallerAdmin": IDL2.Func([], [IDL2.Bool], ["query"]),
    "isPlatformAdmin": IDL2.Func([], [IDL2.Bool], ["query"]),
    "isRegistered": IDL2.Func([], [IDL2.Bool], ["query"]),
    "listAbsenceTypes": IDL2.Func([], [IDL2.Vec(AbsenceType2)], ["query"]),
    "listAbsences": IDL2.Func([AbsenceFilter2], [IDL2.Vec(Absence2)], ["query"]),
    "listAllCompaniesForPlatformAdmin": IDL2.Func(
      [],
      [
        IDL2.Vec(
          IDL2.Record({
            "id": IDL2.Text,
            "name": IDL2.Text,
            "createdAt": IDL2.Int,
            "inactiveEmployeeCount": IDL2.Nat,
            "isActive": IDL2.Bool,
            "address": IDL2.Opt(IDL2.Text),
            "activeEmployeeCount": IDL2.Nat
          })
        )
      ],
      ["query"]
    ),
    "listAllNotifications": IDL2.Func([], [IDL2.Vec(Notification2)], []),
    "listAuditLog": IDL2.Func(
      [IDL2.Opt(IDL2.Text), IDL2.Opt(IDL2.Nat)],
      [IDL2.Vec(AuditEntry2)],
      ["query"]
    ),
    "listAuditLogs": IDL2.Func(
      [AuditLogFilter2],
      [IDL2.Vec(AuditLogEntry2)],
      ["query"]
    ),
    "listCustomers": IDL2.Func([], [IDL2.Vec(Customer2)], ["query"]),
    "listEmployees": IDL2.Func([], [IDL2.Vec(Employee2)], ["query"]),
    "listEmployments": IDL2.Func([EmployeeId2], [Result_262], ["query"]),
    "listExpenseTypes": IDL2.Func([], [IDL2.Vec(ExpenseType2)], ["query"]),
    "listExpenses": IDL2.Func([ExpenseFilter2], [IDL2.Vec(Expense2)], ["query"]),
    "listHolidays": IDL2.Func([], [IDL2.Vec(Holiday2)], ["query"]),
    "listMyNotifications": IDL2.Func([], [IDL2.Vec(UserNotification2)], []),
    "listPeriodCloseAudit": IDL2.Func(
      [CompanyId2],
      [IDL2.Vec(PeriodCloseAuditEntry2)],
      []
    ),
    "listPeriodCloses": IDL2.Func(
      [CompanyId2, IDL2.Nat, IDL2.Nat],
      [IDL2.Vec(PeriodClose2)],
      []
    ),
    "listProjectAssignments": IDL2.Func(
      [],
      [IDL2.Vec(ProjectAssignment2)],
      ["query"]
    ),
    "listProjects": IDL2.Func([], [IDL2.Vec(Project2)], ["query"]),
    "listServiceTypes": IDL2.Func([], [IDL2.Vec(ServiceType2)], ["query"]),
    "listTimeBalanceCorrections": IDL2.Func(
      [EmployeeId2],
      [Result_252],
      ["query"]
    ),
    "listTimeEntries": IDL2.Func(
      [TimeEntryFilter2],
      [IDL2.Vec(TimeEntry2)],
      ["query"]
    ),
    "listVacationBalances": IDL2.Func([EmployeeId2], [Result_242], ["query"]),
    "manuallyTriggerStripeSync": IDL2.Func([IDL2.Nat], [Result_212], []),
    "markAllNotificationsRead": IDL2.Func(
      [],
      [IDL2.Variant({ "ok": IDL2.Nat, "err": IDL2.Text })],
      []
    ),
    "markFakturiert": IDL2.Func(
      [IDL2.Nat, IDL2.Vec(IDL2.Nat), IDL2.Vec(IDL2.Nat)],
      [Result_52],
      []
    ),
    "markNotificationRead": IDL2.Func(
      [IDL2.Text],
      [IDL2.Variant({ "ok": IDL2.Null, "err": IDL2.Text })],
      []
    ),
    "precheckPeriodClose": IDL2.Func(
      [CompanyId2, EmployeeId2, IDL2.Nat, IDL2.Nat],
      [PrecheckResult2],
      []
    ),
    "purgeEmployee": IDL2.Func([EmployeeId2], [Result_52], []),
    "reactivateStripeSubscription": IDL2.Func([IDL2.Nat], [Result_222], []),
    "recordCycleSnapshot": IDL2.Func([IDL2.Nat, IDL2.Nat], [], []),
    "recoverSubscriptionPlans": IDL2.Func([], [Result_212], []),
    "redeemInviteCode": IDL2.Func([IDL2.Text], [Result_142], []),
    "registerCompany": IDL2.Func(
      [
        IDL2.Text,
        IDL2.Text,
        IDL2.Text,
        IDL2.Text,
        IDL2.Opt(IDL2.Text),
        IDL2.Opt(IDL2.Text)
      ],
      [Result_182],
      []
    ),
    "rejectAbsence": IDL2.Func([AbsenceId2, IDL2.Text], [Result_202], []),
    "rejectExpense": IDL2.Func([ExpenseId2, IDL2.Opt(IDL2.Text)], [Result_122], []),
    "relinkStripeCustomer": IDL2.Func([IDL2.Nat, IDL2.Text], [Result_212], []),
    "removeEmployeeFromProject": IDL2.Func(
      [EmployeeId2, ProjectId2],
      [Result_52],
      []
    ),
    "reopenPeriod": IDL2.Func([ReopenPeriodInput2], [Result_232], []),
    "reprocessStripeEvent": IDL2.Func([IDL2.Text], [Result_212], []),
    "resetAbsenceToAusstehend": IDL2.Func(
      [AbsenceId2, IDL2.Text],
      [Result_202],
      []
    ),
    "resetExpenseToAusstehend": IDL2.Func(
      [ExpenseId2, IDL2.Text],
      [Result_122],
      []
    ),
    "resetTenantComplianceRule": IDL2.Func(
      [IDL2.Nat, IDL2.Text],
      [IDL2.Variant({ "ok": TenantComplianceRule2, "err": IDL2.Text })],
      []
    ),
    "resolveFinding": IDL2.Func(
      [ResolveFindingInput2],
      [IDL2.Variant({ "ok": ComplianceFinding2, "err": IDL2.Text })],
      []
    ),
    "restoreDefaultPlansIfMissing": IDL2.Func([], [Result_212], []),
    "revokeInviteCode": IDL2.Func([IDL2.Text], [Result_52], []),
    "runWeeklyComplianceCheck": IDL2.Func(
      [IDL2.Nat, IDL2.Text],
      [
        IDL2.Variant({
          "ok": IDL2.Record({
            "existingFindings": IDL2.Nat,
            "newFindings": IDL2.Nat
          }),
          "err": IDL2.Text
        })
      ],
      []
    ),
    "saveAndSendNotification": IDL2.Func(
      [
        IDL2.Text,
        IDL2.Text,
        NotificationFormat2,
        NotificationPriority2,
        IDL2.Int,
        IDL2.Opt(IDL2.Int),
        NotificationTargetType2,
        IDL2.Vec(IDL2.Text),
        IDL2.Vec(IDL2.Text),
        IDL2.Vec(IDL2.Text)
      ],
      [IDL2.Variant({ "ok": Notification2, "err": IDL2.Text })],
      []
    ),
    "sendChatMessage": IDL2.Func(
      [
        IDL2.Text,
        IDL2.Vec(IDL2.Record({ "content": IDL2.Text, "role": IDL2.Text }))
      ],
      [Result_212],
      []
    ),
    "sendNotification": IDL2.Func(
      [IDL2.Text],
      [IDL2.Variant({ "ok": IDL2.Null, "err": IDL2.Text })],
      []
    ),
    "setCompanyActive": IDL2.Func(
      [IDL2.Nat, IDL2.Bool],
      [IDL2.Variant({ "ok": IDL2.Null, "err": IDL2.Text })],
      []
    ),
    "setCompanyBillingModel": IDL2.Func(
      [IDL2.Nat, BillingModel2],
      [Result_52],
      []
    ),
    "setEmployeeActive": IDL2.Func([EmployeeId2, IDL2.Bool], [Result_142], []),
    "setFrontendCanisterId": IDL2.Func([IDL2.Text], [], []),
    "setFrontendCyclesManual": IDL2.Func([IDL2.Nat], [], []),
    "setMyStandardarbeitszeiten": IDL2.Func(
      [Standardarbeitszeiten2],
      [Result_52],
      []
    ),
    "setOpenAIConfig": IDL2.Func([IDL2.Text], [Result_52], []),
    "setPlatformAdminConfig": IDL2.Func(
      [
        IDL2.Record({
          "frontendCanisterId": IDL2.Text,
          "stripeWebhookEndpointUrl": IDL2.Text,
          "stripeSecretKey": IDL2.Text,
          "stripePublishableKey": IDL2.Text,
          "stripeWebhookSecret": IDL2.Text
        })
      ],
      [Result_52],
      []
    ),
    "setProjectMembers": IDL2.Func(
      [ProjectId2, IDL2.Vec(ProjectMemberAssignment2)],
      [Result_52],
      []
    ),
    "setSnapshotInterval": IDL2.Func([IDL2.Nat], [], []),
    "setStandardarbeitszeitenForEmployee": IDL2.Func(
      [EmployeeId2, Standardarbeitszeiten2],
      [Result_52],
      []
    ),
    "setStripeConfig": IDL2.Func(
      [IDL2.Text, IDL2.Text, IDL2.Text],
      [Result_212],
      []
    ),
    "setUserActiveForCompany": IDL2.Func(
      [CompanyId2, EmployeeId2, IDL2.Bool],
      [Result_52],
      []
    ),
    "setUserRoleForCompany": IDL2.Func(
      [CompanyId2, EmployeeId2, Role2],
      [Result_52],
      []
    ),
    "startSnapshotTimer": IDL2.Func([], [], []),
    "syncStripeSubscription": IDL2.Func([IDL2.Nat], [Result_222], []),
    "testOpenAIConnection": IDL2.Func([], [Result_212], []),
    "testStripeConnection": IDL2.Func(
      [],
      [
        IDL2.Record({
          "apiConnectionOk": IDL2.Bool,
          "apiConnectionMessage": IDL2.Text,
          "customerPortalOk": IDL2.Bool,
          "customerPortalMessage": IDL2.Text
        })
      ],
      []
    ),
    "transformOpenAI": IDL2.Func(
      [TransformationInput2],
      [TransformationOutput2],
      ["query"]
    ),
    "transformStripeResponse": IDL2.Func(
      [HttpTransformArgs2],
      [HttpRequestResult2],
      ["query"]
    ),
    "updateAbsence": IDL2.Func(
      [AbsenceId2, UpdateAbsenceInput2],
      [Result_202],
      []
    ),
    "updateAbsenceType": IDL2.Func(
      [AbsenceTypeId2, UpdateAbsenceTypeInput2],
      [Result_192],
      []
    ),
    "updateCompany": IDL2.Func([UpdateCompanyInput2], [Result_182], []),
    "updateCompanySettings": IDL2.Func([CompanySettings2], [Result_172], []),
    "updateComplianceProfile": IDL2.Func(
      [UpdateComplianceProfileInput2],
      [IDL2.Variant({ "ok": EmployeeComplianceProfile2, "err": IDL2.Text })],
      []
    ),
    "updateCostSettings": IDL2.Func([CostSettings2], [], []),
    "updateCustomer": IDL2.Func(
      [CustomerId2, UpdateCustomerInput2],
      [Result_162],
      []
    ),
    "updateDefaultWorkHours": IDL2.Func([DefaultWorkHours2], [Result_152], []),
    "updateEmployee": IDL2.Func(
      [EmployeeId2, UpdateEmployeeInput2],
      [Result_142],
      []
    ),
    "updateEmployment": IDL2.Func(
      [EmployeeId2, IDL2.Text, UpdateEmploymentInput2],
      [Result_132],
      []
    ),
    "updateExpense": IDL2.Func(
      [ExpenseId2, UpdateExpenseInput2],
      [Result_122],
      []
    ),
    "updateExpenseType": IDL2.Func(
      [ExpenseTypeId2, UpdateExpenseTypeInput2],
      [Result_112],
      []
    ),
    "updateHoliday": IDL2.Func(
      [HolidayId2, UpdateHolidayInput2],
      [Result_102],
      []
    ),
    "updateInvoice": IDL2.Func([IDL2.Nat, UpdateInvoiceInput2], [Result_92], []),
    "updateKnowledgeEntry": IDL2.Func(
      [
        IDL2.Text,
        IDL2.Record({
          "title": IDL2.Text,
          "content": IDL2.Text,
          "role": IDL2.Text,
          "isActive": IDL2.Bool,
          "language": IDL2.Text,
          "category": IDL2.Text
        })
      ],
      [Result_82],
      []
    ),
    "updatePeriodCloseConfig": IDL2.Func(
      [CompanyId2, PeriodCloseConfig2],
      [Result_52],
      []
    ),
    "updateProject": IDL2.Func([ProjectId2, UpdateProjectInput2], [Result_72], []),
    "updateServiceType": IDL2.Func(
      [ServiceTypeId2, UpdateServiceTypeInput2],
      [Result_62],
      []
    ),
    "updateStripeSubscriptionQuantity": IDL2.Func(
      [IDL2.Nat, IDL2.Nat],
      [Result_52],
      []
    ),
    "updateTenantComplianceRule": IDL2.Func(
      [UpdateTenantComplianceRuleInput2],
      [IDL2.Variant({ "ok": TenantComplianceRule2, "err": IDL2.Text })],
      []
    ),
    "updateTimeBalanceCorrection": IDL2.Func(
      [EmployeeId2, IDL2.Text, UpdateTimeBalanceCorrectionInput2],
      [Result_42],
      []
    ),
    "updateTimeEntry": IDL2.Func(
      [TimeEntryId2, UpdateTimeEntryInput2],
      [Result_310],
      []
    ),
    "updateUserNotificationSettings": IDL2.Func(
      [UserNotificationSettings2],
      [Result_210],
      []
    ),
    "updateVacationBalance": IDL2.Func(
      [EmployeeId2, IDL2.Text, UpdateVacationBalanceInput2],
      [Result_110],
      []
    ),
    "upsertSubscriptionPlan": IDL2.Func([SubscriptionPlan2], [Result2], [])
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
var AuditEntityType = /* @__PURE__ */ ((AuditEntityType2) => {
  AuditEntityType2["expenseType"] = "expenseType";
  AuditEntityType2["serviceType"] = "serviceType";
  AuditEntityType2["expense"] = "expense";
  AuditEntityType2["timeEntry"] = "timeEntry";
  AuditEntityType2["customer"] = "customer";
  AuditEntityType2["ferien"] = "ferien";
  AuditEntityType2["invoiceTemplate"] = "invoiceTemplate";
  AuditEntityType2["absence"] = "absence";
  AuditEntityType2["company"] = "company";
  AuditEntityType2["employee"] = "employee";
  AuditEntityType2["approval"] = "approval";
  AuditEntityType2["absenceType"] = "absenceType";
  AuditEntityType2["holiday"] = "holiday";
  AuditEntityType2["project"] = "project";
  return AuditEntityType2;
})(AuditEntityType || {});
var AuditOperation = /* @__PURE__ */ ((AuditOperation2) => {
  AuditOperation2["reject"] = "reject";
  AuditOperation2["remove"] = "remove";
  AuditOperation2["approve"] = "approve";
  AuditOperation2["delete_"] = "delete";
  AuditOperation2["create"] = "create";
  AuditOperation2["update"] = "update";
  return AuditOperation2;
})(AuditOperation || {});
var InvoicePositionTyp = /* @__PURE__ */ ((InvoicePositionTyp2) => {
  InvoicePositionTyp2["leistung"] = "leistung";
  InvoicePositionTyp2["freitext"] = "freitext";
  InvoicePositionTyp2["spese"] = "spese";
  return InvoicePositionTyp2;
})(InvoicePositionTyp || {});
var InvoiceStatus = /* @__PURE__ */ ((InvoiceStatus2) => {
  InvoiceStatus2["entwurf"] = "entwurf";
  InvoiceStatus2["versendet"] = "versendet";
  InvoiceStatus2["bezahlt"] = "bezahlt";
  InvoiceStatus2["storniert"] = "storniert";
  InvoiceStatus2["ueberfaellig"] = "ueberfaellig";
  return InvoiceStatus2;
})(InvoiceStatus || {});
var PeriodCloseStatus = /* @__PURE__ */ ((PeriodCloseStatus2) => {
  PeriodCloseStatus2["reopened"] = "reopened";
  PeriodCloseStatus2["closed"] = "closed";
  PeriodCloseStatus2["ready_for_close"] = "ready_for_close";
  PeriodCloseStatus2["open"] = "open";
  return PeriodCloseStatus2;
})(PeriodCloseStatus || {});
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
  async addKnowledgeEntry(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.addKnowledgeEntry(arg0);
        return from_candid_Result_8_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.addKnowledgeEntry(arg0);
      return from_candid_Result_8_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async applyPlanChange(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.applyPlanChange(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.applyPlanChange(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async approveAbsence(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.approveAbsence(arg0);
        return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.approveAbsence(arg0);
      return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
    }
  }
  async approveExpense(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.approveExpense(arg0);
        return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.approveExpense(arg0);
      return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
    }
  }
  async archiveNotification(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.archiveNotification(arg0);
        return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.archiveNotification(arg0);
      return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
    }
  }
  async assertPeriodIsEditable(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.assertPeriodIsEditable(arg0, arg1, arg2, arg3);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assertPeriodIsEditable(arg0, arg1, arg2, arg3);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async assignCallerUserRole(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n30(this._uploadFile, this._downloadFile, arg1));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n30(this._uploadFile, this._downloadFile, arg1));
      return result;
    }
  }
  async assignEmployeeToProject(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.assignEmployeeToProject(arg0, arg1);
        return from_candid_Result_49_n32(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assignEmployeeToProject(arg0, arg1);
      return from_candid_Result_49_n32(this._uploadFile, this._downloadFile, result);
    }
  }
  async assignSubscriptionPlan(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.assignSubscriptionPlan(arg0, arg1);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assignSubscriptionPlan(arg0, arg1);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async calculateMonthlyBilling(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.calculateMonthlyBilling(arg0, arg1);
        return from_candid_vec_n34(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.calculateMonthlyBilling(arg0, arg1);
      return from_candid_vec_n34(this._uploadFile, this._downloadFile, result);
    }
  }
  async calculateProRataAdjustment(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.calculateProRataAdjustment(arg0, arg1);
        return from_candid_Result_48_n39(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.calculateProRataAdjustment(arg0, arg1);
      return from_candid_Result_48_n39(this._uploadFile, this._downloadFile, result);
    }
  }
  async cancelInvoice(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.cancelInvoice(arg0);
        return from_candid_Result_9_n41(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.cancelInvoice(arg0);
      return from_candid_Result_9_n41(this._uploadFile, this._downloadFile, result);
    }
  }
  async cancelStripeSubscription(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.cancelStripeSubscription(arg0);
        return from_candid_Result_22_n52(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.cancelStripeSubscription(arg0);
      return from_candid_Result_22_n52(this._uploadFile, this._downloadFile, result);
    }
  }
  async checkPlanChangeNeeded(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.checkPlanChangeNeeded(arg0);
        return from_candid_Result_47_n58(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.checkPlanChangeNeeded(arg0);
      return from_candid_Result_47_n58(this._uploadFile, this._downloadFile, result);
    }
  }
  async closePeriod(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.closePeriod(to_candid_ClosePeriodInput_n61(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_23_n63(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.closePeriod(to_candid_ClosePeriodInput_n61(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_23_n63(this._uploadFile, this._downloadFile, result);
    }
  }
  async closePeriodBulk(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.closePeriodBulk(arg0, arg1, arg2, to_candid_opt_n74(this._uploadFile, this._downloadFile, arg3));
        return from_candid_vec_n75(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.closePeriodBulk(arg0, arg1, arg2, to_candid_opt_n74(this._uploadFile, this._downloadFile, arg3));
      return from_candid_vec_n75(this._uploadFile, this._downloadFile, result);
    }
  }
  async compareStripeSubscriptionStatus(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.compareStripeSubscriptionStatus(arg0);
        return from_candid_Result_46_n76(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.compareStripeSubscriptionStatus(arg0);
      return from_candid_Result_46_n76(this._uploadFile, this._downloadFile, result);
    }
  }
  async createAbsence(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createAbsence(to_candid_CreateAbsenceInput_n78(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createAbsence(to_candid_CreateAbsenceInput_n78(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
    }
  }
  async createAbsenceType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createAbsenceType(to_candid_CreateAbsenceTypeInput_n80(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_19_n86(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createAbsenceType(to_candid_CreateAbsenceTypeInput_n80(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_19_n86(this._uploadFile, this._downloadFile, result);
    }
  }
  async createCustomer(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createCustomer(to_candid_CreateCustomerInput_n95(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_16_n101(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createCustomer(to_candid_CreateCustomerInput_n95(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_16_n101(this._uploadFile, this._downloadFile, result);
    }
  }
  async createEmployee(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createEmployee(to_candid_CreateEmployeeInput_n110(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createEmployee(to_candid_CreateEmployeeInput_n110(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
    }
  }
  async createEmployment(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createEmployment(arg0, to_candid_CreateEmploymentInput_n124(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_13_n128(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createEmployment(arg0, to_candid_CreateEmploymentInput_n124(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_13_n128(this._uploadFile, this._downloadFile, result);
    }
  }
  async createExpense(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createExpense(to_candid_CreateExpenseInput_n134(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createExpense(to_candid_CreateExpenseInput_n134(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
    }
  }
  async createExpenseType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createExpenseType(to_candid_CreateExpenseTypeInput_n136(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_11_n138(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createExpenseType(to_candid_CreateExpenseTypeInput_n136(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_11_n138(this._uploadFile, this._downloadFile, result);
    }
  }
  async createHoliday(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createHoliday(to_candid_CreateHolidayInput_n140(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_10_n142(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createHoliday(to_candid_CreateHolidayInput_n140(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_10_n142(this._uploadFile, this._downloadFile, result);
    }
  }
  async createInvoice(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createInvoice(to_candid_CreateInvoiceInput_n144(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_9_n41(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createInvoice(to_candid_CreateInvoiceInput_n144(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_9_n41(this._uploadFile, this._downloadFile, result);
    }
  }
  async createNotificationDraft(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    if (this.processError) {
      try {
        const result = await this.actor.createNotificationDraft(arg0, arg1, to_candid_NotificationFormat_n151(this._uploadFile, this._downloadFile, arg2), to_candid_NotificationPriority_n153(this._uploadFile, this._downloadFile, arg3), arg4, to_candid_opt_n155(this._uploadFile, this._downloadFile, arg5), to_candid_NotificationTargetType_n156(this._uploadFile, this._downloadFile, arg6), arg7, arg8, arg9);
        return from_candid_variant_n158(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createNotificationDraft(arg0, arg1, to_candid_NotificationFormat_n151(this._uploadFile, this._downloadFile, arg2), to_candid_NotificationPriority_n153(this._uploadFile, this._downloadFile, arg3), arg4, to_candid_opt_n155(this._uploadFile, this._downloadFile, arg5), to_candid_NotificationTargetType_n156(this._uploadFile, this._downloadFile, arg6), arg7, arg8, arg9);
      return from_candid_variant_n158(this._uploadFile, this._downloadFile, result);
    }
  }
  async createOrUpdateInvoiceTemplate(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createOrUpdateInvoiceTemplate(to_candid_InvoiceTemplateInput_n169(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_45_n171(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createOrUpdateInvoiceTemplate(to_candid_InvoiceTemplateInput_n169(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_45_n171(this._uploadFile, this._downloadFile, result);
    }
  }
  async createPauseOverride(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createPauseOverride(to_candid_CreatePauseOverrideInput_n175(this._uploadFile, this._downloadFile, arg0));
        return from_candid_variant_n177(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createPauseOverride(to_candid_CreatePauseOverrideInput_n175(this._uploadFile, this._downloadFile, arg0));
      return from_candid_variant_n177(this._uploadFile, this._downloadFile, result);
    }
  }
  async createProject(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createProject(to_candid_CreateProjectInput_n180(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_7_n186(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createProject(to_candid_CreateProjectInput_n180(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_7_n186(this._uploadFile, this._downloadFile, result);
    }
  }
  async createServiceType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createServiceType(to_candid_CreateServiceTypeInput_n195(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_6_n197(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createServiceType(to_candid_CreateServiceTypeInput_n195(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_6_n197(this._uploadFile, this._downloadFile, result);
    }
  }
  async createStripeCheckoutLinkForCompany(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.createStripeCheckoutLinkForCompany(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_41_n199(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createStripeCheckoutLinkForCompany(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_41_n199(this._uploadFile, this._downloadFile, result);
    }
  }
  async createStripeCheckoutLinkForCompanyWithPrice(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.createStripeCheckoutLinkForCompanyWithPrice(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2), arg3);
        return from_candid_Result_41_n199(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createStripeCheckoutLinkForCompanyWithPrice(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2), arg3);
      return from_candid_Result_41_n199(this._uploadFile, this._downloadFile, result);
    }
  }
  async createStripeCheckoutSession(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.createStripeCheckoutSession(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_41_n199(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createStripeCheckoutSession(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_41_n199(this._uploadFile, this._downloadFile, result);
    }
  }
  async createStripeCheckoutSessionWithPrice(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.createStripeCheckoutSessionWithPrice(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2), arg3);
        return from_candid_Result_41_n199(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createStripeCheckoutSessionWithPrice(arg0, arg1, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg2), arg3);
      return from_candid_Result_41_n199(this._uploadFile, this._downloadFile, result);
    }
  }
  async createStripeCustomerPortalSession(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createStripeCustomerPortalSession(arg0);
        return from_candid_Result_40_n201(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createStripeCustomerPortalSession(arg0);
      return from_candid_Result_40_n201(this._uploadFile, this._downloadFile, result);
    }
  }
  async createTimeBalanceCorrection(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createTimeBalanceCorrection(arg0, to_candid_CreateTimeBalanceCorrectionInput_n203(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_4_n206(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createTimeBalanceCorrection(arg0, to_candid_CreateTimeBalanceCorrectionInput_n203(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_4_n206(this._uploadFile, this._downloadFile, result);
    }
  }
  async createTimeEntry(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.createTimeEntry(to_candid_CreateTimeEntryInput_n211(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_3_n213(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createTimeEntry(to_candid_CreateTimeEntryInput_n211(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_3_n213(this._uploadFile, this._downloadFile, result);
    }
  }
  async createVacationBalance(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.createVacationBalance(arg0, to_candid_CreateVacationBalanceInput_n217(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_1_n219(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.createVacationBalance(arg0, to_candid_CreateVacationBalanceInput_n217(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_1_n219(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteAbsence(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteAbsence(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteAbsence(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteAbsenceType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteAbsenceType(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteAbsenceType(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteCustomer(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteCustomer(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteCustomer(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteEmployee(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteEmployee(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteEmployee(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteEmployment(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteEmployment(arg0, arg1);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteEmployment(arg0, arg1);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteExpense(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteExpense(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteExpense(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteExpenseType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteExpenseType(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteExpenseType(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteHoliday(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteHoliday(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteHoliday(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteInvoice(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteInvoice(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteInvoice(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteKnowledgeEntry(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteKnowledgeEntry(arg0);
        return from_candid_Result_39_n223(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteKnowledgeEntry(arg0);
      return from_candid_Result_39_n223(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteMyNotification(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteMyNotification(arg0);
        return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteMyNotification(arg0);
      return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
    }
  }
  async deletePauseOverride(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deletePauseOverride(arg0);
        return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deletePauseOverride(arg0);
      return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteProject(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteProject(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteProject(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteServiceType(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteServiceType(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteServiceType(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteSubscriptionPlan(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteSubscriptionPlan(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteSubscriptionPlan(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteTimeBalanceCorrection(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteTimeBalanceCorrection(arg0, arg1);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteTimeBalanceCorrection(arg0, arg1);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteTimeEntry(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteTimeEntry(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteTimeEntry(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async deleteVacationBalance(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteVacationBalance(arg0, arg1);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteVacationBalance(arg0, arg1);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async duplicateNotification(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.duplicateNotification(arg0);
        return from_candid_variant_n158(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.duplicateNotification(arg0);
      return from_candid_variant_n158(this._uploadFile, this._downloadFile, result);
    }
  }
  async generateInviteCode(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.generateInviteCode(arg0);
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.generateInviteCode(arg0);
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async getAllCompanySubscriptions() {
    if (this.processError) {
      try {
        const result = await this.actor.getAllCompanySubscriptions();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAllCompanySubscriptions();
      return result;
    }
  }
  async getAllSubscriptionPlans() {
    if (this.processError) {
      try {
        const result = await this.actor.getAllSubscriptionPlans();
        return from_candid_vec_n225(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAllSubscriptionPlans();
      return from_candid_vec_n225(this._uploadFile, this._downloadFile, result);
    }
  }
  async getBackendCanisterId() {
    if (this.processError) {
      try {
        const result = await this.actor.getBackendCanisterId();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getBackendCanisterId();
      return result;
    }
  }
  async getCalendarEntries(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getCalendarEntries(arg0, arg1);
        return from_candid_CalendarData_n230(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCalendarEntries(arg0, arg1);
      return from_candid_CalendarData_n230(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCallerUserRole() {
    if (this.processError) {
      try {
        const result = await this.actor.getCallerUserRole();
        return from_candid_UserRole_n235(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCallerUserRole();
      return from_candid_UserRole_n235(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCanisterStatusInfo() {
    if (this.processError) {
      try {
        const result = await this.actor.getCanisterStatusInfo();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCanisterStatusInfo();
      return result;
    }
  }
  async getCompanyBillingModel(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getCompanyBillingModel(arg0);
        return from_candid_Result_38_n237(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCompanyBillingModel(arg0);
      return from_candid_Result_38_n237(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCompanyCalendarAbsences(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.getCompanyCalendarAbsences(arg0, arg1, arg2);
        return from_candid_vec_n240(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCompanyCalendarAbsences(arg0, arg1, arg2);
      return from_candid_vec_n240(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCompanyEmployeesForBilling(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getCompanyEmployeesForBilling(arg0);
        return from_candid_vec_n243(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCompanyEmployeesForBilling(arg0);
      return from_candid_vec_n243(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCompanySettings() {
    if (this.processError) {
      try {
        const result = await this.actor.getCompanySettings();
        return from_candid_Result_17_n244(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCompanySettings();
      return from_candid_Result_17_n244(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCompanySubscription(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getCompanySubscription(arg0);
        return from_candid_opt_n21(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCompanySubscription(arg0);
      return from_candid_opt_n21(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCompanySubscriptionPlan(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getCompanySubscriptionPlan(arg0);
        return from_candid_opt_n246(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCompanySubscriptionPlan(arg0);
      return from_candid_opt_n246(this._uploadFile, this._downloadFile, result);
    }
  }
  async getComplianceCockpitKPI(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getComplianceCockpitKPI(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getComplianceCockpitKPI(arg0);
      return result;
    }
  }
  async getComplianceCockpitRows(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getComplianceCockpitRows(arg0);
        return from_candid_vec_n247(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getComplianceCockpitRows(arg0);
      return from_candid_vec_n247(this._uploadFile, this._downloadFile, result);
    }
  }
  async getComplianceFindings(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.getComplianceFindings(arg0, to_candid_opt_n252(this._uploadFile, this._downloadFile, arg1), to_candid_opt_n255(this._uploadFile, this._downloadFile, arg2));
        return from_candid_vec_n259(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getComplianceFindings(arg0, to_candid_opt_n252(this._uploadFile, this._downloadFile, arg1), to_candid_opt_n255(this._uploadFile, this._downloadFile, arg2));
      return from_candid_vec_n259(this._uploadFile, this._downloadFile, result);
    }
  }
  async getComplianceProfile(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getComplianceProfile(arg0);
        return from_candid_opt_n267(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getComplianceProfile(arg0);
      return from_candid_opt_n267(this._uploadFile, this._downloadFile, result);
    }
  }
  async getContractualHoursForEmployee(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getContractualHoursForEmployee(arg0, arg1);
        return from_candid_opt_n37(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getContractualHoursForEmployee(arg0, arg1);
      return from_candid_opt_n37(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCostDashboardData(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getCostDashboardData(to_candid_opt_n155(this._uploadFile, this._downloadFile, arg0), to_candid_opt_n155(this._uploadFile, this._downloadFile, arg1));
        return from_candid_CostDashboardData_n270(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCostDashboardData(to_candid_opt_n155(this._uploadFile, this._downloadFile, arg0), to_candid_opt_n155(this._uploadFile, this._downloadFile, arg1));
      return from_candid_CostDashboardData_n270(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCostSettings() {
    if (this.processError) {
      try {
        const result = await this.actor.getCostSettings();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCostSettings();
      return result;
    }
  }
  async getCycleSnapshots(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getCycleSnapshots(to_candid_opt_n155(this._uploadFile, this._downloadFile, arg0), to_candid_opt_n155(this._uploadFile, this._downloadFile, arg1));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCycleSnapshots(to_candid_opt_n155(this._uploadFile, this._downloadFile, arg0), to_candid_opt_n155(this._uploadFile, this._downloadFile, arg1));
      return result;
    }
  }
  async getCycleStatus() {
    if (this.processError) {
      try {
        const result = await this.actor.getCycleStatus();
        return from_candid_CycleStatus_n272(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCycleStatus();
      return from_candid_CycleStatus_n272(this._uploadFile, this._downloadFile, result);
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
  async getDefaultWorkHours() {
    if (this.processError) {
      try {
        const result = await this.actor.getDefaultWorkHours();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getDefaultWorkHours();
      return result;
    }
  }
  async getEmployeeWorkTimeBalance(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.getEmployeeWorkTimeBalance(arg0, arg1, arg2);
        return from_candid_Result_37_n274(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getEmployeeWorkTimeBalance(arg0, arg1, arg2);
      return from_candid_Result_37_n274(this._uploadFile, this._downloadFile, result);
    }
  }
  async getEmployeeWorkTimeBalanceFromStart(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getEmployeeWorkTimeBalanceFromStart(arg0);
        return from_candid_Result_37_n274(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getEmployeeWorkTimeBalanceFromStart(arg0);
      return from_candid_Result_37_n274(this._uploadFile, this._downloadFile, result);
    }
  }
  async getEmploymentForDate(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getEmploymentForDate(arg0, arg1);
        return from_candid_Result_36_n276(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getEmploymentForDate(arg0, arg1);
      return from_candid_Result_36_n276(this._uploadFile, this._downloadFile, result);
    }
  }
  async getFrontendCyclesManual() {
    if (this.processError) {
      try {
        const result = await this.actor.getFrontendCyclesManual();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getFrontendCyclesManual();
      return result;
    }
  }
  async getInvoiceById(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getInvoiceById(arg0);
        return from_candid_Result_9_n41(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getInvoiceById(arg0);
      return from_candid_Result_9_n41(this._uploadFile, this._downloadFile, result);
    }
  }
  async getInvoiceTemplate() {
    if (this.processError) {
      try {
        const result = await this.actor.getInvoiceTemplate();
        return from_candid_Result_35_n279(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getInvoiceTemplate();
      return from_candid_Result_35_n279(this._uploadFile, this._downloadFile, result);
    }
  }
  async getInvoices() {
    if (this.processError) {
      try {
        const result = await this.actor.getInvoices();
        return from_candid_Result_34_n282(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getInvoices();
      return from_candid_Result_34_n282(this._uploadFile, this._downloadFile, result);
    }
  }
  async getKnowledgeEntries() {
    if (this.processError) {
      try {
        const result = await this.actor.getKnowledgeEntries();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getKnowledgeEntries();
      return result;
    }
  }
  async getKnowledgeEntriesAdmin() {
    if (this.processError) {
      try {
        const result = await this.actor.getKnowledgeEntriesAdmin();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getKnowledgeEntriesAdmin();
      return result;
    }
  }
  async getMonthlyBillingOverview(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getMonthlyBillingOverview(arg0, arg1);
        return from_candid_vec_n34(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMonthlyBillingOverview(arg0, arg1);
      return from_candid_vec_n34(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMonthlyCloseOverview(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.getMonthlyCloseOverview(arg0, arg1, arg2);
        return from_candid_vec_n285(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMonthlyCloseOverview(arg0, arg1, arg2);
      return from_candid_vec_n285(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyCompany() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyCompany();
        return from_candid_Result_18_n289(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyCompany();
      return from_candid_Result_18_n289(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyComplianceFindings(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getMyComplianceFindings(to_candid_opt_n252(this._uploadFile, this._downloadFile, arg0));
        return from_candid_vec_n259(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyComplianceFindings(to_candid_opt_n252(this._uploadFile, this._downloadFile, arg0));
      return from_candid_vec_n259(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyComplianceProfile() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyComplianceProfile();
        return from_candid_opt_n267(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyComplianceProfile();
      return from_candid_opt_n267(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyEmployee() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyEmployee();
        return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyEmployee();
      return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyStandardarbeitszeiten() {
    if (this.processError) {
      try {
        const result = await this.actor.getMyStandardarbeitszeiten();
        return from_candid_Result_30_n293(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyStandardarbeitszeiten();
      return from_candid_Result_30_n293(this._uploadFile, this._downloadFile, result);
    }
  }
  async getMyVacationLedger(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getMyVacationLedger(arg0);
        return from_candid_opt_n300(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getMyVacationLedger(arg0);
      return from_candid_opt_n300(this._uploadFile, this._downloadFile, result);
    }
  }
  async getOpenAIConfigStatus() {
    if (this.processError) {
      try {
        const result = await this.actor.getOpenAIConfigStatus();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getOpenAIConfigStatus();
      return result;
    }
  }
  async getOpenAIEnabled() {
    if (this.processError) {
      try {
        const result = await this.actor.getOpenAIEnabled();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getOpenAIEnabled();
      return result;
    }
  }
  async getPauseComplianceForDay(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getPauseComplianceForDay(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPauseComplianceForDay(arg0, arg1);
      return result;
    }
  }
  async getPauseOverridesForDay(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getPauseOverridesForDay(arg0, arg1);
        return from_candid_vec_n301(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPauseOverridesForDay(arg0, arg1);
      return from_candid_vec_n301(this._uploadFile, this._downloadFile, result);
    }
  }
  async getPausesForDay(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getPausesForDay(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPausesForDay(arg0, arg1);
      return result;
    }
  }
  async getPeriodCloseConfig(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getPeriodCloseConfig(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPeriodCloseConfig(arg0);
      return result;
    }
  }
  async getPeriodCloseStatus(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.getPeriodCloseStatus(arg0, arg1, arg2, arg3);
        return from_candid_opt_n302(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPeriodCloseStatus(arg0, arg1, arg2, arg3);
      return from_candid_opt_n302(this._uploadFile, this._downloadFile, result);
    }
  }
  async getPlatformAdminConfig() {
    if (this.processError) {
      try {
        const result = await this.actor.getPlatformAdminConfig();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPlatformAdminConfig();
      return result;
    }
  }
  async getPlatformAdminInfo() {
    if (this.processError) {
      try {
        const result = await this.actor.getPlatformAdminInfo();
        return from_candid_opt_n303(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getPlatformAdminInfo();
      return from_candid_opt_n303(this._uploadFile, this._downloadFile, result);
    }
  }
  async getProjectAufwendungen(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProjectAufwendungen(arg0);
        return from_candid_Result_33_n304(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProjectAufwendungen(arg0);
      return from_candid_Result_33_n304(this._uploadFile, this._downloadFile, result);
    }
  }
  async getProjectBudgetReport(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.getProjectBudgetReport(arg0, arg1, arg2);
        return from_candid_Result_32_n306(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProjectBudgetReport(arg0, arg1, arg2);
      return from_candid_Result_32_n306(this._uploadFile, this._downloadFile, result);
    }
  }
  async getProjectMembers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getProjectMembers(arg0);
        return from_candid_Result_31_n308(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getProjectMembers(arg0);
      return from_candid_Result_31_n308(this._uploadFile, this._downloadFile, result);
    }
  }
  async getRelevantKnowledgeContext(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getRelevantKnowledgeContext(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getRelevantKnowledgeContext(arg0, arg1);
      return result;
    }
  }
  async getReportData(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getReportData(to_candid_ReportFilter_n313(this._uploadFile, this._downloadFile, arg0));
        return from_candid_ReportData_n315(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getReportData(to_candid_ReportFilter_n313(this._uploadFile, this._downloadFile, arg0));
      return from_candid_ReportData_n315(this._uploadFile, this._downloadFile, result);
    }
  }
  async getServiceYears(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getServiceYears(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getServiceYears(arg0);
      return result;
    }
  }
  async getSnapshotInterval() {
    if (this.processError) {
      try {
        const result = await this.actor.getSnapshotInterval();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getSnapshotInterval();
      return result;
    }
  }
  async getStandardarbeitszeitenForEmployee(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getStandardarbeitszeitenForEmployee(arg0);
        return from_candid_Result_30_n293(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getStandardarbeitszeitenForEmployee(arg0);
      return from_candid_Result_30_n293(this._uploadFile, this._downloadFile, result);
    }
  }
  async getStripeConfigStatus() {
    if (this.processError) {
      try {
        const result = await this.actor.getStripeConfigStatus();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getStripeConfigStatus();
      return result;
    }
  }
  async getStripeEvents(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getStripeEvents(to_candid_opt_n317(this._uploadFile, this._downloadFile, arg0), arg1);
        return from_candid_vec_n318(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getStripeEvents(to_candid_opt_n317(this._uploadFile, this._downloadFile, arg0), arg1);
      return from_candid_vec_n318(this._uploadFile, this._downloadFile, result);
    }
  }
  async getStripeInvoicesForCompany(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getStripeInvoicesForCompany(arg0);
        return from_candid_vec_n323(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getStripeInvoicesForCompany(arg0);
      return from_candid_vec_n323(this._uploadFile, this._downloadFile, result);
    }
  }
  async getStripePublishableKey() {
    if (this.processError) {
      try {
        const result = await this.actor.getStripePublishableKey();
        return from_candid_opt_n21(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getStripePublishableKey();
      return from_candid_opt_n21(this._uploadFile, this._downloadFile, result);
    }
  }
  async getSubscriptionPlans() {
    if (this.processError) {
      try {
        const result = await this.actor.getSubscriptionPlans();
        return from_candid_vec_n225(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getSubscriptionPlans();
      return from_candid_vec_n225(this._uploadFile, this._downloadFile, result);
    }
  }
  async getSystemStats() {
    if (this.processError) {
      try {
        const result = await this.actor.getSystemStats();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getSystemStats();
      return result;
    }
  }
  async getTenantComplianceRules(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getTenantComplianceRules(arg0);
        return from_candid_vec_n326(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getTenantComplianceRules(arg0);
      return from_candid_vec_n326(this._uploadFile, this._downloadFile, result);
    }
  }
  async getTenantCostBreakdown() {
    if (this.processError) {
      try {
        const result = await this.actor.getTenantCostBreakdown();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getTenantCostBreakdown();
      return result;
    }
  }
  async getTimeBalance(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getTimeBalance(arg0);
        return from_candid_Result_29_n329(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getTimeBalance(arg0);
      return from_candid_Result_29_n329(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUnbilledEntries(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUnbilledEntries(to_candid_opt_n317(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_28_n331(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUnbilledEntries(to_candid_opt_n317(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_28_n331(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUnbilledEntriesWithRates(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUnbilledEntriesWithRates(to_candid_opt_n317(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_27_n334(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUnbilledEntriesWithRates(to_candid_opt_n317(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_27_n334(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUnreadCount() {
    if (this.processError) {
      try {
        const result = await this.actor.getUnreadCount();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUnreadCount();
      return result;
    }
  }
  async getUserNotificationSettings() {
    if (this.processError) {
      try {
        const result = await this.actor.getUserNotificationSettings();
        return from_candid_Result_2_n340(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUserNotificationSettings();
      return from_candid_Result_2_n340(this._uploadFile, this._downloadFile, result);
    }
  }
  async getUsersForCompany(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getUsersForCompany(arg0);
        return from_candid_vec_n342(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getUsersForCompany(arg0);
      return from_candid_vec_n342(this._uploadFile, this._downloadFile, result);
    }
  }
  async getVacationLedger(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.getVacationLedger(arg0, arg1);
        return from_candid_opt_n300(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getVacationLedger(arg0, arg1);
      return from_candid_opt_n300(this._uploadFile, this._downloadFile, result);
    }
  }
  async getVacationLedgerAll(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getVacationLedgerAll(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getVacationLedgerAll(arg0);
      return result;
    }
  }
  async handleStripeWebhook(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.handleStripeWebhook(arg0, arg1);
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.handleStripeWebhook(arg0, arg1);
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async initAllVacationLedgers(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.initAllVacationLedgers(arg0);
        return from_candid_variant_n345(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.initAllVacationLedgers(arg0);
      return from_candid_variant_n345(this._uploadFile, this._downloadFile, result);
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
  async isPlatformAdmin() {
    if (this.processError) {
      try {
        const result = await this.actor.isPlatformAdmin();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isPlatformAdmin();
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
        return from_candid_vec_n346(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAbsenceTypes();
      return from_candid_vec_n346(this._uploadFile, this._downloadFile, result);
    }
  }
  async listAbsences(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listAbsences(to_candid_AbsenceFilter_n347(this._uploadFile, this._downloadFile, arg0));
        return from_candid_vec_n232(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAbsences(to_candid_AbsenceFilter_n347(this._uploadFile, this._downloadFile, arg0));
      return from_candid_vec_n232(this._uploadFile, this._downloadFile, result);
    }
  }
  async listAllCompaniesForPlatformAdmin() {
    if (this.processError) {
      try {
        const result = await this.actor.listAllCompaniesForPlatformAdmin();
        return from_candid_vec_n351(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAllCompaniesForPlatformAdmin();
      return from_candid_vec_n351(this._uploadFile, this._downloadFile, result);
    }
  }
  async listAllNotifications() {
    if (this.processError) {
      try {
        const result = await this.actor.listAllNotifications();
        return from_candid_vec_n353(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAllNotifications();
      return from_candid_vec_n353(this._uploadFile, this._downloadFile, result);
    }
  }
  async listAuditLog(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.listAuditLog(to_candid_opt_n74(this._uploadFile, this._downloadFile, arg0), to_candid_opt_n317(this._uploadFile, this._downloadFile, arg1));
        return from_candid_vec_n354(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAuditLog(to_candid_opt_n74(this._uploadFile, this._downloadFile, arg0), to_candid_opt_n317(this._uploadFile, this._downloadFile, arg1));
      return from_candid_vec_n354(this._uploadFile, this._downloadFile, result);
    }
  }
  async listAuditLogs(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listAuditLogs(to_candid_AuditLogFilter_n357(this._uploadFile, this._downloadFile, arg0));
        return from_candid_vec_n363(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listAuditLogs(to_candid_AuditLogFilter_n357(this._uploadFile, this._downloadFile, arg0));
      return from_candid_vec_n363(this._uploadFile, this._downloadFile, result);
    }
  }
  async listCustomers() {
    if (this.processError) {
      try {
        const result = await this.actor.listCustomers();
        return from_candid_vec_n371(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listCustomers();
      return from_candid_vec_n371(this._uploadFile, this._downloadFile, result);
    }
  }
  async listEmployees() {
    if (this.processError) {
      try {
        const result = await this.actor.listEmployees();
        return from_candid_vec_n243(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listEmployees();
      return from_candid_vec_n243(this._uploadFile, this._downloadFile, result);
    }
  }
  async listEmployments(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listEmployments(arg0);
        return from_candid_Result_26_n372(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listEmployments(arg0);
      return from_candid_Result_26_n372(this._uploadFile, this._downloadFile, result);
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
        const result = await this.actor.listExpenses(to_candid_ExpenseFilter_n375(this._uploadFile, this._downloadFile, arg0));
        return from_candid_vec_n233(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listExpenses(to_candid_ExpenseFilter_n375(this._uploadFile, this._downloadFile, arg0));
      return from_candid_vec_n233(this._uploadFile, this._downloadFile, result);
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
  async listMyNotifications() {
    if (this.processError) {
      try {
        const result = await this.actor.listMyNotifications();
        return from_candid_vec_n379(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listMyNotifications();
      return from_candid_vec_n379(this._uploadFile, this._downloadFile, result);
    }
  }
  async listPeriodCloseAudit(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listPeriodCloseAudit(arg0);
        return from_candid_vec_n382(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listPeriodCloseAudit(arg0);
      return from_candid_vec_n382(this._uploadFile, this._downloadFile, result);
    }
  }
  async listPeriodCloses(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.listPeriodCloses(arg0, arg1, arg2);
        return from_candid_vec_n388(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listPeriodCloses(arg0, arg1, arg2);
      return from_candid_vec_n388(this._uploadFile, this._downloadFile, result);
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
        return from_candid_vec_n389(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listProjects();
      return from_candid_vec_n389(this._uploadFile, this._downloadFile, result);
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
        return from_candid_Result_25_n390(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listTimeBalanceCorrections(arg0);
      return from_candid_Result_25_n390(this._uploadFile, this._downloadFile, result);
    }
  }
  async listTimeEntries(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listTimeEntries(to_candid_TimeEntryFilter_n393(this._uploadFile, this._downloadFile, arg0));
        return from_candid_vec_n234(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listTimeEntries(to_candid_TimeEntryFilter_n393(this._uploadFile, this._downloadFile, arg0));
      return from_candid_vec_n234(this._uploadFile, this._downloadFile, result);
    }
  }
  async listVacationBalances(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.listVacationBalances(arg0);
        return from_candid_Result_24_n395(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.listVacationBalances(arg0);
      return from_candid_Result_24_n395(this._uploadFile, this._downloadFile, result);
    }
  }
  async manuallyTriggerStripeSync(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.manuallyTriggerStripeSync(arg0);
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.manuallyTriggerStripeSync(arg0);
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async markAllNotificationsRead() {
    if (this.processError) {
      try {
        const result = await this.actor.markAllNotificationsRead();
        return from_candid_variant_n345(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.markAllNotificationsRead();
      return from_candid_variant_n345(this._uploadFile, this._downloadFile, result);
    }
  }
  async markFakturiert(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.markFakturiert(arg0, arg1, arg2);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.markFakturiert(arg0, arg1, arg2);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async markNotificationRead(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.markNotificationRead(arg0);
        return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.markNotificationRead(arg0);
      return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
    }
  }
  async precheckPeriodClose(arg0, arg1, arg2, arg3) {
    if (this.processError) {
      try {
        const result = await this.actor.precheckPeriodClose(arg0, arg1, arg2, arg3);
        return from_candid_PrecheckResult_n398(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.precheckPeriodClose(arg0, arg1, arg2, arg3);
      return from_candid_PrecheckResult_n398(this._uploadFile, this._downloadFile, result);
    }
  }
  async purgeEmployee(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.purgeEmployee(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.purgeEmployee(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async reactivateStripeSubscription(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.reactivateStripeSubscription(arg0);
        return from_candid_Result_22_n52(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.reactivateStripeSubscription(arg0);
      return from_candid_Result_22_n52(this._uploadFile, this._downloadFile, result);
    }
  }
  async recordCycleSnapshot(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.recordCycleSnapshot(arg0, arg1);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.recordCycleSnapshot(arg0, arg1);
      return result;
    }
  }
  async recoverSubscriptionPlans() {
    if (this.processError) {
      try {
        const result = await this.actor.recoverSubscriptionPlans();
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.recoverSubscriptionPlans();
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async redeemInviteCode(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.redeemInviteCode(arg0);
        return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.redeemInviteCode(arg0);
      return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
    }
  }
  async registerCompany(arg0, arg1, arg2, arg3, arg4, arg5) {
    if (this.processError) {
      try {
        const result = await this.actor.registerCompany(arg0, arg1, arg2, arg3, to_candid_opt_n74(this._uploadFile, this._downloadFile, arg4), to_candid_opt_n74(this._uploadFile, this._downloadFile, arg5));
        return from_candid_Result_18_n289(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.registerCompany(arg0, arg1, arg2, arg3, to_candid_opt_n74(this._uploadFile, this._downloadFile, arg4), to_candid_opt_n74(this._uploadFile, this._downloadFile, arg5));
      return from_candid_Result_18_n289(this._uploadFile, this._downloadFile, result);
    }
  }
  async rejectAbsence(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.rejectAbsence(arg0, arg1);
        return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.rejectAbsence(arg0, arg1);
      return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
    }
  }
  async rejectExpense(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.rejectExpense(arg0, to_candid_opt_n74(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.rejectExpense(arg0, to_candid_opt_n74(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
    }
  }
  async relinkStripeCustomer(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.relinkStripeCustomer(arg0, arg1);
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.relinkStripeCustomer(arg0, arg1);
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async removeEmployeeFromProject(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.removeEmployeeFromProject(arg0, arg1);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.removeEmployeeFromProject(arg0, arg1);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async reopenPeriod(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.reopenPeriod(to_candid_ReopenPeriodInput_n402(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_23_n63(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.reopenPeriod(to_candid_ReopenPeriodInput_n402(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_23_n63(this._uploadFile, this._downloadFile, result);
    }
  }
  async reprocessStripeEvent(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.reprocessStripeEvent(arg0);
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.reprocessStripeEvent(arg0);
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async resetAbsenceToAusstehend(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.resetAbsenceToAusstehend(arg0, arg1);
        return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.resetAbsenceToAusstehend(arg0, arg1);
      return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
    }
  }
  async resetExpenseToAusstehend(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.resetExpenseToAusstehend(arg0, arg1);
        return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.resetExpenseToAusstehend(arg0, arg1);
      return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
    }
  }
  async resetTenantComplianceRule(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.resetTenantComplianceRule(arg0, arg1);
        return from_candid_variant_n404(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.resetTenantComplianceRule(arg0, arg1);
      return from_candid_variant_n404(this._uploadFile, this._downloadFile, result);
    }
  }
  async resolveFinding(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.resolveFinding(to_candid_ResolveFindingInput_n405(this._uploadFile, this._downloadFile, arg0));
        return from_candid_variant_n409(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.resolveFinding(to_candid_ResolveFindingInput_n405(this._uploadFile, this._downloadFile, arg0));
      return from_candid_variant_n409(this._uploadFile, this._downloadFile, result);
    }
  }
  async restoreDefaultPlansIfMissing() {
    if (this.processError) {
      try {
        const result = await this.actor.restoreDefaultPlansIfMissing();
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.restoreDefaultPlansIfMissing();
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async revokeInviteCode(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.revokeInviteCode(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.revokeInviteCode(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async runWeeklyComplianceCheck(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.runWeeklyComplianceCheck(arg0, arg1);
        return from_candid_variant_n410(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.runWeeklyComplianceCheck(arg0, arg1);
      return from_candid_variant_n410(this._uploadFile, this._downloadFile, result);
    }
  }
  async saveAndSendNotification(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    if (this.processError) {
      try {
        const result = await this.actor.saveAndSendNotification(arg0, arg1, to_candid_NotificationFormat_n151(this._uploadFile, this._downloadFile, arg2), to_candid_NotificationPriority_n153(this._uploadFile, this._downloadFile, arg3), arg4, to_candid_opt_n155(this._uploadFile, this._downloadFile, arg5), to_candid_NotificationTargetType_n156(this._uploadFile, this._downloadFile, arg6), arg7, arg8, arg9);
        return from_candid_variant_n158(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.saveAndSendNotification(arg0, arg1, to_candid_NotificationFormat_n151(this._uploadFile, this._downloadFile, arg2), to_candid_NotificationPriority_n153(this._uploadFile, this._downloadFile, arg3), arg4, to_candid_opt_n155(this._uploadFile, this._downloadFile, arg5), to_candid_NotificationTargetType_n156(this._uploadFile, this._downloadFile, arg6), arg7, arg8, arg9);
      return from_candid_variant_n158(this._uploadFile, this._downloadFile, result);
    }
  }
  async sendChatMessage(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.sendChatMessage(arg0, arg1);
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.sendChatMessage(arg0, arg1);
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async sendNotification(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.sendNotification(arg0);
        return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.sendNotification(arg0);
      return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
    }
  }
  async setCompanyActive(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setCompanyActive(arg0, arg1);
        return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setCompanyActive(arg0, arg1);
      return from_candid_variant_n28(this._uploadFile, this._downloadFile, result);
    }
  }
  async setCompanyBillingModel(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setCompanyBillingModel(arg0, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setCompanyBillingModel(arg0, to_candid_BillingModel_n10(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async setEmployeeActive(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setEmployeeActive(arg0, arg1);
        return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setEmployeeActive(arg0, arg1);
      return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
    }
  }
  async setFrontendCanisterId(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.setFrontendCanisterId(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setFrontendCanisterId(arg0);
      return result;
    }
  }
  async setFrontendCyclesManual(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.setFrontendCyclesManual(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setFrontendCyclesManual(arg0);
      return result;
    }
  }
  async setMyStandardarbeitszeiten(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.setMyStandardarbeitszeiten(to_candid_Standardarbeitszeiten_n411(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setMyStandardarbeitszeiten(to_candid_Standardarbeitszeiten_n411(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async setOpenAIConfig(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.setOpenAIConfig(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setOpenAIConfig(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async setPlatformAdminConfig(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.setPlatformAdminConfig(arg0);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setPlatformAdminConfig(arg0);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async setProjectMembers(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setProjectMembers(arg0, to_candid_vec_n416(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setProjectMembers(arg0, to_candid_vec_n416(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async setSnapshotInterval(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.setSnapshotInterval(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setSnapshotInterval(arg0);
      return result;
    }
  }
  async setStandardarbeitszeitenForEmployee(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.setStandardarbeitszeitenForEmployee(arg0, to_candid_Standardarbeitszeiten_n411(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setStandardarbeitszeitenForEmployee(arg0, to_candid_Standardarbeitszeiten_n411(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async setStripeConfig(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.setStripeConfig(arg0, arg1, arg2);
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setStripeConfig(arg0, arg1, arg2);
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async setUserActiveForCompany(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.setUserActiveForCompany(arg0, arg1, arg2);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setUserActiveForCompany(arg0, arg1, arg2);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async setUserRoleForCompany(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.setUserRoleForCompany(arg0, arg1, to_candid_Role_n112(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.setUserRoleForCompany(arg0, arg1, to_candid_Role_n112(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async startSnapshotTimer() {
    if (this.processError) {
      try {
        const result = await this.actor.startSnapshotTimer();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.startSnapshotTimer();
      return result;
    }
  }
  async syncStripeSubscription(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.syncStripeSubscription(arg0);
        return from_candid_Result_22_n52(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.syncStripeSubscription(arg0);
      return from_candid_Result_22_n52(this._uploadFile, this._downloadFile, result);
    }
  }
  async testOpenAIConnection() {
    if (this.processError) {
      try {
        const result = await this.actor.testOpenAIConnection();
        return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.testOpenAIConnection();
      return from_candid_Result_21_n12(this._uploadFile, this._downloadFile, result);
    }
  }
  async testStripeConnection() {
    if (this.processError) {
      try {
        const result = await this.actor.testStripeConnection();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.testStripeConnection();
      return result;
    }
  }
  async transformOpenAI(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.transformOpenAI(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.transformOpenAI(arg0);
      return result;
    }
  }
  async transformStripeResponse(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.transformStripeResponse(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.transformStripeResponse(arg0);
      return result;
    }
  }
  async updateAbsence(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateAbsence(arg0, to_candid_UpdateAbsenceInput_n419(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateAbsence(arg0, to_candid_UpdateAbsenceInput_n419(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_20_n14(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateAbsenceType(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateAbsenceType(arg0, to_candid_UpdateAbsenceTypeInput_n421(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_19_n86(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateAbsenceType(arg0, to_candid_UpdateAbsenceTypeInput_n421(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_19_n86(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateCompany(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCompany(to_candid_UpdateCompanyInput_n423(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_18_n289(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCompany(to_candid_UpdateCompanyInput_n423(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_18_n289(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateCompanySettings(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCompanySettings(arg0);
        return from_candid_Result_17_n244(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCompanySettings(arg0);
      return from_candid_Result_17_n244(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateComplianceProfile(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateComplianceProfile(to_candid_UpdateComplianceProfileInput_n425(this._uploadFile, this._downloadFile, arg0));
        return from_candid_variant_n427(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateComplianceProfile(to_candid_UpdateComplianceProfileInput_n425(this._uploadFile, this._downloadFile, arg0));
      return from_candid_variant_n427(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateCostSettings(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCostSettings(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCostSettings(arg0);
      return result;
    }
  }
  async updateCustomer(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateCustomer(arg0, to_candid_UpdateCustomerInput_n428(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_16_n101(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateCustomer(arg0, to_candid_UpdateCustomerInput_n428(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_16_n101(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateDefaultWorkHours(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateDefaultWorkHours(arg0);
        return from_candid_Result_15_n430(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateDefaultWorkHours(arg0);
      return from_candid_Result_15_n430(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateEmployee(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateEmployee(arg0, to_candid_UpdateEmployeeInput_n432(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateEmployee(arg0, to_candid_UpdateEmployeeInput_n432(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_14_n116(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateEmployment(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateEmployment(arg0, arg1, to_candid_UpdateEmploymentInput_n434(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_13_n128(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateEmployment(arg0, arg1, to_candid_UpdateEmploymentInput_n434(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_13_n128(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateExpense(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateExpense(arg0, to_candid_UpdateExpenseInput_n436(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateExpense(arg0, to_candid_UpdateExpenseInput_n436(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_12_n22(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateExpenseType(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateExpenseType(arg0, to_candid_UpdateExpenseTypeInput_n438(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_11_n138(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateExpenseType(arg0, to_candid_UpdateExpenseTypeInput_n438(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_11_n138(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateHoliday(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateHoliday(arg0, to_candid_UpdateHolidayInput_n440(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_10_n142(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateHoliday(arg0, to_candid_UpdateHolidayInput_n440(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_10_n142(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateInvoice(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateInvoice(arg0, to_candid_UpdateInvoiceInput_n442(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_9_n41(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateInvoice(arg0, to_candid_UpdateInvoiceInput_n442(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_9_n41(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateKnowledgeEntry(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateKnowledgeEntry(arg0, arg1);
        return from_candid_Result_8_n8(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateKnowledgeEntry(arg0, arg1);
      return from_candid_Result_8_n8(this._uploadFile, this._downloadFile, result);
    }
  }
  async updatePeriodCloseConfig(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updatePeriodCloseConfig(arg0, arg1);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updatePeriodCloseConfig(arg0, arg1);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateProject(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateProject(arg0, to_candid_UpdateProjectInput_n446(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_7_n186(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateProject(arg0, to_candid_UpdateProjectInput_n446(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_7_n186(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateServiceType(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateServiceType(arg0, to_candid_UpdateServiceTypeInput_n448(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_6_n197(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateServiceType(arg0, to_candid_UpdateServiceTypeInput_n448(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_6_n197(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateStripeSubscriptionQuantity(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateStripeSubscriptionQuantity(arg0, arg1);
        return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateStripeSubscriptionQuantity(arg0, arg1);
      return from_candid_Result_5_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateTenantComplianceRule(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateTenantComplianceRule(to_candid_UpdateTenantComplianceRuleInput_n450(this._uploadFile, this._downloadFile, arg0));
        return from_candid_variant_n404(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateTenantComplianceRule(to_candid_UpdateTenantComplianceRuleInput_n450(this._uploadFile, this._downloadFile, arg0));
      return from_candid_variant_n404(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateTimeBalanceCorrection(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateTimeBalanceCorrection(arg0, arg1, to_candid_UpdateTimeBalanceCorrectionInput_n452(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_4_n206(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateTimeBalanceCorrection(arg0, arg1, to_candid_UpdateTimeBalanceCorrectionInput_n452(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_4_n206(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateTimeEntry(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateTimeEntry(arg0, to_candid_UpdateTimeEntryInput_n454(this._uploadFile, this._downloadFile, arg1));
        return from_candid_Result_3_n213(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateTimeEntry(arg0, to_candid_UpdateTimeEntryInput_n454(this._uploadFile, this._downloadFile, arg1));
      return from_candid_Result_3_n213(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateUserNotificationSettings(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateUserNotificationSettings(arg0);
        return from_candid_Result_2_n340(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateUserNotificationSettings(arg0);
      return from_candid_Result_2_n340(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateVacationBalance(arg0, arg1, arg2) {
    if (this.processError) {
      try {
        const result = await this.actor.updateVacationBalance(arg0, arg1, to_candid_UpdateVacationBalanceInput_n456(this._uploadFile, this._downloadFile, arg2));
        return from_candid_Result_1_n219(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateVacationBalance(arg0, arg1, to_candid_UpdateVacationBalanceInput_n456(this._uploadFile, this._downloadFile, arg2));
      return from_candid_Result_1_n219(this._uploadFile, this._downloadFile, result);
    }
  }
  async upsertSubscriptionPlan(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.upsertSubscriptionPlan(to_candid_SubscriptionPlan_n458(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Result_n462(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.upsertSubscriptionPlan(to_candid_SubscriptionPlan_n458(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Result_n462(this._uploadFile, this._downloadFile, result);
    }
  }
}
function from_candid_AbsenceStatus_n18(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n19(_uploadFile, _downloadFile, value);
}
function from_candid_AbsenceTypeVisibility_n91(_uploadFile, _downloadFile, value) {
  return from_candid_record_n92(_uploadFile, _downloadFile, value);
}
function from_candid_AbsenceType_n88(_uploadFile, _downloadFile, value) {
  return from_candid_record_n89(_uploadFile, _downloadFile, value);
}
function from_candid_Absence_n16(_uploadFile, _downloadFile, value) {
  return from_candid_record_n17(_uploadFile, _downloadFile, value);
}
function from_candid_AuditEntityType_n368(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n369(_uploadFile, _downloadFile, value);
}
function from_candid_AuditEntry_n355(_uploadFile, _downloadFile, value) {
  return from_candid_record_n356(_uploadFile, _downloadFile, value);
}
function from_candid_AuditLogEntry_n364(_uploadFile, _downloadFile, value) {
  return from_candid_record_n365(_uploadFile, _downloadFile, value);
}
function from_candid_AuditOperation_n366(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n367(_uploadFile, _downloadFile, value);
}
function from_candid_BillingModel_n56(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n57(_uploadFile, _downloadFile, value);
}
function from_candid_CalendarData_n230(_uploadFile, _downloadFile, value) {
  return from_candid_record_n231(_uploadFile, _downloadFile, value);
}
function from_candid_CalendarVisibilityMode_n93(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n94(_uploadFile, _downloadFile, value);
}
function from_candid_CompanySubscription_n54(_uploadFile, _downloadFile, value) {
  return from_candid_record_n55(_uploadFile, _downloadFile, value);
}
function from_candid_Company_n291(_uploadFile, _downloadFile, value) {
  return from_candid_record_n292(_uploadFile, _downloadFile, value);
}
function from_candid_ComplianceCockpitRow_n248(_uploadFile, _downloadFile, value) {
  return from_candid_record_n249(_uploadFile, _downloadFile, value);
}
function from_candid_ComplianceFinding_n260(_uploadFile, _downloadFile, value) {
  return from_candid_record_n261(_uploadFile, _downloadFile, value);
}
function from_candid_CompliancePeriodeTyp_n265(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n266(_uploadFile, _downloadFile, value);
}
function from_candid_ComplianceResolutionType_n263(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n264(_uploadFile, _downloadFile, value);
}
function from_candid_ComplianceStatus_n250(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n251(_uploadFile, _downloadFile, value);
}
function from_candid_CostDashboardData_n270(_uploadFile, _downloadFile, value) {
  return from_candid_record_n271(_uploadFile, _downloadFile, value);
}
function from_candid_Customer_n103(_uploadFile, _downloadFile, value) {
  return from_candid_record_n104(_uploadFile, _downloadFile, value);
}
function from_candid_CycleStatus_n272(_uploadFile, _downloadFile, value) {
  return from_candid_record_n273(_uploadFile, _downloadFile, value);
}
function from_candid_EmployeeComplianceProfile_n268(_uploadFile, _downloadFile, value) {
  return from_candid_record_n269(_uploadFile, _downloadFile, value);
}
function from_candid_Employee_n118(_uploadFile, _downloadFile, value) {
  return from_candid_record_n119(_uploadFile, _downloadFile, value);
}
function from_candid_EmploymentType_n122(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n123(_uploadFile, _downloadFile, value);
}
function from_candid_Employment_n130(_uploadFile, _downloadFile, value) {
  return from_candid_record_n131(_uploadFile, _downloadFile, value);
}
function from_candid_Erfassungsart_n193(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n194(_uploadFile, _downloadFile, value);
}
function from_candid_ExpenseStatus_n26(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n27(_uploadFile, _downloadFile, value);
}
function from_candid_Expense_n24(_uploadFile, _downloadFile, value) {
  return from_candid_record_n25(_uploadFile, _downloadFile, value);
}
function from_candid_FeiertagsberechnungsartType_n132(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n133(_uploadFile, _downloadFile, value);
}
function from_candid_InvoicePositionTyp_n50(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n51(_uploadFile, _downloadFile, value);
}
function from_candid_InvoicePosition_n48(_uploadFile, _downloadFile, value) {
  return from_candid_record_n49(_uploadFile, _downloadFile, value);
}
function from_candid_InvoiceStatus_n45(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n46(_uploadFile, _downloadFile, value);
}
function from_candid_InvoiceTemplate_n173(_uploadFile, _downloadFile, value) {
  return from_candid_record_n174(_uploadFile, _downloadFile, value);
}
function from_candid_Invoice_n43(_uploadFile, _downloadFile, value) {
  return from_candid_record_n44(_uploadFile, _downloadFile, value);
}
function from_candid_KundeZeiterfassungsart_n108(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n109(_uploadFile, _downloadFile, value);
}
function from_candid_MaskedCalendarAbsence_n241(_uploadFile, _downloadFile, value) {
  return from_candid_record_n242(_uploadFile, _downloadFile, value);
}
function from_candid_MonthlyBillingEntry_n35(_uploadFile, _downloadFile, value) {
  return from_candid_record_n36(_uploadFile, _downloadFile, value);
}
function from_candid_MonthlyCloseRow_n286(_uploadFile, _downloadFile, value) {
  return from_candid_record_n287(_uploadFile, _downloadFile, value);
}
function from_candid_NotificationFormat_n163(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n164(_uploadFile, _downloadFile, value);
}
function from_candid_NotificationPriority_n167(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n168(_uploadFile, _downloadFile, value);
}
function from_candid_NotificationStatus_n161(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n162(_uploadFile, _downloadFile, value);
}
function from_candid_NotificationTargetType_n165(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n166(_uploadFile, _downloadFile, value);
}
function from_candid_Notification_n159(_uploadFile, _downloadFile, value) {
  return from_candid_record_n160(_uploadFile, _downloadFile, value);
}
function from_candid_PauseOverride_n178(_uploadFile, _downloadFile, value) {
  return from_candid_record_n179(_uploadFile, _downloadFile, value);
}
function from_candid_PaymentProvider_n228(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n229(_uploadFile, _downloadFile, value);
}
function from_candid_PeriodCloseAction_n385(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n386(_uploadFile, _downloadFile, value);
}
function from_candid_PeriodCloseAuditEntry_n383(_uploadFile, _downloadFile, value) {
  return from_candid_record_n384(_uploadFile, _downloadFile, value);
}
function from_candid_PeriodCloseStatus_n67(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n68(_uploadFile, _downloadFile, value);
}
function from_candid_PeriodClose_n65(_uploadFile, _downloadFile, value) {
  return from_candid_record_n66(_uploadFile, _downloadFile, value);
}
function from_candid_PeriodType_n69(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n70(_uploadFile, _downloadFile, value);
}
function from_candid_PlatformAdminUserEntry_n343(_uploadFile, _downloadFile, value) {
  return from_candid_record_n344(_uploadFile, _downloadFile, value);
}
function from_candid_PrecheckResult_n398(_uploadFile, _downloadFile, value) {
  return from_candid_record_n399(_uploadFile, _downloadFile, value);
}
function from_candid_PrecheckVerdict_n400(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n401(_uploadFile, _downloadFile, value);
}
function from_candid_ProjectMemberAssignment_n311(_uploadFile, _downloadFile, value) {
  return from_candid_record_n312(_uploadFile, _downloadFile, value);
}
function from_candid_ProjectStatus_n190(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n191(_uploadFile, _downloadFile, value);
}
function from_candid_Project_n188(_uploadFile, _downloadFile, value) {
  return from_candid_record_n189(_uploadFile, _downloadFile, value);
}
function from_candid_Rechnungsadresse_n106(_uploadFile, _downloadFile, value) {
  return from_candid_record_n107(_uploadFile, _downloadFile, value);
}
function from_candid_ReportData_n315(_uploadFile, _downloadFile, value) {
  return from_candid_record_n316(_uploadFile, _downloadFile, value);
}
function from_candid_Result_10_n142(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n143(_uploadFile, _downloadFile, value);
}
function from_candid_Result_11_n138(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n139(_uploadFile, _downloadFile, value);
}
function from_candid_Result_12_n22(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n23(_uploadFile, _downloadFile, value);
}
function from_candid_Result_13_n128(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n129(_uploadFile, _downloadFile, value);
}
function from_candid_Result_14_n116(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n117(_uploadFile, _downloadFile, value);
}
function from_candid_Result_15_n430(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n431(_uploadFile, _downloadFile, value);
}
function from_candid_Result_16_n101(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n102(_uploadFile, _downloadFile, value);
}
function from_candid_Result_17_n244(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n245(_uploadFile, _downloadFile, value);
}
function from_candid_Result_18_n289(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n290(_uploadFile, _downloadFile, value);
}
function from_candid_Result_19_n86(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n87(_uploadFile, _downloadFile, value);
}
function from_candid_Result_1_n219(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n220(_uploadFile, _downloadFile, value);
}
function from_candid_Result_20_n14(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n15(_uploadFile, _downloadFile, value);
}
function from_candid_Result_21_n12(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n13(_uploadFile, _downloadFile, value);
}
function from_candid_Result_22_n52(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n53(_uploadFile, _downloadFile, value);
}
function from_candid_Result_23_n63(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n64(_uploadFile, _downloadFile, value);
}
function from_candid_Result_24_n395(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n396(_uploadFile, _downloadFile, value);
}
function from_candid_Result_25_n390(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n391(_uploadFile, _downloadFile, value);
}
function from_candid_Result_26_n372(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n373(_uploadFile, _downloadFile, value);
}
function from_candid_Result_27_n334(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n335(_uploadFile, _downloadFile, value);
}
function from_candid_Result_28_n331(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n332(_uploadFile, _downloadFile, value);
}
function from_candid_Result_29_n329(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n330(_uploadFile, _downloadFile, value);
}
function from_candid_Result_2_n340(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n341(_uploadFile, _downloadFile, value);
}
function from_candid_Result_30_n293(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n294(_uploadFile, _downloadFile, value);
}
function from_candid_Result_31_n308(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n309(_uploadFile, _downloadFile, value);
}
function from_candid_Result_32_n306(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n307(_uploadFile, _downloadFile, value);
}
function from_candid_Result_33_n304(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n305(_uploadFile, _downloadFile, value);
}
function from_candid_Result_34_n282(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n283(_uploadFile, _downloadFile, value);
}
function from_candid_Result_35_n279(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n280(_uploadFile, _downloadFile, value);
}
function from_candid_Result_36_n276(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n277(_uploadFile, _downloadFile, value);
}
function from_candid_Result_37_n274(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n275(_uploadFile, _downloadFile, value);
}
function from_candid_Result_38_n237(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n238(_uploadFile, _downloadFile, value);
}
function from_candid_Result_39_n223(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n224(_uploadFile, _downloadFile, value);
}
function from_candid_Result_3_n213(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n214(_uploadFile, _downloadFile, value);
}
function from_candid_Result_40_n201(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n202(_uploadFile, _downloadFile, value);
}
function from_candid_Result_41_n199(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n200(_uploadFile, _downloadFile, value);
}
function from_candid_Result_45_n171(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n172(_uploadFile, _downloadFile, value);
}
function from_candid_Result_46_n76(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n77(_uploadFile, _downloadFile, value);
}
function from_candid_Result_47_n58(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n59(_uploadFile, _downloadFile, value);
}
function from_candid_Result_48_n39(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n40(_uploadFile, _downloadFile, value);
}
function from_candid_Result_49_n32(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n33(_uploadFile, _downloadFile, value);
}
function from_candid_Result_4_n206(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n207(_uploadFile, _downloadFile, value);
}
function from_candid_Result_5_n29(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n28(_uploadFile, _downloadFile, value);
}
function from_candid_Result_6_n197(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n198(_uploadFile, _downloadFile, value);
}
function from_candid_Result_7_n186(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n187(_uploadFile, _downloadFile, value);
}
function from_candid_Result_8_n8(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n9(_uploadFile, _downloadFile, value);
}
function from_candid_Result_9_n41(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n42(_uploadFile, _downloadFile, value);
}
function from_candid_Result_n462(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n463(_uploadFile, _downloadFile, value);
}
function from_candid_Role_n120(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n121(_uploadFile, _downloadFile, value);
}
function from_candid_StandardTimeBlock_n298(_uploadFile, _downloadFile, value) {
  return from_candid_record_n299(_uploadFile, _downloadFile, value);
}
function from_candid_Standardarbeitszeiten_n295(_uploadFile, _downloadFile, value) {
  return from_candid_record_n296(_uploadFile, _downloadFile, value);
}
function from_candid_StripeEventStatus_n321(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n322(_uploadFile, _downloadFile, value);
}
function from_candid_StripeEvent_n319(_uploadFile, _downloadFile, value) {
  return from_candid_record_n320(_uploadFile, _downloadFile, value);
}
function from_candid_StripeInvoice_n324(_uploadFile, _downloadFile, value) {
  return from_candid_record_n325(_uploadFile, _downloadFile, value);
}
function from_candid_SubscriptionPlan_n226(_uploadFile, _downloadFile, value) {
  return from_candid_record_n227(_uploadFile, _downloadFile, value);
}
function from_candid_TenantComplianceRule_n327(_uploadFile, _downloadFile, value) {
  return from_candid_record_n328(_uploadFile, _downloadFile, value);
}
function from_candid_TimeBalanceCorrection_n208(_uploadFile, _downloadFile, value) {
  return from_candid_record_n209(_uploadFile, _downloadFile, value);
}
function from_candid_TimeEntry_n215(_uploadFile, _downloadFile, value) {
  return from_candid_record_n216(_uploadFile, _downloadFile, value);
}
function from_candid_UnbilledTimeEntry_n338(_uploadFile, _downloadFile, value) {
  return from_candid_record_n339(_uploadFile, _downloadFile, value);
}
function from_candid_UserNotification_n380(_uploadFile, _downloadFile, value) {
  return from_candid_record_n381(_uploadFile, _downloadFile, value);
}
function from_candid_UserRole_n235(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n236(_uploadFile, _downloadFile, value);
}
function from_candid_VacationBalance_n221(_uploadFile, _downloadFile, value) {
  return from_candid_record_n222(_uploadFile, _downloadFile, value);
}
function from_candid__ImmutableObjectStorageRefillResult_n4(_uploadFile, _downloadFile, value) {
  return from_candid_record_n5(_uploadFile, _downloadFile, value);
}
function from_candid_opt_n105(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_Rechnungsadresse_n106(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n192(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_Erfassungsart_n193(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n20(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n21(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n246(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_SubscriptionPlan_n226(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n262(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_ComplianceResolutionType_n263(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n267(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_EmployeeComplianceProfile_n268(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n278(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_Employment_n130(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n281(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_InvoiceTemplate_n173(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n288(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n300(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n302(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_PeriodClose_n65(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n303(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n37(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n370(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n38(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n387(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n6(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n7(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n71(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n72(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n73(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n90(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_AbsenceTypeVisibility_n91(_uploadFile, _downloadFile, value[0]);
}
function from_candid_record_n104(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    rechnungsadresse: record_opt_to_undefined(from_candid_opt_n105(_uploadFile, _downloadFile, value.rechnungsadresse)),
    contact: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.contact)),
    aktiv: value.aktiv,
    name: value.name,
    zeiterfassungsart: from_candid_KundeZeiterfassungsart_n108(_uploadFile, _downloadFile, value.zeiterfassungsart),
    kundennummer: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kundennummer)),
    notes: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.notes)),
    beschreibung: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.beschreibung)),
    waehrung: value.waehrung,
    companyId: value.companyId
  };
}
function from_candid_record_n107(_uploadFile, _downloadFile, value) {
  return {
    ort: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.ort)),
    plz: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.plz)),
    zusatz1: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.zusatz1)),
    zusatz2: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.zusatz2)),
    postfach: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.postfach)),
    land: value.land,
    strasse: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.strasse))
  };
}
function from_candid_record_n119(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    ort: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.ort)),
    plz: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.plz)),
    weeklyHoursTarget: value.weeklyHoursTarget,
    active: value.active,
    postfach: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.postfach)),
    activatedAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.activatedAt)),
    land: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.land)),
    role: from_candid_Role_n120(_uploadFile, _downloadFile, value.role),
    deactivatedAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.deactivatedAt)),
    email: value.email,
    geburtsdatum: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.geburtsdatum)),
    employmentType: from_candid_EmploymentType_n122(_uploadFile, _downloadFile, value.employmentType),
    adresseZusatz1: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.adresseZusatz1)),
    adresseZusatz2: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.adresseZusatz2)),
    lastName: value.lastName,
    principalId: record_opt_to_undefined(from_candid_opt_n20(_uploadFile, _downloadFile, value.principalId)),
    strasse: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.strasse)),
    startDate: value.startDate,
    companyId: value.companyId,
    firstName: value.firstName
  };
}
function from_candid_record_n131(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    bis: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.bis)),
    von: value.von,
    pensum: value.pensum,
    feiertagsberechnungsart: from_candid_FeiertagsberechnungsartType_n132(_uploadFile, _downloadFile, value.feiertagsberechnungsart),
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
function from_candid_record_n160(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_NotificationStatus_n161(_uploadFile, _downloadFile, value.status),
    title: value.title,
    validFrom: value.validFrom,
    createdAt: value.createdAt,
    senderDisplayName: value.senderDisplayName,
    messageFormat: from_candid_NotificationFormat_n163(_uploadFile, _downloadFile, value.messageFormat),
    messageBody: value.messageBody,
    targetRoleIds: value.targetRoleIds,
    targetUserIds: value.targetUserIds,
    targetType: from_candid_NotificationTargetType_n165(_uploadFile, _downloadFile, value.targetType),
    priority: from_candid_NotificationPriority_n167(_uploadFile, _downloadFile, value.priority),
    targetTenantIds: value.targetTenantIds,
    senderUserId: value.senderUserId,
    validUntil: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.validUntil))
  };
}
function from_candid_record_n17(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_AbsenceStatus_n18(_uploadFile, _downloadFile, value.status),
    absenceTypeId: value.absenceTypeId,
    dateTo: value.dateTo,
    ganztaetig: value.ganztaetig,
    approvedBy: record_opt_to_undefined(from_candid_opt_n20(_uploadFile, _downloadFile, value.approvedBy)),
    createdAt: value.createdAt,
    description: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.description)),
    employeeId: value.employeeId,
    resetReason: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.resetReason)),
    rejectionComment: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.rejectionComment)),
    dateFrom: value.dateFrom,
    dauer: value.dauer,
    companyId: value.companyId
  };
}
function from_candid_record_n174(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    qrIban: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.qrIban)),
    fusszeileLayout: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.fusszeileLayout)),
    qrKontoinhaberAdresse: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.qrKontoinhaberAdresse)),
    bank: value.bank,
    iban: value.iban,
    kopfzeileLayout: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kopfzeileLayout)),
    createdAt: value.createdAt,
    fusstext: value.fusstext,
    mwstNummer: value.mwstNummer,
    qrKontoinhaber: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.qrKontoinhaber)),
    kopfzeileLogoQuelle: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kopfzeileLogoQuelle)),
    qrReferenztyp: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.qrReferenztyp)),
    kopfzeileBildPosition: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kopfzeileBildPosition)),
    kopfzeileAdressePosition: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kopfzeileAdressePosition)),
    zahlungszielTage: value.zahlungszielTage,
    kopfzeileBildUrl: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kopfzeileBildUrl)),
    qrWaehrung: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.qrWaehrung)),
    spalten: value.spalten,
    qrReferenzPraefix: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.qrReferenzPraefix)),
    fusszeilePosition: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.fusszeilePosition)),
    mwstSatz: value.mwstSatz,
    kopfzeileLogoGroesse: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kopfzeileLogoGroesse)),
    kopftext: value.kopftext,
    kundenadresseAbstandNach: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.kundenadresseAbstandNach)),
    kundenadresseAbstandOben: record_opt_to_undefined(from_candid_opt_n37(_uploadFile, _downloadFile, value.kundenadresseAbstandOben)),
    kundenadresseEinrueckungZeichen: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.kundenadresseEinrueckungZeichen)),
    fusszeileBildPosition: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.fusszeileBildPosition)),
    kopfzeileAdresse: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kopfzeileAdresse)),
    kopfzeilePosition: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kopfzeilePosition)),
    praefix: value.praefix,
    naechsteNummer: value.naechsteNummer,
    qrAktivStandard: value.qrAktivStandard,
    farbe: value.farbe,
    fusszeileBildUrl: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.fusszeileBildUrl)),
    kundenadresseLinks: record_opt_to_undefined(from_candid_opt_n6(_uploadFile, _downloadFile, value.kundenadresseLinks)),
    companyId: value.companyId
  };
}
function from_candid_record_n179(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    action: value.action,
    userId: value.userId,
    date: value.date,
    createdByUserId: value.createdByUserId,
    createdAt: value.createdAt,
    gapEnd: value.gapEnd,
    updatedAt: value.updatedAt,
    gapStart: value.gapStart,
    reason: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.reason)),
    companyId: value.companyId
  };
}
function from_candid_record_n189(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_ProjectStatus_n190(_uploadFile, _downloadFile, value.status),
    erfassungsart: record_opt_to_undefined(from_candid_opt_n192(_uploadFile, _downloadFile, value.erfassungsart)),
    active: value.active,
    code: value.code,
    billableRate: value.billableRate,
    name: value.name,
    customerId: value.customerId,
    kurzbezeichnung: value.kurzbezeichnung,
    kostendachCHF: record_opt_to_undefined(from_candid_opt_n37(_uploadFile, _downloadFile, value.kostendachCHF)),
    projektleiter: record_opt_to_undefined(from_candid_opt_n71(_uploadFile, _downloadFile, value.projektleiter)),
    companyId: value.companyId
  };
}
function from_candid_record_n209(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    typ: from_candid_variant_n210(_uploadFile, _downloadFile, value.typ),
    ueberzeit: value.ueberzeit,
    bemerkung: value.bemerkung,
    employeeId: value.employeeId,
    wirkungsdatum: value.wirkungsdatum,
    dauer: value.dauer,
    companyId: value.companyId
  };
}
function from_candid_record_n216(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    bis: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.bis)),
    von: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.von)),
    hours: value.hours,
    fakturiertInRechnungId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.fakturiertInRechnungId)),
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
function from_candid_record_n222(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    verfallsdatum: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.verfallsdatum)),
    employeeId: value.employeeId,
    kalenderjahr: value.kalenderjahr,
    dauer: value.dauer,
    companyId: value.companyId
  };
}
function from_candid_record_n227(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    features: value.features,
    requiresPayment: value.requiresPayment,
    sortOrder: value.sortOrder,
    name: value.name,
    stripeLookupKey: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeLookupKey)),
    description: value.description,
    isRecommended: value.isRecommended,
    isActive: value.isActive,
    stripeProductId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeProductId)),
    updatedAt: value.updatedAt,
    additionalFeatures: value.additionalFeatures,
    pricePerYearCHF: value.pricePerYearCHF,
    stripePriceId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripePriceId)),
    pricePerMonthCHF: value.pricePerMonthCHF,
    stripeMode: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeMode)),
    stripePriceIdYearly: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripePriceIdYearly)),
    minActiveDaysPerMonth: value.minActiveDaysPerMonth,
    maxEmployees: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.maxEmployees)),
    paymentProvider: from_candid_PaymentProvider_n228(_uploadFile, _downloadFile, value.paymentProvider)
  };
}
function from_candid_record_n231(_uploadFile, _downloadFile, value) {
  return {
    absences: from_candid_vec_n232(_uploadFile, _downloadFile, value.absences),
    expenses: from_candid_vec_n233(_uploadFile, _downloadFile, value.expenses),
    timeEntries: from_candid_vec_n234(_uploadFile, _downloadFile, value.timeEntries)
  };
}
function from_candid_record_n239(_uploadFile, _downloadFile, value) {
  return {
    nextDueDate: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.nextDueDate)),
    billingModel: from_candid_BillingModel_n56(_uploadFile, _downloadFile, value.billingModel),
    subscriptionStartDate: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.subscriptionStartDate))
  };
}
function from_candid_record_n242(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: value.status,
    displayTitle: value.displayTitle,
    employeeName: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.employeeName)),
    visibilityMode: value.visibilityMode,
    displayColor: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.displayColor)),
    toDate: value.toDate,
    employeeId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.employeeId)),
    isOwnEntry: value.isOwnEntry,
    fromDate: value.fromDate
  };
}
function from_candid_record_n249(_uploadFile, _downloadFile, value) {
  return {
    vertraglicheUeberstundenH: value.vertraglicheUeberstundenH,
    offeneMassnahmen: value.offeneMassnahmen,
    employee: value.employee,
    ferienstatus: value.ferienstatus,
    pausenVerstoesse: value.pausenVerstoesse,
    gesamtstatus: from_candid_ComplianceStatus_n250(_uploadFile, _downloadFile, value.gesamtstatus),
    gesetzlicheUeberzeitH: value.gesetzlicheUeberzeitH,
    ruhezeitVerstoesse: value.ruhezeitVerstoesse
  };
}
function from_candid_record_n25(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_ExpenseStatus_n26(_uploadFile, _downloadFile, value.status),
    fakturiertInRechnungId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.fakturiertInRechnungId)),
    date: value.date,
    description: value.description,
    employeeId: value.employeeId,
    projektId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.projektId)),
    resetReason: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.resetReason)),
    billableCHF: value.billableCHF,
    kundeId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.kundeId)),
    reimbursementCHF: value.reimbursementCHF,
    expenseTypeId: value.expenseTypeId,
    receiptBlobId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.receiptBlobId)),
    companyId: value.companyId
  };
}
function from_candid_record_n261(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_ComplianceStatus_n250(_uploadFile, _downloadFile, value.status),
    istWert: value.istWert,
    resolutionType: record_opt_to_undefined(from_candid_opt_n262(_uploadFile, _downloadFile, value.resolutionType)),
    periodeKey: value.periodeKey,
    periodeTyp: from_candid_CompliancePeriodeTyp_n265(_uploadFile, _downloadFile, value.periodeTyp),
    rechtlicheReferenz: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.rechtlicheReferenz)),
    auditHash: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.auditHash)),
    createdAt: value.createdAt,
    sollWert: value.sollWert,
    resolutionReason: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.resolutionReason)),
    sourceEntryIds: value.sourceEntryIds,
    meldung: value.meldung,
    employeeId: value.employeeId,
    resolvedAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.resolvedAt)),
    resolvedBy: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.resolvedBy)),
    ruleCode: value.ruleCode,
    einheit: value.einheit,
    companyId: value.companyId
  };
}
function from_candid_record_n269(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    aktiv: value.aktiv,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    employeeId: value.employeeId,
    ausnahmeprofil: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.ausnahmeprofil)),
    erfassungsModus: value.erfassungsModus,
    vertraglicheZusatzferienTage: value.vertraglicheZusatzferienTage,
    gesetzlicheWochenhochstarbeitszeit: value.gesetzlicheWochenhochstarbeitszeit,
    gesetzlicherFerienanspruchWochen: value.gesetzlicherFerienanspruchWochen,
    companyId: value.companyId
  };
}
function from_candid_record_n271(_uploadFile, _downloadFile, value) {
  return {
    dataSource: value.dataSource,
    frontendCanisterId: value.frontendCanisterId,
    snapshots: value.snapshots,
    settings: value.settings,
    backendCanisterId: value.backendCanisterId,
    backendCyclesBalance: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.backendCyclesBalance))
  };
}
function from_candid_record_n273(_uploadFile, _downloadFile, value) {
  return {
    dataSource: value.dataSource,
    frontendCycles: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.frontendCycles)),
    backendCycles: value.backendCycles
  };
}
function from_candid_record_n287(_uploadFile, _downloadFile, value) {
  return {
    status: from_candid_PeriodCloseStatus_n67(_uploadFile, _downloadFile, value.status),
    month: value.month,
    expenseCount: value.expenseCount,
    vacationDays: value.vacationDays,
    year: value.year,
    actualMinutes: value.actualMinutes,
    openEntryCount: value.openEntryCount,
    closeId: record_opt_to_undefined(from_candid_opt_n288(_uploadFile, _downloadFile, value.closeId)),
    targetMinutes: value.targetMinutes,
    employeeId: value.employeeId,
    absenceCount: value.absenceCount,
    lastName: value.lastName,
    complianceStatus: value.complianceStatus,
    firstName: value.firstName
  };
}
function from_candid_record_n292(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    taxId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.taxId)),
    name: value.name,
    createdAt: value.createdAt,
    mwstNummer: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.mwstNummer)),
    kontoInhaber: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kontoInhaber)),
    isActive: value.isActive,
    logoUrl: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.logoUrl)),
    address: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.address)),
    kontoAdresse: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.kontoAdresse))
  };
}
function from_candid_record_n296(_uploadFile, _downloadFile, value) {
  return {
    tuesday: from_candid_vec_n297(_uploadFile, _downloadFile, value.tuesday),
    wednesday: from_candid_vec_n297(_uploadFile, _downloadFile, value.wednesday),
    saturday: from_candid_vec_n297(_uploadFile, _downloadFile, value.saturday),
    thursday: from_candid_vec_n297(_uploadFile, _downloadFile, value.thursday),
    sunday: from_candid_vec_n297(_uploadFile, _downloadFile, value.sunday),
    friday: from_candid_vec_n297(_uploadFile, _downloadFile, value.friday),
    monday: from_candid_vec_n297(_uploadFile, _downloadFile, value.monday)
  };
}
function from_candid_record_n299(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis,
    von: value.von,
    leistungsartId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.leistungsartId)),
    projektId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.projektId))
  };
}
function from_candid_record_n312(_uploadFile, _downloadFile, value) {
  return {
    stundensatz: value.stundensatz,
    employeeId: value.employeeId,
    kostendachCHF: record_opt_to_undefined(from_candid_opt_n37(_uploadFile, _downloadFile, value.kostendachCHF)),
    serviceTypeId: value.serviceTypeId
  };
}
function from_candid_record_n316(_uploadFile, _downloadFile, value) {
  return {
    expenses: value.expenses,
    entries: from_candid_vec_n234(_uploadFile, _downloadFile, value.entries),
    billableHours: value.billableHours,
    expenseItems: from_candid_vec_n233(_uploadFile, _downloadFile, value.expenseItems)
  };
}
function from_candid_record_n320(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    stripeEventId: value.stripeEventId,
    processingStatus: from_candid_StripeEventStatus_n321(_uploadFile, _downloadFile, value.processingStatus),
    stripeSubscriptionId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeSubscriptionId)),
    errorMessage: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.errorMessage)),
    tenantId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.tenantId)),
    processedAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.processedAt)),
    subscriptionId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.subscriptionId)),
    receivedAt: value.receivedAt,
    stripeCustomerId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeCustomerId)),
    rawPayload: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.rawPayload)),
    eventType: value.eventType
  };
}
function from_candid_record_n325(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: value.status,
    stripeSubscriptionId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeSubscriptionId)),
    dueDate: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.dueDate)),
    stripeInvoiceId: value.stripeInvoiceId,
    amountPaid: value.amountPaid,
    invoicePdfUrl: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.invoicePdfUrl)),
    invoiceNumber: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.invoiceNumber)),
    periodEnd: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.periodEnd)),
    stripeCustomerId: value.stripeCustomerId,
    currency: value.currency,
    amountDue: value.amountDue,
    periodStart: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.periodStart)),
    issuedAt: value.issuedAt,
    paidAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.paidAt)),
    hostedInvoiceUrl: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.hostedInvoiceUrl)),
    companyId: value.companyId
  };
}
function from_candid_record_n328(_uploadFile, _downloadFile, value) {
  return {
    modifiedAt: value.modifiedAt,
    modifiedBy: value.modifiedBy,
    isActive: value.isActive,
    tenantId: value.tenantId,
    isCustomized: value.isCustomized,
    customValue: record_opt_to_undefined(from_candid_opt_n37(_uploadFile, _downloadFile, value.customValue)),
    ruleCode: value.ruleCode
  };
}
function from_candid_record_n333(_uploadFile, _downloadFile, value) {
  return {
    spesen: from_candid_vec_n233(_uploadFile, _downloadFile, value.spesen),
    zeiteintraege: from_candid_vec_n234(_uploadFile, _downloadFile, value.zeiteintraege)
  };
}
function from_candid_record_n336(_uploadFile, _downloadFile, value) {
  return {
    spesen: from_candid_vec_n233(_uploadFile, _downloadFile, value.spesen),
    zeiteintraege: from_candid_vec_n337(_uploadFile, _downloadFile, value.zeiteintraege)
  };
}
function from_candid_record_n339(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    bis: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.bis)),
    von: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.von)),
    hours: value.hours,
    date: value.date,
    stundensatz: value.stundensatz,
    createdAt: value.createdAt,
    description: value.description,
    totalCHF: value.totalCHF,
    employeeId: value.employeeId,
    billable: value.billable,
    projectId: value.projectId,
    serviceTypeId: value.serviceTypeId,
    companyId: value.companyId
  };
}
function from_candid_record_n344(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    activatedAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.activatedAt)),
    role: from_candid_Role_n120(_uploadFile, _downloadFile, value.role),
    deactivatedAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.deactivatedAt)),
    isActive: value.isActive,
    email: value.email,
    lastName: value.lastName,
    firstName: value.firstName
  };
}
function from_candid_record_n352(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    name: value.name,
    createdAt: value.createdAt,
    inactiveEmployeeCount: value.inactiveEmployeeCount,
    isActive: value.isActive,
    address: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.address)),
    activeEmployeeCount: value.activeEmployeeCount
  };
}
function from_candid_record_n356(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    oldStatus: value.oldStatus,
    action: value.action,
    changedBy: value.changedBy,
    timestamp: value.timestamp,
    targetType: value.targetType,
    newStatus: value.newStatus,
    targetId: value.targetId,
    previousApprovedBy: record_opt_to_undefined(from_candid_opt_n20(_uploadFile, _downloadFile, value.previousApprovedBy)),
    reason: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.reason))
  };
}
function from_candid_record_n36(_uploadFile, _downloadFile, value) {
  return {
    month: value.month,
    activeUserCount: value.activeUserCount,
    planId: value.planId,
    billableUserCount: value.billableUserCount,
    billingModel: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.billingModel)),
    year: value.year,
    creditAmount: record_opt_to_undefined(from_candid_opt_n37(_uploadFile, _downloadFile, value.creditAmount)),
    totalCHF: value.totalCHF,
    companyName: value.companyName,
    nextDueDateTimestamp: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.nextDueDateTimestamp)),
    planName: value.planName,
    proRataAmount: record_opt_to_undefined(from_candid_opt_n37(_uploadFile, _downloadFile, value.proRataAmount)),
    proRataNote: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.proRataNote)),
    companyId: value.companyId
  };
}
function from_candid_record_n365(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    beforeState: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.beforeState)),
    actorName: value.actorName,
    entityId: value.entityId,
    operation: from_candid_AuditOperation_n366(_uploadFile, _downloadFile, value.operation),
    timestamp: value.timestamp,
    actorPrincipal: value.actorPrincipal,
    entityType: from_candid_AuditEntityType_n368(_uploadFile, _downloadFile, value.entityType),
    fieldChanges: record_opt_to_undefined(from_candid_opt_n370(_uploadFile, _downloadFile, value.fieldChanges)),
    afterState: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.afterState)),
    companyId: value.companyId
  };
}
function from_candid_record_n381(_uploadFile, _downloadFile, value) {
  return {
    isDeleted: value.isDeleted,
    notification: from_candid_Notification_n159(_uploadFile, _downloadFile, value.notification),
    isRead: value.isRead,
    readAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.readAt))
  };
}
function from_candid_record_n384(_uploadFile, _downloadFile, value) {
  return {
    oldStatus: from_candid_PeriodCloseStatus_n67(_uploadFile, _downloadFile, value.oldStatus),
    action: from_candid_PeriodCloseAction_n385(_uploadFile, _downloadFile, value.action),
    performedByUserId: value.performedByUserId,
    auditId: value.auditId,
    tenantId: value.tenantId,
    periodEnd: value.periodEnd,
    warnings: record_opt_to_undefined(from_candid_opt_n387(_uploadFile, _downloadFile, value.warnings)),
    employeeId: record_opt_to_undefined(from_candid_opt_n71(_uploadFile, _downloadFile, value.employeeId)),
    performedAt: value.performedAt,
    periodStart: value.periodStart,
    newStatus: from_candid_PeriodCloseStatus_n67(_uploadFile, _downloadFile, value.newStatus),
    affectedRecordCounts: record_opt_to_undefined(from_candid_opt_n73(_uploadFile, _downloadFile, value.affectedRecordCounts)),
    reason: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.reason))
  };
}
function from_candid_record_n399(_uploadFile, _downloadFile, value) {
  return {
    hasOpenEntries: value.hasOpenEntries,
    blockers: value.blockers,
    verdict: from_candid_PrecheckVerdict_n400(_uploadFile, _downloadFile, value.verdict),
    warnings: value.warnings,
    hasOpenAbsences: value.hasOpenAbsences,
    missingDays: value.missingDays,
    canClose: value.canClose,
    hasComplianceViolations: value.hasComplianceViolations,
    hasOpenExpenses: value.hasOpenExpenses
  };
}
function from_candid_record_n44(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    status: from_candid_InvoiceStatus_n45(_uploadFile, _downloadFile, value.status),
    rechnungsnummer: value.rechnungsnummer,
    total: value.total,
    createdAt: value.createdAt,
    createdBy: value.createdBy,
    fusstext: value.fusstext,
    mwstBetrag: value.mwstBetrag,
    positionen: from_candid_vec_n47(_uploadFile, _downloadFile, value.positionen),
    faelligkeitsdatum: value.faelligkeitsdatum,
    qrAktiv: value.qrAktiv,
    mwstSatz: value.mwstSatz,
    rabatt: value.rabatt,
    kopftext: value.kopftext,
    kundeId: value.kundeId,
    zwischensumme: value.zwischensumme,
    datum: value.datum,
    skonto: value.skonto,
    waehrung: value.waehrung,
    companyId: value.companyId
  };
}
function from_candid_record_n49(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    typ: from_candid_InvoicePositionTyp_n50(_uploadFile, _downloadFile, value.typ),
    menge: value.menge,
    referenzId: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.referenzId)),
    total: value.total,
    bezeichnung: value.bezeichnung,
    invoiceId: value.invoiceId,
    preis: value.preis,
    einheit: value.einheit
  };
}
function from_candid_record_n5(_uploadFile, _downloadFile, value) {
  return {
    success: record_opt_to_undefined(from_candid_opt_n6(_uploadFile, _downloadFile, value.success)),
    topped_up_amount: record_opt_to_undefined(from_candid_opt_n7(_uploadFile, _downloadFile, value.topped_up_amount))
  };
}
function from_candid_record_n55(_uploadFile, _downloadFile, value) {
  return {
    stripeCurrentPeriodEnd: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.stripeCurrentPeriodEnd)),
    latestStripePaymentStatus: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.latestStripePaymentStatus)),
    latestStripeInvoiceId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.latestStripeInvoiceId)),
    nextDueDate: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.nextDueDate)),
    planId: value.planId,
    stripeSubscriptionId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeSubscriptionId)),
    billingModel: from_candid_BillingModel_n56(_uploadFile, _downloadFile, value.billingModel),
    proRataCalculatedAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.proRataCalculatedAt)),
    scheduledPlanChangePriceId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.scheduledPlanChangePriceId)),
    stripeCancelAtPeriodEnd: value.stripeCancelAtPeriodEnd,
    stripeProductId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeProductId)),
    stripeCustomerId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeCustomerId)),
    subscriptionStartDate: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.subscriptionStartDate)),
    scheduledPlanChangeEffectiveAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.scheduledPlanChangeEffectiveAt)),
    stripeStatus: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.stripeStatus)),
    proRataAmount: record_opt_to_undefined(from_candid_opt_n37(_uploadFile, _downloadFile, value.proRataAmount)),
    stripeCurrentPeriodStart: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.stripeCurrentPeriodStart)),
    lastStripeSyncAt: record_opt_to_undefined(from_candid_opt_n38(_uploadFile, _downloadFile, value.lastStripeSyncAt)),
    scheduledPlanChangeId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.scheduledPlanChangeId)),
    proRataNote: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.proRataNote)),
    companyId: value.companyId
  };
}
function from_candid_record_n60(_uploadFile, _downloadFile, value) {
  return {
    estimatedMonthlyCost: value.estimatedMonthlyCost,
    currentPlanId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.currentPlanId)),
    activeUserCount: value.activeUserCount,
    changeNeeded: value.changeNeeded,
    suggestedPlanId: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.suggestedPlanId)),
    suggestedPlanName: value.suggestedPlanName,
    currentPlanName: value.currentPlanName
  };
}
function from_candid_record_n66(_uploadFile, _downloadFile, value) {
  return {
    status: from_candid_PeriodCloseStatus_n67(_uploadFile, _downloadFile, value.status),
    month: value.month,
    periodType: from_candid_PeriodType_n69(_uploadFile, _downloadFile, value.periodType),
    closedByUserId: record_opt_to_undefined(from_candid_opt_n71(_uploadFile, _downloadFile, value.closedByUserId)),
    createdAt: value.createdAt,
    year: value.year,
    reopenReason: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.reopenReason)),
    tenantId: value.tenantId,
    closeId: value.closeId,
    updatedAt: value.updatedAt,
    closedAt: record_opt_to_undefined(from_candid_opt_n72(_uploadFile, _downloadFile, value.closedAt)),
    periodEnd: value.periodEnd,
    employeeId: record_opt_to_undefined(from_candid_opt_n71(_uploadFile, _downloadFile, value.employeeId)),
    periodStart: value.periodStart,
    closeComment: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.closeComment)),
    reopenedAt: record_opt_to_undefined(from_candid_opt_n72(_uploadFile, _downloadFile, value.reopenedAt)),
    affectedRecordCounts: record_opt_to_undefined(from_candid_opt_n73(_uploadFile, _downloadFile, value.affectedRecordCounts)),
    reopenedByUserId: record_opt_to_undefined(from_candid_opt_n71(_uploadFile, _downloadFile, value.reopenedByUserId))
  };
}
function from_candid_record_n89(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    aktiv: value.aktiv,
    name: value.name,
    requiresApproval: value.requiresApproval,
    visibility: record_opt_to_undefined(from_candid_opt_n90(_uploadFile, _downloadFile, value.visibility)),
    compensated: value.compensated,
    companyId: value.companyId
  };
}
function from_candid_record_n92(_uploadFile, _downloadFile, value) {
  return {
    visibleForRoles: value.visibleForRoles,
    showAbsenceTypeName: value.showAbsenceTypeName,
    visibilityMode: from_candid_CalendarVisibilityMode_n93(_uploadFile, _downloadFile, value.visibilityMode),
    showComment: value.showComment,
    companyCalendarDisplayName: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.companyCalendarDisplayName)),
    showEmployeeName: value.showEmployeeName,
    visibleInCompanyCalendar: value.visibleInCompanyCalendar,
    companyCalendarColor: record_opt_to_undefined(from_candid_opt_n21(_uploadFile, _downloadFile, value.companyCalendarColor))
  };
}
function from_candid_variant_n102(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Customer_n103(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n109(_uploadFile, _downloadFile, value) {
  return "stuendlich" in value ? "stuendlich" : "block" in value ? "block" : value;
}
function from_candid_variant_n117(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Employee_n118(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n121(_uploadFile, _downloadFile, value) {
  return "manager" in value ? "manager" : "admin" in value ? "admin" : "employee" in value ? "employee" : value;
}
function from_candid_variant_n123(_uploadFile, _downloadFile, value) {
  return "partTime" in value ? "partTime" : "fullTime" in value ? "fullTime" : "contractor" in value ? "contractor" : value;
}
function from_candid_variant_n129(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Employment_n130(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n13(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n133(_uploadFile, _downloadFile, value) {
  return "wochentag_sollzeit" in value ? "wochentag_sollzeit" : "durchschnittssoll" in value ? "durchschnittssoll" : "keineGutschrift" in value ? "keineGutschrift" : value;
}
function from_candid_variant_n139(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n143(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n15(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Absence_n16(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n158(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Notification_n159(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n162(_uploadFile, _downloadFile, value) {
  return "sent" in value ? "sent" : "draft" in value ? "draft" : "archived" in value ? "archived" : value;
}
function from_candid_variant_n164(_uploadFile, _downloadFile, value) {
  return "html" in value ? "html" : "markdown" in value ? "markdown" : value;
}
function from_candid_variant_n166(_uploadFile, _downloadFile, value) {
  return "mixed" in value ? "mixed" : "role" in value ? "role" : "user" in value ? "user" : "tenant" in value ? "tenant" : value;
}
function from_candid_variant_n168(_uploadFile, _downloadFile, value) {
  return "normal" in value ? "normal" : "important" in value ? "important" : "critical" in value ? "critical" : value;
}
function from_candid_variant_n172(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_InvoiceTemplate_n173(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n177(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_PauseOverride_n178(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n187(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Project_n188(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n19(_uploadFile, _downloadFile, value) {
  return "submitted" in value ? "submitted" : "approved" in value ? "approved" : "rejected" in value ? "rejected" : value;
}
function from_candid_variant_n191(_uploadFile, _downloadFile, value) {
  return "aktiv" in value ? "aktiv" : "inaktiv" in value ? "inaktiv" : "abgeschlossen" in value ? "abgeschlossen" : value;
}
function from_candid_variant_n194(_uploadFile, _downloadFile, value) {
  return "zeitBlock" in value ? "zeitBlock" : "dauer" in value ? "dauer" : value;
}
function from_candid_variant_n198(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n200(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n202(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n207(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_TimeBalanceCorrection_n208(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n210(_uploadFile, _downloadFile, value) {
  return "gutschrift" in value ? "gutschrift" : "reduktion" in value ? "reduktion" : value;
}
function from_candid_variant_n214(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_TimeEntry_n215(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n220(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_VacationBalance_n221(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n224(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n229(_uploadFile, _downloadFile, value) {
  return "stripe" in value ? "stripe" : "none" in value ? "none" : "manual" in value ? "manual" : value;
}
function from_candid_variant_n23(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Expense_n24(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n236(_uploadFile, _downloadFile, value) {
  return "admin" in value ? "admin" : "user" in value ? "user" : "guest" in value ? "guest" : value;
}
function from_candid_variant_n238(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_record_n239(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n245(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n251(_uploadFile, _downloadFile, value) {
  return "CRITICAL" in value ? "CRITICAL" : "FREIGEGEBEN" in value ? "FREIGEGEBEN" : "INFO" in value ? "INFO" : "COMPLIANT" in value ? "COMPLIANT" : "WARNING" in value ? "WARNING" : "BREACH" in value ? "BREACH" : value;
}
function from_candid_variant_n264(_uploadFile, _downloadFile, value) {
  return "FREIGEGEBEN" in value ? "FREIGEGEBEN" : "IGNORED" in value ? "IGNORED" : "CORRECTED" in value ? "CORRECTED" : value;
}
function from_candid_variant_n266(_uploadFile, _downloadFile, value) {
  return "DAY" in value ? "DAY" : "SERVICE_YEAR" in value ? "SERVICE_YEAR" : "WEEK" in value ? "WEEK" : value;
}
function from_candid_variant_n27(_uploadFile, _downloadFile, value) {
  return "pending" in value ? "pending" : "approved" in value ? "approved" : "rejected" in value ? "rejected" : value;
}
function from_candid_variant_n275(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n277(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_opt_n278(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n28(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n280(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_opt_n281(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n283(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_vec_n284(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n290(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Company_n291(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n294(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Standardarbeitszeiten_n295(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n305(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n307(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n309(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_vec_n310(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n322(_uploadFile, _downloadFile, value) {
  return "processed" in value ? "processed" : "ignored" in value ? "ignored" : "received" in value ? "received" : "failed" in value ? "failed" : value;
}
function from_candid_variant_n33(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n330(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n332(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_record_n333(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n335(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_record_n336(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n341(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n345(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n367(_uploadFile, _downloadFile, value) {
  return "reject" in value ? "reject" : "remove" in value ? "remove" : "approve" in value ? "approve" : "delete" in value ? AuditOperation.delete : "create" in value ? "create" : "update" in value ? "update" : value;
}
function from_candid_variant_n369(_uploadFile, _downloadFile, value) {
  return "expenseType" in value ? "expenseType" : "serviceType" in value ? "serviceType" : "expense" in value ? "expense" : "timeEntry" in value ? "timeEntry" : "customer" in value ? "customer" : "ferien" in value ? "ferien" : "invoiceTemplate" in value ? "invoiceTemplate" : "absence" in value ? "absence" : "company" in value ? "company" : "employee" in value ? "employee" : "approval" in value ? "approval" : "absenceType" in value ? "absenceType" : "holiday" in value ? "holiday" : "project" in value ? "project" : value;
}
function from_candid_variant_n373(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_vec_n374(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n386(_uploadFile, _downloadFile, value) {
  return "reopen" in value ? "reopen" : "close" in value ? "close" : "force_close" in value ? "force_close" : "close_failed" in value ? "close_failed" : value;
}
function from_candid_variant_n391(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_vec_n392(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n396(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_vec_n397(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n40(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n401(_uploadFile, _downloadFile, value) {
  return "ok" in value ? "ok" : "blocked" in value ? "blocked" : "ok_with_warnings" in value ? "ok_with_warnings" : value;
}
function from_candid_variant_n404(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_TenantComplianceRule_n327(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n409(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_ComplianceFinding_n260(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n410(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n42(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_Invoice_n43(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n427(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_EmployeeComplianceProfile_n268(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n431(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n46(_uploadFile, _downloadFile, value) {
  return "entwurf" in value ? "entwurf" : "versendet" in value ? "versendet" : "bezahlt" in value ? "bezahlt" : "storniert" in value ? "storniert" : "ueberfaellig" in value ? "ueberfaellig" : value;
}
function from_candid_variant_n463(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_SubscriptionPlan_n226(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n51(_uploadFile, _downloadFile, value) {
  return "leistung" in value ? "leistung" : "freitext" in value ? "freitext" : "spese" in value ? "spese" : value;
}
function from_candid_variant_n53(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_CompanySubscription_n54(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n57(_uploadFile, _downloadFile, value) {
  return "monthly" in value ? "monthly" : "yearly" in value ? "yearly" : value;
}
function from_candid_variant_n59(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_record_n60(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n64(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_PeriodClose_n65(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n68(_uploadFile, _downloadFile, value) {
  return "reopened" in value ? "reopened" : "closed" in value ? "closed" : "ready_for_close" in value ? "ready_for_close" : "open" in value ? "open" : value;
}
function from_candid_variant_n70(_uploadFile, _downloadFile, value) {
  return "month" in value ? "month" : value;
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
function from_candid_variant_n87(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: from_candid_AbsenceType_n88(_uploadFile, _downloadFile, value.ok)
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n9(_uploadFile, _downloadFile, value) {
  return "ok" in value ? {
    __kind__: "ok",
    ok: value.ok
  } : "err" in value ? {
    __kind__: "err",
    err: value.err
  } : value;
}
function from_candid_variant_n94(_uploadFile, _downloadFile, value) {
  return "full" in value ? "full" : "hidden" in value ? "hidden" : "anonymized" in value ? "anonymized" : "masked_reason" in value ? "masked_reason" : value;
}
function from_candid_vec_n225(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_SubscriptionPlan_n226(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n232(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Absence_n16(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n233(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Expense_n24(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n234(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_TimeEntry_n215(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n240(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_MaskedCalendarAbsence_n241(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n243(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Employee_n118(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n247(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_ComplianceCockpitRow_n248(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n259(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_ComplianceFinding_n260(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n284(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Invoice_n43(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n285(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_MonthlyCloseRow_n286(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n297(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_StandardTimeBlock_n298(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n301(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_PauseOverride_n178(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n310(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_ProjectMemberAssignment_n311(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n318(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_StripeEvent_n319(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n323(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_StripeInvoice_n324(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n326(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_TenantComplianceRule_n327(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n337(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_UnbilledTimeEntry_n338(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n34(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_MonthlyBillingEntry_n35(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n342(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_PlatformAdminUserEntry_n343(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n346(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_AbsenceType_n88(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n351(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_record_n352(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n353(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Notification_n159(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n354(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_AuditEntry_n355(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n363(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_AuditLogEntry_n364(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n371(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Customer_n103(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n374(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Employment_n130(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n379(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_UserNotification_n380(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n382(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_PeriodCloseAuditEntry_n383(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n388(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_PeriodClose_n65(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n389(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Project_n188(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n392(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_TimeBalanceCorrection_n208(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n397(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_VacationBalance_n221(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n47(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_InvoicePosition_n48(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n75(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Result_23_n63(_uploadFile, _downloadFile, x));
}
function to_candid_AbsenceFilter_n347(_uploadFile, _downloadFile, value) {
  return to_candid_record_n348(_uploadFile, _downloadFile, value);
}
function to_candid_AbsenceStatus_n349(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n350(_uploadFile, _downloadFile, value);
}
function to_candid_AbsenceTypeVisibility_n82(_uploadFile, _downloadFile, value) {
  return to_candid_record_n83(_uploadFile, _downloadFile, value);
}
function to_candid_AuditEntityType_n361(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n362(_uploadFile, _downloadFile, value);
}
function to_candid_AuditLogFilter_n357(_uploadFile, _downloadFile, value) {
  return to_candid_record_n358(_uploadFile, _downloadFile, value);
}
function to_candid_AuditOperation_n359(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n360(_uploadFile, _downloadFile, value);
}
function to_candid_BillingModel_n10(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n11(_uploadFile, _downloadFile, value);
}
function to_candid_CalendarVisibilityMode_n84(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n85(_uploadFile, _downloadFile, value);
}
function to_candid_ClosePeriodInput_n61(_uploadFile, _downloadFile, value) {
  return to_candid_record_n62(_uploadFile, _downloadFile, value);
}
function to_candid_CompliancePeriodeTyp_n253(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n254(_uploadFile, _downloadFile, value);
}
function to_candid_ComplianceResolutionType_n407(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n408(_uploadFile, _downloadFile, value);
}
function to_candid_ComplianceStatus_n257(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n258(_uploadFile, _downloadFile, value);
}
function to_candid_CreateAbsenceInput_n78(_uploadFile, _downloadFile, value) {
  return to_candid_record_n79(_uploadFile, _downloadFile, value);
}
function to_candid_CreateAbsenceTypeInput_n80(_uploadFile, _downloadFile, value) {
  return to_candid_record_n81(_uploadFile, _downloadFile, value);
}
function to_candid_CreateCustomerInput_n95(_uploadFile, _downloadFile, value) {
  return to_candid_record_n96(_uploadFile, _downloadFile, value);
}
function to_candid_CreateEmployeeInput_n110(_uploadFile, _downloadFile, value) {
  return to_candid_record_n111(_uploadFile, _downloadFile, value);
}
function to_candid_CreateEmploymentInput_n124(_uploadFile, _downloadFile, value) {
  return to_candid_record_n125(_uploadFile, _downloadFile, value);
}
function to_candid_CreateExpenseInput_n134(_uploadFile, _downloadFile, value) {
  return to_candid_record_n135(_uploadFile, _downloadFile, value);
}
function to_candid_CreateExpenseTypeInput_n136(_uploadFile, _downloadFile, value) {
  return to_candid_record_n137(_uploadFile, _downloadFile, value);
}
function to_candid_CreateHolidayInput_n140(_uploadFile, _downloadFile, value) {
  return to_candid_record_n141(_uploadFile, _downloadFile, value);
}
function to_candid_CreateInvoiceInput_n144(_uploadFile, _downloadFile, value) {
  return to_candid_record_n145(_uploadFile, _downloadFile, value);
}
function to_candid_CreatePauseOverrideInput_n175(_uploadFile, _downloadFile, value) {
  return to_candid_record_n176(_uploadFile, _downloadFile, value);
}
function to_candid_CreateProjectInput_n180(_uploadFile, _downloadFile, value) {
  return to_candid_record_n181(_uploadFile, _downloadFile, value);
}
function to_candid_CreateServiceTypeInput_n195(_uploadFile, _downloadFile, value) {
  return to_candid_record_n196(_uploadFile, _downloadFile, value);
}
function to_candid_CreateTimeBalanceCorrectionInput_n203(_uploadFile, _downloadFile, value) {
  return to_candid_record_n204(_uploadFile, _downloadFile, value);
}
function to_candid_CreateTimeEntryInput_n211(_uploadFile, _downloadFile, value) {
  return to_candid_record_n212(_uploadFile, _downloadFile, value);
}
function to_candid_CreateVacationBalanceInput_n217(_uploadFile, _downloadFile, value) {
  return to_candid_record_n218(_uploadFile, _downloadFile, value);
}
function to_candid_EmploymentType_n114(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n115(_uploadFile, _downloadFile, value);
}
function to_candid_Erfassungsart_n184(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n185(_uploadFile, _downloadFile, value);
}
function to_candid_ExpenseFilter_n375(_uploadFile, _downloadFile, value) {
  return to_candid_record_n376(_uploadFile, _downloadFile, value);
}
function to_candid_ExpenseStatus_n377(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n378(_uploadFile, _downloadFile, value);
}
function to_candid_FeiertagsberechnungsartType_n126(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n127(_uploadFile, _downloadFile, value);
}
function to_candid_InvoicePositionInput_n147(_uploadFile, _downloadFile, value) {
  return to_candid_record_n148(_uploadFile, _downloadFile, value);
}
function to_candid_InvoicePositionTyp_n149(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n150(_uploadFile, _downloadFile, value);
}
function to_candid_InvoiceStatus_n444(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n445(_uploadFile, _downloadFile, value);
}
function to_candid_InvoiceTemplateInput_n169(_uploadFile, _downloadFile, value) {
  return to_candid_record_n170(_uploadFile, _downloadFile, value);
}
function to_candid_KundeZeiterfassungsart_n99(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n100(_uploadFile, _downloadFile, value);
}
function to_candid_NotificationFormat_n151(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n152(_uploadFile, _downloadFile, value);
}
function to_candid_NotificationPriority_n153(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n154(_uploadFile, _downloadFile, value);
}
function to_candid_NotificationTargetType_n156(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n157(_uploadFile, _downloadFile, value);
}
function to_candid_PaymentProvider_n460(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n461(_uploadFile, _downloadFile, value);
}
function to_candid_ProjectMemberAssignment_n417(_uploadFile, _downloadFile, value) {
  return to_candid_record_n418(_uploadFile, _downloadFile, value);
}
function to_candid_ProjectStatus_n182(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n183(_uploadFile, _downloadFile, value);
}
function to_candid_Rechnungsadresse_n97(_uploadFile, _downloadFile, value) {
  return to_candid_record_n98(_uploadFile, _downloadFile, value);
}
function to_candid_ReopenPeriodInput_n402(_uploadFile, _downloadFile, value) {
  return to_candid_record_n403(_uploadFile, _downloadFile, value);
}
function to_candid_ReportFilter_n313(_uploadFile, _downloadFile, value) {
  return to_candid_record_n314(_uploadFile, _downloadFile, value);
}
function to_candid_ResolveFindingInput_n405(_uploadFile, _downloadFile, value) {
  return to_candid_record_n406(_uploadFile, _downloadFile, value);
}
function to_candid_Role_n112(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n113(_uploadFile, _downloadFile, value);
}
function to_candid_StandardTimeBlock_n414(_uploadFile, _downloadFile, value) {
  return to_candid_record_n415(_uploadFile, _downloadFile, value);
}
function to_candid_Standardarbeitszeiten_n411(_uploadFile, _downloadFile, value) {
  return to_candid_record_n412(_uploadFile, _downloadFile, value);
}
function to_candid_SubscriptionPlan_n458(_uploadFile, _downloadFile, value) {
  return to_candid_record_n459(_uploadFile, _downloadFile, value);
}
function to_candid_TimeEntryFilter_n393(_uploadFile, _downloadFile, value) {
  return to_candid_record_n394(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateAbsenceInput_n419(_uploadFile, _downloadFile, value) {
  return to_candid_record_n420(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateAbsenceTypeInput_n421(_uploadFile, _downloadFile, value) {
  return to_candid_record_n422(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateCompanyInput_n423(_uploadFile, _downloadFile, value) {
  return to_candid_record_n424(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateComplianceProfileInput_n425(_uploadFile, _downloadFile, value) {
  return to_candid_record_n426(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateCustomerInput_n428(_uploadFile, _downloadFile, value) {
  return to_candid_record_n429(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateEmployeeInput_n432(_uploadFile, _downloadFile, value) {
  return to_candid_record_n433(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateEmploymentInput_n434(_uploadFile, _downloadFile, value) {
  return to_candid_record_n435(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateExpenseInput_n436(_uploadFile, _downloadFile, value) {
  return to_candid_record_n437(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateExpenseTypeInput_n438(_uploadFile, _downloadFile, value) {
  return to_candid_record_n439(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateHolidayInput_n440(_uploadFile, _downloadFile, value) {
  return to_candid_record_n441(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateInvoiceInput_n442(_uploadFile, _downloadFile, value) {
  return to_candid_record_n443(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateProjectInput_n446(_uploadFile, _downloadFile, value) {
  return to_candid_record_n447(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateServiceTypeInput_n448(_uploadFile, _downloadFile, value) {
  return to_candid_record_n449(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateTenantComplianceRuleInput_n450(_uploadFile, _downloadFile, value) {
  return to_candid_record_n451(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateTimeBalanceCorrectionInput_n452(_uploadFile, _downloadFile, value) {
  return to_candid_record_n453(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateTimeEntryInput_n454(_uploadFile, _downloadFile, value) {
  return to_candid_record_n455(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateVacationBalanceInput_n456(_uploadFile, _downloadFile, value) {
  return to_candid_record_n457(_uploadFile, _downloadFile, value);
}
function to_candid_UserRole_n30(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n31(_uploadFile, _downloadFile, value);
}
function to_candid__ImmutableObjectStorageRefillInformation_n2(_uploadFile, _downloadFile, value) {
  return to_candid_record_n3(_uploadFile, _downloadFile, value);
}
function to_candid_opt_n1(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(to_candid__ImmutableObjectStorageRefillInformation_n2(_uploadFile, _downloadFile, value));
}
function to_candid_opt_n155(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_opt_n252(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(to_candid_CompliancePeriodeTyp_n253(_uploadFile, _downloadFile, value));
}
function to_candid_opt_n255(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(to_candid_vec_n256(_uploadFile, _downloadFile, value));
}
function to_candid_opt_n317(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_opt_n74(_uploadFile, _downloadFile, value) {
  return value === null ? candid_none() : candid_some(value);
}
function to_candid_record_n111(_uploadFile, _downloadFile, value) {
  return {
    ort: value.ort ? candid_some(value.ort) : candid_none(),
    plz: value.plz ? candid_some(value.plz) : candid_none(),
    weeklyHoursTarget: value.weeklyHoursTarget,
    postfach: value.postfach ? candid_some(value.postfach) : candid_none(),
    land: value.land ? candid_some(value.land) : candid_none(),
    role: to_candid_Role_n112(_uploadFile, _downloadFile, value.role),
    email: value.email,
    geburtsdatum: value.geburtsdatum ? candid_some(value.geburtsdatum) : candid_none(),
    employmentType: to_candid_EmploymentType_n114(_uploadFile, _downloadFile, value.employmentType),
    adresseZusatz1: value.adresseZusatz1 ? candid_some(value.adresseZusatz1) : candid_none(),
    adresseZusatz2: value.adresseZusatz2 ? candid_some(value.adresseZusatz2) : candid_none(),
    lastName: value.lastName,
    strasse: value.strasse ? candid_some(value.strasse) : candid_none(),
    startDate: value.startDate,
    firstName: value.firstName
  };
}
function to_candid_record_n125(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis ? candid_some(value.bis) : candid_none(),
    von: value.von,
    pensum: value.pensum,
    feiertagsberechnungsart: to_candid_FeiertagsberechnungsartType_n126(_uploadFile, _downloadFile, value.feiertagsberechnungsart),
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
function to_candid_record_n135(_uploadFile, _downloadFile, value) {
  return {
    date: value.date,
    description: value.description,
    projektId: value.projektId ? candid_some(value.projektId) : candid_none(),
    billableCHF: value.billableCHF,
    kundeId: value.kundeId ? candid_some(value.kundeId) : candid_none(),
    reimbursementCHF: value.reimbursementCHF,
    expenseTypeId: value.expenseTypeId,
    receiptBlobId: value.receiptBlobId ? candid_some(value.receiptBlobId) : candid_none()
  };
}
function to_candid_record_n137(_uploadFile, _downloadFile, value) {
  return {
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name,
    billable: value.billable,
    reimbursable: value.reimbursable
  };
}
function to_candid_record_n141(_uploadFile, _downloadFile, value) {
  return {
    ganztaegig: value.ganztaegig ? candid_some(value.ganztaegig) : candid_none(),
    date: value.date,
    name: value.name
  };
}
function to_candid_record_n145(_uploadFile, _downloadFile, value) {
  return {
    fusstext: value.fusstext,
    positionen: to_candid_vec_n146(_uploadFile, _downloadFile, value.positionen),
    qrAktiv: value.qrAktiv ? candid_some(value.qrAktiv) : candid_none(),
    mwstSatz: value.mwstSatz,
    rabatt: value.rabatt,
    kopftext: value.kopftext,
    kundeId: value.kundeId,
    skonto: value.skonto
  };
}
function to_candid_record_n148(_uploadFile, _downloadFile, value) {
  return {
    typ: to_candid_InvoicePositionTyp_n149(_uploadFile, _downloadFile, value.typ),
    menge: value.menge,
    referenzId: value.referenzId ? candid_some(value.referenzId) : candid_none(),
    bezeichnung: value.bezeichnung,
    preis: value.preis,
    einheit: value.einheit
  };
}
function to_candid_record_n170(_uploadFile, _downloadFile, value) {
  return {
    qrIban: value.qrIban ? candid_some(value.qrIban) : candid_none(),
    fusszeileLayout: value.fusszeileLayout ? candid_some(value.fusszeileLayout) : candid_none(),
    qrKontoinhaberAdresse: value.qrKontoinhaberAdresse ? candid_some(value.qrKontoinhaberAdresse) : candid_none(),
    bank: value.bank,
    iban: value.iban,
    kopfzeileLayout: value.kopfzeileLayout ? candid_some(value.kopfzeileLayout) : candid_none(),
    fusstext: value.fusstext,
    mwstNummer: value.mwstNummer,
    qrKontoinhaber: value.qrKontoinhaber ? candid_some(value.qrKontoinhaber) : candid_none(),
    kopfzeileLogoQuelle: value.kopfzeileLogoQuelle ? candid_some(value.kopfzeileLogoQuelle) : candid_none(),
    qrReferenztyp: value.qrReferenztyp ? candid_some(value.qrReferenztyp) : candid_none(),
    kopfzeileBildPosition: value.kopfzeileBildPosition ? candid_some(value.kopfzeileBildPosition) : candid_none(),
    kopfzeileAdressePosition: value.kopfzeileAdressePosition ? candid_some(value.kopfzeileAdressePosition) : candid_none(),
    zahlungszielTage: value.zahlungszielTage,
    kopfzeileBildUrl: value.kopfzeileBildUrl ? candid_some(value.kopfzeileBildUrl) : candid_none(),
    qrWaehrung: value.qrWaehrung ? candid_some(value.qrWaehrung) : candid_none(),
    spalten: value.spalten,
    qrReferenzPraefix: value.qrReferenzPraefix ? candid_some(value.qrReferenzPraefix) : candid_none(),
    fusszeilePosition: value.fusszeilePosition ? candid_some(value.fusszeilePosition) : candid_none(),
    mwstSatz: value.mwstSatz ? candid_some(value.mwstSatz) : candid_none(),
    kopfzeileLogoGroesse: value.kopfzeileLogoGroesse ? candid_some(value.kopfzeileLogoGroesse) : candid_none(),
    kopftext: value.kopftext,
    kundenadresseAbstandNach: value.kundenadresseAbstandNach ? candid_some(value.kundenadresseAbstandNach) : candid_none(),
    kundenadresseAbstandOben: value.kundenadresseAbstandOben ? candid_some(value.kundenadresseAbstandOben) : candid_none(),
    kundenadresseEinrueckungZeichen: value.kundenadresseEinrueckungZeichen ? candid_some(value.kundenadresseEinrueckungZeichen) : candid_none(),
    fusszeileBildPosition: value.fusszeileBildPosition ? candid_some(value.fusszeileBildPosition) : candid_none(),
    kopfzeileAdresse: value.kopfzeileAdresse ? candid_some(value.kopfzeileAdresse) : candid_none(),
    kopfzeilePosition: value.kopfzeilePosition ? candid_some(value.kopfzeilePosition) : candid_none(),
    praefix: value.praefix,
    naechsteNummer: value.naechsteNummer,
    qrAktivStandard: value.qrAktivStandard ? candid_some(value.qrAktivStandard) : candid_none(),
    farbe: value.farbe,
    fusszeileBildUrl: value.fusszeileBildUrl ? candid_some(value.fusszeileBildUrl) : candid_none(),
    kundenadresseLinks: value.kundenadresseLinks ? candid_some(value.kundenadresseLinks) : candid_none()
  };
}
function to_candid_record_n176(_uploadFile, _downloadFile, value) {
  return {
    action: value.action,
    userId: value.userId,
    date: value.date,
    gapEnd: value.gapEnd,
    gapStart: value.gapStart,
    reason: value.reason ? candid_some(value.reason) : candid_none(),
    companyId: value.companyId
  };
}
function to_candid_record_n181(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_ProjectStatus_n182(_uploadFile, _downloadFile, value.status)) : candid_none(),
    erfassungsart: value.erfassungsart ? candid_some(to_candid_Erfassungsart_n184(_uploadFile, _downloadFile, value.erfassungsart)) : candid_none(),
    code: value.code,
    billableRate: value.billableRate,
    name: value.name,
    customerId: value.customerId,
    kurzbezeichnung: value.kurzbezeichnung,
    kostendachCHF: value.kostendachCHF ? candid_some(value.kostendachCHF) : candid_none(),
    projektleiter: value.projektleiter ? candid_some(value.projektleiter) : candid_none()
  };
}
function to_candid_record_n196(_uploadFile, _downloadFile, value) {
  return {
    defaultRate: value.defaultRate,
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name,
    billable: value.billable
  };
}
function to_candid_record_n204(_uploadFile, _downloadFile, value) {
  return {
    typ: to_candid_variant_n205(_uploadFile, _downloadFile, value.typ),
    ueberzeit: value.ueberzeit,
    bemerkung: value.bemerkung,
    wirkungsdatum: value.wirkungsdatum,
    dauer: value.dauer
  };
}
function to_candid_record_n212(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis ? candid_some(value.bis) : candid_none(),
    von: value.von ? candid_some(value.von) : candid_none(),
    hours: value.hours,
    date: value.date,
    description: value.description,
    billable: value.billable,
    projectId: value.projectId,
    requiresApproval: value.requiresApproval ? candid_some(value.requiresApproval) : candid_none(),
    serviceTypeId: value.serviceTypeId
  };
}
function to_candid_record_n218(_uploadFile, _downloadFile, value) {
  return {
    verfallsdatum: value.verfallsdatum ? candid_some(value.verfallsdatum) : candid_none(),
    kalenderjahr: value.kalenderjahr,
    dauer: value.dauer
  };
}
function to_candid_record_n3(_uploadFile, _downloadFile, value) {
  return {
    proposed_top_up_amount: value.proposed_top_up_amount ? candid_some(value.proposed_top_up_amount) : candid_none()
  };
}
function to_candid_record_n314(_uploadFile, _downloadFile, value) {
  return {
    dateTo: value.dateTo,
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    projectId: value.projectId ? candid_some(value.projectId) : candid_none(),
    customerId: value.customerId ? candid_some(value.customerId) : candid_none(),
    dateFrom: value.dateFrom
  };
}
function to_candid_record_n348(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_AbsenceStatus_n349(_uploadFile, _downloadFile, value.status)) : candid_none(),
    absenceTypeId: value.absenceTypeId ? candid_some(value.absenceTypeId) : candid_none(),
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none()
  };
}
function to_candid_record_n358(_uploadFile, _downloadFile, value) {
  return {
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    actorPrincipalFilter: value.actorPrincipalFilter ? candid_some(value.actorPrincipalFilter) : candid_none(),
    operation: value.operation ? candid_some(to_candid_AuditOperation_n359(_uploadFile, _downloadFile, value.operation)) : candid_none(),
    entityType: value.entityType ? candid_some(to_candid_AuditEntityType_n361(_uploadFile, _downloadFile, value.entityType)) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none()
  };
}
function to_candid_record_n376(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_ExpenseStatus_n377(_uploadFile, _downloadFile, value.status)) : candid_none(),
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none()
  };
}
function to_candid_record_n394(_uploadFile, _downloadFile, value) {
  return {
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    projectId: value.projectId ? candid_some(value.projectId) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none()
  };
}
function to_candid_record_n403(_uploadFile, _downloadFile, value) {
  return {
    reopenReason: value.reopenReason ? candid_some(value.reopenReason) : candid_none(),
    closeId: value.closeId
  };
}
function to_candid_record_n406(_uploadFile, _downloadFile, value) {
  return {
    resolutionType: to_candid_ComplianceResolutionType_n407(_uploadFile, _downloadFile, value.resolutionType),
    findingId: value.findingId,
    resolutionReason: value.resolutionReason
  };
}
function to_candid_record_n412(_uploadFile, _downloadFile, value) {
  return {
    tuesday: to_candid_vec_n413(_uploadFile, _downloadFile, value.tuesday),
    wednesday: to_candid_vec_n413(_uploadFile, _downloadFile, value.wednesday),
    saturday: to_candid_vec_n413(_uploadFile, _downloadFile, value.saturday),
    thursday: to_candid_vec_n413(_uploadFile, _downloadFile, value.thursday),
    sunday: to_candid_vec_n413(_uploadFile, _downloadFile, value.sunday),
    friday: to_candid_vec_n413(_uploadFile, _downloadFile, value.friday),
    monday: to_candid_vec_n413(_uploadFile, _downloadFile, value.monday)
  };
}
function to_candid_record_n415(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis,
    von: value.von,
    leistungsartId: value.leistungsartId ? candid_some(value.leistungsartId) : candid_none(),
    projektId: value.projektId ? candid_some(value.projektId) : candid_none()
  };
}
function to_candid_record_n418(_uploadFile, _downloadFile, value) {
  return {
    stundensatz: value.stundensatz,
    employeeId: value.employeeId,
    kostendachCHF: value.kostendachCHF ? candid_some(value.kostendachCHF) : candid_none(),
    serviceTypeId: value.serviceTypeId
  };
}
function to_candid_record_n420(_uploadFile, _downloadFile, value) {
  return {
    dateTo: value.dateTo ? candid_some(value.dateTo) : candid_none(),
    ganztaetig: value.ganztaetig ? candid_some(value.ganztaetig) : candid_none(),
    description: value.description ? candid_some(value.description) : candid_none(),
    dateFrom: value.dateFrom ? candid_some(value.dateFrom) : candid_none(),
    dauer: value.dauer ? candid_some(value.dauer) : candid_none()
  };
}
function to_candid_record_n422(_uploadFile, _downloadFile, value) {
  return {
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    requiresApproval: value.requiresApproval ? candid_some(value.requiresApproval) : candid_none(),
    visibility: value.visibility ? candid_some(to_candid_AbsenceTypeVisibility_n82(_uploadFile, _downloadFile, value.visibility)) : candid_none(),
    compensated: value.compensated ? candid_some(value.compensated) : candid_none()
  };
}
function to_candid_record_n424(_uploadFile, _downloadFile, value) {
  return {
    taxId: value.taxId ? candid_some(value.taxId) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    mwstNummer: value.mwstNummer ? candid_some(value.mwstNummer) : candid_none(),
    kontoInhaber: value.kontoInhaber ? candid_some(value.kontoInhaber) : candid_none(),
    logoUrl: value.logoUrl ? candid_some(value.logoUrl) : candid_none(),
    address: value.address ? candid_some(value.address) : candid_none(),
    kontoAdresse: value.kontoAdresse ? candid_some(value.kontoAdresse) : candid_none()
  };
}
function to_candid_record_n426(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    aktiv: value.aktiv,
    employeeId: value.employeeId,
    ausnahmeprofil: value.ausnahmeprofil ? candid_some(value.ausnahmeprofil) : candid_none(),
    erfassungsModus: value.erfassungsModus,
    vertraglicheZusatzferienTage: value.vertraglicheZusatzferienTage,
    gesetzlicheWochenhochstarbeitszeit: value.gesetzlicheWochenhochstarbeitszeit,
    gesetzlicherFerienanspruchWochen: value.gesetzlicherFerienanspruchWochen
  };
}
function to_candid_record_n429(_uploadFile, _downloadFile, value) {
  return {
    rechnungsadresse: value.rechnungsadresse ? candid_some(to_candid_Rechnungsadresse_n97(_uploadFile, _downloadFile, value.rechnungsadresse)) : candid_none(),
    contact: value.contact ? candid_some(value.contact) : candid_none(),
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    zeiterfassungsart: value.zeiterfassungsart ? candid_some(to_candid_KundeZeiterfassungsart_n99(_uploadFile, _downloadFile, value.zeiterfassungsart)) : candid_none(),
    kundennummer: value.kundennummer ? candid_some(value.kundennummer) : candid_none(),
    notes: value.notes ? candid_some(value.notes) : candid_none(),
    beschreibung: value.beschreibung ? candid_some(value.beschreibung) : candid_none(),
    waehrung: value.waehrung ? candid_some(value.waehrung) : candid_none()
  };
}
function to_candid_record_n433(_uploadFile, _downloadFile, value) {
  return {
    ort: value.ort ? candid_some(value.ort) : candid_none(),
    plz: value.plz ? candid_some(value.plz) : candid_none(),
    weeklyHoursTarget: value.weeklyHoursTarget ? candid_some(value.weeklyHoursTarget) : candid_none(),
    active: value.active ? candid_some(value.active) : candid_none(),
    postfach: value.postfach ? candid_some(value.postfach) : candid_none(),
    land: value.land ? candid_some(value.land) : candid_none(),
    role: value.role ? candid_some(to_candid_Role_n112(_uploadFile, _downloadFile, value.role)) : candid_none(),
    email: value.email ? candid_some(value.email) : candid_none(),
    geburtsdatum: value.geburtsdatum ? candid_some(value.geburtsdatum) : candid_none(),
    employmentType: value.employmentType ? candid_some(to_candid_EmploymentType_n114(_uploadFile, _downloadFile, value.employmentType)) : candid_none(),
    adresseZusatz1: value.adresseZusatz1 ? candid_some(value.adresseZusatz1) : candid_none(),
    adresseZusatz2: value.adresseZusatz2 ? candid_some(value.adresseZusatz2) : candid_none(),
    lastName: value.lastName ? candid_some(value.lastName) : candid_none(),
    strasse: value.strasse ? candid_some(value.strasse) : candid_none(),
    startDate: value.startDate ? candid_some(value.startDate) : candid_none(),
    firstName: value.firstName ? candid_some(value.firstName) : candid_none()
  };
}
function to_candid_record_n435(_uploadFile, _downloadFile, value) {
  return {
    bis: value.bis ? candid_some(value.bis) : candid_none(),
    von: value.von ? candid_some(value.von) : candid_none(),
    pensum: value.pensum,
    feiertagsberechnungsart: value.feiertagsberechnungsart ? candid_some(to_candid_FeiertagsberechnungsartType_n126(_uploadFile, _downloadFile, value.feiertagsberechnungsart)) : candid_none(),
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
function to_candid_record_n437(_uploadFile, _downloadFile, value) {
  return {
    date: value.date ? candid_some(value.date) : candid_none(),
    description: value.description ? candid_some(value.description) : candid_none(),
    projektId: value.projektId ? candid_some(value.projektId) : candid_none(),
    billableCHF: value.billableCHF ? candid_some(value.billableCHF) : candid_none(),
    kundeId: value.kundeId ? candid_some(value.kundeId) : candid_none(),
    reimbursementCHF: value.reimbursementCHF ? candid_some(value.reimbursementCHF) : candid_none(),
    expenseTypeId: value.expenseTypeId ? candid_some(value.expenseTypeId) : candid_none(),
    receiptBlobId: value.receiptBlobId ? candid_some(value.receiptBlobId) : candid_none()
  };
}
function to_candid_record_n439(_uploadFile, _downloadFile, value) {
  return {
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    billable: value.billable ? candid_some(value.billable) : candid_none(),
    reimbursable: value.reimbursable ? candid_some(value.reimbursable) : candid_none()
  };
}
function to_candid_record_n441(_uploadFile, _downloadFile, value) {
  return {
    ganztaegig: value.ganztaegig ? candid_some(value.ganztaegig) : candid_none(),
    date: value.date ? candid_some(value.date) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none()
  };
}
function to_candid_record_n443(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_InvoiceStatus_n444(_uploadFile, _downloadFile, value.status)) : candid_none(),
    fusstext: value.fusstext ? candid_some(value.fusstext) : candid_none(),
    positionen: value.positionen ? candid_some(to_candid_vec_n146(_uploadFile, _downloadFile, value.positionen)) : candid_none(),
    faelligkeitsdatum: value.faelligkeitsdatum ? candid_some(value.faelligkeitsdatum) : candid_none(),
    qrAktiv: value.qrAktiv ? candid_some(value.qrAktiv) : candid_none(),
    mwstSatz: value.mwstSatz ? candid_some(value.mwstSatz) : candid_none(),
    rabatt: value.rabatt ? candid_some(value.rabatt) : candid_none(),
    kopftext: value.kopftext ? candid_some(value.kopftext) : candid_none(),
    kundeId: value.kundeId ? candid_some(value.kundeId) : candid_none(),
    datum: value.datum ? candid_some(value.datum) : candid_none(),
    skonto: value.skonto ? candid_some(value.skonto) : candid_none()
  };
}
function to_candid_record_n447(_uploadFile, _downloadFile, value) {
  return {
    status: value.status ? candid_some(to_candid_ProjectStatus_n182(_uploadFile, _downloadFile, value.status)) : candid_none(),
    erfassungsart: value.erfassungsart ? candid_some(to_candid_Erfassungsart_n184(_uploadFile, _downloadFile, value.erfassungsart)) : candid_none(),
    active: value.active ? candid_some(value.active) : candid_none(),
    code: value.code ? candid_some(value.code) : candid_none(),
    billableRate: value.billableRate ? candid_some(value.billableRate) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    customerId: value.customerId ? candid_some(value.customerId) : candid_none(),
    kurzbezeichnung: value.kurzbezeichnung ? candid_some(value.kurzbezeichnung) : candid_none(),
    kostendachCHF: value.kostendachCHF ? candid_some(value.kostendachCHF) : candid_none(),
    projektleiter: value.projektleiter ? candid_some(value.projektleiter) : candid_none()
  };
}
function to_candid_record_n449(_uploadFile, _downloadFile, value) {
  return {
    defaultRate: value.defaultRate ? candid_some(value.defaultRate) : candid_none(),
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name ? candid_some(value.name) : candid_none(),
    billable: value.billable ? candid_some(value.billable) : candid_none()
  };
}
function to_candid_record_n451(_uploadFile, _downloadFile, value) {
  return {
    newValue: value.newValue ? candid_some(value.newValue) : candid_none(),
    isActive: value.isActive,
    ruleCode: value.ruleCode,
    companyId: value.companyId
  };
}
function to_candid_record_n453(_uploadFile, _downloadFile, value) {
  return {
    typ: value.typ ? candid_some(to_candid_variant_n205(_uploadFile, _downloadFile, value.typ)) : candid_none(),
    ueberzeit: value.ueberzeit ? candid_some(value.ueberzeit) : candid_none(),
    bemerkung: value.bemerkung ? candid_some(value.bemerkung) : candid_none(),
    wirkungsdatum: value.wirkungsdatum ? candid_some(value.wirkungsdatum) : candid_none(),
    dauer: value.dauer ? candid_some(value.dauer) : candid_none()
  };
}
function to_candid_record_n455(_uploadFile, _downloadFile, value) {
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
function to_candid_record_n457(_uploadFile, _downloadFile, value) {
  return {
    verfallsdatum: value.verfallsdatum ? candid_some(value.verfallsdatum) : candid_none(),
    kalenderjahr: value.kalenderjahr ? candid_some(value.kalenderjahr) : candid_none(),
    dauer: value.dauer ? candid_some(value.dauer) : candid_none()
  };
}
function to_candid_record_n459(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    features: value.features,
    requiresPayment: value.requiresPayment,
    sortOrder: value.sortOrder,
    name: value.name,
    stripeLookupKey: value.stripeLookupKey ? candid_some(value.stripeLookupKey) : candid_none(),
    description: value.description,
    isRecommended: value.isRecommended,
    isActive: value.isActive,
    stripeProductId: value.stripeProductId ? candid_some(value.stripeProductId) : candid_none(),
    updatedAt: value.updatedAt,
    additionalFeatures: value.additionalFeatures,
    pricePerYearCHF: value.pricePerYearCHF,
    stripePriceId: value.stripePriceId ? candid_some(value.stripePriceId) : candid_none(),
    pricePerMonthCHF: value.pricePerMonthCHF,
    stripeMode: value.stripeMode ? candid_some(value.stripeMode) : candid_none(),
    stripePriceIdYearly: value.stripePriceIdYearly ? candid_some(value.stripePriceIdYearly) : candid_none(),
    minActiveDaysPerMonth: value.minActiveDaysPerMonth,
    maxEmployees: value.maxEmployees ? candid_some(value.maxEmployees) : candid_none(),
    paymentProvider: to_candid_PaymentProvider_n460(_uploadFile, _downloadFile, value.paymentProvider)
  };
}
function to_candid_record_n62(_uploadFile, _downloadFile, value) {
  return {
    month: value.month,
    year: value.year,
    tenantId: value.tenantId,
    employeeId: value.employeeId ? candid_some(value.employeeId) : candid_none(),
    closeComment: value.closeComment ? candid_some(value.closeComment) : candid_none()
  };
}
function to_candid_record_n79(_uploadFile, _downloadFile, value) {
  return {
    absenceTypeId: value.absenceTypeId,
    dateTo: value.dateTo,
    ganztaetig: value.ganztaetig,
    description: value.description ? candid_some(value.description) : candid_none(),
    dateFrom: value.dateFrom,
    dauer: value.dauer
  };
}
function to_candid_record_n81(_uploadFile, _downloadFile, value) {
  return {
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name,
    requiresApproval: value.requiresApproval,
    visibility: value.visibility ? candid_some(to_candid_AbsenceTypeVisibility_n82(_uploadFile, _downloadFile, value.visibility)) : candid_none(),
    compensated: value.compensated
  };
}
function to_candid_record_n83(_uploadFile, _downloadFile, value) {
  return {
    visibleForRoles: value.visibleForRoles,
    showAbsenceTypeName: value.showAbsenceTypeName,
    visibilityMode: to_candid_CalendarVisibilityMode_n84(_uploadFile, _downloadFile, value.visibilityMode),
    showComment: value.showComment,
    companyCalendarDisplayName: value.companyCalendarDisplayName ? candid_some(value.companyCalendarDisplayName) : candid_none(),
    showEmployeeName: value.showEmployeeName,
    visibleInCompanyCalendar: value.visibleInCompanyCalendar,
    companyCalendarColor: value.companyCalendarColor ? candid_some(value.companyCalendarColor) : candid_none()
  };
}
function to_candid_record_n96(_uploadFile, _downloadFile, value) {
  return {
    rechnungsadresse: value.rechnungsadresse ? candid_some(to_candid_Rechnungsadresse_n97(_uploadFile, _downloadFile, value.rechnungsadresse)) : candid_none(),
    contact: value.contact ? candid_some(value.contact) : candid_none(),
    aktiv: value.aktiv ? candid_some(value.aktiv) : candid_none(),
    name: value.name,
    zeiterfassungsart: value.zeiterfassungsart ? candid_some(to_candid_KundeZeiterfassungsart_n99(_uploadFile, _downloadFile, value.zeiterfassungsart)) : candid_none(),
    kundennummer: value.kundennummer ? candid_some(value.kundennummer) : candid_none(),
    notes: value.notes ? candid_some(value.notes) : candid_none(),
    beschreibung: value.beschreibung ? candid_some(value.beschreibung) : candid_none(),
    waehrung: value.waehrung ? candid_some(value.waehrung) : candid_none()
  };
}
function to_candid_record_n98(_uploadFile, _downloadFile, value) {
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
function to_candid_variant_n100(_uploadFile, _downloadFile, value) {
  return value == "stuendlich" ? {
    stuendlich: null
  } : value == "block" ? {
    block: null
  } : value;
}
function to_candid_variant_n11(_uploadFile, _downloadFile, value) {
  return value == "monthly" ? {
    monthly: null
  } : value == "yearly" ? {
    yearly: null
  } : value;
}
function to_candid_variant_n113(_uploadFile, _downloadFile, value) {
  return value == "manager" ? {
    manager: null
  } : value == "admin" ? {
    admin: null
  } : value == "employee" ? {
    employee: null
  } : value;
}
function to_candid_variant_n115(_uploadFile, _downloadFile, value) {
  return value == "partTime" ? {
    partTime: null
  } : value == "fullTime" ? {
    fullTime: null
  } : value == "contractor" ? {
    contractor: null
  } : value;
}
function to_candid_variant_n127(_uploadFile, _downloadFile, value) {
  return value == "wochentag_sollzeit" ? {
    wochentag_sollzeit: null
  } : value == "durchschnittssoll" ? {
    durchschnittssoll: null
  } : value == "keineGutschrift" ? {
    keineGutschrift: null
  } : value;
}
function to_candid_variant_n150(_uploadFile, _downloadFile, value) {
  return value == "leistung" ? {
    leistung: null
  } : value == "freitext" ? {
    freitext: null
  } : value == "spese" ? {
    spese: null
  } : value;
}
function to_candid_variant_n152(_uploadFile, _downloadFile, value) {
  return value == "html" ? {
    html: null
  } : value == "markdown" ? {
    markdown: null
  } : value;
}
function to_candid_variant_n154(_uploadFile, _downloadFile, value) {
  return value == "normal" ? {
    normal: null
  } : value == "important" ? {
    important: null
  } : value == "critical" ? {
    critical: null
  } : value;
}
function to_candid_variant_n157(_uploadFile, _downloadFile, value) {
  return value == "mixed" ? {
    mixed: null
  } : value == "role" ? {
    role: null
  } : value == "user" ? {
    user: null
  } : value == "tenant" ? {
    tenant: null
  } : value;
}
function to_candid_variant_n183(_uploadFile, _downloadFile, value) {
  return value == "aktiv" ? {
    aktiv: null
  } : value == "inaktiv" ? {
    inaktiv: null
  } : value == "abgeschlossen" ? {
    abgeschlossen: null
  } : value;
}
function to_candid_variant_n185(_uploadFile, _downloadFile, value) {
  return value == "zeitBlock" ? {
    zeitBlock: null
  } : value == "dauer" ? {
    dauer: null
  } : value;
}
function to_candid_variant_n205(_uploadFile, _downloadFile, value) {
  return value == "gutschrift" ? {
    gutschrift: null
  } : value == "reduktion" ? {
    reduktion: null
  } : value;
}
function to_candid_variant_n254(_uploadFile, _downloadFile, value) {
  return value == "DAY" ? {
    DAY: null
  } : value == "SERVICE_YEAR" ? {
    SERVICE_YEAR: null
  } : value == "WEEK" ? {
    WEEK: null
  } : value;
}
function to_candid_variant_n258(_uploadFile, _downloadFile, value) {
  return value == "CRITICAL" ? {
    CRITICAL: null
  } : value == "FREIGEGEBEN" ? {
    FREIGEGEBEN: null
  } : value == "INFO" ? {
    INFO: null
  } : value == "COMPLIANT" ? {
    COMPLIANT: null
  } : value == "WARNING" ? {
    WARNING: null
  } : value == "BREACH" ? {
    BREACH: null
  } : value;
}
function to_candid_variant_n31(_uploadFile, _downloadFile, value) {
  return value == "admin" ? {
    admin: null
  } : value == "user" ? {
    user: null
  } : value == "guest" ? {
    guest: null
  } : value;
}
function to_candid_variant_n350(_uploadFile, _downloadFile, value) {
  return value == "submitted" ? {
    submitted: null
  } : value == "approved" ? {
    approved: null
  } : value == "rejected" ? {
    rejected: null
  } : value;
}
function to_candid_variant_n360(_uploadFile, _downloadFile, value) {
  return value == "reject" ? {
    reject: null
  } : value == "remove" ? {
    remove: null
  } : value == "approve" ? {
    approve: null
  } : value == AuditOperation.delete ? {
    delete_: null
  } : value == "create" ? {
    create: null
  } : value == "update" ? {
    update: null
  } : value;
}
function to_candid_variant_n362(_uploadFile, _downloadFile, value) {
  return value == "expenseType" ? {
    expenseType: null
  } : value == "serviceType" ? {
    serviceType: null
  } : value == "expense" ? {
    expense: null
  } : value == "timeEntry" ? {
    timeEntry: null
  } : value == "customer" ? {
    customer: null
  } : value == "ferien" ? {
    ferien: null
  } : value == "invoiceTemplate" ? {
    invoiceTemplate: null
  } : value == "absence" ? {
    absence: null
  } : value == "company" ? {
    company: null
  } : value == "employee" ? {
    employee: null
  } : value == "approval" ? {
    approval: null
  } : value == "absenceType" ? {
    absenceType: null
  } : value == "holiday" ? {
    holiday: null
  } : value == "project" ? {
    project: null
  } : value;
}
function to_candid_variant_n378(_uploadFile, _downloadFile, value) {
  return value == "pending" ? {
    pending: null
  } : value == "approved" ? {
    approved: null
  } : value == "rejected" ? {
    rejected: null
  } : value;
}
function to_candid_variant_n408(_uploadFile, _downloadFile, value) {
  return value == "FREIGEGEBEN" ? {
    FREIGEGEBEN: null
  } : value == "IGNORED" ? {
    IGNORED: null
  } : value == "CORRECTED" ? {
    CORRECTED: null
  } : value;
}
function to_candid_variant_n445(_uploadFile, _downloadFile, value) {
  return value == "entwurf" ? {
    entwurf: null
  } : value == "versendet" ? {
    versendet: null
  } : value == "bezahlt" ? {
    bezahlt: null
  } : value == "storniert" ? {
    storniert: null
  } : value == "ueberfaellig" ? {
    ueberfaellig: null
  } : value;
}
function to_candid_variant_n461(_uploadFile, _downloadFile, value) {
  return value == "stripe" ? {
    stripe: null
  } : value == "none" ? {
    none: null
  } : value == "manual" ? {
    manual: null
  } : value;
}
function to_candid_variant_n85(_uploadFile, _downloadFile, value) {
  return value == "full" ? {
    full: null
  } : value == "hidden" ? {
    hidden: null
  } : value == "anonymized" ? {
    anonymized: null
  } : value == "masked_reason" ? {
    masked_reason: null
  } : value;
}
function to_candid_vec_n146(_uploadFile, _downloadFile, value) {
  return value.map((x) => to_candid_InvoicePositionInput_n147(_uploadFile, _downloadFile, x));
}
function to_candid_vec_n256(_uploadFile, _downloadFile, value) {
  return value.map((x) => to_candid_ComplianceStatus_n257(_uploadFile, _downloadFile, x));
}
function to_candid_vec_n413(_uploadFile, _downloadFile, value) {
  return value.map((x) => to_candid_StandardTimeBlock_n414(_uploadFile, _downloadFile, x));
}
function to_candid_vec_n416(_uploadFile, _downloadFile, value) {
  return value.map((x) => to_candid_ProjectMemberAssignment_n417(_uploadFile, _downloadFile, x));
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
const useAuthStore = create()(
  persist(
    (set) => ({
      isAuthenticated: false,
      principal: null,
      role: null,
      companyId: null,
      employeeId: null,
      companyName: null,
      companyLogoUrl: null,
      employeeName: null,
      isPlatformAdmin: false,
      isLoading: false,
      setAuthenticated: (principal, role, companyId, employeeId, companyName, employeeName, companyLogoUrl) => set({
        isAuthenticated: true,
        principal,
        role,
        companyId,
        employeeId,
        companyName,
        employeeName,
        companyLogoUrl: companyLogoUrl ?? null,
        isLoading: false
      }),
      setCompanyLogo: (url) => set({ companyLogoUrl: url }),
      setLoading: (loading) => set({ isLoading: loading }),
      setPlatformAdmin: (value) => set({ isPlatformAdmin: value }),
      logout: () => set({
        isAuthenticated: false,
        principal: null,
        role: null,
        companyId: null,
        employeeId: null,
        companyName: null,
        companyLogoUrl: null,
        employeeName: null,
        isPlatformAdmin: false,
        isLoading: false
      })
    }),
    {
      name: "ireport-auth",
      partialize: (state) => ({
        role: state.role,
        companyId: state.companyId,
        employeeId: state.employeeId,
        companyName: state.companyName,
        companyLogoUrl: state.companyLogoUrl,
        employeeName: state.employeeName,
        isPlatformAdmin: state.isPlatformAdmin
      })
    }
  )
);
function useAuth() {
  const { identity: identity2, login, clear, isLoginSuccess } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const store = useAuthStore();
  const hasIdentity = !!identity2;
  const activeCheckDone = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!hasIdentity || !actor || actorFetching) return;
    if (activeCheckDone.current) return;
    const { role, companyId } = useAuthStore.getState();
    if (!role || !companyId) return;
    activeCheckDone.current = true;
    const checkActive = async () => {
      try {
        const result = await actor.getMyEmployee();
        if (result.__kind__ === "ok" && result.ok.active === false) {
          await clear();
          useAuthStore.getState().logout();
          queryClient.clear();
          try {
            localStorage.removeItem("ireport-auth");
          } catch {
          }
          window.location.href = "/login";
        }
      } catch {
      }
    };
    void checkActive();
  }, [hasIdentity, actor, actorFetching, clear, queryClient]);
  reactExports.useEffect(() => {
    if (!hasIdentity) {
      activeCheckDone.current = false;
    }
  }, [hasIdentity]);
  reactExports.useEffect(() => {
    if (!actor || actorFetching || !hasIdentity) return;
    const checkPlatformAdmin = async () => {
      try {
        const isAdmin = await actor.isPlatformAdmin();
        const { isPlatformAdmin: current, setPlatformAdmin } = useAuthStore.getState();
        if (isAdmin !== current) {
          setPlatformAdmin(isAdmin);
        }
      } catch {
      }
    };
    void checkPlatformAdmin();
  }, [actor, actorFetching, hasIdentity]);
  const handleLogout = async () => {
    await clear();
    store.logout();
    queryClient.clear();
    try {
      localStorage.removeItem("ireport-auth");
    } catch {
    }
  };
  return {
    identity: identity2,
    isAuthenticated: hasIdentity,
    isLoginSuccess,
    login,
    logout: handleLogout,
    principal: store.principal,
    role: store.role,
    companyId: store.companyId,
    employeeId: store.employeeId,
    companyName: store.companyName,
    companyLogoUrl: store.companyLogoUrl,
    employeeName: store.employeeName,
    isPlatformAdmin: store.isPlatformAdmin,
    isLoading: store.isLoading,
    setAuthenticated: store.setAuthenticated,
    setCompanyLogo: store.setCompanyLogo,
    setLoading: store.setLoading,
    setPlatformAdmin: store.setPlatformAdmin
  };
}
export {
  AuditEntityType as A,
  InvoiceStatus as I,
  PeriodCloseStatus as P,
  useAuthStore as a,
  useQuery as b,
  createActor as c,
  useAuth as d,
  AuditOperation as e,
  InvoicePositionTyp as f,
  useActor as u
};
