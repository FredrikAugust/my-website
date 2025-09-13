package model

type Name string
type Comment string

func (n Name) IsValid() bool {
	return len(n) > 0 && len(n) <= 100
}

func (n Name) String() string {
	return string(n)
}

func (c Comment) IsValid() bool {
	return len(c) > 0 && len(c) <= 1000
}

func (c Comment) String() string {
	return string(c)
}
