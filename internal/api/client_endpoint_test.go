package api

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
	"qingzhou/internal/store"
)

func TestInboundEditPreservesWSSMappingAndRejectsPublicPlaintext(t *testing.T) {
	a, st := newResetSubAPI(t)
	id, err := st.SaveSbInbound(&store.SbInbound{Type: "vless", Tag: "ws", Listen: "127.0.0.1", ListenPort: 18883, Enabled: true,
		Options: `{"transport":{"type":"ws","path":"/ws"},"client_endpoint":{"server":"node.example.com","server_port":443}}`})
	if err != nil {
		t.Fatal(err)
	}
	save := func(listen, options string) int {
		body, _ := json.Marshal(map[string]interface{}{"listen": listen, "options": options})
		req := httptest.NewRequest("PUT", "/", strings.NewReader(string(body)))
		ctx := chi.NewRouteContext()
		ctx.URLParams.Add("id", strconv.FormatInt(id, 10))
		req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, ctx))
		w := httptest.NewRecorder()
		a.handleAdminSaveSbInbound(w, req)
		return w.Code
	}
	legacyOptions := `{"transport":{"type":"ws","path":"/ws"}}`
	if code := save("127.0.0.1", legacyOptions); code != 200 {
		t.Fatalf("legacy edit=%d", code)
	}
	ib, _ := st.GetSbInbound(id)
	if !strings.Contains(ib.Options, "client_endpoint") {
		t.Fatal("older panel erased WSS mapping")
	}
	if code := save("::", legacyOptions); code != 400 {
		t.Fatalf("public plaintext accepted: %d", code)
	}
	if code := save("127.0.0.1", `{"transport":{"type":"ws","path":"/ws"},"client_endpoint":null}`); code != 200 {
		t.Fatalf("explicit clear=%d", code)
	}
}
