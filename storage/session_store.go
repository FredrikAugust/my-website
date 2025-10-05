package storage

import (
	"errors"
	"net/http"
	"sync"
	"website/model"

	"github.com/google/uuid"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
	"go.opentelemetry.io/otel/trace"
)

var (
	ErrorNoSessionFound = errors.New("no session found")
	ErrorInvalidUUID    = errors.New("invalid UUID")
)

type SessionID uuid.UUID

type SessionStore struct {
	// Double maps for O(1) lookups
	emailSessionIDMap map[model.Email]SessionID
	sessionIDEmailMap map[SessionID]model.Email

	lock sync.Mutex
}

func NewSessionStore() *SessionStore {
	return &SessionStore{
		emailSessionIDMap: make(map[model.Email]SessionID),
		sessionIDEmailMap: make(map[SessionID]model.Email),

		lock: sync.Mutex{},
	}
}

func (s *SessionStore) CreateSession(email string) (string, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	sessionID := uuid.New()

	s.emailSessionIDMap[model.Email(email)] = SessionID(sessionID)
	s.sessionIDEmailMap[SessionID(sessionID)] = model.Email(email)

	return sessionID.String(), nil
}

func (s *SessionStore) GetSession(sessionID string) (model.Email, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	sessionUUID, err := uuid.Parse(sessionID)
	if err != nil {
		return model.Email(""), ErrorInvalidUUID
	}

	email, exists := s.sessionIDEmailMap[SessionID(sessionUUID)]
	if !exists {
		return model.Email(""), ErrorNoSessionFound
	}

	return model.Email(email), nil
}

func (s *SessionStore) GetSessionFromRequest(r *http.Request) (model.Email, error) {
	sessionCookie, err := r.Cookie("session")
	if err != nil {
		return model.Email(""), err
	}

	email, err := s.GetSession(sessionCookie.Value)
	if err == nil {
		trace.SpanFromContext(r.Context()).SetAttributes(semconv.UserEmail(string(email)))
	}
	return email, err
}
