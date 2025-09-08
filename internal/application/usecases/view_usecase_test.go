package usecases

import (
	"errors"
	"testing"
)

type mockViewRepository struct {
	hostname          string
	views             int
	hostnameError     error
	getViewsError     error
	incrementError    error
	incrementCalled   bool
}

func (m *mockViewRepository) GetHostname() (string, error) {
	return m.hostname, m.hostnameError
}

func (m *mockViewRepository) GetViewsForHostname(hostname string) (int, error) {
	return m.views, m.getViewsError
}

func (m *mockViewRepository) IncrementViewCountForHostname(hostname string) error {
	m.incrementCalled = true
	if m.incrementError == nil {
		m.views++
	}
	return m.incrementError
}

func TestViewUsecase_GetPageData_Success(t *testing.T) {
	mock := &mockViewRepository{
		hostname: "test-host",
		views:    5,
	}
	
	usecase := NewViewUsecase(mock)
	
	data, err := usecase.GetPageData()
	
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	
	if !mock.incrementCalled {
		t.Error("Expected IncrementViewCountForHostname to be called")
	}
	
	if data.Hostname != "test-host" {
		t.Errorf("Expected hostname 'test-host', got '%s'", data.Hostname)
	}
	
	if data.VisitorNumber != 6 {
		t.Errorf("Expected visitor number 6, got %d", data.VisitorNumber)
	}
	
	if data.DateTime == "" {
		t.Error("Expected DateTime to be set")
	}
	
	// Check if DateTime format is reasonable (should contain current year)
	if !contains(data.DateTime, "2025") {
		t.Errorf("Expected DateTime to contain current year, got '%s'", data.DateTime)
	}
}

func TestViewUsecase_GetPageData_HostnameError(t *testing.T) {
	mock := &mockViewRepository{
		hostname:      "",
		hostnameError: errors.New("hostname error"),
		views:         3,
	}
	
	usecase := NewViewUsecase(mock)
	
	data, err := usecase.GetPageData()
	
	if err != nil {
		t.Errorf("Expected no error even with hostname error, got %v", err)
	}
	
	if data.Hostname != "unknown" {
		t.Errorf("Expected hostname 'unknown' when hostname fails, got '%s'", data.Hostname)
	}
	
	if data.VisitorNumber != 4 {
		t.Errorf("Expected visitor number 4, got %d", data.VisitorNumber)
	}
}

func TestViewUsecase_GetPageData_IncrementError(t *testing.T) {
	mock := &mockViewRepository{
		hostname:       "test-host",
		incrementError: errors.New("increment error"),
	}
	
	usecase := NewViewUsecase(mock)
	
	data, err := usecase.GetPageData()
	
	if err == nil {
		t.Error("Expected error when increment fails")
	}
	
	if data != nil {
		t.Error("Expected nil data when increment fails")
	}
}

func TestViewUsecase_GetPageData_GetViewsError(t *testing.T) {
	mock := &mockViewRepository{
		hostname:      "test-host",
		getViewsError: errors.New("get views error"),
	}
	
	usecase := NewViewUsecase(mock)
	
	data, err := usecase.GetPageData()
	
	if err == nil {
		t.Error("Expected error when get views fails")
	}
	
	if data != nil {
		t.Error("Expected nil data when get views fails")
	}
}

func contains(s, substr string) bool {
	if len(substr) == 0 {
		return true
	}
	if len(s) < len(substr) {
		return false
	}
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}