// Instrumentation for the web server
package instrumentation

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/propagation"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
	"go.opentelemetry.io/otel/trace"
)

func InstrumentRouter(chi chi.Router) chi.Router {
	tracerProvider := otel.GetTracerProvider()
	tracer := tracerProvider.Tracer("chi")

	return chi.With(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := otel.GetTextMapPropagator().Extract(r.Context(), propagation.HeaderCarrier(r.Header))

			ctx, span := tracer.Start(
				ctx,
				fmt.Sprintf("%s %s", r.Method, r.Pattern),
				trace.WithSpanKind(trace.SpanKindServer),
				trace.WithAttributes(
					requestVerbAttribute(r),
					semconv.ServerAddress(r.Host),
					semconv.URLFull(r.URL.String()),
				),
			)
			defer span.End()

			// By default we don't have access to the responses from the http writer
			// so we use a helper from Chi
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

			// Pass down the line
			next.ServeHTTP(ww, r.WithContext(ctx))

			span.SetAttributes(
				semconv.HTTPRoute(r.Pattern),
				semconv.HTTPResponseStatusCode(ww.Status()),
				semconv.HTTPResponseBodySize(ww.BytesWritten()),
			)

			if ww.Status() >= 200 && ww.Status() < 400 {
				span.SetStatus(codes.Ok, "")
			} else if ww.Status() >= 400 {
				span.SetStatus(codes.Error, "the server returned a status code > 400")
			}
		})
	})
}
