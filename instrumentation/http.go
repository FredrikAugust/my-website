package instrumentation

import (
	"net/http"

	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
)

func requestVerbAttribute(r *http.Request) attribute.KeyValue {
	switch r.Method {
	case http.MethodGet:
		return semconv.HTTPRequestMethodGet
	case http.MethodPost:
		return semconv.HTTPRequestMethodPost
	case http.MethodPut:
		return semconv.HTTPRequestMethodPut
	case http.MethodDelete:
		return semconv.HTTPRequestMethodDelete
	case http.MethodPatch:
		return semconv.HTTPRequestMethodPatch
	case http.MethodHead:
		return semconv.HTTPRequestMethodHead
	case http.MethodOptions:
		return semconv.HTTPRequestMethodOptions
	case http.MethodConnect:
		return semconv.HTTPRequestMethodConnect
	case http.MethodTrace:
		return semconv.HTTPRequestMethodTrace
	default:
		return semconv.HTTPRequestMethodOriginal(r.Method)
	}
}
