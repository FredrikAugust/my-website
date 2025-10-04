package route

import "fmt"

const Root = "/"
const Albums = "/albums"
const Guestbook = "/guestbook"
const Login = "/login"

func Album(id int) string {
	return fmt.Sprintf("albums/%d", id)
}
