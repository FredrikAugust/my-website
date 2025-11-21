package views

import (
	"strings"
	"testing"

	g "maragu.dev/gomponents"
	h "maragu.dev/gomponents/html"
)

func TestPage_DefaultDescription(t *testing.T) {
	result := Page(PageOptions{
		Title:         "Test Title",
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)
	expectedDesc := "Fredrik&#39;s homepage about software, development, sports and photography"

	if !strings.Contains(html, expectedDesc) {
		t.Errorf("Expected default description to be present in HTML, got: %s", html[:500])
	}
}

func TestPage_CustomDescription(t *testing.T) {
	customDesc := "Custom description for testing"
	result := Page(PageOptions{
		Title:         "Test Title",
		Description:   customDesc,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	if !strings.Contains(html, customDesc) {
		t.Errorf("Expected custom description '%s' to be present in HTML", customDesc)
	}
}

func TestPage_DefaultKeywords(t *testing.T) {
	result := Page(PageOptions{
		Title:         "Test Title",
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)
	expectedKeywords := "Fredrik August Madsen-Malmo, homepage, software, development, programming, k3s, golang, rust, typescript"

	if !strings.Contains(html, expectedKeywords) {
		t.Errorf("Expected default keywords to be present in HTML")
	}
}

func TestPage_CustomKeywords(t *testing.T) {
	customKeywords := "custom, keywords, for, testing"
	result := Page(PageOptions{
		Title:         "Test Title",
		Keywords:      customKeywords,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	if !strings.Contains(html, customKeywords) {
		t.Errorf("Expected custom keywords '%s' to be present in HTML", customKeywords)
	}
}

func TestPage_OGTitleDefaultsToTitle(t *testing.T) {
	title := "My Test Page"
	result := Page(PageOptions{
		Title:         title,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	// Check that OG title meta tag contains the page title
	if !strings.Contains(html, `property="og:title"`) {
		t.Error("Expected og:title meta tag to be present")
	}
	if !strings.Contains(html, title) {
		t.Errorf("Expected og:title to contain '%s'", title)
	}
}

func TestPage_CustomOGTitle(t *testing.T) {
	title := "My Test Page"
	ogTitle := "Custom OG Title"
	result := Page(PageOptions{
		Title:         title,
		OGTitle:       ogTitle,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	if !strings.Contains(html, ogTitle) {
		t.Errorf("Expected custom OG title '%s' to be present in HTML", ogTitle)
	}
}

func TestPage_OGDescriptionDefaultsToDescription(t *testing.T) {
	description := "This is a test description"
	result := Page(PageOptions{
		Title:         "Test Title",
		Description:   description,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	// Check that OG description contains the page description
	if !strings.Contains(html, `property="og:description"`) {
		t.Error("Expected og:description meta tag to be present")
	}
	if !strings.Contains(html, description) {
		t.Errorf("Expected og:description to contain '%s'", description)
	}
}

func TestPage_CustomOGDescription(t *testing.T) {
	description := "Regular description"
	ogDescription := "Custom OG Description"
	result := Page(PageOptions{
		Title:         "Test Title",
		Description:   description,
		OGDescription: ogDescription,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	if !strings.Contains(html, ogDescription) {
		t.Errorf("Expected custom OG description '%s' to be present in HTML", ogDescription)
	}
}

func TestPage_TwitterTitleCascading(t *testing.T) {
	// Test that Twitter title cascades from OGTitle which cascades from Title
	title := "Main Title"
	result := Page(PageOptions{
		Title:         title,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	// Twitter title should use the main title
	if !strings.Contains(html, `name="twitter:title"`) {
		t.Error("Expected twitter:title meta tag to be present")
	}
	if !strings.Contains(html, title) {
		t.Errorf("Expected twitter:title to contain '%s'", title)
	}
}

func TestPage_TwitterTitleWithOGTitle(t *testing.T) {
	// Test that Twitter title defaults to OGTitle when OGTitle is set
	title := "Main Title"
	ogTitle := "OG Title"
	result := Page(PageOptions{
		Title:         title,
		OGTitle:       ogTitle,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	// Twitter title should use the OG title
	if !strings.Contains(html, ogTitle) {
		t.Errorf("Expected twitter:title to contain '%s'", ogTitle)
	}
}

func TestPage_CustomTwitterTitle(t *testing.T) {
	title := "Main Title"
	ogTitle := "OG Title"
	twitterTitle := "Twitter Title"
	result := Page(PageOptions{
		Title:        title,
		OGTitle:      ogTitle,
		TwitterTitle: twitterTitle,
		Path:         "/test",
		Authenticated: false,
		Body:         []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	// Twitter title should use the custom Twitter title
	if !strings.Contains(html, twitterTitle) {
		t.Errorf("Expected custom twitter:title '%s' to be present in HTML", twitterTitle)
	}
}

func TestPage_TwitterDescriptionCascading(t *testing.T) {
	// Test that Twitter description cascades from OGDescription which cascades from Description
	description := "Main Description"
	result := Page(PageOptions{
		Title:         "Test Title",
		Description:   description,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	// Twitter description should use the main description
	if !strings.Contains(html, `name="twitter:description"`) {
		t.Error("Expected twitter:description meta tag to be present")
	}
	if !strings.Contains(html, description) {
		t.Errorf("Expected twitter:description to contain '%s'", description)
	}
}

func TestPage_AllMetadataPresent(t *testing.T) {
	result := Page(PageOptions{
		Title:         "Test Page",
		Description:   "Test description",
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	requiredMetaTags := []string{
		`charset="utf-8"`,
		`name="viewport"`,
		`name="keywords"`,
		`name="author"`,
		`property="og:type"`,
		`property="og:title"`,
		`property="og:description"`,
		`property="og:site_name"`,
		`name="twitter:card"`,
		`name="twitter:title"`,
		`name="twitter:description"`,
	}

	for _, tag := range requiredMetaTags {
		if !strings.Contains(html, tag) {
			t.Errorf("Expected meta tag '%s' to be present in HTML", tag)
		}
	}
}

func TestPage_TitleInHTMLHead(t *testing.T) {
	title := "My Unique Test Title"
	result := Page(PageOptions{
		Title:         title,
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	if !strings.Contains(html, "<title>"+title+"</title>") {
		t.Errorf("Expected <title> tag to contain '%s'", title)
	}
}

func TestPage_BodyContentRendered(t *testing.T) {
	contentText := "Unique test content string"
	result := Page(PageOptions{
		Title:         "Test Title",
		Path:          "/test",
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text(contentText))},
	})

	html := renderToString(result)

	if !strings.Contains(html, contentText) {
		t.Errorf("Expected body content '%s' to be present in HTML", contentText)
	}
}

func TestPage_NavbarRenderedWithPath(t *testing.T) {
	path := "/test-path"
	result := Page(PageOptions{
		Title:         "Test Title",
		Path:          path,
		Authenticated: false,
		Body:          []g.Node{h.Div(g.Text("Test content"))},
	})

	html := renderToString(result)

	// Check that navbar is rendered (it should contain navigation links)
	if !strings.Contains(html, "Home") || !strings.Contains(html, "Photography") || !strings.Contains(html, "Blog") {
		t.Error("Expected navbar to be rendered with navigation links")
	}
}

// Helper function to render a gomponents Node to string
func renderToString(node g.Node) string {
	var sb strings.Builder
	_ = node.Render(&sb)
	return sb.String()
}
