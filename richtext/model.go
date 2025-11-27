package richtext

import (
	"encoding/json"

	"go.uber.org/zap"
	g "maragu.dev/gomponents"
	h "maragu.dev/gomponents/html"
)

type RootNode struct {
	Children []g.Node
}

func (r *RootNode) UnmarshalJSON(data []byte) error {
	r.Children = make([]g.Node, 0)

	var base struct {
		Root struct {
			Children []json.RawMessage `json:"children"`
		} `json:"root"`
	}
	err := json.Unmarshal(data, &base)
	if err != nil {
		zap.L().Warn("failed to unmarshal data", zap.Error(err), zap.ByteString("data", data))
	}

	for _, rawChild := range base.Root.Children {
		r.Children = append(r.Children, unmarshalChild(rawChild))
	}

	return nil
}

func unmarshalChild(rawChild json.RawMessage) g.Node {
	var typeCheck struct {
		Type string `json:"type"`
	}
	err := json.Unmarshal(rawChild, &typeCheck)
	if err != nil {
		zap.L().Warn("failed to unmarshal child", zap.Error(err), zap.ByteString("child", rawChild))
	}
	switch typeCheck.Type {
	case "block":
		return unmarshalBlock(rawChild)
	case "list":
		return unmarshalList(rawChild)
	case "listitem":
		return unmarshalListItem(rawChild)
	case "text":
		return unmarshalText(rawChild)
	case "paragraph":
		return unmarshalParagraph(rawChild)
	case "link":
		return unmarshalLink(rawChild)
	case "heading":
		return unmarshalHeading(rawChild)
	case "upload":
		return unmarshalUpload(rawChild)
	case "horizontalrule":
		return unmarshalHorizontalRule()
	}

	return g.Text("unknown child: " + typeCheck.Type)
}

func unmarshalHorizontalRule() g.Node {
	return h.Hr(h.Class("my-2 border-t-[3px] border-double max-w-prose"))
}

func unmarshalLink(rawChild json.RawMessage) g.Node {
	var link struct {
		Children []json.RawMessage `json:"children"`
		Fields   struct {
			URL string `json:"url"`
		} `json:"fields"`
	}
	err := json.Unmarshal(rawChild, &link)
	if err != nil {
		zap.L().Warn("failed to unmarshal link", zap.Error(err), zap.ByteString("child", rawChild))
	}
	return h.A(
		h.Href(link.Fields.URL),
		h.Rel("noreferer"),
		h.Target("_blank"),
		g.Map(link.Children, func(child json.RawMessage) g.Node {
			return unmarshalChild(child)
		}),
	)
}

func unmarshalHeading(rawChild json.RawMessage) g.Node {
	var heading struct {
		Tag      string            `json:"tag"`
		Children []json.RawMessage `json:"children"`
	}
	err := json.Unmarshal(rawChild, &heading)
	if err != nil {
		zap.L().Warn("failed to unmarshal heading", zap.Error(err), zap.ByteString("child", rawChild))
	}
	return g.El(
		heading.Tag,
		g.Map(heading.Children, func(child json.RawMessage) g.Node {
			return unmarshalChild(child)
		}),
	)
}

func unmarshalUpload(rawChild json.RawMessage) g.Node {
	var upload struct {
		Value struct {
			Id    int    `json:"id"`
			Alt   string `json:"alt"`
			URL   string `json:"url"`
			Sizes map[string]struct {
				Url string `json:"url"`
			} `json:"sizes"`
		} `json:"value"`
	}
	err := json.Unmarshal(rawChild, &upload)
	if err != nil {
		zap.L().Warn("failed to unmarshal upload", zap.Error(err), zap.ByteString("child", rawChild))
	}
	return h.Img(h.Class("max-w-full md:max-w-lg"), h.Src(upload.Value.Sizes["large"].Url), h.Alt(upload.Value.Alt), h.Loading("lazy"))
}

func unmarshalParagraph(rawChild json.RawMessage) g.Node {
	var paragraph struct {
		Children []json.RawMessage `json:"children"`
	}
	err := json.Unmarshal(rawChild, &paragraph)
	if err != nil {
		zap.L().Warn("failed to unmarshal paragraph", zap.Error(err), zap.ByteString("child", rawChild))
	}
	return h.P(
		g.Map(paragraph.Children, func(child json.RawMessage) g.Node {
			return unmarshalChild(child)
		}),
	)
}

func unmarshalText(rawChild json.RawMessage) g.Node {
	var text struct {
		Text   string `json:"text"`
		Format int    `json:"format"`
	}
	err := json.Unmarshal(rawChild, &text)
	if err != nil {
		zap.L().Warn("failed to unmarshal text", zap.Error(err), zap.ByteString("child", rawChild))
	}

	switch text.Format {
	case 0:
		return g.Text(text.Text)
	case 1:
		return h.Strong(g.Text(text.Text))
	case 2:
		return h.Em(g.Text(text.Text))
	case 16:
		return h.Code(h.Class("bg-gray-100 border border-gray-200 text-[0.9rem] rounded-sm p-0.5"), g.Text(text.Text))
	default:
		return g.Text(text.Text)
	}

}

func unmarshalListItem(rawChild json.RawMessage) g.Node {
	var listitem struct {
		Children []json.RawMessage `json:"children"`
	}
	err := json.Unmarshal(rawChild, &listitem)
	if err != nil {
		zap.L().Warn("failed to unmarshal listitem", zap.Error(err), zap.ByteString("child", rawChild))
	}
	return h.Li(
		g.Map(listitem.Children, func(child json.RawMessage) g.Node {
			return unmarshalChild(child)
		}),
	)
}

func unmarshalList(rawChild json.RawMessage) g.Node {
	var list struct {
		Tag      string            `json:"tag"`
		Children []json.RawMessage `json:"children"`
		ListType string            `json:"listType"`
	}
	err := json.Unmarshal(rawChild, &list)
	if err != nil {
		zap.L().Warn("failed to unmarshal list", zap.Error(err), zap.ByteString("child", rawChild))
	}
	if list.ListType == "number" {
		return h.Ol(
			h.Class("list-decimal list-inside"),
			g.Map(list.Children, func(child json.RawMessage) g.Node {
				return unmarshalChild(child)
			}),
		)
	}

	return g.Text("unsupported list type: " + list.ListType)
}

func unmarshalBlock(rawChild json.RawMessage) g.Node {
	var block struct {
		Type   string            `json:"type"`
		Fields map[string]string `json:"fields"`
	}
	err := json.Unmarshal(rawChild, &block)
	if err != nil {
		zap.L().Warn("failed to unmarshal child", zap.Error(err), zap.ByteString("child", rawChild))
	}

	switch block.Fields["blockType"] {
	case "Code":
		return unmarshalCodeBlock(rawChild)
	}

	return g.Text("unknown block: " + block.Type)
}

func unmarshalCodeBlock(rawChild json.RawMessage) g.Node {
	var codeBlock struct {
		Fields struct {
			Code      string `json:"code"`
			Lang      string `json:"language"`
			BlockName string `json:"blockName"`
		} `json:"fields"`
	}
	err := json.Unmarshal(rawChild, &codeBlock)
	if err != nil {
		zap.L().Warn("failed to unmarshal code block", zap.Error(err), zap.ByteString("child", rawChild))
	}
	return h.Pre(
		h.Class("max-w-prose"),
		h.Code(h.Style("tab-size: 2"), g.Text(codeBlock.Fields.Code)),
	)
}

func (r RootNode) RenderToGomponents() g.Node {
	return h.Div(
		h.Class("flex flex-col gap-1"),
		g.Group(r.Children),
	)
}
