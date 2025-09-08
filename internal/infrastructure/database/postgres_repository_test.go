package database

import (
	"database/sql"
	"fmt"
	"testing"

	_ "github.com/lib/pq"
)

func setupTestDB(t *testing.T) *sql.DB {
	host := getEnv("TEST_DB_HOST", "localhost")
	port := getEnv("TEST_DB_PORT", "5432")
	user := getEnv("TEST_DB_USER", "postgres")
	password := getEnv("TEST_DB_PASSWORD", "supersecret")
	dbname := getEnv("TEST_DB_NAME", "mydb")

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		t.Skipf("Could not connect to test database: %v", err)
	}

	if err = db.Ping(); err != nil {
		t.Skipf("Could not ping test database: %v", err)
	}

	// Clean up test data
	_, err = db.Exec("DELETE FROM views WHERE hostname LIKE 'test-%'")
	if err != nil {
		t.Fatalf("Could not clean test data: %v", err)
	}

	return db
}

func TestPostgresViewRepository_GetHostname(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewPostgresViewRepository(db)

	hostname, err := repo.GetHostname()
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if hostname == "" {
		t.Error("Expected hostname to be non-empty")
	}
}

func TestPostgresViewRepository_IncrementAndGetViews(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewPostgresViewRepository(db)
	testHostname := "test-host-1"

	// First increment should create the record
	err := repo.IncrementViewCountForHostname(testHostname)
	if err != nil {
		t.Errorf("Expected no error on first increment, got %v", err)
	}

	// Get views should return 1
	views, err := repo.GetViewsForHostname(testHostname)
	if err != nil {
		t.Errorf("Expected no error getting views, got %v", err)
	}

	if views != 1 {
		t.Errorf("Expected views to be 1, got %d", views)
	}

	// Second increment should update the record
	err = repo.IncrementViewCountForHostname(testHostname)
	if err != nil {
		t.Errorf("Expected no error on second increment, got %v", err)
	}

	// Get views should return 2
	views, err = repo.GetViewsForHostname(testHostname)
	if err != nil {
		t.Errorf("Expected no error getting views, got %v", err)
	}

	if views != 2 {
		t.Errorf("Expected views to be 2, got %d", views)
	}

	// Clean up
	_, err = db.Exec("DELETE FROM views WHERE hostname = $1", testHostname)
	if err != nil {
		t.Errorf("Could not clean up test data: %v", err)
	}
}

func TestPostgresViewRepository_GetViewsForNonexistentHost(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewPostgresViewRepository(db)
	testHostname := "test-nonexistent-host"

	views, err := repo.GetViewsForHostname(testHostname)
	if err != nil {
		t.Errorf("Expected no error for nonexistent host, got %v", err)
	}

	if views != 0 {
		t.Errorf("Expected views to be 0 for nonexistent host, got %d", views)
	}
}

func TestPostgresViewRepository_MultipleHosts(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewPostgresViewRepository(db)
	host1 := "test-host-a"
	host2 := "test-host-b"

	// Increment host1 twice
	repo.IncrementViewCountForHostname(host1)
	repo.IncrementViewCountForHostname(host1)

	// Increment host2 once
	repo.IncrementViewCountForHostname(host2)

	// Check host1 has 2 views
	views1, err := repo.GetViewsForHostname(host1)
	if err != nil {
		t.Errorf("Expected no error getting views for host1, got %v", err)
	}
	if views1 != 2 {
		t.Errorf("Expected host1 to have 2 views, got %d", views1)
	}

	// Check host2 has 1 view
	views2, err := repo.GetViewsForHostname(host2)
	if err != nil {
		t.Errorf("Expected no error getting views for host2, got %v", err)
	}
	if views2 != 1 {
		t.Errorf("Expected host2 to have 1 view, got %d", views2)
	}

	// Clean up
	db.Exec("DELETE FROM views WHERE hostname IN ($1, $2)", host1, host2)
}