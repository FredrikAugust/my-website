package database

import (
	"database/sql"
	"fmt"
	"os"
	
	_ "github.com/lib/pq"
	"github.com/fredrikaugust/website/internal/application/interfaces"
)

type PostgresViewRepository struct {
	db *sql.DB
}

func NewPostgresViewRepository(db *sql.DB) interfaces.ViewRepository {
	return &PostgresViewRepository{db: db}
}

func (r *PostgresViewRepository) GetHostname() (string, error) {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown", err
	}
	return hostname, nil
}

func (r *PostgresViewRepository) GetViewsForHostname(hostname string) (int, error) {
	var views int
	query := "SELECT views FROM views WHERE hostname = $1"
	
	err := r.db.QueryRow(query, hostname).Scan(&views)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, fmt.Errorf("failed to get views for hostname %s: %w", hostname, err)
	}
	
	return views, nil
}

func (r *PostgresViewRepository) IncrementViewCountForHostname(hostname string) error {
	query := `
		INSERT INTO views (hostname, views) 
		VALUES ($1, 1)
		ON CONFLICT (hostname) 
		DO UPDATE SET views = views.views + 1, last_updated = NOW()`
	
	_, err := r.db.Exec(query, hostname)
	if err != nil {
		return fmt.Errorf("failed to increment view count for hostname %s: %w", hostname, err)
	}
	
	return nil
}

func ConnectDB() (*sql.DB, error) {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "supersecret")
	dbname := getEnv("DB_NAME", "mydb")
	
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	
	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	
	return db, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}