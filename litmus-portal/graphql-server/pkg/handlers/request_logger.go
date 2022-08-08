package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
)

type responseWriter struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func wrapResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{ResponseWriter: w}
}

func (rw *responseWriter) Status() int {
	return rw.status
}

func (rw *responseWriter) WriteHeader(code int) {
	if rw.wroteHeader {
		return
	}

	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
	rw.wroteHeader = true

	return
}

func LoggingMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			wrapped := wrapResponseWriter(w)
			next.ServeHTTP(wrapped, r)

			escapedURL := strings.Replace(r.URL.EscapedPath(), "\n", "", -1)
			escapedURL = strings.Replace(escapedURL, "\r", "", -1)

			logrus.Infof("status: %v, method: %v, path: %v, duration: %v", wrapped.status, r.Method, r.URL.EscapedPath(), time.Since(start))
		}

		return http.HandlerFunc(fn)
	}
}
