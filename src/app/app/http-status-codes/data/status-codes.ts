import type { StatusCodeSection } from "../types"

export const statusCodeSections: StatusCodeSection[] = [
  {
    title: "1xx informational response",
    description: "The server is processing the request",
    codes: [
      {
        code: 100,
        title: "Continue",
        description: "Waiting for the client to emit the body of the request.",
      },
      {
        code: 101,
        title: "Switching Protocols",
        description: "The server has agreed to change protocol.",
      },
      {
        code: 102,
        title: "Processing",
        description: "The server is processing the request, but no response is available yet. For WebDav.",
      },
      {
        code: 103,
        title: "Early Hints",
        description: "The server returns some response headers before final HTTP message.",
      },
    ],
  },
  {
    title: "2xx success",
    description: "The request was successfully received, understood, and accepted",
    codes: [
      {
        code: 200,
        title: "OK",
        description: "Standard response for successful HTTP requests.",
      },
      {
        code: 201,
        title: "Created",
        description: "The request has been fulfilled, resulting in the creation of a new resource.",
      },
      {
        code: 202,
        title: "Accepted",
        description: "The request has been accepted for processing, but the processing has not been completed.",
      },
      {
        code: 203,
        title: "Non-Authoritative Information",
        description:
          "The request is successful but the content of the original request has been modified by a transforming proxy.",
      },
      {
        code: 204,
        title: "No Content",
        description: "The server successfully processed the request and is not returning any content.",
      },
      {
        code: 205,
        title: "Reset Content",
        description: "The server indicates to reinitialize the document view which sent this request.",
      },
      {
        code: 206,
        title: "Partial Content",
        description: "The server is delivering only part of the resource due to a range header sent by the client.",
      },
      {
        code: 207,
        title: "Multi-Status",
        description:
          "The message body that follows is by default an XML message and can contain a number of separate response codes.",
      },
      {
        code: 208,
        title: "Already Reported",
        description:
          "The members of a DAV binding have already been enumerated in a preceding part of the (multistatus) response.",
      },
      {
        code: 226,
        title: "IM Used",
        description:
          "The server has fulfilled a request for the resource, and the response is a representation of the result.",
      },
    ],
  },
  {
    title: "3xx redirection",
    description: "Further action needs to be taken to complete the request",
    codes: [
      {
        code: 300,
        title: "Multiple Choices",
        description: "Indicates multiple options for the resource that the client may follow.",
      },
      {
        code: 301,
        title: "Moved Permanently",
        description: "This and all future requests should be directed to the given URI.",
      },
      {
        code: 302,
        title: "Found",
        description: "Redirect to another URL. This is an example of industry practice contradicting the standard.",
      },
      {
        code: 303,
        title: "See Other",
        description: "The response to the request can be found under another URI.",
      },
      {
        code: 304,
        title: "Not Modified",
        description:
          "Indicates that the resource has not been modified since the version specified by the request headers.",
      },
      {
        code: 305,
        title: "Use Proxy",
        description: "The requested resource is available only through a proxy.",
      },
      {
        code: 307,
        title: "Temporary Redirect",
        description:
          "The request should be repeated with another URI, but future requests should still use the original URI.",
      },
      {
        code: 308,
        title: "Permanent Redirect",
        description: "The request and all future requests should be repeated using another URI.",
      },
    ],
  },
  {
    title: "4xx client errors",
    description: "The request contains bad syntax or cannot be fulfilled",
    codes: [
      {
        code: 400,
        title: "Bad Request",
        description: "The server cannot or will not process the request due to an apparent client error.",
      },
      {
        code: 401,
        title: "Unauthorized",
        description: "Authentication is required and has failed or has not yet been provided.",
      },
      {
        code: 402,
        title: "Payment Required",
        description:
          "Reserved for future use. The original intention was that this code might be used as part of some form of digital cash.",
      },
      {
        code: 403,
        title: "Forbidden",
        description: "The request was valid, but the server is refusing action.",
      },
      {
        code: 404,
        title: "Not Found",
        description: "The requested resource could not be found but may be available in the future.",
      },
      {
        code: 405,
        title: "Method Not Allowed",
        description: "A request method is not supported for the requested resource.",
      },
      {
        code: 406,
        title: "Not Acceptable",
        description:
          "The requested resource is capable of generating only content not acceptable according to the Accept headers sent.",
      },
      {
        code: 407,
        title: "Proxy Authentication Required",
        description: "The client must first authenticate itself with the proxy.",
      },
      {
        code: 408,
        title: "Request Timeout",
        description: "The server timed out waiting for the request.",
      },
      {
        code: 409,
        title: "Conflict",
        description:
          "Indicates that the request could not be processed because of conflict in the current state of the resource.",
      },
      {
        code: 410,
        title: "Gone",
        description: "Indicates that the resource requested is no longer available and will not be available again.",
      },
      {
        code: 411,
        title: "Length Required",
        description:
          "The request did not specify the length of its content, which is required by the requested resource.",
      },
      {
        code: 412,
        title: "Precondition Failed",
        description: "The server does not meet one of the preconditions that the requester put on the request.",
      },
      {
        code: 413,
        title: "Payload Too Large",
        description: "The request is larger than the server is willing or able to process.",
      },
      {
        code: 414,
        title: "URI Too Long",
        description: "The URI provided was too long for the server to process.",
      },
      {
        code: 415,
        title: "Unsupported Media Type",
        description: "The request entity has a media type which the server or resource does not support.",
      },
      {
        code: 416,
        title: "Range Not Satisfiable",
        description: "The client has asked for a portion of the file, but the server cannot supply that portion.",
      },
      {
        code: 417,
        title: "Expectation Failed",
        description: "The server cannot meet the requirements of the Expect request-header field.",
      },
      {
        code: 418,
        title: "I'm a teapot",
        description: "Any attempt to brew coffee with a teapot should result in the error code '418 I'm a teapot'.",
      },
      {
        code: 421,
        title: "Misdirected Request",
        description: "The request was directed at a server that is not able to produce a response.",
      },
      {
        code: 422,
        title: "Unprocessable Entity",
        description: "The request was well-formed but was unable to be followed due to semantic errors.",
      },
      {
        code: 423,
        title: "Locked",
        description: "The resource that is being accessed is locked.",
      },
      {
        code: 424,
        title: "Failed Dependency",
        description: "The request failed because it depended on another request and that request failed.",
      },
      {
        code: 425,
        title: "Too Early",
        description: "Indicates that the server is unwilling to risk processing a request that might be replayed.",
      },
      {
        code: 426,
        title: "Upgrade Required",
        description:
          "The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field.",
      },
      {
        code: 428,
        title: "Precondition Required",
        description: "The origin server requires the request to be conditional.",
      },
      {
        code: 429,
        title: "Too Many Requests",
        description: "The user has sent too many requests in a given amount of time.",
      },
      {
        code: 431,
        title: "Request Header Fields Too Large",
        description:
          "The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.",
      },
      {
        code: 451,
        title: "Unavailable For Legal Reasons",
        description:
          "A server operator has received a legal demand to deny access to a resource or to a set of resources.",
      },
    ],
  },
  {
    title: "5xx server errors",
    description: "The server failed to fulfill an apparently valid request",
    codes: [
      {
        code: 500,
        title: "Internal Server Error",
        description:
          "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.",
      },
      {
        code: 501,
        title: "Not Implemented",
        description:
          "The server either does not recognize the request method, or it lacks the ability to fulfill the request.",
      },
      {
        code: 502,
        title: "Bad Gateway",
        description:
          "The server was acting as a gateway or proxy and received an invalid response from the upstream server.",
      },
      {
        code: 503,
        title: "Service Unavailable",
        description: "The server is currently unavailable (because it is overloaded or down for maintenance).",
      },
      {
        code: 504,
        title: "Gateway Timeout",
        description:
          "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.",
      },
      {
        code: 505,
        title: "HTTP Version Not Supported",
        description: "The server does not support the HTTP protocol version used in the request.",
      },
      {
        code: 506,
        title: "Variant Also Negotiates",
        description: "Transparent content negotiation for the request results in a circular reference.",
      },
      {
        code: 507,
        title: "Insufficient Storage",
        description: "The server is unable to store the representation needed to complete the request.",
      },
      {
        code: 508,
        title: "Loop Detected",
        description: "The server detected an infinite loop while processing the request.",
      },
      {
        code: 510,
        title: "Not Extended",
        description: "Further extensions to the request are required for the server to fulfill it.",
      },
      {
        code: 511,
        title: "Network Authentication Required",
        description: "The client needs to authenticate to gain network access.",
      },
    ],
  },
]

