package api

import (
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"qingzhou/internal/auth"
)

func TestConsoleOAuthLoginPreservesIdentityAndCookieScope(t *testing.T) {
	f := newOAuthFixture(t)
	f.exchangeRedirect = consoleAuthOrigin + oauthCallbackPath
	state, proof := f.startAt(t, consoleAuthOrigin)
	if proof.Path != "/" || proof.Domain != "" || !proof.Secure || !strings.HasPrefix(proof.Name, "__Host-") {
		t.Fatal("Console must preserve a host-only, Secure, Path=/ browser proof")
	}
	r := httptest.NewRequest("GET", f.exchangeRedirect+"?code=single-use-code&state="+url.QueryEscape(state), nil)
	r.AddCookie(proof)
	w := httptest.NewRecorder()
	f.a.handleOAuthCallback(w, r)
	if w.Code != http.StatusSeeOther || w.Header().Get("Location") != consoleAuthOrigin+"/#/oauth2/callback" {
		t.Fatalf("Console callback: %d %s", w.Code, w.Header().Get("Location"))
	}
	var login *http.Cookie
	for _, cookie := range w.Result().Cookies() {
		if cookie.Name == cookieName {
			login = cookie
		}
		if cookie.Name == proof.Name && (cookie.Path != "/" || cookie.MaxAge >= 0) {
			t.Fatal("browser proof was not cleared at its original path")
		}
	}
	if login == nil || login.Path != "/api/kreeproxy/" || !login.Secure || !login.HttpOnly {
		t.Fatal("Console login session is missing or has the wrong scope")
	}
	claims, err := auth.Parse(f.a.secret, login.Value)
	if err != nil {
		t.Fatal(err)
	}
	jar, _ := cookiejar.New(nil)
	consoleAPI, _ := url.Parse(consoleAuthOrigin + "/api/kreeproxy/api/auth/me")
	aiAPI, _ := url.Parse(consoleAuthOrigin + "/api/kreepai/api/v1/auth/me")
	jar.SetCookies(consoleAPI, []*http.Cookie{login})
	if len(jar.Cookies(consoleAPI)) != 1 || len(jar.Cookies(aiAPI)) != 0 {
		t.Fatal("QingZhou session leaked outside its Console API namespace")
	}
	logout := httptest.NewRecorder()
	f.a.handleLogout(logout, httptest.NewRequest("POST", consoleAPI.String(), nil))
	jar.SetCookies(consoleAPI, logout.Result().Cookies())
	if len(jar.Cookies(consoleAPI)) != 0 {
		t.Fatal("logout did not delete the Console session at its original path")
	}
	// The original domain uses the same issuer/subject binding and its own cookie.
	f.exchangeRedirect = ""
	state, proof = f.start(t)
	w = f.callback(state, proof)
	if w.Header().Get("Location") != "https://panel.example/#/oauth2/callback" {
		t.Fatal("original site callback changed")
	}
	for _, cookie := range w.Result().Cookies() {
		if cookie.Name == cookieName {
			originalClaims, err := auth.Parse(f.a.secret, cookie.Value)
			if err != nil || originalClaims.UserID != claims.UserID || cookie.Path != "/" {
				t.Fatal("original site identity or session path changed")
			}
		}
	}
	stored, err := f.a.oauthConfig()
	if err != nil || stored != f.c {
		t.Fatal("Console changed persisted OAuth configuration")
	}
}

func TestConsoleOAuthRejectsStateFromOriginalOrigin(t *testing.T) {
	f := newOAuthFixture(t)
	state, proof := f.start(t)
	r := httptest.NewRequest("GET", consoleAuthOrigin+oauthCallbackPath+"?state="+state+"&code=unused", nil)
	r.AddCookie(proof)
	w := httptest.NewRecorder()
	f.a.handleOAuthCallback(w, r)
	if w.Header().Get("Location") != consoleAuthOrigin+"/#/oauth2/callback?error=state" || f.exchanges != 0 {
		t.Fatal("accepted an original-origin state in the Console flow")
	}
}

func TestConsoleAuthOriginIsAnExactHostAllowlist(t *testing.T) {
	c := oauthConfig{RedirectURL: "https://panel.example" + oauthCallbackPath, Issuer: "https://issuer.example/", ClientID: "client"}
	for _, host := range []string{"console.kreeper.cc", "CONSOLE.KREEPER.CC:443", "panel.example", "console.kreeper.cc.evil.test", "console.kreeper.cc:444"} {
		t.Run(host, func(t *testing.T) {
			r := httptest.NewRequest("GET", "https://"+host+"/", nil)
			r.Header.Set("X-Forwarded-Host", "console.kreeper.cc")
			r.Header.Set("Origin", consoleAuthOrigin)
			got := oauthConfigForRequest(c, r)
			want := c
			if host == "console.kreeper.cc" || host == "CONSOLE.KREEPER.CC:443" {
				want.RedirectURL = consoleAuthOrigin + oauthCallbackPath
			}
			if got != want {
				t.Fatal("unexpected callback selection or changed client/issuer")
			}
		})
	}
}
