package route

import "fmt"

const Root = "/"
const Blog = "/blog"
const Albums = "/albums"
const Guestbook = "/guestbook"
const GuestbookDelete = "/guestbook/delete"
const Login = "/login"

func Album(id int) string {
	return fmt.Sprintf("albums/%d", id)
}
