package storage

import (
	"context"
	"errors"
	"net/http"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"

	"website/helpers"
	"website/model"

	"github.com/google/uuid"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
	"go.opentelemetry.io/otel/trace"
)

type SessionStore interface {
	CreateSession(ctx context.Context, email string) (string, error)
	GetSession(ctx context.Context, sessionID string) (model.Email, error)
	GetSessionFromRequest(r *http.Request) (model.Email, error)
}

var (
	ErrorNoSessionFound = errors.New("no session found")
	ErrorInvalidUUID    = errors.New("invalid UUID")
)

type SessionID uuid.UUID

type InMemorySessionStore struct {
	// Double maps for O(1) lookups
	emailSessionIDMap map[model.Email]SessionID
	sessionIDEmailMap map[SessionID]model.Email

	lock sync.Mutex
}

func NewInMemorySessionStore() *InMemorySessionStore {
	return &InMemorySessionStore{
		emailSessionIDMap: make(map[model.Email]SessionID),
		sessionIDEmailMap: make(map[SessionID]model.Email),

		lock: sync.Mutex{},
	}
}

func (s *InMemorySessionStore) CreateSession(ctx context.Context, email string) (string, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	sessionID := uuid.New()

	s.emailSessionIDMap[model.Email(email)] = SessionID(sessionID)
	s.sessionIDEmailMap[SessionID(sessionID)] = model.Email(email)

	return sessionID.String(), nil
}

func (s *InMemorySessionStore) GetSession(ctx context.Context, sessionID string) (model.Email, error) {
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

func (s *InMemorySessionStore) GetSessionFromRequest(r *http.Request) (model.Email, error) {
	sessionCookie, err := r.Cookie("session")
	if err != nil {
		return model.Email(""), err
	}

	email, err := s.GetSession(r.Context(), sessionCookie.Value)
	if err == nil {
		trace.SpanFromContext(r.Context()).SetAttributes(semconv.UserEmail(string(email)))
	}
	return email, err
}

type RedisMemorySessionStore struct {
	client *redis.Client
}

func NewRedisSessionStore() *RedisMemorySessionStore {
	return &RedisMemorySessionStore{
		client: redis.NewClient(&redis.Options{
			Addr:     helpers.GetStringOrDefault("REDIS_ADDR", "localhost:6379"),
			Password: "",
			DB:       0,
		}),
	}
}

func (r *RedisMemorySessionStore) CreateSession(ctx context.Context, email string) (string, error) {
	sessionID := uuid.New().String()
	ret := r.client.Set(ctx, "session:"+sessionID, email, time.Hour*24*14)
	if ret.Err() != nil {
		return "", ret.Err()
	}
	return sessionID, nil
}

func (r *RedisMemorySessionStore) GetSession(ctx context.Context, sessionID string) (model.Email, error) {
	ret := r.client.Get(ctx, "session:"+sessionID)
	err := ret.Err()
	if err != nil {
		return model.Email(""), err
	}

	return model.Email(ret.Val()), nil
}

func (r *RedisMemorySessionStore) GetSessionFromRequest(req *http.Request) (model.Email, error) {
	sessionCookie, err := req.Cookie("session")
	if err != nil {
		return model.Email(""), err
	}

	email, err := r.GetSession(req.Context(), sessionCookie.Value)
	if err == nil {
		trace.SpanFromContext(req.Context()).SetAttributes(semconv.UserEmail(string(email)))
	}
	return email, err
}
