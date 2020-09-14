package server

// SetTokenType token type
func (s *Server) SetTokenType(tokenType string) {
	s.Config.TokenType = tokenType
}

// SetAllowGetAccessRequest to allow GET requests for the token
func (s *Server) SetAllowGetAccessRequest(allow bool) {
	s.Config.AllowGetAccessRequest = allow
}
