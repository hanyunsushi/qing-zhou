package api

import (
	"net/http"
	"strings"
)

const consoleAuthOrigin = "https://console.kreeper.cc"

// The gateway preserves Host. Never derive a callback from an arbitrary
// Origin, Referer or X-Forwarded-Host supplied by the browser.
func isConsoleAuthRequest(r *http.Request) bool {
	return strings.EqualFold(r.Host, "console.kreeper.cc") || strings.EqualFold(r.Host, "console.kreeper.cc:443")
}

func oauthConfigForRequest(c oauthConfig, r *http.Request) oauthConfig {
	if isConsoleAuthRequest(r) {
		c.RedirectURL = consoleAuthOrigin + oauthCallbackPath
	}
	return c
}

// Scope business sessions in the backend so the gateway can leave the
// __Host- OIDC browser-proof cookie at its required Path=/.
func authCookiePath(r *http.Request) string {
	if isConsoleAuthRequest(r) {
		return "/api/kreeproxy/"
	}
	return "/"
}
