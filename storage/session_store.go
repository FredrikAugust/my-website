package storage

import (
	"errors"
	"net/http"
	"sync"
	"website/model"

	"github.com/google/uuid"
)

type SessionID uuid.UUID

type SessionStore struct {
	store map[model.Email]SessionID
	lock  sync.Mutex
}

func NewSessionStore() *SessionStore {
	return &SessionStore{
		store: make(map[model.Email]SessionID),
		lock:  sync.Mutex{},
	}
}

func (s *SessionStore) CreateSession(email string) (string, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	sessionID := uuid.New()
	s.store[model.Email(email)] = SessionID(sessionID)

	return sessionID.String(), nil
}

func (s *SessionStore) GetSession(sessionID string) (model.Email, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	sessionUUID, err := uuid.Parse(sessionID)
	if err != nil {
		return model.Email(""), err
	}

	for e, sID := range s.store {
		if sID == SessionID(sessionUUID) {
			return e, nil
		}
	}

	return model.Email(""), errors.New("no session exists for sessionID")
}

func (s *SessionStore) GetSessionFromRequest(r *http.Request) (model.Email, error) {
	sessionCookie, err := r.Cookie("session")
	if err != nil {
		return model.Email(""), err
	}

	return s.GetSession(sessionCookie.Value)
}
